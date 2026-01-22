<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = null;

try {

    $productId = (int)($_POST["id"] ?? 0);
    $type      = $_POST["adjustment_type"] ?? null;
    $amount    = (int)($_POST["amount"] ?? 0);
    $note      = $_POST["note"] ?? null;
    $userId    = (int)$my_details->id;

    if (!$productId || !$type || $amount < 0) {
        throw new Exception("Invalid payload");
    }

    if (!in_array($type, ["add", "subtract", "set"], true)) {
        throw new Exception("Invalid adjustment type");
    }

    $conn->beginTransaction();

    $stmt = $conn->prepare("
        SELECT stock_quantity, manage_stock
        FROM products
        WHERE id = ?
        FOR UPDATE
    ");
    $stmt->execute([$productId]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product) {
        throw new Exception("Product not found");
    }

    if (!$product["manage_stock"]) {
        throw new Exception("Stock management disabled");
    }

    $currentStock = (int)$product["stock_quantity"];

    if ($type === "add") {
        $newStock = $currentStock + $amount;
    } elseif ($type === "subtract") {
        $newStock = max(0, $currentStock - $amount);
    } else {
        $newStock = $amount;
    }

    $stmt = $conn->prepare("
        UPDATE products
        SET stock_quantity = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$newStock, $productId]);

    $get_product = $conn->prepare("SELECT stock_quantity FROM products WHERE id = ?");
    $get_product->execute([$productId]);
    $product = $get_product->fetch(PDO::FETCH_OBJ);

    if($product->stock_quantity <= 0){
        $update=$conn->prepare("UPDATE products SET in_stock = 0 WHERE id = ?");
        $update->execute([$productId]);
    }else{
        $update=$conn->prepare("UPDATE products SET in_stock = 1 WHERE id = ?");
        $update->execute([$productId]);
    }

    $stmt = $conn->prepare("
        INSERT INTO inventory_adjustments
        (product_id, user_id, adjustment_type, quantity, note)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $productId,
        $userId,
        $type,
        $amount,
        $note
    ]);

    $conn->commit();

    $data = [
        "product_id" => $productId,
        "old_stock"  => $currentStock,
        "new_stock"  => $newStock,
        "type"       => $type,
        "quantity"   => $amount
    ];

} catch (Throwable $e) {
    $conn->rollBack();
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);
