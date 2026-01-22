<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $order_id = $_POST['order_id'] ?? null;

    if (!$order_id) {
        echo json_encode([
            "error" => true,
            "data"  => "Order ID is required"
        ]);
        exit;
    }

    try {
        $conn->beginTransaction();

        // 1️⃣ Get order total amount
        $stmt = $conn->prepare("
            SELECT total_amount
            FROM orders
            WHERE id = :order_id
            LIMIT 1
        ");
        $stmt->execute([
            ":order_id" => $order_id
        ]);

        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            throw new Exception("Order not found");
        }

        $amount = $order['total_amount'];

        // 2️⃣ Insert cash payment
        $stmt = $conn->prepare("
            INSERT INTO payments (
                order_id,
                method,
                provider,
                amount,
                status,
                currency,
                created_at
            ) VALUES (
                :order_id,
                'cash',
                'card',
                :amount,
                'paid',
                'CAD',
                NOW()
            )
        ");

        $stmt->execute([
            ":order_id" => $order_id,
            ":amount"   => $amount
        ]);

        // 3️⃣ Update order payment info
        $stmt = $conn->prepare("
            UPDATE orders
            SET
                created_by_admin_id = :created_by_admin_id,
                order_source = 'admin',
                payment_status = 'paid',
                payment_method = 'cash'
            WHERE id = :order_id
        ");

        $stmt->execute([
            ":created_by_admin_id" => $my_details->id,
            ":order_id" => $order_id
        ]);

        $get_items = $conn->prepare("SELECT product_id, quantity FROM order_items WHERE order_id = :order_id");
        $get_items->execute([
            ":order_id" => $order_id
        ]);

        $items = $get_items->fetchAll(PDO::FETCH_ASSOC);

        foreach ($items as $item) {

            $product_id = (int) ($item['product_id'] ?? 0);
            $quantity   = max(1, (int) ($item['quantity'] ?? 1));

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
                // throw new Exception("Product not found");
            }

            if ((int)$product->stock_quantity < (int)$quantity) {
                continue;
                // throw new Exception("Insufficient stock for product ID {$product_id}");
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
        $conn->commit();

        echo json_encode([
            "error" => false,
            "data"  => "Cash payment recorded successfully"
        ]);

    } catch (Exception $e) {
        $db->rollBack();

        echo json_encode([
            "error" => true,
            "data"  => $e->getMessage()
        ]);
    }
