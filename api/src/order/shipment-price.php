<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    $error = false;
    $data  = null;

    try {
        if (empty($_POST['items']) || !is_array($_POST['items']) || empty($_POST['address'])) {
            throw new Exception("Invalid request payload");
        }

        $origin_postal = $site_settings->shipment_postal_code ?? null;
        $origin_city = $site_settings->shipment_city ?? null;
        $origin_province = $site_settings->shipment_province ?? null;
        $origin_country = $site_settings->shipment_country ?? 'CA';

        $dest_postal = $_POST['address']['postal_code'] ?? null;
        $dest_province = $_POST['address']['province'] ?? null;
        $dest_country = $_POST['address']['country'] ?? 'CA';

        if (!$origin_postal) {
            throw new Exception("Missing origin postal code");
        }

        if (!$dest_postal) {
            throw new Exception("Missing destination postal code");
        }

        $weight = 0;
        $depth = 0;
        $width = 0;
        $height = 0;

        $stmt = $conn->prepare("SELECT `weight`, `item_height`, `item_width`, `item_depth` FROM products WHERE id = ? LIMIT 1");

        foreach ($_POST['items'] as $item) {
            if (empty($item['id']) || empty($item['quantity']) || $item['quantity'] <= 0) {
                continue;
            }

            $stmt->execute([(int)$item['id']]);
            $product = $stmt->fetch(PDO::FETCH_OBJ);

            if (!$product) {
                continue;
            }

            $qty = (int)$item['quantity'];

            $weight += ($product->weight ?? 0) * $qty;
            $depth += ($product->item_depth ?? 0) * $qty;
            $width += ($product->item_width ?? 0) * $qty;
            $height += ($product->item_height ?? 0) * $qty;
        }

        if ($weight <= 0 || $depth <= 0 || $width <= 0 || $height <= 0) {
            throw new Exception("Invalid package dimensions or weight");
        }

        $origin = [
            "postal_code" => strtoupper(trim($origin_postal)),
            "city" => $origin_city,
            "province" => strtoupper(trim($origin_province)),
            "country" => strtoupper(trim($origin_country))
        ];

        $destination = [
            "postal_code" => strtoupper(trim($dest_postal)),
            "province" => strtoupper(trim($dest_province)),
            "country" => strtoupper(trim($dest_country))
        ];

        $pkg = [
            "weight" => round($weight, 2),
            "length" => round($depth, 2),
            "width" => round($width, 2),
            "height" => round($height, 2)
        ];

        $canada_post_result = canada_post_rate($origin, $destination, $pkg);
        $fedex_result = fedex_rate($origin, $destination, $pkg);
        $dhl_result = dhl_rate($origin, $destination, $pkg);

        $data = [
            "canada_post" => $canada_post_result,
            "fedex" => $fedex_result,
            "dhl" => $dhl_result
        ];

    } catch (Throwable $e) {
        // http_response_code(400);
        $error = true;
        $data = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data" => $data
    ]);