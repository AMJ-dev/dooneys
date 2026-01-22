<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    $error = false;
    $data  = [];
    $user_id = null;
    $auth = false;

    try {

        if (isset($_POST["auth"]) && $_POST["auth"] == "1") {
            require_once dirname(__DIR__, 2) . "/include/verify-user.php";
            $user_id = (int)$my_details->id;
            $auth = true;
        }

        $productsStmt = $conn->prepare("
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.original_price,
                p.sku,
                p.status,
                p.is_best_seller,
                p.is_new,
                p.in_stock,
                p.manage_stock,
                p.stock_quantity,
                p.low_stock_alert,
                p.weight,
                p.item_width,
                p.item_height,
                p.item_depth,
                p.created_at,
                p.updated_at,
                c.id   AS category_id,
                c.name AS category_name,
                c.slug AS category_slug
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id
            ORDER BY p.created_at DESC
        ");
        $productsStmt->execute();
        $products = $productsStmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$products) {
            echo json_encode(["error" => false, "data" => []]);
            exit;
        }

        $productIds = array_column($products, 'id');
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));

        $galleryStmt = $conn->prepare("
            SELECT product_id, id, image, sort_order
            FROM product_gallery
            WHERE product_id IN ($placeholders)
            ORDER BY sort_order ASC, id ASC
        ");
        $galleryStmt->execute($productIds);
        $galleryRows = $galleryStmt->fetchAll(PDO::FETCH_ASSOC);

        $featuresStmt = $conn->prepare("
            SELECT product_id, id, feature, sort_order
            FROM product_features
            WHERE product_id IN ($placeholders)
            ORDER BY sort_order ASC
        ");
        $featuresStmt->execute($productIds);
        $featureRows = $featuresStmt->fetchAll(PDO::FETCH_ASSOC);

        $variantsStmt = $conn->prepare("
            SELECT
                pv.product_id,
                pv.id AS variant_id,
                pv.variant_type,
                pvo.id AS option_id,
                pvo.option_value,
                pvo.sort_order
            FROM product_variants pv
            LEFT JOIN product_variant_options pvo ON pvo.variant_id = pv.id
            WHERE pv.product_id IN ($placeholders)
            ORDER BY pv.id ASC, pvo.sort_order ASC
        ");
        $variantsStmt->execute($productIds);
        $variantRows = $variantsStmt->fetchAll(PDO::FETCH_ASSOC);

        $wishlistMap = [];

        if ($auth && $user_id > 0) {
            $wishStmt = $conn->prepare("
                SELECT product_id
                FROM wishlists
                WHERE user_id = ?
            ");
            $wishStmt->execute([$user_id]);
            $wishlistMap = array_flip($wishStmt->fetchAll(PDO::FETCH_COLUMN));
        }

        $galleryMap = [];
        $featureMap = [];
        $variantMap = [];

        foreach ($galleryRows as $g) {
            $galleryMap[$g['product_id']][] = [
                "id" => (int)$g['id'],
                "image" => $g['image'],
                "sort_order" => (int)$g['sort_order']
            ];
        }

        foreach ($featureRows as $f) {
            $featureMap[$f['product_id']][] = [
                "id" => (int)$f['id'],
                "feature" => $f['feature'],
                "sort_order" => (int)$f['sort_order']
            ];
        }

        foreach ($variantRows as $v) {
            $pid = $v['product_id'];
            $vid = $v['variant_id'];

            if (!isset($variantMap[$pid][$vid])) {
                $variantMap[$pid][$vid] = [
                    "id" => (int)$vid,
                    "type" => $v['variant_type'],
                    "options" => []
                ];
            }

            if ($v['option_id']) {
                $variantMap[$pid][$vid]['options'][] = [
                    "id" => (int)$v['option_id'],
                    "value" => $v['option_value'],
                    "sort_order" => (int)$v['sort_order']
                ];
            }
        }

        foreach ($products as &$p) {
            $pid = $p['id'];
            $p["gallery_count"]= count($galleryMap[$pid] ?? []);
            $p['gallery'] = $galleryMap[$pid] ?? [];
            $p['first_image'] = $p['gallery'][0]['image'] ?? null;
            $p['features'] = $featureMap[$pid] ?? [];
            $p['variants'] = array_values($variantMap[$pid] ?? []);
            $p['is_wishlist'] = $auth && isset($wishlistMap[$pid]);
        }

        $data = $products;

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
