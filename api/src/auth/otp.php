<?php
use \Firebase\JWT\JWT;
require_once dirname(__DIR__, 2)."/include/set-header.php";

$jwt = false;      
if(isset($_POST["jwt"])){
    $decoded = JWT::decode($_POST["jwt"], $publicKey, array('RS256'));
    $my_details = get_user($decoded->id);
    if(empty($my_details) || $my_details==false) invalid_token();
    $_SESSION["login_id"] = $decoded->id;
}     

$verify_resp = verify_otp(); 

if($verify_resp["error"]){
    $error = $verify_resp["error"];
    $data = $verify_resp["data"];
}else{
    $error = false; 
    $data = "OTP Verified"; 
    
    if(isset($_SESSION["login_id"])) {
        $user = get_user($_SESSION["login_id"], "id, email, mobile_number, first_name, last_name, is_admin");
        $token = [
            "id" => $user->id, 
            "first_name" => $user->first_name, 
            "email" => $user->email, 
            "role" => $user->is_admin == "1" ? "admin" : "user"
        ];
        $jwt = JWT::encode($token, $privateKey, 'RS256');

        $conn->prepare("UPDATE visitors SET user_id = :user_id WHERE anon_id = :anon_id")
            ->execute([":user_id" => $user->id, ":anon_id" => $_COOKIE['anon_id']]);

        $code = ["jwt" => $jwt, "role" => $user->is_admin == "1" ? "admin" : "account"];
        $locationInfo = isset($_POST["locationInfo"]) ? $_POST["locationInfo"] : "";
        $deviceInfo = isset($_POST["deviceInfo"]) ? $_POST["deviceInfo"] : "";
        
        // Format dates for display
        $formattedDate = date('F j, Y \a\t g:i A');
        $formattedTime = date('g:i A');
        $formattedDay = date('l, F j, Y');

        $update_user = $conn->prepare("UPDATE users SET last_login = :last_login WHERE id = :id");
        $update_user->execute([":last_login" => $date_time, ":id" => $user->id]);

        $ip = getClientIp();
        $location = getLocationInfo($ip);
        
        // Get browser and device info
        $browserInfo = $_POST['browser'] ?? 'Unknown Browser';
        $platformInfo = $_POST['platform'] ?? 'Unknown Platform';
        $deviceType = $_POST['device_type'] ?? 'Unknown Device';

        $save_login = $conn->prepare("
            INSERT INTO logins (user_id, ip_address, user_agent, device_type, platform, browser, country, city, created_at) 
            VALUES (:user_id, :ip_address, :user_agent, :device_type, :platform, :browser, :country, :city, :created_at)");
        $save_login->execute([
            ":user_id" => $user->id,
            ":ip_address" => $ip,
            ":user_agent" => $_SERVER['HTTP_USER_AGENT'],
            ":device_type" => $deviceType,
            ":platform" => $platformInfo,
            ":browser" => $browserInfo,
            ":country" => $location['country'],
            ":city" => $location['city'],
            ":created_at" => $date_time
        ]);

        // Get site branding
        $brandName = htmlspecialchars($comp_name ?? "Doonneys Beauty");
        $supportEmail = htmlspecialchars($comp_email);

        // Enhanced Success Email Template
        $subject = "✨ Welcome Back to {$brandName}!";
        
        $message = <<<HTML
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Login Notification - {$brandName}</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
                
                <!-- Main Container -->
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                    
                    <!-- Welcome Header -->
                    <div style="background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2%, transparent 2.5%); background-size: 50px 50px;"></div>
                        
                        <!-- Welcome Icon -->
                        <div style="position: relative; z-index: 2; margin-bottom: 20px;">
                            <div style="display: inline-block; width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);">
                                <span style="font-size: 40px; color: hsl(20,85%,50%);">👋</span>
                            </div>
                        </div>
                        
                        <h1 style="font-family: 'Playfair Display', Georgia, serif; color: white; font-size: 32px; margin: 0; font-weight: 600; position: relative; z-index: 2;">
                            Welcome Back!
                        </h1>
                        <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px; position: relative; z-index: 2;">
                            Your {$brandName} account was just accessed
                        </p>
                    </div>
                    
                    <!-- Content Area -->
                    <div style="padding: 50px 40px;">
                        
                        <!-- Personal Greeting -->
                        <div style="margin-bottom: 30px;">
                            <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: hsl(20,30%,15%); margin: 0 0 15px 0; font-weight: 600;">
                                Hello, {$user->first_name}!
                            </h2>
                            <p style="color: hsl(20,20%,45%); font-size: 16px; margin: 0;">
                                You've successfully logged into your {$brandName} account. Here are the details of this login:
                            </p>
                        </div>
                        
                        <!-- Login Details Card -->
                        <div style="background: linear-gradient(135deg, hsl(30,30%,94%) 0%, hsl(30,20%,96%) 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(30,20%,88%); box-shadow: 0 4px 20px -4px hsla(20,30%,20%,0.08);">
                            <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 25px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                                <span>🔐</span>
                                <span>Login Details</span>
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                                <!-- Time -->
                                <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                    <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                        🕒
                                    </div>
                                    <div style="flex: 1;">
                                        <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Login Time</p>
                                        <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$formattedDate}</p>
                                    </div>
                                </div>
                                
                                <!-- Device -->
                                <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                    <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                        💻
                                    </div>
                                    <div style="flex: 1;">
                                        <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Device & Browser</p>
                                        <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$deviceType} • {$browserInfo}</p>
                                    </div>
                                </div>
                                
                                <!-- Location -->
                                <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                    <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                        📍
                                    </div>
                                    <div style="flex: 1;">
                                        <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Approximate Location</p>
                                        <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$location['city']}, {$location['country']}</p>
                                    </div>
                                </div>
                                
                                <!-- Status -->
                                <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                    <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                        ✅
                                    </div>
                                    <div style="flex: 1;">
                                        <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Login Status</p>
                                        <p style="color: hsl(120,60%,40%); margin: 0; font-size: 15px; font-weight: 600;">✅ Successful Authentication</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Quick Actions -->
                        <div style="background: white; border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(20,85%,50%); box-shadow: 0 8px 30px -8px hsla(20,85%,50%,0.15);">
                            <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; text-align: center;">
                                🚀 Ready to Explore
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 25px;">
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                    <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">🛍️</div>
                                    <span style="color: hsl(20,30%,15%); font-size: 15px;">Browse our latest beauty collections</span>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                    <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">📦</div>
                                    <span style="color: hsl(20,30%,15%); font-size: 15px;">Track your current orders</span>
                                </div>
                                
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                    <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">✨</div>
                                    <span style="color: hsl(20,30%,15%); font-size: 15px;">Discover personalized recommendations</span>
                                </div>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="{$baseURL}/shop" style="display: inline-block; background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); color: white; text-decoration: none; padding: 16px 36px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 6px 25px hsla(20,85%,50%,0.3); margin: 0 10px 10px 0;">
                                    🛍️ Shop Now
                                </a>
                                <a href="{$baseURL}/account" style="display: inline-block; background: white; color: hsl(20,85%,50%); text-decoration: none; padding: 16px 36px; border-radius: 50px; font-weight: 600; font-size: 16px; border: 2px solid hsl(20,85%,50%); margin: 0 0 10px 10px;">
                                    👤 My Account
                                </a>
                            </div>
                        </div>
                        
                        <!-- Security Alert -->
                        <div style="background: linear-gradient(135deg, hsl(350,60%,95%) 0%, hsl(350,60%,92%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 2px solid hsl(350,60%,80%);">
                            <div style="display: flex; align-items: flex-start; gap: 15px; margin-bottom: 20px;">
                                <div style="background: hsl(350,60%,65%); color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 20px; flex-shrink: 0;">
                                    ⚠️
                                </div>
                                <div>
                                    <h3 style="color: hsl(350,60%,45%); margin: 0 0 10px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 20px;">
                                        Security Notice
                                    </h3>
                                    <p style="color: hsl(350,60%,45%); margin: 0; font-size: 14px;">
                                        If this wasn't you, your account may be at risk. Take action immediately.
                                    </p>
                                </div>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <a href="{$baseURL}/account/security" style="display: block; background: hsl(350,60%,65%); color: white; text-decoration: none; padding: 14px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center;">
                                    🔐 Secure Account
                                </a>
                                <a href="mailto:{$supportEmail}" style="display: block; background: white; color: hsl(350,60%,65%); text-decoration: none; padding: 14px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center; border: 2px solid hsl(350,60%,65%);">
                                    📧 Contact Support
                                </a>
                            </div>
                        </div>
                        
                        <!-- Recent Activity -->
                        <div style="background: linear-gradient(135deg, hsl(210,40%,98%) 0%, hsl(210,40%,96%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px solid hsl(210,40%,90%);">
                            <h3 style="color: hsl(210,50%,40%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                                <span>📊</span>
                                <span>Account Security Tips</span>
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(210,40%,90%);">
                                    <div style="color: hsl(210,50%,40%); font-size: 20px; margin-bottom: 8px;">🔑</div>
                                    <p style="color: hsl(210,50%,30%); margin: 0; font-size: 13px; font-weight: 600;">Use Strong Passwords</p>
                                </div>
                                
                                <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(210,40%,90%);">
                                    <div style="color: hsl(210,50%,40%); font-size: 20px; margin-bottom: 8px;">📱</div>
                                    <p style="color: hsl(210,50%,30%); margin: 0; font-size: 13px; font-weight: 600;">Enable 2FA</p>
                                </div>
                                
                                <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(210,40%,90%);">
                                    <div style="color: hsl(210,50%,40%); font-size: 20px; margin-bottom: 8px;">📧</div>
                                    <p style="color: hsl(210,50%,30%); margin: 0; font-size: 13px; font-weight: 600;">Review Login Emails</p>
                                </div>
                                
                                <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(210,40%,90%);">
                                    <div style="color: hsl(210,50%,40%); font-size: 20px; margin-bottom: 8px;">🚫</div>
                                    <p style="color: hsl(210,50%,30%); margin: 0; font-size: 13px; font-weight: 600;">Logout Public Devices</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid hsl(30,20%,88%); text-align: center;">
                            <p style="color: hsl(20,20%,45%); margin: 0 0 15px 0; font-size: 15px;">
                                Thank you for choosing {$brandName} for your beauty journey.
                            </p>
                            <p style="color: hsl(20,30%,25%); margin: 0; font-weight: 600; font-family: 'Playfair Display', Georgia, serif;">
                                With radiant regards,<br>
                                <span style="color: hsl(20,85%,50%);">The {$brandName} Team</span>
                            </p>
                        </div>
                        
                    </div>
                    
                    <!-- Bottom Bar -->
                    <div style="background: linear-gradient(135deg, hsl(20,25%,8%) 0%, hsl(20,30%,12%) 100%); padding: 20px 30px; text-align: center;">
                        <p style="color: hsl(30,20%,95%); margin: 0 0 10px 0; font-size: 12px;">
                            Account: {$user->email} • Login: {$formattedTime} • IP: {$ip}
                        </p>
                        <p style="color: hsl(30,15%,65%); margin: 0; font-size: 11px;">
                            This is an automated security notification for your protection.
                        </p>
                    </div>
                    
                </div>

            </body>
            </html>
            HTML;

        send_email($user->email, $user->first_name, $subject, $message);

        // Get user notification preferences
        $stmt = $conn->prepare("SELECT sms_alerts FROM user_notifications WHERE user_id = :user_id");
        $stmt->execute([":user_id" => $user->id]);
        $notification = $stmt->fetch(PDO::FETCH_OBJ);

        // Optional SMS notification
        if($notification && $notification->sms_alerts == "1"){
            $smsMessage = "✅ Welcome back to {$brandName}! Your login was successful at {$formattedTime}. If this wasn't you, secure your account immediately.";
            send_sms($user->mobile_number, $smsMessage);
        }
        
        unset($_SESSION["redirectURL"]);
        unset($_SESSION["login_id"]);
    } else {
        $my_details = "";
    }
}

echo json_encode(["data" => $data, "error" => $error, "code" => $code]);