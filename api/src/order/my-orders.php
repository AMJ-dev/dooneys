<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data  = [];

    try {

        $user_id = (int)$my_details->id;

        $stmt = $conn->prepare("
            SELECT
                o.id AS order_id,
                o.order_number,
                o.order_status,
                o.total_amount,
                o.created_at,

                oi.product_name,
                oi.quantity,
                oi.total_price,

                COALESCE(
                    (
                        SELECT pi.image
                        FROM product_gallery pi
                        WHERE pi.product_id = oi.product_id
                        ORDER BY pi.sort_order ASC
                        LIMIT 1
                    ),
                    ''
                ) AS product_image,

                CONCAT(
                    oa.street_address, ', ',
                    oa.city, ', ',
                    oa.province, ' ',
                    oa.postal_code
                ) AS shipping_address

            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN order_addresses oa ON oa.order_id = o.id

            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        ");

        $stmt->execute([$user_id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $orders = [];

        foreach ($rows as $r) {

            $oid = $r['order_id'];

            if (!isset($orders[$oid])) {
                $orders[$oid] = [
                    "id" => (string)$r["order_id"],
                    "orderNumber" => (string)$r["order_number"],
                    "date" => $r["created_at"],
                    "status" => $r["order_status"],
                    "total" => (float)$r["total_amount"],
                    "shippingAddress" => $r["shipping_address"],
                    "items" => []
                ];
            }

            $orders[$oid]["items"][] = [
                "name" => $r["product_name"],
                "quantity" => (int)$r["quantity"],
                "price" => (float)$r["total_price"],
                "image" => $r["product_image"]
            ];
        }

        $data = array_values($orders);

    } catch (Throwable $e) {
        http_response_code(400);
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
