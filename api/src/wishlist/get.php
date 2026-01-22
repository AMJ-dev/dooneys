<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data  = [];

    try {
        $user_id = (int)$my_details->id;

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
                c.name AS category
            FROM wishlists w
            JOIN products p ON p.id = w.product_id
            JOIN categories c ON c.id = p.category_id
            WHERE w.user_id = :uid
            ORDER BY w.created_at DESC
        ");
        $stmt->execute([':uid' => $user_id]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$products) {
            echo json_encode(["error" => false, "data" => []]);
            exit;
        }

        $productIds = array_map('intval', array_column($products, 'id'));
        $in = implode(',', $productIds);

        $g = $conn->query("
            SELECT product_id, image
            FROM product_gallery
            WHERE product_id IN ($in)
            ORDER BY sort_order ASC, id ASC
        ")->fetchAll(PDO::FETCH_GROUP | PDO::FETCH_COLUMN);

        $f = $conn->query("
            SELECT product_id, feature
            FROM product_features
            WHERE product_id IN ($in)
            ORDER BY sort_order ASC
        ")->fetchAll(PDO::FETCH_GROUP | PDO::FETCH_COLUMN);

        $variantRows = $conn->query("
            SELECT
                pv.product_id,
                pv.variant_type,
                pvo.option_value
            FROM product_variants pv
            JOIN product_variant_options pvo ON pvo.variant_id = pv.id
            WHERE pv.product_id IN ($in)
            ORDER BY pv.id ASC, pvo.sort_order ASC
        ")->fetchAll(PDO::FETCH_ASSOC);

        $variantsMap = [];
        foreach ($variantRows as $row) {
            $variantsMap[(int)$row['product_id']][] = [
                "type" => $row['variant_type'],
                "value" => $row['option_value']
            ];
        }

        foreach ($products as $row) {
            $pid = (int)$row['id'];

            $stock = "normal";
            if (!$row['in_stock'] || $row['stock_quantity'] <= 0) {
                $stock = "out";
            } elseif (
                $row['low_stock_alert'] !== null &&
                $row['stock_quantity'] <= $row['low_stock_alert']
            ) {
                $stock = "low";
            }

            $groupedVariants = [];
            foreach ($variantsMap[$pid] ?? [] as $v) {
                $groupedVariants[$v['type']][] = $v['value'];
            }

            $variants = [];
            foreach ($groupedVariants as $type => $opts) {
                $variants[] = [
                    "type" => $type,
                    "options" => $opts
                ];
            }

            $data[] = [
                "id" => (string)$pid,
                "name" => $row['name'],
                "price" => (float)$row['price'],
                "originalPrice" => $row['original_price'] !== null ? (float)$row['original_price'] : null,
                "image" => $g[$pid][0] ?? null,
                "gallery" => $g[$pid] ?? [],
                "category" => $row['category'],
                "description" => $row['description'],
                "features" => $f[$pid] ?? [],
                "variants" => $variants,
                "isNew" => (bool)$row['is_new'],
                "isBestSeller" => (bool)$row['is_best_seller'],
                "inStock" => (bool)$row['in_stock'],
                "stock" => $stock,
                "is_wishlist" => 1
            ];
        }

    } catch (Throwable $e) {
        http_response_code(400);
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
