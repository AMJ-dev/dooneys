<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data  = null;
    try {

        if (empty($_POST['items']) || !is_array($_POST['items'])) {
            throw new Exception("Invalid items payload");
        }

        $conn->beginTransaction();

        $user_id = (int) $my_details->id;
        $pickup_id = NULL;
        if($_POST["fulfillment_method"] == "pickup") {
            if(!isset($_POST["pickup_id"])) {
                throw new Exception("Invalid pickup ID");
            }
            $pickup_id = $_POST["pickup_id"];
        }

        require_once __DIR__ . "/get-total.php"; 

        $orderNumber = generate_tracking_number();

        $orderStmt = $conn->prepare("
            INSERT INTO orders (
                order_number,
                user_id,
                pickup_id,
                recipient_first_name,
                recipient_last_name,
                recipient_phone,
                recipient_email,
                fulfillment_method,
                payment_method,
                shipping_cost,
                subtotal,
                tax_amount,
                discount_amount,
                discount_code,
                total_amount,
                payment_status,
                order_status,
                created_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'processing', NOW()
            )
        ");

        $orderStmt->execute([
            $orderNumber,
            $user_id,
            $pickup_id,
            $_POST["recipient_first_name"],
            $_POST["recipient_last_name"],
            $_POST["recipient_phone"],
            $_POST["recipient_email"],
            $fulfillment,
            $payment,
            $shipping_cost,
            $subtotal,
            $tax,
            $discount_amount,
            $discount_code,
            $total
        ]);

        $order_id = (int) $conn->lastInsertId();

        if ($address) {
            $addrStmt = $conn->prepare("
                INSERT INTO order_addresses (
                    order_id,
                    name,
                    street_address,
                    city,
                    province,
                    postal_code,
                    phone
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ");

            $addrStmt->execute([
                $order_id,
                $_POST['recipient']['name'] ?? $address->name,
                $address->street_address,
                $address->city,
                $address->province,
                $address->postal_code,
                $_POST['recipient']['phone'] ?? $address->mobile_number
            ]);
        }

        $itemStmt = $conn->prepare("
            INSERT INTO order_items (
                order_id,
                product_id,
                product_name,
                unit_price,
                quantity,
                total_price
            ) VALUES (?, ?, ?, ?, ?, ?)
        ");

        $variantInsert = $conn->prepare("
            INSERT INTO order_item_variants (
                order_item_id,
                variant_type,
                option_id,
                option_value,
                price_modifier
            ) VALUES (?, ?, ?, ?, ?)
        ");

        foreach ($computedItems as $ci) {
            $itemStmt->execute([
                $order_id,
                $ci['product_id'],
                $ci['product_name'],
                $ci['unit_price'],
                $ci['quantity'],
                $ci['line_total']
            ]);

            $order_item_id = (int) $conn->lastInsertId();

            foreach ($ci['variants'] as $v) {
                $variantInsert->execute([
                    $order_item_id,
                    $v['variant_type'],
                    $v['option_id'],
                    $v['option_value'],
                    $v['price_modifier']
                ]);
            }
        }

        $conn->prepare("
            INSERT INTO order_status_history (order_id, status, changed_by)
            VALUES (?, 'processing', 'system')
        ")->execute([$order_id]);

        $conn->commit();

        $data = [
            "orderId"     => $order_id,
            "orderNumber" => $orderNumber,
            "total"       => $total
        ];

    } catch (Throwable $e) {

        if ($conn->inTransaction()) {
            $conn->rollBack();
        }

        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
