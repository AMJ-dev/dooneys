<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = null;

try {

    $stmt = $conn->prepare("
        SELECT
            o.id,
            o.order_number,
            o.order_status,
            o.total_amount,
            o.created_at,
            o.recipient_first_name,
            o.recipient_last_name,
            o.recipient_phone,
            o.recipient_email,
            o.last4,
            o.card_brand,
            o.order_source,
            o.user_id,
            o.created_by_admin_id,
            COUNT(oi.id) AS item_count
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    ");
    $stmt->execute();
    $ordersRaw = $stmt->fetchAll(PDO::FETCH_OBJ);

    $itemsStmt = $conn->prepare("
        SELECT
            oi.product_name,
            oi.quantity,
            oi.unit_price,
            COALESCE(
                (
                    SELECT pg.image
                    FROM product_gallery pg
                    WHERE pg.product_id = oi.product_id
                    ORDER BY pg.sort_order ASC
                    LIMIT 1
                ),
                ''
            ) AS image
        FROM order_items oi
        WHERE oi.order_id = ?
    ");

    $userStmt = $conn->prepare("
        SELECT first_name, last_name
        FROM users
        WHERE id = ?
        LIMIT 1
    ");

    $addrStmt = $conn->prepare("
        SELECT street_address, city, province, postal_code
        FROM user_addresses
        WHERE id = ?
        LIMIT 1
    ");

    $pickupStmt = $conn->prepare("
        SELECT address, city, state, zip_code
        FROM pickup_locations
        WHERE id = ?
        LIMIT 1
    ");

    $addrIdStmt = $conn->prepare("
        SELECT address_id, pickup_id
        FROM orders
        WHERE id = ?
        LIMIT 1
    ");

    $orders = [];

    foreach ($ordersRaw as $o) {

        if ($o->order_source === 'pos') {
            $userStmt->execute([$o->created_by_admin_id]);
        } else {
            $userStmt->execute([$o->user_id]);
        }

        $user = $userStmt->fetch(PDO::FETCH_OBJ);
        $customerName = $user ? trim($user->first_name . " " . $user->last_name) : "";

        $itemsStmt->execute([$o->id]);
        $items = [];
        foreach ($itemsStmt->fetchAll(PDO::FETCH_OBJ) as $i) {
            $items[] = [
                "name"     => $i->product_name,
                "quantity" => (int)$i->quantity,
                "price"    => (float)$i->unit_price,
                "image"    => $i->image
            ];
        }

        $shippingAddress = "";

        $addrIdStmt->execute([$o->id]);
        $addrIds = $addrIdStmt->fetch(PDO::FETCH_OBJ);

        if (!empty($addrIds->address_id)) {
            $addrStmt->execute([(int)$addrIds->address_id]);
            $a = $addrStmt->fetch(PDO::FETCH_OBJ);
            if ($a) {
                $shippingAddress = "{$a->street_address}, {$a->city}, {$a->province} {$a->postal_code}";
            }
        } elseif (!empty($addrIds->pickup_id)) {
            $pickupStmt->execute([(int)$addrIds->pickup_id]);
            $p = $pickupStmt->fetch(PDO::FETCH_OBJ);
            if ($p) {
                $shippingAddress = "{$p->address}, {$p->city}, {$p->state} {$p->zip_code} (Pickup)";
            }
        }

        $orders[] = [
            "id"               => $o->id,
            "order_number"     => $o->order_number,
            "order_source"     => $o->order_source,
            "customer"         => $customerName,
            "date"             => $o->created_at,
            "status"           => $o->order_status,
            "items"            => $items,
            "total"            => (float)$o->total_amount,
            "shippingAddress"  => $shippingAddress
        ];
    }

    $data = $orders;

} catch (Throwable $e) {
    http_response_code(400);
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);
