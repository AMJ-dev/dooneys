<?php
    use Twilio\Rest\Client;

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;
    use PHPMailer\PHPMailer\SMTP;

    function encrypt_pass($pass){
        return password_hash($pass, PASSWORD_ARGON2I);
    } 

    function check_login(){
        if(!isset($_SESSION["id"])) no_permision();
    }
    function no_permision(){ 
        header($_SERVER['SERVER_PROTOCOL'] . ' 403 Forbidden');
        echo json_encode(["error"=>true, "data"=>"You don't have enough permission to access this Resources"]);
        die(); 
    }
    function humandate($timestamp){
        return date("F jS, Y", strtotime($timestamp));
    }
    function humandatetime($timestamp){
        return date("F jS, Y h:i A", strtotime($timestamp));
    }
    function get_expires(){
        global $date_time, $otp_expires;
        return date("Y-m-d H:i:s", strtotime("+$otp_expires", strtotime($date_time)));
    }

    function rm_special_char($char){
        return preg_replace("/[^a-zA-Z0-9\.]/", "_", (string)$char);
    }
    
    function gen_filename($filename){
        $file_name = rm_special_char($filename);
        $bytes = bin2hex(random_bytes(5));
        $ext = pathinfo($file_name, PATHINFO_EXTENSION);
        $suffix = substr(pathinfo($file_name, PATHINFO_FILENAME), -8);
        $name = $bytes . "_" . date("Y_m_d_H_i_s") . "_" . $suffix;
        $final = $ext ? "$name.$ext" : $name;
        return "uploads/$final";
    }
    
    function ensure_upload_dir($dir = 'uploads'){
        $abs = dirname(__DIR__, 1) . "/$dir";
        if (!is_dir($abs)) {
            if (!mkdir($abs, 0755, true) && !is_dir($abs)) {
                return [false, "Failed to create upload directory"];
            }
        }
        if (!is_writable($abs)) return [false, "Upload directory is not writable"];
        return [true, $abs];
    }
    
    function php_upload_error_msg($err){
        return match((int)$err){
            UPLOAD_ERR_INI_SIZE   => "File exceeds server limit (upload_max_filesize).",
            UPLOAD_ERR_FORM_SIZE  => "File exceeds form limit (MAX_FILE_SIZE).",
            UPLOAD_ERR_PARTIAL    => "File was only partially uploaded.",
            UPLOAD_ERR_NO_FILE    => "No file was uploaded.",
            UPLOAD_ERR_NO_TMP_DIR => "Missing a temporary folder on server.",
            UPLOAD_ERR_CANT_WRITE => "Failed to write file to disk.",
            UPLOAD_ERR_EXTENSION  => "File upload stopped by a PHP extension.",
            default               => "Unknown upload error."
        };
    }
    
    function upload_pics($file, $maxBytes = 5242880){
        global $image_accepted;
        [$okDir, $dirMsg] = ensure_upload_dir('uploads');
        if (!$okDir) return ["error"=>true, "code"=>"DIR_ERROR", "message"=>$dirMsg];
    
        if (!is_array($file) || !isset($file['error'])) {
            return ["error"=>true, "code"=>"BAD_INPUT", "message"=>"Invalid file payload."];
        }
    
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ["error"=>true, "code"=>"PHP_UPLOAD_ERR", "message"=>php_upload_error_msg($file['error'])];
        }
    
        $size = (int)($file['size'] ?? 0);
        if ($size <= 0) {
            return ["error"=>true, "code"=>"EMPTY_FILE", "message"=>"Empty file or size not set."];
        }
        if ($size > $maxBytes) {
            return ["error"=>true, "code"=>"SIZE_EXCEEDED", "message"=>"File too large. Max ".number_format($maxBytes/1048576, 2)." MB."];
        }
    
        if (!is_uploaded_file($file['tmp_name'])) {
            return ["error"=>true, "code"=>"NOT_UPLOADED", "message"=>"Possible file upload attack detected."];
        }
    
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $serverMime = $finfo ? finfo_file($finfo, $file['tmp_name']) : null;
        if ($finfo) finfo_close($finfo);
        if (!$serverMime) {
            return ["error"=>true, "code"=>"MIME_DETECT_FAIL", "message"=>"Unable to detect file type."];
        }
        if (!in_array($serverMime, $image_accepted, true)) {
            return ["error"=>true, "code"=>"MIME_NOT_ALLOWED", "message"=>"Invalid file format ($serverMime)."];
        }
    
        $target_rel = gen_filename($file['name']);
        $target_abs = dirname(__DIR__, 1) . "/" . $target_rel;
    
        if (!move_uploaded_file($file['tmp_name'], $target_abs)) {
            return ["error"=>true, "code"=>"MOVE_FAILED", "message"=>"Failed to move uploaded file."];
        }
    
        @chmod($target_abs, 0644);
    
        return [
            "error"   => false,
            "code"    => "OK",
            "message" => "Uploaded successfully.",
            "path"    => $target_rel,
            "meta"    => [
                "original_name" => $file['name'],
                "mime"          => $serverMime,
                "size"          => $size
            ]
        ];
    }

    function upload_files($file){
        [$okDir, $dirMsg] = ensure_upload_dir('uploads');
        if (!$okDir) return ["error"=>true, "code"=>"DIR_ERROR", "message"=>$dirMsg];
    
        if (!is_array($file) || !isset($file['error'])) return ["error"=>true, "code"=>"BAD_INPUT", "message"=>"Invalid file payload."];
    
        if ($file['error'] !== UPLOAD_ERR_OK) return ["error"=>true, "code"=>"PHP_UPLOAD_ERR", "message"=>php_upload_error_msg($file['error'])];
    
        $size = (int)($file['size'] ?? 0);
        if ($size <= 0) return ["error"=>true, "code"=>"EMPTY_FILE", "message"=>"Empty file or size not set."];
            
        if (!is_uploaded_file($file['tmp_name'])) return ["error"=>true, "code"=>"NOT_UPLOADED", "message"=>"Possible file upload attack detected."];
                
        $target_rel = gen_filename($file['name']);
        $target_abs = dirname(__DIR__, 1) . "/" . $target_rel;
  
        if (!move_uploaded_file($file['tmp_name'], $target_abs)) {
            return ["error"=>true, "code"=>"MOVE_FAILED", "message"=>"Failed to move uploaded file."];
        }
    
        @chmod($target_abs, 0644);
    
        return [
            "error"   => false,
            "code"    => "OK",
            "message" => "Uploaded successfully.",
            "path"    => $target_rel,
            "meta"    => [
                "original_name" => $file['name'],
                "size"          => $size
            ]
        ];
    }
    
    function verify_otp(){
        global $conn, $date_time, $error, $data;
        $otp = strtoupper($_POST["otp"]); 
        $user_id = isset($_SESSION["reset_id"])?"reset_id":"login_id";
        if(isset($_SESSION[$user_id])){
            $check_otp = $conn->prepare('SELECT time_expires FROM otp WHERE user_id=:user_id && otp=:otp');
            $check_otp->bindValue(':user_id', $_SESSION[$user_id]);
            $check_otp->bindValue(':otp', $otp);
            $check_otp->execute();
            if ($check_otp->rowCount() > 0) {
                $otp_data = $check_otp->fetch(PDO::FETCH_ASSOC);    
                if(strtotime($date_time) < strtotime($otp_data["time_expires"])){  
                    
                    $update_otp = $conn->prepare("UPDATE otp set otp=:otp WHERE user_id=:user_id");
                    $update_otp->bindValue(":otp", "");
                    $update_otp->bindValue(":user_id", $_SESSION[$user_id]);
                    if($update_otp->execute()) $error = false;
                }else $data = "OTP has expired, Please try again later";
            }else $data = "OTP Invalid";
        }
        return ["error"=>$error, "data"=>$data];
    } 

    function send_sms($to, $msg, $media = []) {
        global $twilio_auth_token, $twilio_account_sid, $twilio_from;
        if(!$twilio_account_sid || !$twilio_auth_token || !$twilio_from) return ["error"=>true, "data"=>"Invalid 'To' Phone Number."];
        try {
            $client = new Client($twilio_account_sid, $twilio_auth_token);
            return $client->messages->create($to, [
                "from" => $twilio_from,
                "body" => $msg,
                "mediaUrl" => $media
            ]);
        } catch (\Twilio\Exceptions\RestException $e) {
            error_log("SMS sending failed: " . $e->getMessage());
            return "Error: SMS sending failed. Invalid 'To' Phone Number.";
        } catch (Exception $e) {
            error_log("SMS sending failed: " . $e->getMessage());
            return "Error: SMS sending failed. Please try again later.";
        }
    }
    function send_email($to, $name, $subject, $message, $reply_to="", $reply_name="", $attachment=[]){
        global $baseURL, $AppName, $sender_email, $comp_logo, $email_host, $email_port, $email_user, $email_password;  
   
        $template = file_get_contents(__DIR__."/email/index.tpl");
        $template = str_replace("<!-- #{AppName} -->", $AppName, $template);
        $template = str_replace("<!-- #{comp_logo} -->", $comp_logo, $template);
        $template = str_replace("<!-- #{baseURL} -->", $baseURL, $template);
        $template = str_replace("<!-- #{message} -->", $message, $template);
        $template = str_replace("<!-- #{email_user} -->", $email_user, $template);
        $template = str_replace("<!-- #{date_year} -->", date("Y"), $template);
       
        try {
            $mail = new PHPMailer(true);             
            $mail->isSMTP();      
            $mail->Mailer = "smtp";                                      
            $mail->SMTPAuth=true;                                            
            $mail->SMTPKeepAlive=true;                                
            $mail->SMTPSecure = "ssl"; 
            $mail->CharSet = "UTF-8";
            $mail->Encoding = "base64";                                            
            $mail->Host       = $email_host;                    
            $mail->Port       = $email_port;                
            $mail->Username   = $email_user;                    
            $mail->Password   = $email_password; 
            $mail->Sender = $sender_email;    
            $mail->From     = $email_user;
            $mail->FromName = $AppName;                         
            $mail->Subject = $subject;
            $mail->Body    = $template;
            $mail->addAddress($to, $name);
            
            if(!empty($reply_to)) $mail->addReplyTo($reply_to, $reply_name);  
            else $mail->addReplyTo($email_user, $AppName);
            if (is_array($attachment) && isset($attachment['path']) && file_exists($attachment['path'])) {
                $name = isset($attachment['name']) ? $attachment['name'] : basename($attachment['path']);
                $mail->addAttachment($attachment['path'], $name);
            }
            $mail->isHTML(true);
            try {
                $is_send = $mail->send();
                $mail->clearAddresses();
                $mail->clearAttachments();
                $mail->clearAllRecipients();
                $mail->clearCustomHeaders();
                return $is_send;
            } catch (\Throwable $th) {
                //throw $th;
            }
        } catch (Exception $e) {
            echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
        }
    }

    function delete_file($file){
        if(!empty($file)){
            $file_location=dirname(__DIR__, 1)."/".$file;
            try {
                if (file_exists($file_location)) unlink($file_location);
            } catch (\Throwable $th) {
                //throw $th;
            }
        }
    }   
    function getClientIp(){
        $keys = [
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_REAL_IP',
            'HTTP_X_FORWARDED_FOR',
            'REMOTE_ADDR'
        ];

        foreach ($keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = explode(',', $_SERVER[$key])[0];
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        return "0.0.0.0";
    }
    function getLocationInfo(string $ip): array{
        $default = [
            "ip" => $ip,
            "country" => "Unknown",
            "region" => "Unknown",
            "city" => "Unknown",
            "timezone" => "Unknown",
            "isp" => "Unknown"
        ];

        try {
            $url = "https://ipapi.co/{$ip}/json/";
            $response = @file_get_contents($url);

            if ($response !== false) {
                $data = json_decode($response, true);

                if (is_array($data)) {
                    return [
                        "ip" => $ip,
                        "country" => $data["country_name"] ?? $default["country"],
                        "region" => $data["region"] ?? $default["region"],
                        "city" => $data["city"] ?? $default["city"],
                        "timezone" => $data["timezone"] ?? $default["timezone"],
                        "isp" => $data["org"] ?? $default["isp"]
                    ];
                }
            }
        } catch (Throwable $e) {
        }

        return $default;
    }
    function check_permission($user_id, $permission_code) {
        global $conn;
        
        $stmt = $conn->prepare("
            SELECT p.code 
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN user_roles ur ON rp.role_id = ur.role_id
            WHERE ur.user_id = :user_id AND p.code = :permission_code
        ");
        $stmt->bindValue(":user_id", $user_id, PDO::PARAM_INT);
        $stmt->bindValue(":permission_code", $permission_code, PDO::PARAM_STR);
        $stmt->execute();
        
        return $stmt->fetch() !== false;
    }
    function rand_id(){
        return rand(3000, 4500000);
    } 
    function gen_link_code(){
        return bin2hex(openssl_random_pseudo_bytes(200));
    }
    function gen_token(){
        $keyLength = rand(55, 155);
        $iterations = rand(2000, 10000);
        $data=generate_uuid()."-".uniqid();
        $generated_key=openssl_pbkdf2($data, gen_random_strings(), $keyLength, $iterations, "sha256");
        return base64_encode($generated_key);
    }
    function generate_uuid($uid="%04x%04x%04x-%04x%04x-%04x%04x-%04x%04x-%04x%04x%04x") {
        return sprintf($uid,
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xff4B ),
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xff4B ), mt_rand( 0, 0xff4B ),
            mt_rand( 0, 0x0C2f ) | 0x4000, mt_rand( 0, 0x3fff ) | 0x8000,
            mt_rand( 0, 0xff4B ), mt_rand( 0, 0x2Aff ), mt_rand( 0, 0xffD3 ), mt_rand( 0, 0xff4B )
        );   
    }
    function gen_random_strings(){
        return bin2hex(openssl_random_pseudo_bytes(rand(15, 80)));
    } 
    function generate_reset_link(){
        return bin2hex(openssl_random_pseudo_bytes(100));
    }
    function generate_otp(){
        $digits = '';
        for ($i = 0; $i < 6; $i++) $digits .= random_int(0, 9);
        return $digits;
    }
    function gen_password(){
        return bin2hex(openssl_random_pseudo_bytes(8));
    }
    function get_user($user_id, $sel="*"){
        global $conn;
        $user = "";
        $get_user = $conn->prepare("SELECT $sel FROM users WHERE id=:id");
        $get_user->execute([":id"=>$user_id]);
        if($get_user->rowCount()>0){
            $user = $get_user->fetch(PDO::FETCH_OBJ);
            unset($user->passord);
        }
        return $user;
    }
    function send_otp($user_id, $email, $full_name){ 
        global $conn, $date_time;
        $otp = generate_otp();
        
        $message = "Your verification code is $otp. Please, don\'t disclose this to anyone.";
        send_email($email, $full_name, strtoupper("email verification"), $message);

        $save_otp=$conn->prepare("UPDATE otp SET otp=:otp, date_time=:date_time WHERE user_id=:user_id");
        $save_otp->bindValue(':otp', $otp); 
        $save_otp->bindValue(':date_time', $date_time);
        $save_otp->bindValue(':user_id', $user_id); 
        return $save_otp->execute();
    }
    function hide_email($email){
        $em   = explode("@", strtolower($email));
        $name = implode('@', array_slice($em, 0, count($em) - 1));
        if(strlen($name)==1) return   '*'.'@'.end($em);
        $len  = floor(strlen($name)/2);
        return substr($name,0, $len) . str_repeat('*', $len) . "@" . end($em);
    }
    function canada_post_rate($origin, $destination, $pkg) {
        global $canadapost_api, $is_prod;
        if (!$is_prod) {
            return [
                "carrier" => "Canada Post",
                "price"   => 12.99,
                "delivery"=> "3 days"
            ];
        }

        $xml = <<<XML
            <?xml version="1.0" encoding="UTF-8"?>
            <mailing-scenario xmlns="http://www.canadapost.ca/ws/ship/rate-v4">
            <customer-number>{$canadapost_api['customer_number']}</customer-number>
            <parcel-characteristics>
                <weight>{$pkg['weight']}</weight>
                <dimensions>
                <length>{$pkg['length']}</length>
                <width>{$pkg['width']}</width>
                <height>{$pkg['height']}</height>
                </dimensions>
            </parcel-characteristics>
            <origin-postal-code>{$origin['postal_code']}</origin-postal-code>
            <destination>
                <domestic>
                <postal-code>{$destination['postal_code']}</postal-code>
                </domestic>
            </destination>
            </mailing-scenario>
        XML;

        $url = $is_prod 
            ? "https://soa-gw.canadapost.ca/rs/ship/price"
            : "https://ct.soa-gw.canadapost.ca/rs/ship/price";

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $xml,
            CURLOPT_USERPWD => $canadapost_api['username'] . ":" . $canadapost_api['password'],
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/vnd.cpc.ship.rate-v4+xml",
                "Accept: application/vnd.cpc.ship.rate-v4+xml"
            ]
        ]);

        $res = curl_exec($ch);
        curl_close($ch);
        if (!$res) return null;

        $xmlRes = simplexml_load_string($res);
        $xmlRes->registerXPathNamespace('cpc', 'http://www.canadapost.ca/ws/ship/rate-v4');

        $quotes = $xmlRes->xpath('//cpc:price-quote');
        if (!$quotes) return null;

        $best = null;
        foreach ($quotes as $q) {
            $price = (float)$q->{'price-details'}->due;
            if (!$best || $price < $best['price']) {
                $best = [
                    "carrier" => "Canada Post",
                    "price"   => $price,
                    "delivery"=> (string)$q->{'service-standard'}->{'expected-transit-time'} . " days"
                ];
            }
        }

        return $best;
    }

    function fedex_token() {
        global $fedex_client_id, $fedex_client_secret, $is_prod;

        static $cache = null;
        static $expires = 0;

        if ($cache && time() < $expires) return $cache;

        $url = $is_prod 
            ? "https://apis.fedex.com/oauth/token"
            : "https://apis-sandbox.fedex.com/oauth/token";

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query([
                "grant_type" => "client_credentials",
                "client_id" => $fedex_client_id,
                "client_secret" => $fedex_client_secret
            ]),
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/x-www-form-urlencoded"
            ]
        ]);

        $res = curl_exec($ch);
        curl_close($ch);

        $d = json_decode($res, true);
        if (!isset($d['access_token'])) return null;

        $cache = $d['access_token'];
        $expires = time() + 3300;

        return $cache;
    }

    function fedex_rate($origin, $destination, $pkg) {
        global $fedex_account_number, $is_prod;
        if (!$is_prod) {
            return [
                "carrier" => "FedEx",
                "price"   => 18.50,
                "delivery"=> "2 days"
            ];
        }

        
        $token = fedex_token();
        if (!$token) return null;

        $payload = [
            "accountNumber" => ["value" => $fedex_account_number],
            "requestedShipment" => [
                "shipper" => [
                    "address" => [
                        "postalCode" => $origin['postal_code'],
                        "countryCode" => $origin['country'] ?? "CA",
                        "stateOrProvinceCode" => $origin['province'] ?? null
                    ]
                ],
                "recipient" => [
                    "address" => [
                        "postalCode" => $destination['postal_code'],
                        "countryCode" => $destination['country'] ?? "CA",
                        "stateOrProvinceCode" => $destination['province'] ?? null
                    ]
                ],
                "pickupType" => "DROPOFF_AT_FEDEX_LOCATION",
                "requestedPackageLineItems" => [[
                    "weight" => ["units" => "KG", "value" => $pkg['weight']],
                    "dimensions" => [
                        "length" => $pkg['length'],
                        "width"  => $pkg['width'],
                        "height" => $pkg['height'],
                        "units"  => "CM"
                    ]
                ]]
            ]
        ];

        $url = $is_prod 
            ? "https://apis.fedex.com/rate/v1/rates/quotes"
            : "https://apis-sandbox.fedex.com/rate/v1/rates/quotes";

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer $token",
                "Content-Type: application/json",
                "X-locale: en_US"
            ]
        ]);

        $res = curl_exec($ch);
        curl_close($ch);

        $d = json_decode($res, true);
        if (empty($d['output']['rateReplyDetails'])) return null;

        $best = null;
        foreach ($d['output']['rateReplyDetails'] as $r) {
            $price = (float)$r['ratedShipmentDetails'][0]['totalNetCharge']['amount'];
            if (!$best || $price < $best['price']) {
                $best = [
                    "carrier" => "FedEx",
                    "price"   => $price,
                    "delivery"=> ($r['commit']['transitDays'] ?? '?') . " days"
                ];
            }
        }

        return $best;
    }
    function dhl_rate($origin, $destination, $pkg) {
        global $dhl_api, $is_prod;
        if (!$is_prod) {
            return [
                "carrier" => "DHL",
                "price"   => 15.75,
                "delivery"=> "4 days"
            ];
        }

        
        $params = [
            "originCountryCode"      => $origin['country'] ?? "CA",
            "originPostalCode"       => $origin['postal_code'],
            "originRegionCode"       => $origin['province'] ?? null,
            "destinationCountryCode" => $destination['country'] ?? "CA",
            "destinationPostalCode"  => $destination['postal_code'],
            "destinationRegionCode"  => $destination['province'] ?? null,
            "weight"                 => $pkg['weight'],
            "length"                 => $pkg['length'],
            "width"                  => $pkg['width'],
            "height"                 => $pkg['height'],
            "plannedShippingDate"    => date("Y-m-d"),
            "isCustomsDeclarable"    => false
        ];

        $url = $is_prod 
            ? "https://api.dhl.com/mydhlapi/rates"
            : "https://api-sandbox.dhl.com/mydhlapi/rates";

        // Remove nulls so query string is clean
        $queryParams = http_build_query(array_filter($params));

        $ch = curl_init($url . "?" . $queryParams);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                "DHL-API-Key: " . $dhl_api['api_key']
            ]
        ]);

        $res = curl_exec($ch);
        curl_close($ch);

        $d = json_decode($res, true);
        if (empty($d['products'])) return null;

        $best = null;
        foreach ($d['products'] as $p) {
            $price = (float)$p['totalPrice'][0]['price'];
            if (!$best || $price < $best['price']) {
                $best = [
                    "carrier" => "DHL",
                    "price"   => $price,
                    // DHL returns a date, normalize to days difference
                    "delivery"=> isset($p['deliveryCapabilities']['estimatedDeliveryDate'])
                        ? (new DateTime($p['deliveryCapabilities']['estimatedDeliveryDate']))
                            ->diff(new DateTime())->days . " days"
                        : "?"
                ];
            }
        }

        return $best;
    }
    function calculate_shipping_rates(array $items, array $address): array {
        global $conn, $site_settings;
        $origin = [
            "postal_code" => $site_settings->shipment_postal_code,
            "city"        => $site_settings->shipment_city,
            "province"    => $site_settings->shipment_province,
            "country"     => $site_settings->shipment_country ?? 'CA'
        ];

        $destination = [
            "postal_code" => $address['postal_code'],
            "province"    => $address['province'],
            "country"     => $address['country'] ?? 'CA'
        ];

        $weight = 0;
        $depth = 0;
        $width = 0;
        $height = 0;

        $stmt = $conn->prepare("
            SELECT weight, item_height, item_width, item_depth
            FROM products
            WHERE id = ?
            LIMIT 1
        ");

        foreach ($items as $item) {
            $stmt->execute([$item['id']]);
            $p = $stmt->fetch(PDO::FETCH_OBJ);
            if (!$p) continue;

            $qty = max(1, (int)$item['quantity']);
            $weight += ($p->weight ?? 0) * $qty;
            $depth  += ($p->item_depth ?? 0) * $qty;
            $width  += ($p->item_width ?? 0) * $qty;
            $height += ($p->item_height ?? 0) * $qty;
        }

        $pkg = [
            "weight" => round($weight, 2),
            "length" => round($depth, 2),
            "width"  => round($width, 2),
            "height" => round($height, 2)
        ];

        return [
            "canada_post" => canada_post_rate($origin, $destination, $pkg),
            "fedex"       => fedex_rate($origin, $destination, $pkg),
            "dhl"         => dhl_rate($origin, $destination, $pkg)
        ];
    }
    function test_canada_post(array $c) {
        if (empty($c["customer_number"]) || empty($c["username"]) || empty($c["password"])) {
            throw new Exception("Missing Canada Post credentials");
        }

        $ch = curl_init("https://soa-gw.canadapost.ca/rs/customer/" . $c["customer_number"]);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERPWD => $c["username"] . ":" . $c["password"],
            CURLOPT_HTTPHEADER => ["Accept: application/json"],
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($response === false) {
            throw new Exception("Canada Post cURL error: " . curl_error($ch));
        }

        if ($status !== 200) {
            throw new Exception("Canada Post authentication failed. Response: " . $response);
        }

        curl_close($ch);

        return [
            "status" => $status,
            "response" => json_decode($response, true)
        ];
    }

    function test_fedex(array $c) {
        if (empty($c["client_id"]) || empty($c["client_secret"]) || empty($c["account_number"])) {
            throw new Exception("Missing FedEx credentials");
        }

        $ch = curl_init("https://apis.fedex.com/oauth/token");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query([
                "grant_type" => "client_credentials",
                "client_id" => $c["client_id"],
                "client_secret" => $c["client_secret"]
            ]),
            CURLOPT_HTTPHEADER => ["Content-Type: application/x-www-form-urlencoded"],
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($response === false) {
            throw new Exception("FedEx cURL error: " . curl_error($ch));
        }

        if ($status !== 200) {
            throw new Exception("FedEx authentication failed. Response: " . $response);
        }

        curl_close($ch);

        return [
            "status" => $status,
            "response" => json_decode($response, true)
        ];
    }

    function test_dhl(array $c) {
        if (empty($c["account_number"]) || empty($c["api_key"])) {
            throw new Exception("Missing DHL credentials");
        }

        $ch = curl_init("https://api.dhl.com/mydhlapi/test");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                "DHL-API-Key: " . $c["api_key"],
                "Accept: application/json"
            ],
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($response === false) {
            throw new Exception("DHL cURL error: " . curl_error($ch));
        }

        if ($status !== 200) {
            throw new Exception("DHL authentication failed. Response: " . $response);
        }

        curl_close($ch);

        return [
            "status" => $status,
            "response" => json_decode($response, true)
        ];
    }

    function generate_tracking_number(){
        $prefix = 'DN'; // Doonneys
        $date   = date('ymdhis'); // YYMMDDHHMMSS
        $rand   = strtoupper(bin2hex(random_bytes(3))); // 6 chars

        return "{$prefix}-{$date}-{$rand}";
    }
    function format_response($carrier, $tracking, $label = null) { 
        return [ 
            "carrier" => $carrier, 
            "tracking" => $tracking, 
            "label" => $label 
        ]; 
    }
    function create_shipping_order(string $carrier, array $order){
        switch ($carrier) {
            case 'canada_post':
                return canada_post_create_order($order);

            case 'fedex':
                return fedex_create_order($order);

            case 'dhl':
                return dhl_create_order($order);

            default:
                throw new Exception("Unsupported carrier");
        } 
    }

    function canada_post_create_order(array $order){
        global $canadapost_api, $is_prod;

        if (!$is_prod) {
            return [
                "carrier"  => "Canada Post",
                "tracking" => "CPTEST" . rand(10000000,99999999),
                "label"    => null
            ];
        }

        $s = $order['shipper'];
        $r = $order['recipient'];
        $p = $order['parcel'];

        $xml = <<<XML
    <?xml version="1.0" encoding="UTF-8"?>
    <shipment xmlns="http://www.canadapost.ca/ws/shipment-v8">
        <customer-number>{$canadapost_api['customer_number']}</customer-number>

        <sender>
            <name>{$s['name']}</name>
            <phone-number>{$s['phone']}</phone-number>
            <address-details>
                <address-line-1>{$s['address']}</address-line-1>
                <city>{$s['city']}</city>
                <prov-state>{$s['state']}</prov-state>
                <postal-code>{$s['postal']}</postal-code>
                <country-code>{$s['country']}</country-code>
            </address-details>
        </sender>

        <destination>
            <domestic>
                <name>{$r['name']}</name>
                <address>
                    <address-line-1>{$r['address']}</address-line-1>
                    <city>{$r['city']}</city>
                    <prov-state>{$r['state']}</prov-state>
                    <postal-code>{$r['postal']}</postal-code>
                </address>
            </domestic>
        </destination>

        <parcel-characteristics>
            <weight>{$p['weight']}</weight>
            <dimensions>
                <length>{$p['length']}</length>
                <width>{$p['width']}</width>
                <height>{$p['height']}</height>
            </dimensions>
        </parcel-characteristics>
    </shipment>
    XML;

        $ch = curl_init("https://soa-gw.canadapost.ca/rs/shipments");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $xml,
            CURLOPT_USERPWD => $canadapost_api['username'] . ":" . $canadapost_api['password'],
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/vnd.cpc.shipment-v8+xml",
                "Accept: application/vnd.cpc.shipment-v8+xml"
            ]
        ]);

        $res = curl_exec($ch);
        curl_close($ch);

        $x = simplexml_load_string($res);

        return [
            "carrier"  => "Canada Post",
            "tracking" => (string)$x->{'tracking-pin'},
            "label"    => null // label via follow-up API
        ];
    }
    function fedex_create_order(array $order){
        global $fedex_account_number, $is_prod;

        if (!$is_prod) {
            return [
                "carrier"  => "FedEx",
                "tracking" => "FDXTEST" . rand(10000000,99999999),
                "label"    => null
            ];
        }

        $t = fedex_token();
        $s = $order['shipper'];
        $r = $order['recipient'];
        $p = $order['parcel'];

        $payload = [
            "accountNumber" => ["value" => $fedex_account_number],
            "labelResponseOptions" => "URL_ONLY",
            "requestedShipment" => [
                "shipper" => [
                    "contact" => [
                        "personName" => $s['name'],
                        "phoneNumber"=> $s['phone']
                    ],
                    "address" => [
                        "streetLines"=> [$s['address']],
                        "city" => $s['city'],
                        "stateOrProvinceCode" => $s['state'],
                        "postalCode" => $s['postal'],
                        "countryCode" => $s['country']
                    ]
                ],
                "recipient" => [
                    "contact" => [
                        "personName" => $r['name'],
                        "phoneNumber"=> $r['phone']
                    ],
                    "address" => [
                        "streetLines"=> [$r['address']],
                        "city" => $r['city'],
                        "stateOrProvinceCode" => $r['state'],
                        "postalCode" => $r['postal'],
                        "countryCode" => $r['country']
                    ]
                ],
                "packagingType" => "YOUR_PACKAGING",
                "serviceType" => "FEDEX_GROUND",
                "requestedPackageLineItems" => [[
                    "weight" => ["units"=>"KG","value"=>$p['weight']],
                    "dimensions" => [
                        "length"=>$p['length'],
                        "width"=>$p['width'],
                        "height"=>$p['height'],
                        "units"=>"CM"
                    ]
                ]]
            ]
        ];

        $ch = curl_init("https://apis.fedex.com/ship/v1/shipments");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer $t",
                "Content-Type: application/json"
            ]
        ]);

        $res = curl_exec($ch);
        curl_close($ch);

        $d = json_decode($res, true);

        return [
            "carrier"  => "FedEx",
            "tracking" => $d['output']['transactionShipments'][0]['masterTrackingNumber'],
            "label"    => $d['output']['transactionShipments'][0]['pieceResponses'][0]['packageDocuments'][0]['url']
        ];
    }

    function dhl_create_order(array $order){
        global $dhl_api, $is_prod;

        if (!$is_prod) {
            return [
                "carrier"  => "DHL",
                "tracking" => "DHLTEST" . rand(10000000,99999999),
                "label"    => null
            ];
        }

        $s = $order['shipper'];
        $r = $order['recipient'];
        $p = $order['parcel'];

        $payload = [
            "plannedShippingDateAndTime" => date('c'),
            "productCode" => "P",
            "accounts" => [[
                "typeCode" => "shipper",
                "number" => $dhl_api['account_number']
            ]],
            "customerDetails" => [
                "shipperDetails" => [
                    "postalAddress" => [
                        "addressLine1"=>$s['address'],
                        "cityName"=>$s['city'],
                        "postalCode"=>$s['postal'],
                        "countryCode"=>$s['country']
                    ],
                    "contactInformation" => [
                        "fullName"=>$s['name'],
                        "phone"=>$s['phone']
                    ]
                ],
                "receiverDetails" => [
                    "postalAddress" => [
                        "addressLine1"=>$r['address'],
                        "cityName"=>$r['city'],
                        "postalCode"=>$r['postal'],
                        "countryCode"=>$r['country']
                    ],
                    "contactInformation" => [
                        "fullName"=>$r['name'],
                        "phone"=>$r['phone']
                    ]
                ]
            ],
            "content" => [
                "packages" => [[
                    "weight"=>$p['weight'],
                    "dimensions"=>[
                        "length"=>$p['length'],
                        "width"=>$p['width'],
                        "height"=>$p['height']
                    ]
                ]]
            ]
        ];

        $ch = curl_init("https://api.dhl.com/mydhlapi/shipments");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => [
                "DHL-API-Key: ".$dhl_api['api_key'],
                "Content-Type: application/json"
            ]
        ]);

        $res = curl_exec($ch);
        curl_close($ch);

        $d = json_decode($res, true);

        return [
            "carrier"  => "DHL",
            "tracking" => $d['shipmentTrackingNumber'],
            "label"    => $d['documents'][0]['url']
        ];
    }
