<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    $error = false;
    $data  = [
        "best_sellers" => [],
        "new_products" => []
    ];

    $user_id = 0;

    if (!empty($_POST["auth"]) && $_POST["auth"] == "1") {
        require_once dirname(__DIR__, 2) . "/include/verify-user.php";
        $user_id = (int)$my_details->id;
    }

    try {

        function fetchProducts(PDO $conn, string $condition, int $user_id = 0): array {

            $wishlistJoin   = "";
            $wishlistSelect = "0 AS is_wishlist";

            if ($user_id > 0) {
                $wishlistSelect = "IF(w.id IS NULL, 0, 1) AS is_wishlist";
                $wishlistJoin = "
                    LEFT JOIN wishlists w
                    ON w.product_id = p.id AND w.user_id = :uid
                ";
            }

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
                    {$wishlistSelect},
                    (
                        SELECT pg.image
                        FROM product_gallery pg
                        WHERE pg.product_id = p.id
                        ORDER BY pg.sort_order ASC
                        LIMIT 1
                    ) AS image
                FROM products p
                INNER JOIN categories c ON c.id = p.category_id
                {$wishlistJoin}
                WHERE p.status = 'active'
                AND {$condition}
                ORDER BY p.created_at DESC
                LIMIT 5
            ");

            if ($user_id > 0) {
                $stmt->bindValue(':uid', $user_id, PDO::PARAM_INT);
            }

            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!$products) return [];

            $productIds = array_column($products, 'id');

            $features = $conn->query("
                SELECT product_id, feature
                FROM product_features
                WHERE product_id IN (" . implode(',', $productIds) . ")
                ORDER BY sort_order ASC
            ")->fetchAll(PDO::FETCH_GROUP | PDO::FETCH_COLUMN);

            $variantRows = $conn->query("
                SELECT
                    pv.product_id,
                    pv.variant_type,
                    pvo.option_value,
                    pvo.id option_id,
                    pvo.price_modifier
                FROM product_variants pv
                JOIN product_variant_options pvo ON pvo.variant_id = pv.id
                WHERE pv.product_id IN (" . implode(',', $productIds) . ")
                ORDER BY pv.id ASC, pvo.sort_order ASC
            ")->fetchAll(PDO::FETCH_ASSOC);

            $variantsMap = [];
            foreach ($variantRows as $row) {
                $variantsMap[$row['product_id']][$row['variant_type']][] = [
                    "value" => $row['option_value'],
                    "option_id" => (int)$row['option_id'],
                    "price_modifier" => (string)$row['price_modifier']
                ];
            }

            $result = [];

            foreach ($products as $row) {

                $stock = "normal";
                if (!$row['in_stock'] || $row['stock_quantity'] <= 0) {
                    $stock = "out";
                } elseif ($row['stock_quantity'] <= $row['low_stock_alert']) {
                    $stock = "low";
                }

                $pid = (int)$row['id'];

                $result[] = [
                    "id" => (string)$pid,
                    "name" => $row['name'],
                    "slug" => strtolower(preg_replace('/[^a-z0-9]+/i', '-', $row['name'])),
                    "price" => (float)$row['price'],
                    "originalPrice" => $row['original_price'] !== null ? (float)$row['original_price'] : null,
                    "image" => $row['image'],
                    "category" => $row['category'],
                    "description" => $row['description'],
                    "features" => $features[$pid] ?? [],
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

            return $result;
        }

        $data['best_sellers'] = fetchProducts($conn, "p.is_best_seller = 1", $user_id);
        $data['new_products'] = fetchProducts($conn, "p.is_new = 1", $user_id);

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
