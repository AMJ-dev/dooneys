<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = null;

try {

    if (empty($_POST['id'])) {
        throw new Exception("Invalid subcategory id");
    }

    $id = (int)$_POST['id'];

    if ($id <= 0) {
        throw new Exception("Invalid subcategory id");
    }

    $conn->beginTransaction();

    /* -------- CHECK IF EXISTS -------- */
    $check = $conn->prepare("
        SELECT id FROM sub_categories 
        WHERE id = :id 
        LIMIT 1
    ");
    $check->execute([':id' => $id]);

    if ($check->rowCount() === 0) {
        throw new Exception("Subcategory not found");
    }

    /* -------- DELETE -------- */
    $delete = $conn->prepare("
        DELETE FROM sub_categories 
        WHERE id = :id 
        LIMIT 1
    ");
    $delete->execute([':id' => $id]);

    $conn->commit();

    $data = "Subcategory removed";

} catch (Throwable $e) {

    if ($conn->inTransaction()) {
        $conn->rollBack();
    }

    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);
