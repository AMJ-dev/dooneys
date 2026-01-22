<?php 
    require_once __DIR__.'/constants.php';
    $dsn = "mysql:host=localhost; dbname=$db_name";
    $conn = new PDO($dsn, $db_user, $db_pass, []);
    if (!$conn) die('DB Connection Failed');

    require_once __DIR__.'/php-jwt/BeforeValidException.php';
    require_once __DIR__.'/php-jwt/ExpiredException.php';
    require_once __DIR__.'/php-jwt/SignatureInvalidException.php';
    require_once __DIR__.'/php-jwt/JWT.php';

    $privateKey = file_get_contents(__DIR__.'/keys/private.key');
    $publicKey = file_get_contents(__DIR__.'/keys/public.pem');
    
    require __DIR__."/PHPMailer/Exception.php";
    require __DIR__."/PHPMailer/PHPMailer.php";
    require __DIR__."/PHPMailer/SMTP.php";
      
    $date_time = date("Y-m-d H:i:s");

    require_once __DIR__.'/functions.php'; 
    $can_post_job = false; 
    if(isset($_SESSION["id"])) $my_details = get_user($_SESSION["id"]);
        