<?php
    require dirname(__DIR__, 2) . "/vendor/autoload.php";
    require dirname(__DIR__, 2) . "/include/verify-user.php";


    $get_settings = $conn->prepare("SELECT stripe_secret_key FROM store_settings LIMIT 1");
    $get_settings->execute();
    $site_settings = $get_settings->fetch(PDO::FETCH_OBJ);

    \Stripe\Stripe::setApiKey($site_settings->stripe_secret_key);

    try {
        if (empty($_POST['items']) || !is_array($_POST['items'])) {
            throw new Exception("Invalid items payload");
        }

        $conn->beginTransaction();

        $user_id = (int)$my_details->id;

        require_once __DIR__."/get-total.php";

        $intent = \Stripe\PaymentIntent::create([
            "amount" => $total*100,
            "currency" => "usd",
            "automatic_payment_methods" => ["enabled" => true],
        ]);

        echo json_encode([
            "error" => false,
            "data" => [
                "clientSecret" => $intent->client_secret
            ]
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
