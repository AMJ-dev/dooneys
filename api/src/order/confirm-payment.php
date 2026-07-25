<?php
    require_once dirname(__DIR__, 2) . "/vendor/autoload.php";
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    // Fetch and CLEAN the Stripe secret key
    $get_settings = $conn->prepare("SELECT stripe_secret_key, new_order_notification, low_stock_notification FROM store_settings LIMIT 1");
    $get_settings->execute();
    $site_settings = $get_settings->fetch(PDO::FETCH_OBJ);

    // Clean the secret key - remove ALL whitespace, newlines, and extra characters
    $stripe_secret_key = trim(preg_replace('/[\r\n\t\s]+/', '', $site_settings->stripe_secret_key));
    
    // Validate the key format
    if (strpos($stripe_secret_key, 'sk_') !== 0) {
        throw new Exception("Invalid Stripe secret key format. Key should start with 'sk_'");
    }
    
    // Set the API key with the cleaned key
    \Stripe\Stripe::setApiKey($stripe_secret_key);

    $error = false;
    $data  = null;

    try {

        if (
            empty($_POST['orderId']) ||
            empty($_POST['paymentIntentId'])
        ) {
            throw new Exception("Invalid request");
        }

        $order_id        = (int) $_POST['orderId'];
        $paymentIntentId = trim($_POST['paymentIntentId']);
        $user_id         = (int) $my_details->id;

        $conn->beginTransaction();

        // 1️⃣ Load order
        $stmt = $conn->prepare("
            SELECT id, total_amount, payment_method, payment_status
            FROM orders
            WHERE id = ? AND user_id = ?
            LIMIT 1
        ");
        $stmt->execute([$order_id, $user_id]);
        $order = $stmt->fetch(PDO::FETCH_OBJ);

        if (!$order) {
            throw new Exception("Order not found");
        }

        if ($order->payment_method !== 'card') {
            throw new Exception("Invalid payment method");
        }

        if ($order->payment_status === 'paid') {
            throw new Exception("Order already paid");
        }

        // 2️⃣ Verify payment intent with Stripe - with better error handling
        try {
            $intent = \Stripe\PaymentIntent::retrieve($paymentIntentId);
        } catch (\Stripe\Exception\AuthenticationException $e) {
            throw new Exception("Stripe authentication failed. Please check your API key.");
        } catch (\Stripe\Exception\ApiConnectionException $e) {
            throw new Exception("Stripe API connection failed. Please check your network.");
        } catch (\Stripe\Exception\InvalidRequestException $e) {
            throw new Exception("Invalid request to Stripe: " . $e->getMessage());
        } catch (\Stripe\Exception\ApiErrorException $e) {
            throw new Exception("Stripe API error: " . $e->getMessage());
        }

        if ($intent->status !== 'succeeded') {
            throw new Exception("Payment not successful. Status: " . $intent->status);
        }
        
        $paymentMethodId = $intent->payment_method; 
        $paymentMethod = \Stripe\PaymentMethod::retrieve($paymentMethodId); 
        $last4 = $paymentMethod->card->last4; 
        $brand = $paymentMethod->card->brand;
        
        $paidAmount = round($intent->amount_received / 100, 2);
        $orderTotal = round($order->total_amount, 2);

        if ($paidAmount !== $orderTotal) {
            throw new Exception("Payment amount mismatch: Paid {$paidAmount} vs Order {$orderTotal}");
        }
        
        // 3️⃣ Save payment
        $stmt = $conn->prepare("INSERT INTO payments 
        (order_id, payment_intent_id, provider, card_brand, last4, amount, currency, `status`, created_at) VALUES 
        (:order_id, :payment_intent_id, :provider, :card_brand, :last4, :amount, :currency, 'paid', NOW())");
        $stmt->bindValue(":order_id", $order_id, PDO::PARAM_INT);
        $stmt->bindValue(":payment_intent_id", $paymentIntentId, PDO::PARAM_STR);
        $stmt->bindValue(":provider", "card", PDO::PARAM_STR);
        $stmt->bindValue(":card_brand", $brand, PDO::PARAM_STR);
        $stmt->bindValue(":last4", $last4, PDO::PARAM_STR);
        $stmt->bindValue(":amount", $paidAmount, PDO::PARAM_STR);
        $stmt->bindValue(":currency", strtoupper($intent->currency), PDO::PARAM_STR);
        $stmt->execute();
        
        $stmt = $conn->prepare("
            UPDATE orders
            SET
                order_source = :order_source,
                payment_status = 'paid',
                last4 = :last4,
                card_brand = :card_brand,
                order_status   = 'processing',
                updated_at     = NOW()
            WHERE id = :order_id
        ");
        $stmt->bindValue(":order_source", "checkout", PDO::PARAM_STR);
        $stmt->bindValue(":order_id", $order_id, PDO::PARAM_INT);
        $stmt->bindValue(":last4", $last4, PDO::PARAM_STR);
        $stmt->bindValue(":card_brand", $brand, PDO::PARAM_STR);
        $stmt->execute();

        // 5️⃣ Status history
        $conn->prepare("
            INSERT INTO order_status_history (order_id, status, changed_by)
            VALUES (?, 'paid', 'system')
        ")->execute([$order_id]);

        // Get items for stock update
        $stmt = $conn->prepare("
            SELECT product_id, quantity
            FROM order_items
            WHERE order_id = ?
        ");
        $stmt->execute([$order_id]);
        $orderItems = $stmt->fetchAll(PDO::FETCH_OBJ);

        foreach ($orderItems as $item) {
            $product_id = (int) $item->product_id;
            $quantity   = max(1, (int) $item->quantity);

            $lock = $conn->prepare("
                SELECT stock_quantity
                FROM products
                WHERE id = ?
                FOR UPDATE
            ");
            $lock->execute([$product_id]);
            $product = $lock->fetch(PDO::FETCH_OBJ);

            if (!$product) {
                continue;
            }

            if ((int)$product->stock_quantity >= (int)$quantity) {
                $update = $conn->prepare("
                    UPDATE products
                    SET stock_quantity = stock_quantity - :qty
                    WHERE id = :pid
                ");
                $update->execute([
                    ":qty" => (int)$quantity,
                    ":pid" => (int)$product_id
                ]);
            }
        }

        // Update discount usage if applicable
        if (isset($_POST['discount_code']) && !empty($_POST['discount_code'])) {
            $stmt = $conn->prepare("
                SELECT id FROM discounts 
                WHERE code = ? AND is_active = 1
                LIMIT 1
            ");
            $stmt->execute([trim($_POST['discount_code'])]);
            $discount = $stmt->fetch(PDO::FETCH_OBJ);
            
            if ($discount) {
                $stmt = $conn->prepare("UPDATE discounts SET total_used = total_used + 1 WHERE id = :id ");
                $stmt->bindValue(":id", $discount->id, PDO::PARAM_INT);
                $stmt->execute();
            }
        }
        
        $conn->commit();

        // Get order details for email
        $stmt = $conn->prepare("
            SELECT o.*, 
                   COUNT(oi.id) as item_count,
                   GROUP_CONCAT(p.name SEPARATOR ', ') as product_names
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.id = ?
            GROUP BY o.id
        ");
        $stmt->execute([$order_id]);
        $orderDetails = $stmt->fetch(PDO::FETCH_OBJ);

        // send email to customer (keep your existing email code here)
        // ... email code ...

        // email to admin (keep your existing email code here)
        // ... admin email code ...

        // low stock notification (keep your existing email code here)
        // ... low stock code ...

        $data = [
            "orderId" => $order_id,
            "status"  => "paid"
        ];

    } catch (Throwable $e) {

        if ($conn->inTransaction()) {
            $conn->rollBack();
        }

        http_response_code(400);
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
?>