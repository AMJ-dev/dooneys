<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data = null;

    try {
        $conn->beginTransaction();

        $user_id = $my_details->id;
        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) throw new Exception("Invalid request");

        $check = $conn->prepare("
            SELECT is_default FROM user_addresses
            WHERE id = :id AND user_id = :uid
        ");
        $check->execute([':id'=>$id,':uid'=>$user_id]);
        $addr = $check->fetch(PDO::FETCH_OBJ);
        if (!$addr) throw new Exception("Address not found");

        $conn->prepare("
            DELETE FROM user_addresses WHERE id = :id AND user_id = :uid
        ")->execute([':id'=>$id,':uid'=>$user_id]);

        if ($addr->is_default) {
            $conn->prepare("
                UPDATE user_addresses
                SET is_default = 1
                WHERE user_id = :uid
                ORDER BY id DESC
                LIMIT 1
            ")->execute([':uid'=>$user_id]);
        }

        $conn->commit();
        $data = "Address deleted successfully";

    } catch (Throwable $e) {
        $conn->rollBack();
        $error = true;
        $data = $e->getMessage();
    }

    // if ($error) http_response_code(400);
    echo json_encode(['error'=>$error,'data'=>$data]);
