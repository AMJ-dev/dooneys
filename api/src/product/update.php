<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {
        $conn->beginTransaction();

        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) throw new Exception("Invalid product ID");

        if (trim($_POST['name'] ?? '') === '') throw new Exception("Product name required");
        if (trim($_POST['sku'] ?? '') === '') throw new Exception("SKU required");
        if ((float)($_POST['price'] ?? 0) <= 0) throw new Exception("Invalid price");

        $conn->prepare("
            UPDATE products SET
                name=:name,
                description=:description,
                category_id=:category_id,
                price=:price,
                original_price=:original_price,
                sku=:sku,
                status=:status,
                in_stock=:in_stock,
                manage_stock=:manage_stock,
                stock_quantity=:stock_quantity,
                low_stock_alert=:low_stock_alert,
                weight=:weight,
                item_width=:item_width,
                item_height=:item_height,
                item_depth=:item_depth,
                is_best_seller=:is_best_seller,
                is_new=:is_new
            WHERE id=:id
        ")->execute([
            ':name'            => $_POST['name'],
            ':description'     => $_POST['description'] ?? null,
            ':category_id'     => (int)$_POST['category_id'],
            ':price'           => (float)$_POST['price'],
            ':original_price'  => $_POST['original_price'] ?: null,
            ':sku'             => $_POST['sku'],
            ':status'          => $_POST['status'],
            ':in_stock'        => $_POST['in_stock'],
            ':manage_stock'    => $_POST['manage_stock'],
            ':stock_quantity'  => (int)$_POST['stock_quantity'],
            ':low_stock_alert' => (int)$_POST['low_stock_alert'],
            ':weight'          => (float)$_POST['weight'],
            ':item_width'      => (float)$_POST['item_width'],
            ':item_height'     => (float)$_POST['item_height'],
            ':item_depth'      => (float)$_POST['item_depth'],
            ':is_best_seller'  => $_POST['is_best_seller'],
            ':is_new'          => $_POST['is_new'],
            ':id'              => $id
        ]);

        if (!empty($_POST['removed_images'])) {
            $stmt = $conn->prepare("DELETE FROM product_gallery WHERE id=?");
            foreach ($_POST['removed_images'] as $imgId) {
                $stmt->execute([(int)$imgId]);
            }
        }

        if (!empty($_POST['existing_images'])) {
            $stmt = $conn->prepare("
                UPDATE product_gallery SET sort_order=:sort WHERE id=:id
            ");
            foreach ($_POST['existing_images'] as $img) {
                $stmt->execute([
                    ':id'   => (int)$img['id'],
                    ':sort' => (int)$img['sort_order']
                ]);
            }
        }

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
                    INSERT INTO product_gallery (product_id,image,sort_order)
                    VALUES (:pid,:img,:sort)
                ")->execute([
                    ':pid'  => $id,
                    ':img'  => $up['path'],
                    ':sort' => $i
                ]);
            }
        }

        if (!empty($_POST['removed_features'])) {
            $stmt = $conn->prepare("DELETE FROM product_features WHERE id=?");
            foreach ($_POST['removed_features'] as $fid) {
                $stmt->execute([(int)$fid]);
            }
        }

        if (!empty($_POST['existing_features'])) {
            $stmt = $conn->prepare("
                UPDATE product_features SET feature=:feature, sort_order=:sort WHERE id=:id
            ");
            foreach ($_POST['existing_features'] as $f) {
                $stmt->execute([
                    ':id'      => (int)$f['id'],
                    ':feature' => $f['feature'],
                    ':sort'    => (int)$f['sort_order']
                ]);
            }
        }

        if (!empty($_POST['new_features'])) {
            $stmt = $conn->prepare("
                INSERT INTO product_features (product_id,feature,sort_order)
                VALUES (:pid,:feature,:sort)
            ");
            foreach ($_POST['new_features'] as $f) {
                $stmt->execute([
                    ':pid'     => $id,
                    ':feature' => $f['feature'],
                    ':sort'    => (int)$f['sort_order']
                ]);
            }
        }

        if (!empty($_POST['removed_variants'])) {
            $stmt = $conn->prepare("DELETE FROM product_variants WHERE id=?");
            foreach ($_POST['removed_variants'] as $vid) {
                $stmt->execute([(int)$vid]);
            }
        }

        if (!empty($_POST['removed_options'])) {
            $stmt = $conn->prepare("DELETE FROM product_variant_options WHERE id=?");
            foreach ($_POST['removed_options'] as $oid) {
                $stmt->execute([(int)$oid]);
            }
        }

        if (!empty($_POST['existing_variants'])) {
            foreach ($_POST['existing_variants'] as $v) {
                $vid = (int)$v['id'];

                $conn->prepare("
                    UPDATE product_variants SET variant_type=:type WHERE id=:id
                ")->execute([
                    ':id'   => $vid,
                    ':type' => $v['type']
                ]);

                if (!empty($v['options'])) {
                    $stmt = $conn->prepare("
                        UPDATE product_variant_options
                        SET option_value=:val, sort_order=:sort, price_modifier=:price
                        WHERE id=:id
                    ");
                    foreach ($v['options'] as $o) {
                        $stmt->execute([
                            ':id'    => (int)$o['id'],
                            ':val'   => $o['value'],
                            ':sort'  => (int)$o['sort_order'],
                            ':price' => (float)$o['price_modifier']
                        ]);
                    }
                }

                if (!empty($v['new_options'])) {
                    $stmt = $conn->prepare("
                        INSERT INTO product_variant_options
                        (variant_id,option_value,sort_order,price_modifier)
                        VALUES (:vid,:val,:sort,:price)
                    ");
                    foreach ($v['new_options'] as $o) {
                        $stmt->execute([
                            ':vid'   => $vid,
                            ':val'   => $o['value'],
                            ':sort'  => (int)$o['sort_order'],
                            ':price' => (float)$o['price_modifier']
                        ]);
                    }
                }
            }
        }

        if (!empty($_POST['new_variants'])) {
            foreach ($_POST['new_variants'] as $v) {
                $conn->prepare("
                    INSERT INTO product_variants (product_id,variant_type)
                    VALUES (:pid,:type)
                ")->execute([
                    ':pid'  => $id,
                    ':type' => $v['type']
                ]);
                $vid = $conn->lastInsertId();

                foreach ($v['options'] as $o) {
                    $conn->prepare("
                        INSERT INTO product_variant_options
                        (variant_id,option_value,sort_order,price_modifier)
                        VALUES (:vid,:val,:sort,:price)
                    ")->execute([
                        ':vid'   => $vid,
                        ':val'   => $o['value'],
                        ':sort'  => (int)$o['sort_order'],
                        ':price' => (float)$o['price_modifier']
                    ]);
                }
            }
        }

        $conn->commit();
        $data = ['id' => $id];

    } catch (Throwable $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode(['error'=>$error,'data'=>$data]);
