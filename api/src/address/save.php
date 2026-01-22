<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data = null;

    try {
        $conn->beginTransaction();

        $user_id = $my_details->id;

        $required = [
            'label','name','street_address','city',
            'province','postal_code'
        ];

        foreach ($required as $f) {
            if (empty($_POST[$f])) {
                throw new Exception("$f is required");
            }
        }

        $is_default = !empty($_POST['is_default']) ? 1 : 0;

        if ($is_default) {
            $conn->prepare("
                UPDATE user_addresses SET is_default = 0 WHERE user_id = :uid
            ")->execute([':uid' => $user_id]);
        }

        $conn->prepare("
            INSERT INTO user_addresses
            (user_id,label,name,street_address,city,province,postal_code,mobile_number,is_default)
            VALUES
            (:uid,:label,:name,:street,:city,:province,:postal,:mobile,:def)
        ")->execute([
            ':uid'=>$user_id,
            ':label'=>$_POST['label'],
            ':name'=>$_POST['name'],
            ':street'=>$_POST['street_address'],
            ':city'=>$_POST['city'],
            ':province'=>$_POST['province'],
            ':postal'=>$_POST['postal_code'],
            ':mobile'=>$_POST['mobile_number'] ?? null,
            ':def'=>$is_default
        ]);

        $conn->commit();
        $data = "Address saved successfully";

    } catch (Throwable $e) {
        $conn->rollBack();
        $error = true;
        $data = $e->getMessage();
    }

    // if ($error) http_response_code(400);
    echo json_encode(['error'=>$error,'data'=>$data]);
