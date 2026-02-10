<?php
    $gst_rate = (float)$site_settings->store_gst;

    $fulfillment = $_POST['fulfillment_method'] ?? 'shipping';
    $payment     = $_POST['payment_method'] ?? 'card';

    if (!in_array($fulfillment, ['pickup', 'shipping'], true)) {
        throw new Exception("Invalid fulfillment method");
    }

    if (!in_array($payment, ['card', 'cash'], true)) {
        throw new Exception("Invalid payment method");
    }

    $address = null;
    if ($fulfillment === 'shipping') {
        $address_id = (int) ($_POST['address_id'] ?? 0);

        $stmt = $conn->prepare("
            SELECT *
            FROM user_addresses
            WHERE id = ? AND user_id = ?
            LIMIT 1
        ");
        $stmt->execute([$address_id, $user_id]);
        $address = $stmt->fetch(PDO::FETCH_OBJ);

        if (!$address) {
            throw new Exception("Invalid shipping address");
        }
    }

    $items = $_POST['items'];
    $subtotal = 0;
    $computedItems = [];

    $productStmt = $conn->prepare("
        SELECT
            p.id AS product_id,
            p.name,
            p.price AS base_price
        FROM products p
        WHERE p.id = ?
        LIMIT 1
    ");

    $variantStmt = $conn->prepare("
        SELECT
            pvo.id AS option_id,
            pv.variant_type,
            pvo.option_value,
            COALESCE(pvo.price_modifier, 0) AS price_modifier
        FROM product_variants pv
        JOIN product_variant_options pvo ON pvo.variant_id = pv.id
        WHERE pvo.id = ? AND pv.product_id = ?
        LIMIT 1
    ");

    foreach ($items as $item) {

        $product_id = (int) ($item['product_id'] ?? 0);
        $quantity   = max(1, (int) ($item['quantity'] ?? 1));
        $variants   = $item['variants'] ?? [];

        if ($product_id <= 0) {
            throw new Exception("Invalid product");
        }

        $productStmt->execute([$product_id]);
        $product = $productStmt->fetch(PDO::FETCH_OBJ);

        if (!$product) {
            throw new Exception("Product not found");
        }

        $unit_price = (float) $product->base_price;
        $variant_summary = [];
        $variant_total_modifier = 0;

        if (is_array($variants)) {
            foreach ($variants as $v) {
                $option_id = (int) ($v['option_id'] ?? 0);
                if ($option_id <= 0) {
                    continue;
                }

                $variantStmt->execute([$option_id, $product_id]);
                $variant = $variantStmt->fetch(PDO::FETCH_OBJ);

                if (!$variant) {
                    throw new Exception("Invalid variant option");
                }

                $variant_total_modifier += (float) $variant->price_modifier;

                $variant_summary[] = [
                    'variant_type'   => $variant->variant_type,
                    'option_id'      => $variant->option_id,
                    'option_value'   => $variant->option_value,
                    'price_modifier' => (float) $variant->price_modifier
                ];
            }
        }

        $unit_price += $variant_total_modifier;
        $line_total = $unit_price * $quantity;
        $subtotal  += $line_total;

        $computedItems[] = [
            'product_id'      => $product_id,
            'product_name'    => $product->name,
            'quantity'        => $quantity,
            'unit_price'      => $unit_price,
            'line_total'      => $line_total,
            'variants'        => $variant_summary
        ];
    }

    $discount_amount = 0;
    $discount_code   = null;
    $has_free_shipping_discount = false;

    if (!empty($_POST['discount_code'])) {
        $stmt = $conn->prepare("
            SELECT *
            FROM discounts
            WHERE code = ? AND is_active = 1
            LIMIT 1
        ");
        $stmt->execute([trim($_POST['discount_code'])]);
        $discount = $stmt->fetch(PDO::FETCH_OBJ);

        if ($discount) {
            if ($discount->min_purchase_amount > 0 && $subtotal < $discount->min_purchase_amount) {
                throw new Exception("Discount minimum not met");
            }

            $discount_code = $discount->code;

            if ($discount->discount_type === 'percentage') {
                $discount_amount = ($subtotal * $discount->discount_value) / 100;
            } elseif ($discount->discount_type === 'fixed') {
                $discount_amount = min($discount->discount_value, $subtotal);
            } elseif ($discount->discount_type === 'free_shipping') {
                $has_free_shipping_discount = true;
                $discount_amount = 0;
            }
        }
    }
    
    $shipping_cost = 0;
    if ($fulfillment === 'shipping') {
        // Check store free shipping
        $is_store_free_shipping = false;
        if ($site_settings->store_free_shipping == "1") {
            $free_shipping_threshold = (float)$site_settings->store_free_shipping_threshold;
            if ($free_shipping_threshold > 0) {
                $is_store_free_shipping = ($subtotal >= $free_shipping_threshold);
            } else {
                // If threshold is 0, ALL orders get free shipping
                $is_store_free_shipping = true;
            }
        }
        
        // Check free shipping discount
        $is_free_shipping_discount = false;
        if ($has_free_shipping_discount && $discount) {
            $minPurchase = (float)$discount->min_purchase_amount;
            $is_free_shipping_discount = ($minPurchase <= 0 || $subtotal >= $minPurchase);
        }
        
        if ($is_store_free_shipping || $is_free_shipping_discount) {
            $shipping_cost = 0;
        } else {
            $origin_postal = $site_settings->shipment_postal_code ?? null;
            $origin_city = $site_settings->shipment_city ?? null;
            $origin_province = $site_settings->shipment_province ?? null;
            $origin_country = $site_settings->shipment_country ?? 'CA';

            $dest_postal = $address->postal_code ?? null;
            $dest_province = $address->province ?? null;
            $dest_country = $address->country ?? 'CA';

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

            if($_POST["selected_shipping"]["carrier_id"] == "canada_post") $shipping_result = canada_post_rate($origin, $destination, $pkg);
            elseif($_POST["selected_shipping"]["carrier_id"] == "fedex") $shipping_result = fedex_rate($origin, $destination, $pkg);
            elseif($_POST["selected_shipping"]["carrier_id"] == "dhl") $shipping_result = dhl_rate($origin, $destination, $pkg);
            $shipping_cost = $shipping_result['price'];
        }
    }

    $tax   = ($subtotal * $gst_rate) / 100;
    $total = $subtotal + $shipping_cost + $tax - $discount_amount;

    if ($total <= 0) {
        throw new Exception("Invalid total amount");
    }
?>