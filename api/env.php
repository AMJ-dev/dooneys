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
    $apiURL="https://api.$url/";
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
    
    define('META_ACCESS_TOKEN', 'EAATnpHfZBpRcBSMrOIPZBZClKwbBhXz5HwnC7ZADx1pX1DyAhQviSS4VtfWlPXRkqbbgkyasvBjjEDlqXyY8H1vk4lsSQTNMsXDtCgxj3eZBsnwPl1PsObdRDjlnouEGXZB42p15e4er2t6ymA1KdK4GKKCBzpjg1rZAXuOqkfU5oNAorZAH5aDnIlUPIawIvw3vtgZDZD');
    define('META_CATALOG_ID', '2462053827632897');
    define('FACEBOOK_PAGE_ID', 'YOUR_FACEBOOK_PAGE_ID');
    define('INSTAGRAM_BUSINESS_ID', 'YOUR_INSTAGRAM_BUSINESS_ID'); 
    define('WHATSAPP_PHONE_ID', '1149522334904832');
    define('WHATSAPP_ADMIN_NUMBERS', ['+2348083654765']);
    define('API_VERSION', 'v21.0');