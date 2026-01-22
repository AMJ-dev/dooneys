<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {
        $conn->beginTransaction();

        $name        = trim($_POST['name'] ?? '');
        $sku         = trim($_POST['sku'] ?? '');
        $category_id = (int)($_POST['category_id'] ?? 0);
        $price       = (float)($_POST['price'] ?? 0);

        if ($name === '') throw new Exception("Product name is required");
        // if ($sku === '') throw new Exception("SKU is required");
        if ($category_id <= 0) throw new Exception("Invalid category");
        if ($price <= 0) throw new Exception("Price must be greater than zero");

        $stmt = $conn->prepare("
            INSERT INTO products (
                name, description, category_id,
                price, original_price, sku,
                status, in_stock, manage_stock,
                stock_quantity, low_stock_alert,
                weight, item_width, item_height, item_depth,
                is_best_seller, is_new
            ) VALUES (
                :name, :description, :category_id,
                :price, :original_price, :sku,
                :status, :in_stock, :manage_stock,
                :stock_quantity, :low_stock_alert,
                :weight, :item_width, :item_height, :item_depth,
                :is_best_seller, :is_new
            )
        ");

        $stmt->execute([
            ':name'             => $name,
            ':description'      => $_POST['description'] ?? null,
            ':category_id'      => $category_id,
            ':price'            => $price,
            ':original_price'   => $_POST['original_price'] ?: null,
            ':sku'              => $sku,
            ':status'           => $_POST['status'] ?? 'active',
            ':in_stock'         => $_POST['in_stock'] ?? 1,
            ':manage_stock'     => $_POST['manage_stock'] ?? 1,
            ':stock_quantity'   => (int)($_POST['stock_quantity'] ?? 0),
            ':low_stock_alert'  => (int)($_POST['low_stock_alert'] ?? 10),
            ':weight'           => (float)($_POST['weight'] ?? 0),
            ':item_width'       => (float)($_POST['item_width'] ?? 0),
            ':item_height'      => (float)($_POST['item_height'] ?? 0),
            ':item_depth'       => (float)($_POST['item_depth'] ?? 0),
            ':is_best_seller'   => $_POST['is_best_seller'] ?? 0,
            ':is_new'           => $_POST['is_new'] ?? 0,
        ]);

        $product_id = (int)$conn->lastInsertId();

        if (!empty($_FILES['new_images'])) {
            foreach ($_FILES['new_images']['tmp_name'] as $i => $tmp) {
                $file = [
                    'name'     => $_FILES['new_images']['name'][$i],
                    'type'     => $_FILES['new_images']['type'][$i],
                    'tmp_name' => $tmp,
                    'error'    => $_FILES['new_images']['error'][$i],
                    'size'     => $_FILES['new_images']['size'][$i],
                ];

                $up = upload_pics($file);
                if ($up['error']) throw new Exception($up['message']);

                $conn->prepare("
                    INSERT INTO product_gallery (product_id, image, sort_order)
                    VALUES (:pid, :img, :sort)
                ")->execute([
                    ':pid'  => $product_id,
                    ':img'  => $up['path'],
                    ':sort' => $i
                ]);
            }
        }

        if (!empty($_POST['new_features'])) {
            foreach ($_POST['new_features'] as $f) {
                $conn->prepare("
                    INSERT INTO product_features (product_id, feature, sort_order)
                    VALUES (:pid, :feature, :sort)
                ")->execute([
                    ':pid'     => $product_id,
                    ':feature' => trim($f['feature']),
                    ':sort'    => (int)$f['sort_order']
                ]);
            }
        }

        if (!empty($_POST['new_variants'])) {
            foreach ($_POST['new_variants'] as $variant) {

                $conn->prepare("
                    INSERT INTO product_variants (product_id, variant_type)
                    VALUES (:pid, :type)
                ")->execute([
                    ':pid'  => $product_id,
                    ':type' => trim($variant['type'])
                ]);

                $variant_id = (int)$conn->lastInsertId();

                foreach ($variant['options'] as $option) {
                    $conn->prepare("
                        INSERT INTO product_variant_options
                        (variant_id, option_value, sort_order, price_modifier)
                        VALUES (:vid, :val, :sort, :price)
                    ")->execute([
                        ':vid'   => $variant_id,
                        ':val'   => trim($option['value']),
                        ':sort'  => (int)$option['sort_order'],
                        ':price' => (float)($option['price_modifier'] ?? 0)
                    ]);
                }
            }
        }

        $conn->commit();
        $data = ['id' => $product_id];

    } catch (Throwable $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        'error' => $error,
        'data'  => $data
    ]);
