<?php
    require_once __DIR__."/include/conn.php";
    $is_prod = false;
    $canadapost_api["customer_number"] = "";
    $canadapost_api["username"] = "6d4a916436ce6b03";
    $canadapost_api["password"] = "010766f729379043852f82";
    $pkg['weight'] = 1;
    $pkg['length'] = 1;
    $pkg['width'] = 1;
    $pkg['height'] = 1;
    $origin['postal_code'] = "T5J 3A3";
    $destination['postal_code'] = "M1L - M9N";

    $rates = canada_post_rates($origin, $destination, $pkg);
    print_r($rates);
    function canada_post_rates($origin, $destination, $pkg) {
        global $canadapost_api, $is_prod;
        $xml = <<<XML
            <?xml version="1.0" encoding="UTF-8"?>
            <mailing-scenario xmlns="http://www.canadapost.ca/ws/ship/rate-v4">
            <customer-number>{$canadapost_api['customer_number']}</customer-number>
            <parcel-characteristics>
                <weight>{$pkg['weight']}</weight>
                <dimensions>
                <length>{$pkg['length']}</length>
                <width>{$pkg['width']}</width>
                <height>{$pkg['height']}</height>
                </dimensions>
            </parcel-characteristics>
            <origin-postal-code>{$origin['postal_code']}</origin-postal-code>
            <destination>
                <domestic>
                <postal-code>{$destination['postal_code']}</postal-code>
                </domestic>
            </destination>
            </mailing-scenario>
        XML;

        $url = $is_prod 
            ? "https://soa-gw.canadapost.ca/rs/ship/price"
            : "https://ct.soa-gw.canadapost.ca/rs/ship/price";

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $xml,
            CURLOPT_USERPWD => $canadapost_api['username'] . ":" . $canadapost_api['password'],
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/vnd.cpc.ship.rate-v4+xml",
                "Accept: application/vnd.cpc.ship.rate-v4+xml"
            ]
        ]);

        $res = curl_exec($ch);
        curl_close($ch);
        if (!$res) return null;

        $xmlRes = simplexml_load_string($res);
        $xmlRes->registerXPathNamespace('cpc', 'http://www.canadapost.ca/ws/ship/rate-v4');

        $quotes = $xmlRes->xpath('//cpc:price-quote');
        if (!$quotes) return null;

        $best = null;
        foreach ($quotes as $q) {
            $price = (float)$q->{'price-details'}->due;
            if (!$best || $price < $best['price']) {
                $best = [
                    "carrier" => "Canada Post",
                    "price"   => $price,
                    "delivery"=> (string)$q->{'service-standard'}->{'expected-transit-time'} . " days"
                ];
            }
        }

        return $best;
    }

