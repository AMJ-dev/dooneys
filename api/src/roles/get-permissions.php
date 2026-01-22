<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {
        $roleId = isset($_GET["id"]) ? (int)$_GET["id"] : null;

        $sql = "
            SELECT 
                r.id,
                r.slug,
                r.name,
                r.description,
                r.created_at,
                r.updated_at,
                COUNT(u.id) AS staff_count
            FROM roles r
            LEFT JOIN users u ON u.role_id = r.id
        ";

        if ($roleId) {
            $sql .= " WHERE r.id = :id ";
        }

        $sql .= "
            GROUP BY r.id
            ORDER BY r.created_at ASC
        ";

        $stmt = $conn->prepare($sql);

        if ($roleId) {
            $stmt->bindValue(":id", $roleId, PDO::PARAM_INT);
        }

        $stmt->execute();
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($roleId && !$roles) {
            throw new Exception("Role not found");
        }

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

        $out = [];
        foreach ($roles as $r) {
            $out[] = [
                "id"           => (string)$r["id"],
                "name"         => $r["name"],
                "description"  => $r["description"] ?? "",
                "permissions"  => $permissionsByRole[$r["id"]] ?? [],
                "staffCount"   => (int)$r["staff_count"],
                "createdAt"    => $r["created_at"],
                "lastModified" => $r["updated_at"]
            ];
        }

        $data = $roleId ? $out[0] : $out;

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
