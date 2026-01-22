<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    $error   = false;
    $data    = null;
    $user_id = null;
    $auth    = false;

    try {
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) {
            throw new Exception("Invalid request");
        }

        if (!empty($_POST["auth"]) && $_POST["auth"] == "1") {
            require_once dirname(__DIR__, 2) . "/include/verify-user.php";
            $user_id = (int)$my_details->id;
            $auth    = true;
        }

        $stmt = $conn->prepare("
            SELECT
                p.id,
                p.name,
                p.description,
                p.category_id,
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
                c.name AS category_name,
                c.slug AS category_slug
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id
            WHERE p.id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => $id]);

        if (!$stmt->rowCount()) {
            throw new Exception("Product not found");
        }

        $product = $stmt->fetch(PDO::FETCH_OBJ);

        $galleryStmt = $conn->prepare("
            SELECT id, image, sort_order
            FROM product_gallery
            WHERE product_id = :id
            ORDER BY sort_order ASC, id ASC
        ");
        $galleryStmt->execute([':id' => $id]);
        $product->gallery = $galleryStmt->fetchAll(PDO::FETCH_OBJ);

        $featuresStmt = $conn->prepare("
            SELECT id, feature, sort_order
            FROM product_features
            WHERE product_id = :id
            ORDER BY sort_order ASC
        ");
        $featuresStmt->execute([':id' => $id]);
        $product->features = $featuresStmt->fetchAll(PDO::FETCH_OBJ);

        $variantStmt = $conn->prepare("
            SELECT id, variant_type
            FROM product_variants
            WHERE product_id = :id
            ORDER BY id ASC
        ");
        $variantStmt->execute([':id' => $id]);

        $variants = [];

        while ($variant = $variantStmt->fetch(PDO::FETCH_OBJ)) {

            $optionStmt = $conn->prepare("
                SELECT id, option_value, sort_order, price_modifier
                FROM product_variant_options
                WHERE variant_id = :vid
                ORDER BY sort_order ASC, id ASC
            ");
            $optionStmt->execute([':vid' => $variant->id]);

            $variants[] = [
                "id"   => (int)$variant->id,
                "type" => $variant->variant_type,
                "options" => array_map(function ($opt) {
                    return [
                        "id"            => (int)$opt->id,
                        "option_id"     => (int)$opt->id,
                        "value"         => $opt->option_value,
                        "sort_order"    => (int)$opt->sort_order,
                        "price_modifier"=> (string)$opt->price_modifier
                    ];
                }, $optionStmt->fetchAll(PDO::FETCH_OBJ))
            ];
        }

        $product->variants = $variants;

        if ($auth && $user_id > 0) {
            $wishStmt = $conn->prepare("
                SELECT 1
                FROM wishlists
                WHERE user_id = :uid AND product_id = :pid
                LIMIT 1
            ");
            $wishStmt->execute([
                ':uid' => $user_id,
                ':pid' => $id
            ]);
            $product->is_wishlist = (bool)$wishStmt->fetch();
        } else {
            $product->is_wishlist = false;
        }

        $product->price          = (float)$product->price;
        $product->original_price = $product->original_price !== null ? (float)$product->original_price : null;
        $product->weight         = $product->weight !== null ? (float)$product->weight : null;
        $product->item_width     = $product->item_width !== null ? (float)$product->item_width : null;
        $product->item_height    = $product->item_height !== null ? (float)$product->item_height : null;
        $product->item_depth     = $product->item_depth !== null ? (float)$product->item_depth : null;

        $data = $product;

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
