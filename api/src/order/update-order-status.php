<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $id     = $_POST['id'] ?? null;
    $status = $_POST['status'] ?? null;
    $note   = $_POST['note'] ?? null;

    $allowedStatuses = [
        'pending',
        'processing',
        'packaging',
        'shipped',
        'ready_for_pickup',
        'delivered',
        'cancelled'
    ];

    if (!$id || !$status) {
        echo json_encode([
            "error" => true,
            "data"  => "Order ID and status are required"
        ]);
        exit;
    }

    if (!in_array($status, $allowedStatuses, true)) {
        echo json_encode([
            "error" => true,
            "data"  => "Invalid order status"
        ]);
        exit;
    }

    try {
        $conn->beginTransaction();

        // 1️⃣ Update orders table
        $stmt = $conn->prepare("UPDATE orders SET order_status = :status WHERE id = :id");
        $stmt->execute([
            ":status" => $status,
            ":id"     => $id
        ]);

        if ($stmt->rowCount() === 0) {
            throw new Exception("Order not found or status unchanged");
        }

        // 2️⃣ Insert into order_status_history
        $stmt = $conn->prepare("
            INSERT INTO order_status_history (
                order_id,
                status,
                note,
                changed_by,
                created_at
            ) VALUES (
                :order_id,
                :status,
                :note,
                'admin',
                NOW()
            )
        ");
        $stmt->execute([
            ":order_id" => $id,
            ":status"   => $status,
            ":note"     => $note
        ]);

        // Get order and user details
        $get_order = $conn->prepare("
            SELECT o.*, u.email, u.mobile_number, u.first_name, u.last_name 
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = :id
        ");
        $get_order->execute([":id" => $id]);
        $order = $get_order->fetch(PDO::FETCH_OBJ);

        if (!$order) {
            throw new Exception("Order not found");
        }
        if($_POST['status'] == "shipped") require_once __DIR__."/create-shipment.php";
        

        $stmt = $conn->prepare("SELECT order_updates, sms_alerts FROM user_notifications WHERE user_id = :user_id");
        $stmt->execute([":user_id" => $order->user_id]);

        $notification = $stmt->fetch(PDO::FETCH_OBJ);

        // Send email notification if enabled
        if ($notification && $notification->order_updates == "1") {
            $statusIcons = [
                'pending' => '⏳',
                'processing' => '🔄',
                'packaging' => '📦',
                'shipped' => '🚚',
                'ready_for_pickup' => '🏪',
                'delivered' => '✅',
                'cancelled' => '❌'
            ];

            $statusTitles = [
                'pending' => 'Order Received',
                'processing' => 'Processing Your Order',
                'packaging' => 'Packaging Your Items',
                'shipped' => 'Shipped & On The Way',
                'ready_for_pickup' => 'Ready for Pickup',
                'delivered' => 'Delivered Successfully',
                'cancelled' => 'Order Cancelled'
            ];

            $statusDescriptions = [
                'pending' => 'Your order has been received and is awaiting processing.',
                'processing' => 'Our team is now processing your beauty essentials with care.',
                'packaging' => 'Your items are being carefully packaged for delivery.',
                'shipped' => 'Your package is now on its way to you.',
                'ready_for_pickup' => 'Your order is ready for pickup at our store.',
                'delivered' => 'Your order has been delivered to your address.',
                'cancelled' => 'Your order has been cancelled as requested.'
            ];

            $icon = $statusIcons[$status] ?? '📦';
            $title = $statusTitles[$status] ?? 'Order Status Updated';
            $description = $statusDescriptions[$status] ?? 'Your order status has been updated.';
            
            $subject = "{$icon} Order #{$order->id}: {$title}";
            
            $message = <<<HTML
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Order Status Update - Doonneys Beauty</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
                    
                    <!-- Main Container -->
                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                        
                        <!-- Dynamic Header based on status -->
                        <div style="background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
                            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2%, transparent 2.5%); background-size: 50px 50px;"></div>
                            
                            <div style="position: relative; z-index: 2; margin-bottom: 20px;">
                                <div style="display: inline-block; width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);">
                                    <span style="font-size: 40px; color: hsl(20,85%,50%);">{$icon}</span>
                                </div>
                            </div>
                            
                            <h1 style="font-family: 'Playfair Display', Georgia, serif; color: white; font-size: 32px; margin: 0; font-weight: 600; position: relative; z-index: 2;">
                                {$title}
                            </h1>
                            <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px; position: relative; z-index: 2;">
                                Order #{$order->id} • {$description}
                            </p>
                        </div>
                        
                        <!-- Content Area -->
                        <div style="padding: 50px 40px;">
                            
                            <!-- Personal Greeting -->
                            <div style="margin-bottom: 30px;">
                                <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: hsl(20,30%,15%); margin: 0 0 15px 0; font-weight: 600;">
                                    Hello, {$order->first_name}!
                                </h2>
                                <p style="color: hsl(20,20%,45%); font-size: 16px; margin: 0;">
                                    Your Doonneys Beauty order status has been updated. Here are the latest details:
                                </p>
                            </div>
                            
                            <!-- Order Status Card -->
                            <div style="background: linear-gradient(135deg, hsl(30,30%,94%) 0%, hsl(30,20%,96%) 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(30,20%,88%); box-shadow: 0 4px 20px -4px hsla(20,30%,20%,0.08);">
                                <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 25px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                                    <span>📋</span>
                                    <span>Order Status Update</span>
                                </h3>
                                
                                <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                                    <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                        <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                            #️⃣
                                        </div>
                                        <div style="flex: 1;">
                                            <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Order Number</p>
                                            <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px; font-weight: 600;">#{$order->id}</p>
                                        </div>
                                    </div>
                                    
                                    <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                        <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                            🔄
                                        </div>
                                        <div style="flex: 1;">
                                            <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">New Status</p>
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <span style="color: hsl(20,30%,15%); margin: 0; font-size: 15px; font-weight: 600; text-transform: capitalize;">{$status}</span>
                                                <span style="font-size: 20px;">{$icon}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                HTML;

                            // Add tracking info for shipped orders
                            if ($status === 'shipped') {
                                $message .= <<<HTML
                                    <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                        <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                            🚚
                                        </div>
                                        <div style="flex: 1;">
                                            <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Shipping Update</p>
                                            <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">Your package is now in transit</p>
                                        </div>
                                    </div>
                HTML;
                            }

                            // Add note if provided
                            if (!empty($note)) {
                                $message .= <<<HTML
                                    <div style="padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                        <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px;">
                                            <div style="background: hsl(20,85%,50%); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 14px;">
                                                📝
                                            </div>
                                            <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0; font-size: 14px;">Admin Note</p>
                                        </div>
                                        <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px; padding-left: 42px;">{$note}</p>
                                    </div>
                HTML;
                            }

                            $message .= <<<HTML
                                </div>
                            </div>
                            
                            <!-- Next Steps -->
                            <div style="background: white; border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(20,85%,50%); box-shadow: 0 8px 30px -8px hsla(20,85%,50%,0.15);">
                                <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; text-align: center;">
                                    📍 What to Expect Next
                                </h3>
                                
                                <div style="display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 25px;">
                HTML;

                            // Dynamic next steps based on status
                            $nextSteps = [
                                'pending' => [
                                    ['icon' => '⏳', 'text' => 'Your order will be reviewed by our team'],
                                    ['icon' => '📞', 'text' => 'We may contact you for verification if needed'],
                                    ['icon' => '📦', 'text' => 'Processing will begin within 24 hours']
                                ],
                                'processing' => [
                                    ['icon' => '🧴', 'text' => 'Our beauty specialists are preparing your items'],
                                    ['icon' => '✨', 'text' => 'Quality checking all products'],
                                    ['icon' => '📦', 'text' => 'Packaging will begin shortly']
                                ],
                                'packaging' => [
                                    ['icon' => '📦', 'text' => 'Your items are being carefully packaged'],
                                    ['icon' => '🎁', 'text' => 'Eco-friendly packaging materials used'],
                                    ['icon' => '🚚', 'text' => 'Will be handed to courier soon']
                                ],
                                'shipped' => [
                                    ['icon' => '📱', 'text' => 'Track your package in real-time'],
                                    ['icon' => '🏠', 'text' => 'Estimated delivery: 3-5 business days'],
                                    ['icon' => '📦', 'text' => 'Watch for delivery notifications']
                                ],
                                'ready_for_pickup' => [
                                    ['icon' => '🏪', 'text' => 'Bring your ID and order confirmation'],
                                    ['icon' => '⏰', 'text' => 'Store hours: 9 AM - 8 PM, 7 days a week'],
                                    ['icon' => '📞', 'text' => 'Call ahead if you need assistance']
                                ],
                                'delivered' => [
                                    ['icon' => '🎉', 'text' => 'Enjoy your new beauty essentials!'],
                                    ['icon' => '⭐', 'text' => 'Leave a review to help others'],
                                    ['icon' => '🔄', 'text' => 'Need help? Contact our support team']
                                ],
                                'cancelled' => [
                                    ['icon' => '💳', 'text' => 'Refund processed within 5-7 business days'],
                                    ['icon' => '📧', 'text' => 'Refund confirmation will be emailed to you'],
                                    ['icon' => '🛍️', 'text' => 'Browse our collection for your next purchase']
                                ]
                            ];

                            $currentSteps = $nextSteps[$status] ?? $nextSteps['pending'];
                            
                            foreach ($currentSteps as $step) {
                                $message .= <<<HTML
                                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                        <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">{$step['icon']}</div>
                                        <span style="color: hsl(20,30%,15%); font-size: 15px;">{$step['text']}</span>
                                    </div>
                HTML;
                            }

                            $message .= <<<HTML
                                </div>
                                
                                <div style="text-align: center;">
                                    <a href="{$baseURL}/account/orders/{$order->id}" style="display: inline-block; background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); color: white; text-decoration: none; padding: 16px 36px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 6px 25px hsla(20,85%,50%,0.3);">
                                        🔍 View Order Details
                                    </a>
                                </div>
                            </div>
                            
                            <!-- Need Help -->
                            <div style="background: linear-gradient(135deg, hsl(210,40%,98%) 0%, hsl(210,40%,96%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px solid hsl(210,40%,90%);">
                                <h3 style="color: hsl(210,50%,40%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                                    <span>💁</span>
                                    <span>Need Help?</span>
                                </h3>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                    <a href="{$baseURL}/contact" style="display: block; background: hsl(210,50%,40%); color: white; text-decoration: none; padding: 14px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center;">
                                        📞 Contact Support
                                    </a>
                                    <a href="{$baseURL}/faq" style="display: block; background: white; color: hsl(210,50%,40%); text-decoration: none; padding: 14px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center; border: 2px solid hsl(210,50%,40%);">
                                        ❓ View FAQ
                                    </a>
                                </div>
                            </div>
                            
                            <!-- Footer -->
                            <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid hsl(30,20%,88%); text-align: center;">
                                <p style="color: hsl(20,20%,45%); margin: 0 0 15px 0; font-size: 15px;">
                                    Thank you for shopping with Doonneys Beauty.
                                </p>
                                <p style="color: hsl(20,30%,25%); margin: 0; font-weight: 600; font-family: 'Playfair Display', Georgia, serif;">
                                    With radiant regards,<br>
                                    <span style="color: hsl(20,85%,50%);">The Doonneys Beauty Team</span>
                                </p>
                            </div>
                            
                        </div>
                        
                        <!-- Bottom Bar -->
                        <div style="background: linear-gradient(135deg, hsl(20,25%,8%) 0%, hsl(20,30%,12%) 100%); padding: 20px 30px; text-align: center;">
                            <p style="color: hsl(30,20%,95%); margin: 0 0 10px 0; font-size: 12px;">
                                Order #{$order->id} • Status: {$status} • Updated: {$currentDateTime}
                            </p>
                            <p style="color: hsl(30,15%,65%); margin: 0; font-size: 11px;">
                                This is an automated order status notification.
                            </p>
                        </div>
                        
                    </div>

                </body>
                </html>
                HTML;

            send_email($order->email, $order->first_name . " " . $order->last_name, $subject, $message);
        }

        // Send SMS notification if enabled
        if ($notification && $notification->sms_alerts == "1" && !empty($order->mobile_number)) {
            $smsMessages = [
                'pending' => "📦 Doonneys Beauty: Order #{$order->id} received. We'll process it soon!",
                'processing' => "🔄 Doonneys Beauty: Order #{$order->id} is being processed. Your beauty essentials are being prepared.",
                'packaging' => "📦 Doonneys Beauty: Order #{$order->id} is being packaged with care.",
                'shipped' => "🚚 Doonneys Beauty: Order #{$order->id} shipped! Track your package: {$baseURL}/track/{$order->id}",
                'ready_for_pickup' => "🏪 Doonneys Beauty: Order #{$order->id} ready for pickup! Bring your ID to our store.",
                'delivered' => "✅ Doonneys Beauty: Order #{$order->id} delivered! Enjoy your beauty products.",
                'cancelled' => "❌ Doonneys Beauty: Order #{$order->id} cancelled. Refund will be processed within 5-7 days."
            ];
            
            $smsMessage = $smsMessages[$status] ?? "Doonneys Beauty: Order #{$order->id} status updated to {$status}";
            
            send_sms($order->mobile_number, $smsMessage);
        }

        $conn->commit();

        echo json_encode([
            "error" => false,
            "data"  => "Order status updated successfully"
        ]);

    } catch (Exception $e) {
        $conn->rollBack();

        echo json_encode([
            "error" => true,
            "data"  => $e->getMessage()
        ]);
    }
?>