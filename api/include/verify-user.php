<?php
    use Firebase\JWT\JWT;

    require_once __DIR__ . '/set-header.php';

    JWT::$leeway = 30;

    function json_fail(int $status, string $message) {
        http_response_code($status);
        echo json_encode(["error" => true, "data" => $message], JSON_UNESCAPED_SLASHES);
        exit;
    }

    function get_auth_header(): ?string {
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            foreach ($headers as $k => $v) {
                if (strcasecmp($k, 'Authorization') === 0) return $v;
            }
        }
        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) return $_SERVER['HTTP_AUTHORIZATION'];
        if (!empty($_SERVER['Authorization'])) return $_SERVER['Authorization'];    
        if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        return null;
    }

    function invalid_token() {
        json_fail(401, "Invalid token");
    }

    $auth = get_auth_header();

    if (!$auth || !preg_match('/^\s*Bearer\s+(\S+)\s*$/i', $auth, $m)) invalid_token();

    $token = $m[1];

    try {
        $decoded = JWT::decode($token, $publicKey, array('RS256'));
        if (!isset($decoded->id)) invalid_token();
    
        $my_details = get_user($decoded->id);

        if (!$my_details) invalid_token();
        if (isset($my_details->password)) unset($my_details->password);
    } catch (\Throwable $e) {
        echo $e->getMessage();
        exit;
        // invalid_token();
    }


