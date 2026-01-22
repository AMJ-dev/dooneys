<?php
require_once dirname(__DIR__, 2) . "/include/verify-user.php";

$error = false;
$data  = null;

try {

    $orderNumber = $_GET['id'] ?? null;
    if (!$orderNumber) {
        throw new Exception("Invalid order ID");
    }

    $user_id = (int)$my_details->id;

    $stmt = $conn->prepare("
        SELECT
            id,
            order_number,
            order_status,
            payment_status,
            payment_method,
            subtotal,
            shipping_cost,
            tax_amount,
            discount_amount,
            total_amount,
            shipping_carrier,
            tracking_number,
            address_id,
            pickup_id,
            created_at
        FROM orders
        WHERE order_number = ?
        AND user_id = ?
        LIMIT 1
    ");
    $stmt->execute([$orderNumber, $user_id]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        throw new Exception("Order not found");
    }

    $itemStmt = $conn->prepare("
        SELECT
            oi.id,
            oi.product_id,
            oi.product_name,
            oi.unit_price,
            oi.quantity,
            COALESCE(
                (
                    SELECT pi.image
                    FROM product_images pi
                    WHERE pi.product_id = oi.product_id
                    ORDER BY pi.sort_order ASC
                    LIMIT 1
                ),
                ''
            ) AS image
        FROM order_items oi
        WHERE oi.order_id = ?
    ");
    $itemStmt->execute([$order['id']]);
    $itemsRaw = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

    $variantStmt = $conn->prepare("
        SELECT variant_type, option_value
        FROM order_item_variants
        WHERE order_item_id = ?
    ");

    $items = [];

    foreach ($itemsRaw as $row) {

        $variantStmt->execute([$row['id']]);
        $variantsRaw = $variantStmt->fetchAll(PDO::FETCH_ASSOC);

        $variants = [];
        foreach ($variantsRaw as $v) {
            $variants[$v['variant_type']] = $v['option_value'];
        }

        $items[] = [
            "id"       => (string)$row['product_id'],
            "name"     => $row['product_name'],
            "price"    => (float)$row['unit_price'],
            "quantity" => (int)$row['quantity'],
            "image"    => $row['image'],
            "variants" => $variants ?: null
        ];
    }

    if (!empty($order['address_id']) && (int)$order['address_id'] > 0) {

        $stmt = $conn->prepare("
            SELECT
                name,
                street_address,
                city,
                province,
                postal_code,
                country,
                phone
            FROM user_addresses
            WHERE id = ?
            AND user_id = ?
            LIMIT 1
        ");
        $stmt->execute([
            (int)$order['address_id'],
            $user_id
        ]);
        $addr = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$addr) {
            throw new Exception("Delivery address not found");
        }

        $shippingAddress = [
            "type"        => "delivery",
            "name"        => $addr['name'],
            "street"     => $addr['street_address'],
            "city"       => $addr['city'],
            "province"   => $addr['province'],
            "postalCode" => $addr['postal_code'],
            "country"    => $addr['country'],
            "phone"      => $addr['phone']
        ];

    } elseif (!empty($order['pickup_id']) && (int)$order['pickup_id'] > 0) {

        $stmt = $conn->prepare("
            SELECT
                name,
                address,
                city,
                state,
                zip_code,
                country,
                contact_phone
            FROM pickup_locations
            WHERE id = ?
            AND status = 'active'
            LIMIT 1
        ");
        $stmt->execute([(int)$order['pickup_id']]);
        $pickup = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$pickup) {
            throw new Exception("Pickup location not found");
        }

        $shippingAddress = [
            "type"        => "pickup",
            "name"        => $pickup['name'],
            "street"     => $pickup['address'],
            "city"       => $pickup['city'],
            "province"   => $pickup['state'],
            "postalCode" => $pickup['zip_code'],
            "country"    => $pickup['country'],
            "phone"      => $pickup['contact_phone']
        ];

    } else {
        throw new Exception("No address linked to this order");
    }

    $data = [
        "id"            => (string)$order['id'],
        "orderNumber"   => $order['order_number'],
        "date"          => $order['created_at'],
        "status"        => $order['order_status'],
        "paymentStatus" => ucfirst($order['payment_status']),
        "paymentMethod" => ucfirst($order['payment_method']),
        "subtotal"      => (float)$order['subtotal'],
        "shipping"      => (float)$order['shipping_cost'],
        "tax"           => (float)$order['tax_amount'],
        "discount"      => (float)$order['discount_amount'],
        "total"         => (float)$order['total_amount'],
        "carrier"       => $order['shipping_carrier'],
        "trackingNumber"=> $order['tracking_number'],
        "items"         => $items,
        "shippingAddress" => $shippingAddress
    ];

} catch (Throwable $e) {
    http_response_code(400);
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);
