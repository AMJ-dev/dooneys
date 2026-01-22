<?php
    use \Firebase\JWT\JWT;
 
    $now = time();
    $tokenPayload = [
        "id"  => $user->id,
        "iat" => $now,
        "exp" => $now + 3600,
        "iss" => $baseURL ?? "https://your-domain",
        "aud" => $baseURL ?? "https://your-domain",
        "plat"=> "web",
    ];
    $jwt = JWT::encode($tokenPayload, $privateKey, 'RS256');
    $code = [
        "jwt"   => $jwt,
        "email" => hide_email($user->email),
    ];