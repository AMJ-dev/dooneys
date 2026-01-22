<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data  = null;

    try {
        
        $stmt = $conn->prepare("SELECT order_updates, sms_alerts, security_notifications FROM user_notifications WHERE user_id = :user_id");
        $stmt->execute([":user_id" => $my_details->id]);

        $notification = $stmt->fetch(PDO::FETCH_OBJ);

        $profile = [
            "id"            => (string)$my_details->id,
            "first_name"    => $my_details->first_name,
            "last_name"     => $my_details->last_name,
            "pics"          => $my_details->pics,
            "email"         => $my_details->email,
            "role"          => $my_details->role,
            "role_id"       => $my_details->role_id,
            "dob"           => $my_details->dob,
            "mobile_number" => $my_details->mobile_number,
            "order_updates" => $notification->order_updates,
            "sms_alerts"    => $notification->sms_alerts,
            "security_notifications" => $notification->security_notifications,
            "created_at"    => $my_details->created_at,
            "status"        => $my_details->status
        ];

        $permissions = [];

        if ($my_details->role === "admin") {

            $stmt = $conn->prepare("
                SELECT code
                FROM permissions
            ");
            $stmt->execute();
            $permissions = $stmt->fetchAll(PDO::FETCH_COLUMN);

        } elseif ($my_details->role === "staff" && $my_details->role_id) {

            $stmt = $conn->prepare("
                SELECT p.code
                FROM role_permissions rp
                INNER JOIN permissions p ON p.id = rp.permission_id
                WHERE rp.role_id = :rid
            ");
            $stmt->execute([":rid" => $my_details->role_id]);
            $permissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
        }

        $data = [
            "profile" => $profile,
            "permissions" => $permissions
        ];

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
