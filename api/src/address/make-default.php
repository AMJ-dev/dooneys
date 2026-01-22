<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data  = null;

    try {
        $conn->beginTransaction();

        $user_id = (int)$my_details->id;
        $id = (int)($_POST['id'] ?? 0);

        if ($id <= 0) {
            throw new Exception("Invalid request");
        }

        $stmt = $conn->prepare("
            SELECT id 
            FROM user_addresses 
            WHERE id = :id AND user_id = :uid
            LIMIT 1
        ");
        $stmt->execute([
            ':id'  => $id,
            ':uid' => $user_id
        ]);

        if (!$stmt->fetch()) {
            throw new Exception("Address not found");
        }

        $stmt = $conn->prepare("
            UPDATE user_addresses
            SET is_default = 0
            WHERE user_id = :uid
        ");
        $stmt->execute([':uid' => $user_id]);

        $stmt = $conn->prepare("
            UPDATE user_addresses
            SET is_default = 1
            WHERE id = :id AND user_id = :uid
            LIMIT 1
        ");
        $stmt->execute([
            ':id'  => $id,
            ':uid' => $user_id
        ]);

        $conn->commit();
        $data = "Default address updated successfully";

    } catch (Throwable $e) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        'error' => $error,
        'data'  => $data
    ]);
