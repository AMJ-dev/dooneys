<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data  = null;

    try {
        $user_id    = (int)$my_details->id;
        $product_id = (int)($_POST['id'] ?? 0);

        if ($product_id <= 0) {
            throw new Exception("Invalid product");
        }

        // Check product exists
        $checkProduct = $conn->prepare("
            SELECT id
            FROM products
            WHERE id = :pid AND status = 'active'
            LIMIT 1
        ");
        $checkProduct->execute([':pid' => $product_id]);

        if (!$checkProduct->fetch()) {
            throw new Exception("Product not found");
        }

        // Check if already in wishlist
        $check = $conn->prepare("
            SELECT id
            FROM wishlists
            WHERE user_id = :uid AND product_id = :pid
            LIMIT 1
        ");
        $check->execute([
            ':uid' => $user_id,
            ':pid' => $product_id
        ]);

        if ($check->fetch()) {
            // ❌ Remove from wishlist
            $del = $conn->prepare("
                DELETE FROM wishlists
                WHERE user_id = :uid AND product_id = :pid
            ");
            $del->execute([
                ':uid' => $user_id,
                ':pid' => $product_id
            ]);

            $data = [
                "saved" => false,
                "action" => "removed",
                "product_id" => $product_id
            ];
        } else {
            // ✅ Add to wishlist
            $ins = $conn->prepare("
                INSERT INTO wishlists (user_id, product_id)
                VALUES (:uid, :pid)
            ");
            $ins->execute([
                ':uid' => $user_id,
                ':pid' => $product_id
            ]);

            $data = [
                "saved" => true,
                "action" => "added",
                "product_id" => $product_id
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
