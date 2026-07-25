<?php
function sendWhatsAppMessage($to, $message) {
    $accessToken = 'EAATnpHfZBpRcBSMrOIPZBZClKwbBhXz5HwnC7ZADx1pX1DyAhQviSS4VtfWlPXRkqbbgkyasvBjjEDlqXyY8H1vk4lsSQTNMsXDtCgxj3eZBsnwPl1PsObdRDjlnouEGXZB42p15e4er2t6ymA1KdK4GKKCBzpjg1rZAXuOqkfU5oNAorZAH5aDnIlUPIawIvw3vtgZDZD';
    $phoneId = '1149522334904832';
    $apiVersion = 'v21.0';
    
    $url = "https://graph.facebook.com/{$apiVersion}/{$phoneId}/messages";
    
    $data = [
        'messaging_product' => 'whatsapp',
        'to' => $to,
        'type' => 'text',
        'text' => ['body' => $message]
    ];
    
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json'
        ],
        CURLOPT_TIMEOUT => 30
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'success' => $httpCode === 200,
        'http_code' => $httpCode,
        'response' => json_decode($response, true),
        'error' => $error
    ];
}

// Usage
$result = sendWhatsAppMessage('2348083654765', 'Test from website');
print_r($result);