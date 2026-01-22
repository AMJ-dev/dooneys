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
            SELECT id FROM user_addresses WHERE id = :id AND user_id = :uid
        ");
        $check->execute([':id'=>$id,':uid'=>$user_id]);
        if (!$check->fetch()) throw new Exception("Address not found");

        $is_default = !empty($_POST['is_default']) ? 1 : 0;

        if ($is_default) {
            $conn->prepare("
                UPDATE user_addresses SET is_default = 0 WHERE user_id = :uid
            ")->execute([':uid'=>$user_id]);
        }

        $conn->prepare("
            UPDATE user_addresses SET
                label=:label,
                name=:name,
                street_address=:street,
                city=:city,
                province=:province,
                postal_code=:postal,
                mobile_number=:mobile,
                is_default=:def
            WHERE id=:id AND user_id=:uid
        ")->execute([
            ':label'=>$_POST['label'],
            ':name'=>$_POST['name'],
            ':street'=>$_POST['street_address'],
            ':city'=>$_POST['city'],
            ':province'=>$_POST['province'],
            ':postal'=>$_POST['postal_code'],
            ':mobile'=>$_POST['mobile_number'] ?? null,
            ':def'=>$is_default,
            ':id'=>$id,
            ':uid'=>$user_id
        ]);

        $conn->commit();
        $data = "Address updated successfully";

    } catch (Throwable $e) {
        $conn->rollBack();
        $error = true;
        $data = $e->getMessage();
    }

    // if ($error) http_response_code(400);
    echo json_encode(['error'=>$error,'data'=>$data]);
