<?php
    $order = [
        "shipper" => [
            "name"    => "My Store",
            "phone"   => "1234567890",
            "address" => "123 King St",
            "city"    => "Toronto",
            "state"   => "ON",
            "postal"  => "M5V1E3",
            "country" => "CA"
        ],

        "recipient" => [
            "name"    => "John Doe",
            "phone"   => "9876543210",
            "address" => "456 Main St",
            "city"    => "Vancouver",
            "state"   => "BC",
            "postal"  => "V6B1A1",
            "country" => "CA"
        ],

        "parcel" => [
            "weight" => 2.5,   // KG
            "length" => 30,    // CM
            "width"  => 20,
            "height" => 10
        ]
    ];


    $shipment = create_shipping_order($selected_carrier, $order);

    $db->prepare("
        UPDATE orders
        SET
            shipping_carrier = ?,
            tracking_number  = ?,
            shipping_label   = ?,
            shipped_at       = NOW()
        WHERE id = ?
    ")->execute([
        $shipment['carrier'],
        $shipment['tracking'],
        $shipment['label'],
        $order_id
    ]);