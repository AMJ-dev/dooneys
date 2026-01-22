<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data  = null;

    try {
        $user_id = (int)$my_details->id;

        $stmt = $conn->prepare("DELETE FROM wishlists WHERE user_id = :uid");
        $stmt->execute([':uid' => $user_id]);

        $data = ["cleared" => true, "deleted_count" => $stmt->rowCount()];

    } catch (Throwable $e) {
        // http_response_code(400);
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
