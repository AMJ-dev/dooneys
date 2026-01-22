<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {

        $order_id = (int)($_GET['id'] ?? 0);

        if ($order_id <= 0) {
            throw new Exception("Invalid order ID");
        }

        $orderStmt = $conn->prepare("
            SELECT
                o.id,
                o.user_id,
                o.created_by_admin_id,
                o.order_source,
                o.order_number,
                o.recipient_first_name,
                o.recipient_last_name,
                o.recipient_phone,
                o.recipient_email,
                o.fulfillment_method,
                o.payment_method,
                o.last4,
                o.card_brand,
                o.payment_status,
                o.order_status,
                o.subtotal,
                o.tax_amount,
                o.discount_amount,
                o.discount_code,
                o.shipping_cost,
                o.total_amount,
                o.shipping_carrier,
                o.shipping_eta,
                o.created_at,
                p.amount AS paid_amount,
                p.currency,
                p.payment_intent_id,
                p.created_at AS paid_at
            FROM orders o
            LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'paid'
            WHERE o.id = ?
            LIMIT 1
        ");
        $orderStmt->execute([$order_id]);
        $order = $orderStmt->fetch(PDO::FETCH_OBJ);

        if (!$order) {
            throw new Exception("Order not found");
        }

        if ($order->order_source === 'pos') {
            $actorId = $order->created_by_admin_id;
        } else {
            $actorId = $order->user_id;
        }

        $user = $actorId
            ? get_user($actorId, "first_name, last_name, email, mobile_number, pics")
            : null;

        $addressStmt = $conn->prepare("
            SELECT
                name,
                street_address,
                city,
                province,
                postal_code,
                phone
            FROM order_addresses
            WHERE order_id = ?
            LIMIT 1
        ");
        $addressStmt->execute([$order_id]);
        $address = $addressStmt->fetch(PDO::FETCH_OBJ);

        $statusStmt = $conn->prepare("
            SELECT status, note, created_at
            FROM order_status_history
            WHERE order_id = ?
            ORDER BY created_at DESC
        ");
        $statusStmt->execute([$order_id]);
        $status = $statusStmt->fetchAll(PDO::FETCH_OBJ);

        $itemsStmt = $conn->prepare("
            SELECT
                oi.id AS order_item_id,
                oi.product_id,
                oi.product_name,
                oi.unit_price,
                oi.quantity,
                oi.total_price,
                (
                    SELECT pg.image
                    FROM product_gallery pg
                    WHERE pg.product_id = oi.product_id
                    ORDER BY pg.sort_order ASC
                    LIMIT 1
                ) AS image
            FROM order_items oi
            WHERE oi.order_id = ?
        ");
        $itemsStmt->execute([$order_id]);

        $variantStmt = $conn->prepare("
            SELECT
                variant_type,
                option_value,
                price_modifier
            FROM order_item_variants
            WHERE order_item_id = ?
        ");

        $items = [];

        while ($row = $itemsStmt->fetch(PDO::FETCH_OBJ)) {

            $variantStmt->execute([$row->order_item_id]);
            $variants = $variantStmt->fetchAll(PDO::FETCH_OBJ);

            $items[] = [
                "product" => [
                    "id"    => (string)$row->product_id,
                    "name"  => $row->product_name,
                    "price" => (float)$row->unit_price,
                    "image" => $row->image
                ],
                "quantity"  => (int)$row->quantity,
                "lineTotal" => (float)$row->total_price,
                "variants"  => $variants
            ];
        }

        $data = [
            "order" => [
                "id" => $order_id,
                "orderNumber" => $order->order_number,
                "createdAt" => $order->created_at,
                "status" => [
                    "order"   => $order->order_status,
                    "payment" => $order->payment_status
                ]
            ],
            "order_source" => $order->order_source,
            "order_status_history" => $status,
            "customer" => $user ? [
                "name"  => $user->first_name . " " . $user->last_name,
                "email" => $user->email,
                "phone" => $user->mobile_number,
                "pics"  => $user->pics
            ] : null,
            "recipient" => [
                "name"  => trim($order->recipient_first_name . " " . $order->recipient_last_name),
                "email" => $order->recipient_email,
                "phone" => $order->recipient_phone
            ],
            "fulfillment" => [
                "method"  => $order->fulfillment_method,
                "carrier" => $order->shipping_carrier,
                "eta"     => $order->shipping_eta
            ],
            "payment" => [
                "method" => $order->payment_method,
                "status" => $order->payment_status,
                "paidAmount" => (float)$order->paid_amount,
                "currency" => $order->currency,
                "paymentIntentId" => $order->payment_intent_id,
                "paidAt" => $order->paid_at,
                "last4" => $order->last4,
                "card_brand" => $order->card_brand
            ],
            "totals" => [
                "subtotal" => (float)$order->subtotal,
                "shipping" => (float)$order->shipping_cost,
                "tax"      => (float)$order->tax_amount,
                "discount" => (float)$order->discount_amount,
                "discountCode" => $order->discount_code,
                "grandTotal" => (float)$order->total_amount
            ],
            "shippingAddress" => $address ? [
                "name"     => $address->name,
                "street"  => $address->street_address,
                "city"    => $address->city,
                "province"=> $address->province,
                "postal"  => $address->postal_code,
                "phone"   => $address->phone
            ] : null,
            "items" => $items,
            "receipt" => [
                "receiptNumber" => $order->order_number,
                "issuedAt" => $order->paid_at ?? $order->created_at,
                "merchant" => [
                    "name" => $AppName ?? "Store",
                    "email" => $comp_email ?? null,
                    "phone" => $comp_phone ?? null,
                    "address" => $comp_address ?? null
                ]
            ]
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
