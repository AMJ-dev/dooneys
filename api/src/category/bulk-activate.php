<?php
    require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

    $error = false;
    $data  = null;

    try {
        $conn->beginTransaction();
        $upd = $conn->prepare("UPDATE categories SET status = 'active'");
        $upd->execute();

        $conn->commit();
        $data = ["activated" => true, "affected_rows" => $upd->rowCount()];

    } catch (Throwable $e) {
        $conn->rollBack();
        $error = true;
        $data  = $e->getMessage();
    }

    if ($error) http_response_code(400);
    echo json_encode(["error" => $error, "data" => $data]);
