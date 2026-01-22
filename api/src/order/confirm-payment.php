<?php
    require dirname(__DIR__, 2) . "/vendor/autoload.php";
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $get_settings = $conn->prepare("SELECT stripe_secret_key FROM store_settings LIMIT 1");
    $get_settings->execute();
    $site_settings = $get_settings->fetch(PDO::FETCH_OBJ);

    \Stripe\Stripe::setApiKey($site_settings->stripe_secret_key);

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

        // 2️⃣ Verify payment intent with Stripe
        $intent = \Stripe\PaymentIntent::retrieve($paymentIntentId);

        if ($intent->status !== 'succeeded') {
            throw new Exception("Payment not successful");
        }
        $paymentMethodId = $intent->payment_method; 
        $paymentMethod = \Stripe\PaymentMethod::retrieve($paymentMethodId); 
        $last4 = $paymentMethod->card->last4; 
        $brand = $paymentMethod->card->brand;
        
        $paidAmount = round($intent->amount_received / 100, 2);
        $orderTotal = round($order->total_amount, 2);

        if ($paidAmount !== $orderTotal) throw new Exception("Payment amount mismatch");
        
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

        foreach ($items as $item) {

            $product_id = (int) ($item['product_id'] ?? 0);
            $quantity   = max(1, (int) ($item['quantity'] ?? 1));
            $variants   = $item['variants'] ?? [];

            if ($product_id <= 0) {
                throw new Exception("Invalid product");
            }

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

            if ((int)$product->stock_quantity < (int)$quantity) {
                continue;
            }

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

        if (isset($discount) && $discount_amount > 0) {
            $stmt = $conn->prepare("UPDATE discounts SET total_used = total_used + 1 WHERE id = :id ");
            $stmt->bindValue(":id", $discount->id, PDO::PARAM_INT);
            $stmt->execute();
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

        // send email to customer
        $subject = "✨ Payment Confirmed - Order #{$order_id}";
        
        $message = <<<HTML
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Confirmation - Doonneys Beauty</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
                
                <!-- Main Container -->
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                    
                    <!-- Gradient Header -->
                    <div style="background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2%, transparent 2.5%); background-size: 50px 50px;"></div>
                        
                        <div style="position: relative; z-index: 2; margin-bottom: 20px;">
                            <div style="display: inline-block; width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);">
                                <span style="font-size: 40px; color: hsl(20,85%,50%);">✨</span>
                            </div>
                        </div>
                        
                        <h1 style="font-family: 'Playfair Display', Georgia, serif; color: white; font-size: 32px; margin: 0; font-weight: 600; position: relative; z-index: 2;">
                            Payment Confirmed
                        </h1>
                        <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px; position: relative; z-index: 2;">
                            Your Doonneys Beauty order is now processing
                        </p>
                    </div>
                    
                    <!-- Content Area -->
                    <div style="padding: 50px 40px;">
                        
                        <!-- Personal Greeting -->
                        <div style="margin-bottom: 30px;">
                            <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: hsl(20,30%,15%); margin: 0 0 15px 0; font-weight: 600;">
                                Hello, {$my_details->first_name}!
                            </h2>
                            <p style="color: hsl(20,20%,45%); font-size: 16px; margin: 0;">
                                Your payment for Order #{$order_id} has been successfully processed. We're preparing your beauty essentials with care.
                            </p>
                        </div>
                        
                        <!-- Order Summary Card -->
                        <div style="background: linear-gradient(135deg, hsl(30,30%,94%) 0%, hsl(30,20%,96%) 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(30,20%,88%); box-shadow: 0 4px 20px -4px hsla(20,30%,20%,0.08);">
                            <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 25px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                                <span>📦</span>
                                <span>Order Summary</span>
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                                <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                    <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                        #️⃣
                                    </div>
                                    <div style="flex: 1;">
                                        <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Order Number</p>
                                        <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px; font-weight: 600;">#{$order_id}</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                    <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                        💳
                                    </div>
                                    <div style="flex: 1;">
                                        <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Payment Method</p>
                                        <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$brand} •••• {$last4}</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                    <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                        💰
                                    </div>
                                    <div style="flex: 1;">
                                        <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Amount Paid</p>
                                        <p style="color: hsl(120,60%,40%); margin: 0; font-size: 15px; font-weight: 600;">\${$paidAmount}</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                    <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                        📊
                                    </div>
                                    <div style="flex: 1;">
                                        <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Items Ordered</p>
                                        <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$orderDetails->item_count} Beauty Products</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Next Steps -->
                        <div style="background: white; border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(20,85%,50%); box-shadow: 0 8px 30px -8px hsla(20,85%,50%,0.15);">
                            <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; text-align: center;">
                                🚀 What Happens Next?
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 25px;">
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                    <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">1</div>
                                    <span style="color: hsl(20,30%,15%); font-size: 15px;">Our beauty specialists carefully prepare your order</span>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                    <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">2</div>
                                    <span style="color: hsl(20,30%,15%); font-size: 15px;">You'll receive a shipping confirmation email</span>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                    <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">3</div>
                                    <span style="color: hsl(20,30%,15%); font-size: 15px;">Track your package with real-time updates</span>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                    <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">4</div>
                                    <span style="color: hsl(20,30%,15%); font-size: 15px;">Your beauty essentials arrive at your doorstep</span>
                                </div>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="{$baseURL}/account/orders" style="display: inline-block; background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); color: white; text-decoration: none; padding: 16px 36px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 6px 25px hsla(20,85%,50%,0.3);">
                                    📋 View Order Details
                                </a>
                            </div>
                        </div>
                        
                        <!-- Need Help -->
                        <div style="background: linear-gradient(135deg, hsl(210,40%,98%) 0%, hsl(210,40%,96%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px solid hsl(210,40%,90%);">
                            <h3 style="color: hsl(210,50%,40%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                                <span>💁</span>
                                <span>Need Help?</span>
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                                <a href="{$baseURL}/contact" style="display: block; background: hsl(210,50%,40%); color: white; text-decoration: none; padding: 14px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center;">
                                    📞 Contact Support
                                </a>
                                <a href="{$baseURL}/faq" style="display: block; background: white; color: hsl(210,50%,40%); text-decoration: none; padding: 14px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center; border: 2px solid hsl(210,50%,40%);">
                                    ❓ Visit FAQ
                                </a>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid hsl(30,20%,88%); text-align: center;">
                            <p style="color: hsl(20,20%,45%); margin: 0 0 15px 0; font-size: 15px;">
                                Thank you for trusting Doonneys Beauty with your skincare journey.
                            </p>
                            <p style="color: hsl(20,30%,25%); margin: 0; font-weight: 600; font-family: 'Playfair Display', Georgia, serif;">
                                Radiantly yours,<br>
                                <span style="color: hsl(20,85%,50%);">The Doonneys Beauty Team</span>
                            </p>
                        </div>
                        
                    </div>
                    
                    <!-- Bottom Bar -->
                    <div style="background: linear-gradient(135deg, hsl(20,25%,8%) 0%, hsl(20,30%,12%) 100%); padding: 20px 30px; text-align: center;">
                        <p style="color: hsl(30,20%,95%); margin: 0 0 10px 0; font-size: 12px;">
                            Order #{$order_id} • Paid: \${$paidAmount} • Status: Processing
                        </p>
                        <p style="color: hsl(30,15%,65%); margin: 0; font-size: 11px;">
                            This is an automated order confirmation. For assistance, contact support.
                        </p>
                    </div>
                    
                </div>

            </body>
            </html>
            HTML;

                    send_email($my_details->email, $my_details->first_name . " " . $my_details->last_name, $subject, $message);
                    
                    //email to admin
                    if($site_settings->new_order_notification=="1"){
                        // Enhanced admin notification email
                        $adminSubject = "✨ New Order Received - #{$order_id}";
                        $adminMessage = <<<HTML
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Order - Doonneys Beauty</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
                
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                    
                    <div style="background: linear-gradient(135deg, hsl(210,50%,40%) 0%, hsl(210,60%,30%) 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="font-family: 'Playfair Display', serif; color: white; font-size: 28px; margin: 0; font-weight: 600;">
                            🚨 New Order Alert
                        </h1>
                        <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px;">
                            Order #{$order_id} has been paid
                        </p>
                    </div>
                    
                    <div style="padding: 40px;">
                        <div style="background: hsl(30,30%,94%); border-radius: 12px; padding: 25px; margin-bottom: 20px;">
                            <h3 style="color: hsl(20,30%,25%); margin-top: 0; font-family: 'Playfair Display', serif; font-size: 18px;">
                                📊 Order Summary
                            </h3>
                            <p style="color: hsl(20,30%,15%); margin: 8px 0;">
                                <strong>Order ID:</strong> #{$order_id}
                            </p>
                            <p style="color: hsl(20,30%,15%); margin: 8px 0;">
                                <strong>Customer:</strong> {$my_details->first_name} {$my_details->last_name}
                            </p>
                            <p style="color: hsl(20,30%,15%); margin: 8px 0;">
                                <strong>Amount:</strong> \${$paidAmount}
                            </p>
                            <p style="color: hsl(20,30%,15%); margin: 8px 0;">
                                <strong>Payment:</strong> {$brand} •••• {$last4}
                            </p>
                            <p style="color: hsl(20,30%,15%); margin: 8px 0;">
                                <strong>Items:</strong> {$orderDetails->item_count} products
                            </p>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="{$baseURL}/admin/orders/edit/{$order_id}" style="display: inline-block; background: linear-gradient(135deg, hsl(210,50%,40%) 0%, hsl(210,60%,30%) 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 15px;">
                                📋 Process Order
                            </a>
                        </div>
                    </div>
                    
                    <div style="background: hsl(20,25%,8%); padding: 20px; text-align: center;">
                        <p style="color: hsl(30,20%,95%); margin: 0; font-size: 12px;">
                            Doonneys Beauty Admin Notification
                        </p>
                    </div>
                    
                </div>

            </body>
            </html>
            HTML;

                        send_email($comp_email, $AppName, $adminSubject, $adminMessage);
                    }

                    //email to admin that the product has low quantity
            if($site_settings->low_stock_notification=="1"){
                // Get all low stock products
                $stmt = $conn->prepare("
                    SELECT id, `name`, stock_quantity, low_stock_alert 
                    FROM products 
                    WHERE stock_quantity > 0 AND stock_quantity <= low_stock_alert
                    ORDER BY stock_quantity ASC
                ");
                $stmt->execute();
                $lowStockProducts = $stmt->fetchAll(PDO::FETCH_OBJ);
                
                // Get all out of stock products
                $stmt = $conn->prepare("
                    SELECT id, `name`, stock_quantity 
                    FROM products 
                    WHERE stock_quantity = 0 AND in_stock = 1
                ");
                $stmt->execute();
                $outOfStockProducts = $stmt->fetchAll(PDO::FETCH_OBJ);
                
                // Send combined email if there are any stock issues
                if($lowStockProducts || $outOfStockProducts){
                    $subject = "📦 Stock Status Alert - " . date('M j, Y');
                    
                    $message = <<<HTML
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Stock Alert - Doonneys Beauty</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
                
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); padding: 40px 30px; text-align: center; position: relative;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2%, transparent 2.5%); background-size: 50px 50px;"></div>
                        
                        <h1 style="font-family: 'Playfair Display', serif; color: white; font-size: 28px; margin: 0; font-weight: 600; position: relative; z-index: 2;">
                            📦 Stock Status Update
                        </h1>
                        <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px; position: relative; z-index: 2;">
                            Action Required: Review Product Inventory
                        </p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px;">
            HTML;

                    // Low Stock Section
                    if($lowStockProducts){
                        $lowStockCount = count($lowStockProducts);
                        $message .= <<<HTML
                        <div style="margin-bottom: 30px;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                                <div style="background: hsl(40,90%,50%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 18px;">
                                    ⚠️
                                </div>
                                <h2 style="font-family: 'Playfair Display', serif; color: hsl(20,30%,15%); margin: 0; font-size: 22px;">
                                    Low Stock Products ({$lowStockCount})
                                </h2>
                            </div>
                            
                            <div style="background: hsl(40,90%,97%); border-radius: 12px; overflow: hidden; border: 1px solid hsl(40,90%,85%);">
                                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; background: hsl(40,90%,92%); padding: 15px 20px; border-bottom: 1px solid hsl(40,90%,85%);">
                                    <div style="font-weight: 600; color: hsl(40,90%,30%);">Product Name</div>
                                    <div style="font-weight: 600; color: hsl(40,90%,30%);">Current Stock</div>
                                    <div style="font-weight: 600; color: hsl(40,90%,30%);">Alert Level</div>
                                </div>
            HTML;

                        foreach($lowStockProducts as $product){
                            $percentage = round(($product->stock_quantity / $product->low_stock_alert) * 100);
                            $message .= <<<HTML
                                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; padding: 15px 20px; border-bottom: 1px solid hsl(40,90%,92%); background: white;">
                                        <div style="color: hsl(20,30%,15%); font-weight: 500;">{$product->name}</div>
                                        <div style="color: hsl(40,90%,40%); font-weight: 600;">{$product->stock_quantity}</div>
                                        <div>
                                            <div style="background: hsl(40,90%,90%); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 5px;">
                                                <div style="background: hsl(40,90%,50%); height: 100%; width: {$percentage}%;"></div>
                                            </div>
                                            <div style="color: hsl(20,20%,45%); font-size: 12px;">{$product->low_stock_alert} units</div>
                                        </div>
                                    </div>
            HTML;
                        }
                        
                        $message .= <<<HTML
                                </div>
                                <div style="padding: 15px 20px; background: hsl(40,90%,92%); text-align: center;">
                                    <a href="{$baseURL}/admin/products?filter=low_stock" style="display: inline-block; background: hsl(40,90%,50%); color: white; text-decoration: none; padding: 10px 25px; border-radius: 25px; font-weight: 600; font-size: 14px;">
                                        🔄 Restock Products
                                    </a>
                                </div>
                            </div>
                        </div>
            HTML;
                    }

                    // Out of Stock Section
                    if($outOfStockProducts){
                        $outOfStockCount = count($outOfStockProducts);
                        $message .= <<<HTML
                        <div style="margin-bottom: 30px;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                                <div style="background: hsl(0,90%,60%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 18px;">
                                    🛑
                                </div>
                                <h2 style="font-family: 'Playfair Display', serif; color: hsl(20,30%,15%); margin: 0; font-size: 22px;">
                                    Out of Stock Products ({$outOfStockCount})
                                </h2>
                            </div>
                            
                            <div style="background: hsl(0,90%,97%); border-radius: 12px; overflow: hidden; border: 1px solid hsl(0,90%,85%);">
                                <div style="display: grid; grid-template-columns: 2fr 1fr; background: hsl(0,90%,92%); padding: 15px 20px; border-bottom: 1px solid hsl(0,90%,85%);">
                                    <div style="font-weight: 600; color: hsl(0,90%,30%);">Product Name</div>
                                    <div style="font-weight: 600; color: hsl(0,90%,30%);">Status</div>
                                </div>
            HTML;

                        foreach($outOfStockProducts as $product){
                            $message .= <<<HTML
                                    <div style="display: grid; grid-template-columns: 2fr 1fr; padding: 15px 20px; border-bottom: 1px solid hsl(0,90%,92%); background: white;">
                                        <div style="color: hsl(20,30%,15%); font-weight: 500;">{$product->name}</div>
                                        <div>
                                            <span style="background: hsl(0,90%,60%); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                                OUT OF STOCK
                                            </span>
                                        </div>
                                    </div>
            HTML;
                        }
                        
                        $message .= <<<HTML
                                </div>
                                <div style="padding: 15px 20px; background: hsl(0,90%,92%); text-align: center;">
                                    <a href="{$baseURL}/admin/products?filter=out_of_stock" style="display: inline-block; background: hsl(0,90%,60%); color: white; text-decoration: none; padding: 10px 25px; border-radius: 25px; font-weight: 600; font-size: 14px;">
                                        ⚡ Urgent Restock Required
                                    </a>
                                </div>
                            </div>
                        </div>
            HTML;
                    }

                    // Update out of stock status
                    if($outOfStockProducts){
                        foreach($outOfStockProducts as $product){
                            $update=$conn->prepare("UPDATE products SET in_stock = 0 WHERE id = ?");
                            $update->execute([$product->id]);
                        }
                    }

                    // Summary Stats
                    $totalIssues = count($lowStockProducts) + count($outOfStockProducts);
                    $message .= <<<HTML
                        <!-- Summary -->
                        <div style="background: linear-gradient(135deg, hsl(210,40%,98%) 0%, hsl(210,40%,96%) 100%); border-radius: 12px; padding: 25px; margin-top: 30px; border: 1px solid hsl(210,40%,90%);">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center;">
                                <div>
                                    <div style="font-size: 32px; color: hsl(40,90%,50%); font-weight: 700;">{$lowStockCount}</div>
                                    <div style="color: hsl(40,90%,30%); font-size: 14px; font-weight: 600;">Low Stock Items</div>
                                </div>
                                <div>
                                    <div style="font-size: 32px; color: hsl(0,90%,60%); font-weight: 700;">{$outOfStockCount}</div>
                                    <div style="color: hsl(0,90%,30%); font-size: 14px; font-weight: 600;">Out of Stock</div>
                                </div>
                            </div>
                            
                            <div style="margin-top: 20px; text-align: center;">
                                <a href="{$baseURL}/admin/inventory" style="display: inline-block; background: linear-gradient(135deg, hsl(210,50%,40%) 0%, hsl(210,60%,30%) 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; font-size: 14px;">
                                    📊 View Full Inventory Report
                                </a>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid hsl(30,20%,88%); text-align: center;">
                            <p style="color: hsl(20,20%,45%); margin: 0 0 10px 0; font-size: 14px;">
                                This is an automated stock notification. Products have been automatically marked out of stock.
                            </p>
                            <p style="color: hsl(20,30%,25%); margin: 0; font-weight: 600; font-family: 'Playfair Display', serif;">
                                Doonneys Beauty Inventory System
                            </p>
                        </div>
                    </div>
                    
                    <!-- Bottom Bar -->
                    <div style="background: linear-gradient(135deg, hsl(20,25%,8%) 0%, hsl(20,30%,12%) 100%); padding: 15px 30px; text-align: center;">
                        <p style="color: hsl(30,15%,65%); margin: 0; font-size: 11px;">
                            Generated: {$currentDateTime} • Total Issues: {$totalIssues}
                        </p>
                    </div>
                    
                </div>

            </body>
            </html>
            HTML;

                    send_email($comp_email, $AppName, $subject, $message);
                }
            }
        
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