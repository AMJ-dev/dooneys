<?php
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header("HTTP/1.1 200 OK");
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Max-Age: 86400"); 
        header("Content-Length: 0");
        header("Content-Type: text/plain");
        exit(0);
    }

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    
    require_once __DIR__.'/conn.php';
    
    $input = json_decode(file_get_contents('php://input'), true);
    if(isset($input)) $_POST = $input; 

    $get_settings = $conn->prepare("SELECT * FROM store_settings LIMIT 1");
    $get_settings->execute();
    $site_settings = $get_settings->fetch(PDO::FETCH_OBJ);

    unset($site_settings->stripe_secret_key);
