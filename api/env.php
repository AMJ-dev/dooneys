<?php
    ini_set("display_errors", 1);
    ini_set("display_startup_errors", 1);
    error_reporting(E_ALL);
    // error_reporting(0);
    ob_start();
    // ob_end_clean();
    
    date_default_timezone_set("America/Edmonton");

    if (session_status() === PHP_SESSION_NONE) session_start();
    $url="localhost/doonneys";
    $baseURL="http://$url/";
    $db_name = "doonneys";
    $AppName="Doonneys Beauty";
    $db_user = "cyberpros";
    $db_pass = "Group2022@"; 
    
    $email_host="mail.doonneys.com";
    $email_port=465; 
    $email_user="info@doonneys.com";
    $email_password="Group2022@";
    $sender_email = "info@doonneys.com";
    $info_email = "sender@doonneys.com";

    $twilio_auth_token = "";
    $twilio_account_sid = "";
    $twilio_from = "";
    $is_prod = false;
    

