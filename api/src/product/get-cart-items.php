<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    $error = false;
    $data  = ["items" => []];

    try {
        if (empty($_POST['items']) || !is_array($_POST['items'])) {
            throw new Exception("Invalid cart data");
        }

        $items = $_POST['items'];
        if (!$items) {
            echo json_encode(["error" => false, "data" => ["items" => []]]);
            exit;
        }

        $productIds = [];
        foreach ($items as $i) {
            $pid = (int)($i['product_id'] ?? $i['product']['id'] ?? 0);
            if ($pid > 0) $productIds[] = $pid;
        }

        $productIds = array_values(array_unique($productIds));
        if (!$productIds) throw new Exception("No valid products");

        $in = implode(',', array_fill(0, count($productIds), '?'));

        /* PRODUCTS */
        $stmt = $conn->prepare("
            SELECT
                p.id,
                p.name,
                p.price,
                p.original_price,
                p.description,
                p.in_stock,
                p.stock_quantity,
                p.low_stock_alert,
                p.is_best_seller,
                p.is_new,
                c.name AS category,
                (
                    SELECT pg.image
                    FROM product_gallery pg
                    WHERE pg.product_id = p.id
                    ORDER BY pg.sort_order ASC
                    LIMIT 1
                ) AS image
            FROM products p
            JOIN categories c ON c.id = p.category_id
            WHERE p.status = 'active'
            AND p.id IN ($in)
        ");
        $stmt->execute($productIds);

        $productMap = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $p) {
            $productMap[(int)$p['id']] = $p;
        }

        $inIds = implode(',', array_map('intval', $productIds));

        $variantRows = $conn->query("
            SELECT
                pv.product_id,
                pv.variant_type,
                pvo.id AS option_id,
                pvo.option_value,
                pvo.price_modifier
            FROM product_variants pv
            JOIN product_variant_options pvo ON pvo.variant_id = pv.id
            WHERE pv.product_id IN ($inIds)
            ORDER BY pv.id ASC, pvo.sort_order ASC
        ");

        $variantMap = [];
        while ($row = $variantRows->fetch(PDO::FETCH_ASSOC)) {
            $variantMap[(int)$row['product_id']][$row['variant_type']][] = [
                "id" => (int)$row['option_id'],
                "value" => $row['option_value'],
                "price_modifier" => (float)$row['price_modifier']
            ];
        }

        /* CART ITEMS */
        foreach ($items as $item) {
            $pid = (int)($item['product_id'] ?? $item['product']['id'] ?? 0);
            if (!isset($productMap[$pid])) continue;

            $p   = $productMap[$pid];
            $qty = max(1, (int)($item['quantity'] ?? 1));

            $selectedVariants = [];
            $variantPrice = 0.0;

            if (!empty($item['variants'])) {
                foreach ($item['variants'] as $sv) {
                    $type = $sv['type'] ?? null;
                    if (!$type || empty($variantMap[$pid][$type])) continue;

                    foreach ($variantMap[$pid][$type] as $opt) {
                        if (
                            (!empty($sv['option_id']) && (int)$sv['option_id'] === $opt['id']) ||
                            (!empty($sv['value']) && $sv['value'] === $opt['value'])
                        ) {
                            $selectedVariants[] = [
                                "type" => $type,
                                "option" => $opt
                            ];
                            $variantPrice += $opt['price_modifier'];
                            break;
                        }
                    }
                }
            }

            $finalPrice = (float)$p['price'] + $variantPrice;

            $stock = "normal";
            if (!$p['in_stock'] || $p['stock_quantity'] <= 0) {
                $stock = "out";
            } elseif ($p['low_stock_alert'] !== null && $p['stock_quantity'] <= $p['low_stock_alert']) {
                $stock = "low";
            }

            $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $p['name']), '-'));

            $data['items'][] = [
                "product" => [
                    "id" => (string)$p['id'],
                    "name" => $p['name'],
                    "slug" => $slug,
                    "price" => $finalPrice,
                    "basePrice" => (float)$p['price'],
                    "originalPrice" => $p['original_price'] !== null ? (float)$p['original_price'] : null,
                    "image" => $p['image'],
                    "category" => $p['category'],
                    "description" => $p['description'],
                    "isNew" => (bool)$p['is_new'],
                    "isBestSeller" => (bool)$p['is_best_seller'],
                    "inStock" => (bool)$p['in_stock'],
                    "stock" => $stock
                ],
                "quantity" => $qty,
                "variants" => $selectedVariants
            ];
        }

    } catch (Throwable $e) {
        http_response_code(400);
        $error = true;
        $data  = ["message" => $e->getMessage(), "items" => []]; // ✅ consistent structure
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
