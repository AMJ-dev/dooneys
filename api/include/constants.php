<?php
    require_once dirname(__DIR__, 1)."/env.php";
    $header_name = "Authorization";
    $comp_logo = $baseURL."logo.png";
    $sender_email = "info@doonneys.com";
    $date_time=date("Y-m-d H:i:s");
    $charges = 2;
    $comp_name=$AppName;
    $comp_email="info@doonneys.com";
    $comp_phone="+1 (825) 436-7356";
    $comp_address="Edmonton, Alberta, Canada";
    $error=true;   
    $data="An error occured, Pls try again later";
    $image_accepted = ["image/jpeg", "image/jpg", "image/png", "image/x-png", "image/pjpeg", "image/avif", "image/apng", "image/webp", "image/svg+xml"];   
    $docs_accepted = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    $otp_expires = "30 minutes";    
    $btn_style = "background-color: #2258BF;text-align:center;height: 55px;padding: 0px 100px;display: inline-block;line-height: 55px;color: #ffffff;font-weight: 600;font-size: 16px;border-radius: 12px;";
    $code = "";
    $fail = function($msg, $code = 400) {
        http_response_code($code);
        echo json_encode(['error' => true, 'data' => $msg], JSON_UNESCAPED_SLASHES);
        exit;
    };
    $privacy_url = "{$baseURL}privacy";
    $year = date("Y");
    