<?php
    require_once dirname(__DIR__, 2) . "/include/verify-user.php";

    $error = false;
    $data  = null;

    try {
        $user_id = $my_details->id;

        $stmt = $conn->prepare("
            SELECT
                id,
                label,
                name,
                street_address,
                city,
                province,
                postal_code,
                mobile_number,
                is_default,
                created_at,
                updated_at
            FROM user_addresses
            WHERE user_id = :uid
            ORDER BY is_default DESC, id DESC
        ");

        $stmt->execute([':uid' => $user_id]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    } catch (Throwable $e) {
        $error = true;
        $data  = $e->getMessage();
    }

    if ($error) {
        // http_response_code(400);
    }

    echo json_encode([
        "error" => $error,
        "data"  => $data
    ]);
