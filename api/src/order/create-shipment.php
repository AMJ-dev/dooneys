<?php
    $get_address = $conn->prepare("SELECT * FROM user_addresses WHERE id = :id");
    $get_address->execute([":id" => $order->address_id]);
    $address = $get_address->fetch(PDO::FETCH_OBJ);

    $weight = 0;
    $depth = 0;
    $width = 0;
    $height = 0;
    $get_items = $conn->prepare("SELECT product_id, quantity FROM order_items WHERE order_id = :id");
    $get_items->execute([":id" => $order->id]);
    while($item = $get_items->fetch(PDO::FETCH_OBJ)){
        // echo $item->product_id. " ";
        $get_product = $conn->prepare("SELECT `weight`, `item_height`, `item_width`, `item_depth` FROM products WHERE id = :id LIMIT 1");
        $get_product->execute([":id" => $item->product_id]);
        if($get_product->rowCount() > 0) {
            $product = $get_product->fetch(PDO::FETCH_OBJ);

            $qty = (int)$item->quantity;

            $weight += ($product->weight ?? 0) * $qty;
            $depth += ($product->item_depth ?? 0) * $qty;
            $width += ($product->item_width ?? 0) * $qty;
            $height += ($product->item_height ?? 0) * $qty;
        }
    }


    $origin_postal = $site_settings->shipment_postal_code ?? null;
    $origin_city = $site_settings->shipment_city ?? null;
    $origin_province = $site_settings->shipment_province ?? null;
    $origin_country = $site_settings->shipment_country ?? 'CA';

    $create_order = [
        "shipper" => [
            "name"    => $AppName,
            "phone"   => $comp_phone,
            "address" => $comp_address,
            "city" => strtoupper(trim($origin_city)),
            "postal" => strtoupper(trim($origin_postal)),
            "state" => strtoupper(trim($origin_province)),
            "country" => strtoupper(trim($origin_country))
        ],

        "recipient" => [
            "name"    => $order->recipient_first_name." ".$order->recipient_last_name,
            "phone"   => $order->recipient_phone,
            "address" => $address->street_address,
            "city"    => $address->city,
            "state"   => $address->province,
            "postal"  => $address->postal_code,
            "country" => $address->country ?? 'CA'
        ],

        "parcel" => [
            "weight" => round($weight, 2),
            "length" => round($depth, 2),
            "width" => round($width, 2),
            "height" => round($height, 2)
        ]
    ];

    $carrier = str_replace(" ", "_", strtolower($order->shipping_carrier));

    $shipment = create_shipping_order($carrier, $create_order);

    $update  = $conn->prepare("UPDATE orders SET shipping_carrier = :carrier, tracking_number = :tracking, shipping_label   = :label, shipped_at       = NOW() WHERE id = :id ");

    $update->bindValue(":carrier", $shipment['carrier']);
    $update->bindValue(":tracking", $shipment['tracking']);
    $update->bindValue(":label", $shipment['label']);
    $update->bindValue(":id", $order->id);
    $update->execute();