<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    $error = false;
    $data  = ["categories" => [], "products" => [], "store_gst" => $site_settings->store_gst];

    try {
        $user_id = 0;

        if (!empty($_POST["auth"]) && $_POST["auth"] == "1") {
            require_once dirname(__DIR__, 2) . "/include/verify-user.php";
            $user_id = (int)$my_details->id;
        }

        $cat_id = isset($_POST["cat_id"]) && $_POST["cat_id"] !== ""
            ? (int)$_POST["cat_id"]
            : 0;

        $wishlistJoin   = "";
        $wishlistSelect = "0 AS is_wishlist";

        if ($user_id > 0) {
            $wishlistSelect = "IF(w.id IS NULL, 0, 1) AS is_wishlist";
            $wishlistJoin = "
                LEFT JOIN wishlists w
                ON w.product_id = p.id AND w.user_id = :uid
            ";
        }

        $whereCategory = $cat_id > 0 ? "AND p.category_id = :cat_id" : "";

        $stmt = $conn->prepare("
            SELECT
                p.id,
                p.name,
                p.price,
                p.sku,
                p.original_price,
                p.description,
                p.in_stock,
                p.stock_quantity,
                p.low_stock_alert,
                p.is_best_seller,
                p.is_new,
                c.name AS category,
                {$wishlistSelect}
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id
            {$wishlistJoin}
            WHERE p.status = 'active'
            {$whereCategory}
            ORDER BY p.created_at DESC
        ");

        if ($user_id > 0) {
            $stmt->bindValue(':uid', $user_id, PDO::PARAM_INT);
        }
        if ($cat_id > 0) {
            $stmt->bindValue(':cat_id', $cat_id, PDO::PARAM_INT);
        }

        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($products) {

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
                    pvo.id option_id,
                    pvo.option_value,
                    pvo.price_modifier
                FROM product_variants pv
                JOIN product_variant_options pvo ON pvo.variant_id = pv.id
                WHERE pv.product_id IN ($in)
                ORDER BY pv.id ASC, pvo.sort_order ASC
            ")->fetchAll(PDO::FETCH_ASSOC);

            $variantsMap = [];
            foreach ($variantRows as $row) {
                $variantsMap[(int)$row['product_id']][$row['variant_type']][] = [
                    "value" => $row['option_value'],
                    "option_id" => (int)$row['option_id'],
                    "price_modifier" => (string)$row['price_modifier']
                ];
            }

            foreach ($products as $row) {
                $pid = (int)$row['id'];

                $stock = "normal";
                if (!$row['in_stock'] || $row['stock_quantity'] <= 0) {
                    $stock = "out";
                } elseif ($row['low_stock_alert'] !== null && $row['stock_quantity'] <= $row['low_stock_alert']) {
                    $stock = "low";
                }

                $data["products"][] = [
                    "id" => (string)$pid,
                    "name" => $row['name'],
                    "sku" => $row['sku'],
                    "slug" => strtolower(preg_replace('/[^a-z0-9]+/i', '-', $row['name'])),
                    "price" => (float)$row['price'],
                    "originalPrice" => $row['original_price'] !== null ? (float)$row['original_price'] : null,
                    "image" => $g[$pid][0] ?? null,
                    "gallery" => $g[$pid] ?? [],
                    "category" => $row['category'],
                    "description" => $row['description'],
                    "features" => $f[$pid] ?? [],
                    "variants" => array_map(
                        fn($type, $opts) => ["type" => $type, "options" => $opts],
                        array_keys($variantsMap[$pid] ?? []),
                        $variantsMap[$pid] ?? []
                    ),
                    "isNew" => (bool)$row['is_new'],
                    "isBestSeller" => (bool)$row['is_best_seller'],
                    "inStock" => (bool)$row['in_stock'],
                    "stock" => $stock,
                    "is_wishlist" => (int)$row['is_wishlist'],
                    "rating" => round(mt_rand(40, 50) / 10, 1)
                ];
            }
        }

        $cat = $conn->query("
            SELECT
                c.id,
                c.name,
                c.slug,
                c.description,
                c.image,
                COUNT(p.id) AS product_count
            FROM categories c
            LEFT JOIN products p
                ON p.category_id = c.id AND p.status = 'active'
            WHERE c.status = 'active'
            GROUP BY c.id
            ORDER BY c.created_at DESC
        ");
        $data["categories"] = $cat->fetchAll(PDO::FETCH_ASSOC);

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
