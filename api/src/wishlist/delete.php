<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data  = null;

    try {
        $user_id = (int)$my_details->id;
        $product_id = (int)($_POST['id'] ?? 0);

        if ($product_id <= 0) {
            throw new Exception("Invalid product");
        }

        $stmt = $conn->prepare("DELETE FROM wishlists WHERE user_id = :uid AND product_id = :pid LIMIT 1");
        $stmt->execute([':uid' => $user_id, ':pid' => $product_id]);

        if ($stmt->rowCount() === 0) {
            throw new Exception("Item not found in wishlist");
        }

        $data = [
            "deleted" => true,
            "product_id" => $product_id
        ];

    } catch (Throwable $e) {
        // http_response_code(400);
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
