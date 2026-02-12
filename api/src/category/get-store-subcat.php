<?php
require_once dirname(__DIR__, 2) . "/include/set-header.php";

$error   = false;
$data    = null;
$user_id = 0;

try {

    /* ================= AUTH (OPTIONAL) ================= */
    if (!empty($_POST["auth"]) && $_POST["auth"] == "1") {
        require_once dirname(__DIR__, 2) . "/include/verify-user.php";
        $user_id = (int)$my_details->id;
    }

    $subcat_id = (int)($_POST["subcat_id"] ?? 0);
    if ($subcat_id <= 0) {
        throw new Exception("Invalid subcategory");
    }

    $stmt = $conn->prepare("
        SELECT sc.id, sc.name, sc.slug, sc.status, sc.category_id,
               c.name AS category_name,
               c.slug AS category_slug,
               c.image AS category_image
        FROM sub_categories sc
        INNER JOIN categories c ON c.id = sc.category_id
        WHERE sc.id = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $subcat_id]);

    if (!$stmt->rowCount()) {
        throw new Exception("Subcategory not found");
    }

    $subcategory = $stmt->fetch(PDO::FETCH_ASSOC);

    $category = [
        "id"   => (int)$subcategory["category_id"],
        "name" => $subcategory["category_name"],
        "slug" => $subcategory["category_slug"],
        "image"=> $subcategory["category_image"]
    ];

    $relStmt = $conn->prepare("
        SELECT id, category_id, name, slug, status
        FROM sub_categories
        WHERE category_id = :cid
        ORDER BY name ASC
    ");
    $relStmt->execute([':cid' => $subcategory["category_id"]]);
    $related_subcategories = $relStmt->fetchAll(PDO::FETCH_ASSOC);

    $wishlistJoin   = "";
    $wishlistSelect = "0 AS is_wishlist";

    if ($user_id > 0) {
        $wishlistSelect = "IF(w.id IS NULL, 0, 1) AS is_wishlist";
        $wishlistJoin = "
            LEFT JOIN wishlists w
            ON w.product_id = p.id AND w.user_id = :uid
        ";
    }

    $prodStmt = $conn->prepare("
        SELECT
            p.id,
            p.name,
            p.price,
            p.original_price,
            p.sku,
            p.description,
            p.is_best_seller,
            p.is_new,
            p.in_stock,
            p.stock_quantity,
            p.low_stock_alert,
            {$wishlistSelect}
        FROM products p
        {$wishlistJoin}
        WHERE p.sub_category_id = :sid
        AND p.status = 'active'
        ORDER BY p.created_at DESC
    ");

    if ($user_id > 0) {
        $prodStmt->bindValue(':uid', $user_id, PDO::PARAM_INT);
    }

    $prodStmt->bindValue(':sid', $subcat_id, PDO::PARAM_INT);
    $prodStmt->execute();

    $products = $prodStmt->fetchAll(PDO::FETCH_ASSOC);

    if ($products) {

        $ids = array_map('intval', array_column($products, 'id'));
        $in  = implode(',', $ids);

        /* ---------- GALLERY ---------- */
        $g = $conn->query("
            SELECT product_id, image
            FROM product_gallery
            WHERE product_id IN ($in)
            ORDER BY sort_order ASC
        ")->fetchAll(PDO::FETCH_GROUP | PDO::FETCH_COLUMN);

        /* ---------- FEATURES ---------- */
        $f = $conn->query("
            SELECT product_id, feature
            FROM product_features
            WHERE product_id IN ($in)
            ORDER BY sort_order ASC
        ")->fetchAll(PDO::FETCH_GROUP | PDO::FETCH_COLUMN);

        /* ---------- VARIANTS ---------- */
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

        $formattedProducts = [];

        foreach ($products as $row) {

            $pid = (int)$row['id'];

            $stock = "normal";
            if (!$row['in_stock'] || $row['stock_quantity'] <= 0) {
                $stock = "out";
            } elseif ($row['low_stock_alert'] !== null &&
                      $row['stock_quantity'] <= $row['low_stock_alert']) {
                $stock = "low";
            }

            $formattedProducts[] = [
                "id" => $pid,
                "name" => $row['name'],
                "sku" => $row['sku'],
                "slug" => strtolower(preg_replace('/[^a-z0-9]+/i', '-', $row['name'])),
                "price" => (float)$row['price'],
                "originalPrice" => $row['original_price'] !== null ? (float)$row['original_price'] : null,
                "image" => $g[$pid][0] ?? null,
                "gallery" => $g[$pid] ?? [],
                "category" => $subcategory["category_name"],
                "sub_category_id" => (int)$subcat_id,
                "sub_category_name" => $subcategory["name"],
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

        $products = $formattedProducts;
    }

    $data = [
        "subcategory" => $subcategory,
        "products" => $products,
        "category" => $category,
        "related_subcategories" => $related_subcategories
    ];

} catch (Throwable $e) {
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);
