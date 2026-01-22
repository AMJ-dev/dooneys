<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data = [
        "users" => [],
        "access_levels" => []
    ];

    try {
        $stmt = $conn->prepare("
            SELECT 
                r.id,
                r.name,
                r.description,
                COUNT(u.id) AS count
            FROM roles r
            LEFT JOIN users u 
                ON u.role_id = r.id 
                AND u.role IN ('admin','staff')
            GROUP BY r.id
            ORDER BY r.created_at ASC
        ");
        $stmt->execute();
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($roles as $r) {
            $data['access_levels'][] = [
                "id"    => (string)$r['id'],
                "name"  => $r['name'],
                "count" => (int)$r['count']
            ];
        }

        $stmt = $conn->prepare("
            SELECT 
                u.id,
                CONCAT(u.first_name, ' ', u.last_name) AS name,
                u.email,
                u.mobile_number,
                u.pics,
                u.status,
                u.created_at,
                u.last_login,
                r.id   AS role_id,
                r.name AS role_name
            FROM users u
            INNER JOIN roles r ON r.id = u.role_id
            WHERE u.role IN ('admin','staff')
            ORDER BY u.created_at DESC
        ");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($users as $u) {
            $data['users'][] = [
                "id"          => (string)$u['id'],
                "name"        => $u['name'],
                "email"       => $u['email'],
                "phone"       => $u['mobile_number'],
                "pics"        => $u['pics'],
                "role"        => $u['role_name'],
                "accessLevel" => (string)$u['role_id'],
                "status"      => $u['status'] == 1 ? "active" : ($u['status'] == 2 ? "suspended" : "inactive"),
                "joinDate"    => date("Y-m-d", strtotime($u['created_at'])),
                "lastActive"  => $u['last_login'] ? date("Y-m-d", strtotime($u['last_login'])) : date("Y-m-d"),
                "lastLogin"   => $u['last_login']
            ];
        }

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
