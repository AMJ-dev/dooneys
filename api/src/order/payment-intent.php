<?php
    require dirname(__DIR__, 2) . "/vendor/autoload.php";
    require dirname(__DIR__, 2) . "/include/verify-user.php";

    $get_settings = $conn->prepare("SELECT * FROM store_settings LIMIT 1");
    $get_settings->execute();
    $site_settings = $get_settings->fetch(PDO::FETCH_OBJ);

    // Clean the secret key - remove whitespace and newlines
    $stripe_secret_key = trim(preg_replace('/\s+/', '', $site_settings->stripe_secret_key));
    
    // Make it available globally
    $GLOBALS['site_settings'] = $site_settings;

    \Stripe\Stripe::setApiKey($stripe_secret_key);

    try {
        if (empty($_POST['items']) || !is_array($_POST['items'])) {
            throw new Exception("Invalid items payload");
        }

        $conn->beginTransaction();

        $user_id = (int)$my_details->id;

        require_once __DIR__."/get-total.php";

        // Verify the total is valid
        if ($total <= 0) {
            throw new Exception("Invalid total amount: " . $total);
        }

        // Convert to cents (Stripe expects amount in smallest currency unit)
        $amount_in_cents = (int) round($total * 100);
        
        if ($amount_in_cents < 50) {
            throw new Exception("Amount must be at least $0.50 CAD");
        }

        $intent = \Stripe\PaymentIntent::create([
            "amount" => $amount_in_cents,
            "currency" => "cad",
            "automatic_payment_methods" => ["enabled" => true],
        ]);

        echo json_encode([
            "error" => false,
            "data" => [
                "clientSecret" => $intent->client_secret
            ]
        ]);
    } catch (Exception $e) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
?>