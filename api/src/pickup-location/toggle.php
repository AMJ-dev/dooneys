<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {

        if (empty($_POST["id"])) {
            throw new Exception("Missing pickup location id");
        }

        $id = (int) $_POST["id"];
        if ($id <= 0) {
            throw new Exception("Invalid pickup location id");
        }

        $stmt = $conn->prepare("
            SELECT status, name
            FROM pickup_locations
            WHERE id = ?
            LIMIT 1
        ");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_OBJ);

        if (!$row) {
            throw new Exception("Pickup location not found");
        }

        $current = $row->status;

        $next = $current === "active"
            ? "inactive"
            : "active";

        $update = $conn->prepare("
            UPDATE pickup_locations
            SET status = ?, updated_at = NOW()
            WHERE id = ?
            LIMIT 1
        ");
        $update->execute([$next, $id]);

        $data = [
            "id" => $id,
            "old_status" => $current,
            "new_status" => $next,
            "name" => $row->name
        ];

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
