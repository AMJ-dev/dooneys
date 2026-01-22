<?php
    require_once dirname(__DIR__, 2) . "/include/set-header.php";

    function respond(bool $error, string $message, int $http = 200, array $extra = []) {
        http_response_code($http);
        echo json_encode(array_merge([
            "error" => $error,
            "message" => $message
        ], $extra));
        exit;
    }

    $email    = strtolower(trim($_POST["email"] ?? ""));
    $password = $_POST["password"] ?? "";

    if ($email === "" || $password === "") {
        respond(true, "Email and password are required", 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(true, "Invalid email address", 422);
    }

    $chk_user = $conn->prepare("
        SELECT 
            id,
            email,
            mobile_number,
            password,
            first_name,
            is_admin,
            status
        FROM users
        WHERE email = :email
        LIMIT 1
    ");
    $chk_user->bindValue(":email", $email);
    $chk_user->execute();

    $user = $chk_user->fetch(PDO::FETCH_OBJ);

    if (!$user || !password_verify($password, $user->password)) respond(true, "Invalid email or password");
    if ((int)$user->status === 0) respond(true, "Account not activated");
    if ((int)$user->status === 2) respond(true, "Account suspended. Contact support.");
    require_once dirname(__DIR__, 2) . "/include/update-token.php";

    try {
        require __DIR__ . "/send-otp.php";
    } catch (Throwable $e) {
        respond(true, "Failed to send OTP. Please try again.");
    }

    respond(false, "OTP sent to your email", 200, [
        "user_id" => $user->id,
        "is_admin" => (bool)$user->is_admin
    ]);
