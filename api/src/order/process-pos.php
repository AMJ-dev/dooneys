<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    if (!isset($_POST['items']) || !is_array($_POST['items']) || empty($_POST['items'])) {
        echo json_encode(['error' => true, 'data' => 'No items in cart']);
        exit;
    }

    $valid_payment_methods = ['cash', 'card'];
    if (!isset($_POST['payment_method']) || !in_array($_POST['payment_method'], $valid_payment_methods)) {
        echo json_encode(['error' => true, 'data' => 'Invalid payment method']);
        exit;
    }

    $conn->beginTransaction();

    try {
        $order_total = 0;
        $subtotal = 0;
        $tax_amount = 0;
        $discount_amount = 0;
        $order_items = [];
        
        // Process each item - get actual quantities from database, not user input
        foreach ($_POST['items'] as $item) {
            if (!isset($item['product_id']) || !isset($item['quantity'])) {
                throw new Exception('Invalid item data structure');
            }
            
            $product_id = (int)$item['product_id'];
            $requested_quantity = (int)$item['quantity'];
            $variant_options = $item['variant_options']; 
            
            // Get product details from database
            $stmt = $conn->prepare("
                SELECT p.id, p.name, p.price, p.stock_quantity, p.sku, p.category_id,
                    p.in_stock, p.manage_stock, c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = ? AND p.status = 'active'
            ");
            $stmt->bindValue(1, $product_id, PDO::PARAM_INT);
            $stmt->execute();
            $product = $stmt->fetch(PDO::FETCH_OBJ);
            
            if (!$product) {
                throw new Exception("Product ID {$product_id} not found or inactive");
            }
            
            // Check stock availability - use actual stock from database
            if ($product->manage_stock && $product->in_stock) {
                $actual_stock = (int)$product->stock_quantity;
                $available_quantity = min($requested_quantity, $actual_stock);
                
                if ($available_quantity <= 0) {
                    throw new Exception("Product '{$product->name}' is out of stock");
                }
                
                if ($available_quantity < $requested_quantity) {
                    throw new Exception("POS Warning: Insufficient stock for product {$product->name}. Requested: {$requested_quantity}, Available: {$available_quantity}");
                }
            } else {
                $available_quantity = $requested_quantity;
            }
            
            // Calculate price with variant modifiers
            $item_price = (float)$product->price;
            $variant_modifiers = 0;
            $variant_details = [];
            
            // Apply variant price modifiers if any
            if (!empty($variant_options) && is_array($variant_options)) {
                foreach ($variant_options as $variant_option_id) {
                    $stmt = $conn->prepare("
                        SELECT pvo.option_value, pvo.price_modifier, pv.variant_type
                        FROM product_variant_options pvo
                        JOIN product_variants pv ON pvo.variant_id = pv.id
                        WHERE pvo.id = ? AND pv.product_id = ?
                    ");
                    $stmt->bindValue(1, $variant_option_id, PDO::PARAM_INT);
                    $stmt->bindValue(2, $product_id, PDO::PARAM_INT);
                    $stmt->execute();
                    $variant = $stmt->fetch(PDO::FETCH_OBJ);
                    
                    if ($variant) {
                        $variant_modifiers += (float)$variant->price_modifier;
                        $variant_details[] = [
                            'type' => $variant->variant_type,
                            'value' => $variant->option_value,
                            'modifier' => (float)$variant->price_modifier
                        ];
                    }
                }
            }
            
            $item_price += $variant_modifiers;
            $item_subtotal = $item_price * $available_quantity;
            
            $order_items[] = [
                'product_id' => $product_id,
                'product_name' => $product->name,
                'sku' => $product->sku,
                'quantity' => $available_quantity,
                'unit_price' => $item_price,
                'subtotal' => $item_subtotal,
                'variant_details' => $variant_details,
                'stock_before' => $product->stock_quantity
            ];
            
            $subtotal += $item_subtotal;
        }
                
        // Calculate tax (on subtotal - discount)
        $taxable_amount = $subtotal;
        $tax_amount = $taxable_amount * (float)$site_settings->store_gst/100;
        
        // Calculate total
        $order_total = $subtotal + $tax_amount;
        
        // Generate order number
        $order_number = generate_tracking_number();
                
         
        // Insert order
        $stmt = $conn->prepare("
            INSERT INTO orders (
                order_number, user_id, created_by_admin_id, pickup_id, recipient_first_name, recipient_last_name,
                recipient_email, recipient_phone, fulfillment_method, payment_method,
                subtotal, tax_amount, discount_amount, discount_code,
                total_amount, currency, payment_status, order_status, order_source
            ) VALUES (:order_number, :user_id, :created_by_admin_id, :pickup_id, :recipient_first_name, :recipient_last_name,
                :recipient_email, :recipient_phone, :fulfillment_method, :payment_method,
                :subtotal, :tax_amount, :discount_amount, :discount_code,
                :total_amount, :currency, :payment_status, :order_status, :order_source)
        ");
        
        $stmt->bindValue(":order_number", $order_number, PDO::PARAM_STR);
        $stmt->bindValue(":user_id", "0", PDO::PARAM_INT);
        $stmt->bindValue(":created_by_admin_id", $my_details->id, PDO::PARAM_INT);
        $stmt->bindValue(":pickup_id", null, PDO::PARAM_INT);
        $stmt->bindValue(":recipient_first_name", null, PDO::PARAM_STR);
        $stmt->bindValue(":recipient_last_name", null, PDO::PARAM_STR);
        $stmt->bindValue(":recipient_email", null, PDO::PARAM_STR);
        $stmt->bindValue(":recipient_phone", null, PDO::PARAM_STR);
        $stmt->bindValue(":fulfillment_method", "pickup", PDO::PARAM_STR);
        $stmt->bindValue(":payment_method", $_POST['payment_method'], PDO::PARAM_STR);
        $stmt->bindValue(":subtotal", $subtotal, PDO::PARAM_STR);
        $stmt->bindValue(":tax_amount", $tax_amount, PDO::PARAM_STR);
        $stmt->bindValue(":discount_amount", 0, PDO::PARAM_STR);
        $stmt->bindValue(":discount_code", null, PDO::PARAM_STR);
        $stmt->bindValue(":total_amount", $order_total, PDO::PARAM_STR);
        $stmt->bindValue(":currency", "CAD", PDO::PARAM_STR);
        $stmt->bindValue(":payment_status", "paid", PDO::PARAM_STR);
        $stmt->bindValue(":order_status", "delivered", PDO::PARAM_STR);
        $stmt->bindValue(":order_source", "pos", PDO::PARAM_STR);        
        if (!$stmt->execute()) {
            throw new Exception("Failed to create order");
        }
        
        $order_id = $conn->lastInsertId();
        
        // Insert order items and update stock
        foreach ($order_items as $item) {
            // Insert order item
            $stmt = $conn->prepare("
                INSERT INTO order_items (
                    order_id, product_id, product_name, unit_price, quantity, total_price
                ) VALUES (:order_id, :product_id, :product_name, :unit_price, :quantity, :total_price)
            ");
            
            $item_total = $item['subtotal'];
            
            $stmt->bindValue(":order_id", $order_id, PDO::PARAM_INT);
            $stmt->bindValue(":product_id", $item['product_id'], PDO::PARAM_INT);
            $stmt->bindValue(":product_name", $item['product_name'], PDO::PARAM_STR);
            $stmt->bindValue(":unit_price", $item['unit_price'], PDO::PARAM_STR);
            $stmt->bindValue(":quantity", $item['quantity'], PDO::PARAM_INT);
            $stmt->bindValue(":total_price", $item_total, PDO::PARAM_STR);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to add order item");
            }
            
            $order_item_id = $conn->lastInsertId();
            
            // Insert variant details if any
            if (!empty($item['variant_details'])) {
                foreach ($item['variant_details'] as $variant) {
                    // Get variant option ID
                    $stmt = $conn->prepare("
                        SELECT pvo.id
                        FROM product_variant_options pvo
                        JOIN product_variants pv ON pvo.variant_id = pv.id
                        WHERE pv.product_id = :product_id AND pvo.option_value = :option_value AND pv.variant_type = :variant_type
                    ");
                    $stmt->bindValue(":product_id", $item['product_id'], PDO::PARAM_INT);
                    $stmt->bindValue(":option_value", $variant['value'], PDO::PARAM_STR);
                    $stmt->bindValue(":variant_type", $variant['type'], PDO::PARAM_STR);
                    $stmt->execute();
                    $variant_option = $stmt->fetch(PDO::FETCH_OBJ);
                    
                    if ($variant_option) {
                        $stmt = $conn->prepare("
                            INSERT INTO order_item_variants (
                                order_item_id, option_id, option_value, variant_type, price_modifier
                            ) VALUES (:order_item_id, :option_id, :option_value, :variant_type, :price_modifier)
                        ");
                        $stmt->bindValue(":order_item_id", $order_item_id, PDO::PARAM_INT);
                        $stmt->bindValue(":option_id", $variant_option->id, PDO::PARAM_INT);
                        $stmt->bindValue(":option_value", $variant['value'], PDO::PARAM_STR);
                        $stmt->bindValue(":variant_type", $variant['type'], PDO::PARAM_STR);
                        $stmt->bindValue(":price_modifier", $variant['modifier'], PDO::PARAM_STR);
                        $stmt->execute();
                    }
                }
            }
            
            // Update product stock
            if ($item['stock_before'] !== null) {
                $new_stock = max(0, $item['stock_before'] - $item['quantity']);
                
                $stmt = $conn->prepare("
                    UPDATE products 
                    SET stock_quantity = :stock_quantity 
                    WHERE id = :product_id
                ");
                $stmt->bindValue(":stock_quantity", $new_stock, PDO::PARAM_INT);
                $stmt->bindValue(":product_id", $item['product_id'], PDO::PARAM_INT);
                
                if (!$stmt->execute()) {
                    throw new Exception("Failed to update stock for product {$item['product_id']}");
                }
            }
        }
        
        // Add order status history
        $stmt = $conn->prepare("
            INSERT INTO order_status_history (order_id, status, changed_by, note)
            VALUES (:order_id, :status, 'admin', 'POS Order Created')
        ");
        $stmt->bindValue(":order_id", $order_id, PDO::PARAM_INT);
        $stmt->bindValue(":status", "delivered", PDO::PARAM_STR);
        $stmt->execute();
        
        $stmt = $conn->prepare("
            INSERT INTO payments (
                order_id, method, provider, amount, currency, status
            ) VALUES (:order_id, 'cash', 'cash', :amount, :currency, 'paid')
        ");
        $stmt->bindValue(":order_id", $order_id, PDO::PARAM_INT);
        $stmt->bindValue(":amount", $order_total, PDO::PARAM_STR);
        $stmt->bindValue(":currency", "CAD", PDO::PARAM_STR);
        $stmt->execute();
                        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'error' => false,
            'data' => 'Order created successfully',
            'order' => [
                'id' => $order_id,
                'order_number' => $order_number,
                'total' => number_format($order_total, 2),
                'currency' => $currency,
                'subtotal' => number_format($subtotal, 2),
                'tax_amount' => number_format($tax_amount, 2),
                'payment_method' => $_POST['payment_method'],
            ]
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        if ($conn->inTransaction()) {
            $conn->rollback();
        }
        
        header('Content-Type: application/json');
        echo json_encode([
            'error' => true,
            'data' => $e->getMessage()
        ]);
    }
