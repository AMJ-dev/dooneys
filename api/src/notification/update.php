<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data  = null;

    try {
        $userId = (int) $my_details->id;

        $stmt = $conn->prepare("
            INSERT INTO user_notifications
                (user_id, order_updates, sms_alerts, security_notifications)
            VALUES
                (:uid, :ou, :sa, :sn)
            ON DUPLICATE KEY UPDATE
                order_updates = VALUES(order_updates),
                sms_alerts = VALUES(sms_alerts),
                security_notifications = VALUES(security_notifications)
        ");

        $stmt->execute([
            ':uid' => $userId,
            ':ou'  => $_POST['orderUpdates'],
            ':sa'  => $_POST['smsAlerts'],
            ':sn'  => $_POST['securityNotifications'],
        ]);

        $data = true;

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
