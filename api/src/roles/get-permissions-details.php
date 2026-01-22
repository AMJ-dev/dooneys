<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = null;
$roleId = $_GET["id"] ?? null;

try {
    $stmt = $conn->prepare("
        SELECT 
            id,
            code,
            name,
            description,
            icon,
            category,
            created_at
        FROM permissions
        ORDER BY category, name ASC
    ");
    $stmt->execute();
    $allPermissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $permissions = [];
    foreach ($allPermissions as $perm) {
        $permissions[] = [
            "id" => (string)$perm["id"],
            "code" => $perm["code"],
            "name" => $perm["name"],
            "description" => $perm["description"] ?? "",
            "icon" => $perm["icon"] ?? "Shield",
            "category" => $perm["category"] ?? "General",
            "createdAt" => $perm["created_at"]
        ];
    }

    if ($roleId) {
        $stmt = $conn->prepare("
            SELECT 
                r.id,
                r.slug,
                r.name,
                r.description,
                r.created_at,
                r.updated_at,
                COUNT(u.id) AS staff_count
            FROM roles r
            LEFT JOIN users u ON u.role_id = r.id AND u.status = '1'
            WHERE r.id = :id
            GROUP BY r.id
        ");
        $stmt->execute([':id' => $roleId]);
        $role = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$role) {
            throw new Exception("Role not found");
        }

        $stmt = $conn->prepare("
            SELECT p.code
            FROM role_permissions rp
            INNER JOIN permissions p ON p.id = rp.permission_id
            WHERE rp.role_id = :role_id
        ");
        $stmt->execute([':role_id' => $roleId]);
        $rolePermissions = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);

        $stmt = $conn->prepare("
            SELECT 
                u.id,
                CONCAT(u.first_name, ' ', u.last_name) AS name,
                u.email,
                u.mobile_number AS phone,
                CASE 
                    WHEN u.status = '1' THEN 'active'
                    WHEN u.status = '0' THEN 'inactive'
                    ELSE 'suspended'
                END as status,
                u.created_at AS join_date,
                u.last_login AS last_active,
                u.pics,
                u.role_id
            FROM users u
            WHERE u.role IN ('staff', 'admin')
            ORDER BY u.created_at DESC
        ");
        $stmt->execute();
        $allStaff = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmt = $conn->prepare("
            SELECT 
                u.id,
                CONCAT(u.first_name, ' ', u.last_name) AS name,
                u.email,
                u.mobile_number AS phone,
                CASE 
                    WHEN u.status = '1' THEN 'active'
                    WHEN u.status = '0' THEN 'inactive'
                    ELSE 'suspended'
                END as status,
                u.created_at AS join_date,
                u.last_login AS last_active,
                u.pics,
                u.role_id
            FROM users u
            WHERE u.role_id = :role_id 
            AND u.role IN ('staff', 'admin')
            ORDER BY u.created_at DESC
        ");
        $stmt->execute([':role_id' => $roleId]);
        $assignedStaff = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $roleData = [
            "id" => (string)$role["id"],
            "name" => $role["name"],
            "description" => $role["description"] ?? "",
            "permissions" => $rolePermissions,
            "staffCount" => (int)$role["staff_count"],
            "createdAt" => $role["created_at"],
            "lastModified" => $role["updated_at"],
            "assignedStaff" => $assignedStaff
        ];

        $data = [
            "permissions" => $permissions,
            "access_levels" => [$roleData],
            "staffs" => $allStaff,
            "role" => $roleData
        ];

    } else {
        $stmt = $conn->prepare("
            SELECT 
                r.id,
                r.slug,
                r.name,
                r.description,
                r.created_at,
                r.updated_at,
                COUNT(u.id) AS staff_count
            FROM roles r
            LEFT JOIN users u ON u.role_id = r.id AND u.status = '1'
            GROUP BY r.id
            ORDER BY r.created_at ASC
        ");
        $stmt->execute();
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmt = $conn->prepare("
            SELECT 
                rp.role_id,
                p.code
            FROM role_permissions rp
            INNER JOIN permissions p ON p.id = rp.permission_id
        ");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $permissionsByRole = [];
        foreach ($rows as $row) {
            $permissionsByRole[$row["role_id"]][] = $row["code"];
        }

        $stmt = $conn->prepare("
            SELECT 
                u.id,
                CONCAT(u.first_name, ' ', u.last_name) AS name,
                u.email,
                u.mobile_number AS phone,
                CASE 
                    WHEN u.status = '1' THEN 'active'
                    WHEN u.status = '0' THEN 'inactive'
                    ELSE 'suspended'
                END as status,
                u.created_at AS join_date,
                u.last_login AS last_active,
                u.pics,
                u.role_id
            FROM users u
            WHERE u.role IN ('staff', 'admin')
            ORDER BY u.created_at DESC
        ");
        $stmt->execute();
        $staffMembers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $accessLevels = [];
        foreach ($roles as $role) {
            $assignedStaff = array_filter($staffMembers, function($staff) use ($role) {
                return $staff['role_id'] == $role['id'];
            });
            $assignedStaff = array_values($assignedStaff);

            $accessLevels[] = [
                "id" => (string)$role["id"],
                "name" => $role["name"],
                "description" => $role["description"] ?? "",
                "permissions" => $permissionsByRole[$role["id"]] ?? [],
                "staffCount" => (int)$role["staff_count"],
                "createdAt" => $role["created_at"],
                "lastModified" => $role["updated_at"],
                "assignedStaff" => $assignedStaff
            ];
        }

        $data = [
            "permissions" => $permissions,
            "access_levels" => $accessLevels,
            "staffs" => $staffMembers
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
?>