<?php
require_once dirname(__DIR__, 2) . "/include/verify-user.php";

$error = false;
$data  = null;

try {

    if (empty($_POST['orderId'])) {
        throw new Exception("Invalid request");
    }

    $order_id = (int)$_POST['orderId'];
    $user_id  = (int)$my_details->id;

    $conn->beginTransaction();

    $stmt = $conn->prepare("
        SELECT id, payment_method, payment_status
        FROM orders
        WHERE id = ? AND user_id = ?
        LIMIT 1
    ");
    $stmt->execute([$order_id, $user_id]);
    $order = $stmt->fetch(PDO::FETCH_OBJ);

    if (!$order) {
        throw new Exception("Order not found");
    }

    if ($order->payment_method !== 'cash') {
        throw new Exception("Invalid payment method");
    }

    if ($order->payment_status !== 'pending') {
        throw new Exception("Order already confirmed");
    }

    $conn->prepare("
        UPDATE orders
        SET payment_status = 'cash_on_delivery',
            updated_at = NOW()
        WHERE id = ?
        LIMIT 1
    ")->execute([$order_id]);

    $conn->prepare("
        INSERT INTO payments (
            order_id,
            method,
            status,
            amount,
            reference,
            created_at
        )
        SELECT
            id,
            'cash',
            'pending',
            total_amount,
            CONCAT('COD-', order_number),
            NOW()
        FROM orders
        WHERE id = ?
        LIMIT 1
    ")->execute([$order_id]);

    $conn->prepare("
        INSERT INTO order_status_history (order_id, status, changed_by)
        VALUES (?, 'confirmed', 'system')
    ")->execute([$order_id]);

    $conn->commit();

    $data = [
        "orderId" => $order_id,
        "status"  => "confirmed"
    ];

} catch (Throwable $e) {

    if ($conn->inTransaction()) {
        $conn->rollBack();
    }

    http_response_code(400);
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);
