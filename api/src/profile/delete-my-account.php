<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data  = null;

    try {
        $user_id = (int)$my_details->id;

        $conn->beginTransaction();

        $stmt = $conn->prepare("DELETE FROM wishlists WHERE user_id = :uid");
        $stmt->bindValue(':uid', $user_id, PDO::PARAM_INT);
        $stmt->execute();

        $stmt = $conn->prepare("DELETE FROM user_notifications WHERE user_id = :uid");
        $stmt->bindValue(':uid', $user_id, PDO::PARAM_INT);
        $stmt->execute();

        $stmt = $conn->prepare("DELETE FROM users WHERE id = :uid LIMIT 1");
        $stmt->bindValue(':uid', $user_id, PDO::PARAM_INT);
        $stmt->execute();

        $conn->commit();

        $data = true;
        $error = false;

    } catch (Throwable $e) {
        $conn->rollBack();
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data" => $data
    ]);
