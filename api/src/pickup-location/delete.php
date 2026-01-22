<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {

        if (empty($_POST['id'])) {
            throw new Exception("Missing location id");
        }

        $id = (int) $_POST['id'];

        if ($id <= 0) {
            throw new Exception("Invalid location id");
        }

        $stmt = $conn->prepare("
            DELETE FROM pickup_locations
            WHERE id = ?
            LIMIT 1
        ");

        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            throw new Exception("Pickup location not found");
        }

        $data = [
            "id"     => $id,
            "status" => "deleted"
        ];

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
