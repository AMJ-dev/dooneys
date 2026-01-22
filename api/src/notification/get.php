<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data  = null;

    try {
        $user_id = (int)$my_details->id;

        $stmt = $conn->prepare("
            SELECT
                order_updates,
                sms_alerts,
                security_notifications
            FROM user_notifications
            WHERE user_id = :uid
            LIMIT 1
        ");
        $stmt->execute([':uid' => $user_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

    } catch (Throwable $e) {
        // http_response_code(400);
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data" => $data
    ]);
