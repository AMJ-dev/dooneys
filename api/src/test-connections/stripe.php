<?php
    require dirname(__DIR__, 2) . "/vendor/autoload.php";
    require dirname(__DIR__, 2) . "/vendor/verify-admin.php";

    function jsonResponse($error, $data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode([
            "error" => $error,
            "data"  => $data
        ]);
        exit;
    }

    $secretKey = trim($_POST["secret_key"] ?? "");
    $publicKey = trim($_POST["publishable_key"] ?? "");

    if (!$secretKey || !$publicKey) {
        jsonResponse(true, "Missing Stripe keys", 400);
    }

    if (!preg_match('/^sk_(live|test)_/', $secretKey) || !preg_match('/^pk_(live|test)_/', $publicKey)) {
        jsonResponse(true, "Invalid Stripe key format", 400);
    }

    try {
        \Stripe\Stripe::setApiKey($secretKey);
        $account = \Stripe\Account::retrieve();

        jsonResponse(false, [
            "account_id"       => $account->id,
            "country"          => $account->country,
            "charges_enabled"  => $account->charges_enabled
        ]);
    } catch (\Stripe\Exception\ApiErrorException $e) {
        jsonResponse(true, $e->getMessage(), 400);
    } catch (\Exception $e) {
        jsonResponse(true, "Unexpected error: " . $e->getMessage(), 500);
    }
