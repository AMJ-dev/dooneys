<?php
    require_once dirname(__DIR__, 2)."/include/set-header.php";
    
    $brandName = htmlspecialchars($comp_name ?? "Doonneys Beauty");
    $supportEmail = htmlspecialchars($comp_email ?? "support@doonneys.com");
    $supportPhone = htmlspecialchars($comp_phone ?? "");
    
    if($_POST["where"] == "send-link"){
        $check_user = $conn->prepare("SELECT id, first_name, last_name, email, mobile_number FROM users WHERE email=:email");
        $check_user->execute([":email"=>strtolower($_POST["email"])]);
        
        if($check_user->rowCount()>0){
            $user = $check_user->fetch(PDO::FETCH_OBJ);
            
            $link1 = generate_reset_link();
            $link2 = generate_reset_link();
            $update_link = $conn->prepare("UPDATE password_reset SET link1=:link1, link2=:link2, time_expires=:time_expires WHERE user_id=:user_id");
            $update_link->bindValue(":link1", $link1);
            $update_link->bindValue(":link2", $link2);
            $update_link->bindValue(":time_expires", get_expires());
            $update_link->bindValue(":user_id", $user->id);
            
            if($update_link->execute()){
                $error = false;
                $data = "Email Sent Successfully";
                
                $reset_link = $baseURL."reset-password/$link1/$link2";
                $expiry_time = $otp_expires ?? "15 minutes";
                $current_time = date('g:i A');
                $current_date = date('F j, Y');
                
                $subject = "🔐 Password Reset Request - {$brandName}";
                
                $message = <<<HTML
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Password Reset - {$brandName}</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
                        
                        <!-- Main Container -->
                        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                            
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
                                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2%, transparent 2.5%); background-size: 50px 50px;"></div>
                                
                                <!-- Security Icon -->
                                <div style="position: relative; z-index: 2; margin-bottom: 20px;">
                                    <div style="display: inline-block; width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);">
                                        <span style="font-size: 40px; color: hsl(20,85%,50%);">🔐</span>
                                    </div>
                                </div>
                                
                                <h1 style="font-family: 'Playfair Display', Georgia, serif; color: white; font-size: 32px; margin: 0; font-weight: 600; position: relative; z-index: 2;">
                                    Password Reset
                                </h1>
                                <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px; position: relative; z-index: 2;">
                                    Secure your {$brandName} account
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
                                        We received a request to reset the password for your {$brandName} account. Click the button below to proceed.
                                    </p>
                                </div>
                                
                                <!-- Action Button -->
                                <div style="text-align: center; margin: 40px 0;">
                                    <a href="{$reset_link}" style="display: inline-block; background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); color: white; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 6px 25px hsla(20,85%,50%,0.4);">
                                        🔐 Reset Your Password
                                    </a>
                                    <p style="color: hsl(20,20%,45%); margin-top: 15px; font-size: 14px;">
                                        Click above to reset your password securely
                                    </p>
                                </div>
                                
                                <!-- Link Details -->
                                <div style="background: linear-gradient(135deg, hsl(30,30%,94%) 0%, hsl(30,20%,96%) 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid hsl(30,20%,88%);">
                                    <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 15px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                                        <span>🔗</span>
                                        <span>Alternative Access Method</span>
                                    </h3>
                                    <p style="color: hsl(20,20%,45%); margin: 0 0 15px 0; font-size: 14px;">
                                        If the button doesn't work, copy and paste this URL into your browser:
                                    </p>
                                    <div style="background: white; border: 1px solid hsl(30,20%,88%); border-radius: 8px; padding: 15px; word-break: break-all;">
                                        <a href="{$reset_link}" style="color: hsl(20,85%,50%); text-decoration: none; font-size: 14px; font-family: monospace;">{$reset_link}</a>
                                    </div>
                                </div>
                                
                                <!-- Security Information -->
                                <div style="background: linear-gradient(135deg, hsl(350,60%,95%) 0%, hsl(350,60%,92%) 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border: 2px solid hsl(350,60%,80%);">
                                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                                        <div style="background: hsl(350,60%,65%); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px;">
                                            ⏱️
                                        </div>
                                        <h3 style="color: hsl(350,60%,45%); margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 18px;">
                                            Time Sensitive Link
                                        </h3>
                                    </div>
                                    <p style="color: hsl(350,60%,45%); margin: 0 0 15px 0; font-size: 15px;">
                                        This password reset link will expire in <strong>{$expiry_time}</strong> for security reasons.
                                    </p>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                        <div style="background: white; border-radius: 8px; padding: 12px; border: 1px solid hsl(350,60%,80%); text-align: center;">
                                            <p style="color: hsl(350,60%,45%); font-weight: 600; margin: 0 0 5px 0; font-size: 12px;">Request Time</p>
                                            <p style="color: hsl(20,30%,15%); margin: 0; font-size: 13px;">{$current_time}</p>
                                        </div>
                                        <div style="background: white; border-radius: 8px; padding: 12px; border: 1px solid hsl(350,60%,80%); text-align: center;">
                                            <p style="color: hsl(350,60%,45%); font-weight: 600; margin: 0 0 5px 0; font-size: 12px;">Request Date</p>
                                            <p style="color: hsl(20,30%,15%); margin: 0; font-size: 13px;">{$current_date}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Security Alert -->
                                <div style="background: linear-gradient(135deg, hsl(40,90%,95%) 0%, hsl(40,90%,92%) 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border: 2px solid hsl(40,90%,80%);">
                                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                                        <div style="background: hsl(40,90%,60%); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px;">
                                            ⚠️
                                        </div>
                                        <h3 style="color: hsl(40,90%,40%); margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 18px;">
                                            Security Alert
                                        </h3>
                                    </div>
                                    <p style="color: hsl(40,90%,40%); margin: 0; font-size: 15px;">
                                        If you didn't request this password reset, please ignore this email or contact our support team immediately.
                                    </p>
                                    <div style="margin-top: 15px;">
                                        <a href="mailto:{$supportEmail}" style="display: inline-block; background: hsl(40,90%,60%); color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                                            📧 Contact Support
                                        </a>
                                    </div>
                                </div>
                                
                                <!-- Footer -->
                                <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid hsl(30,20%,88%); text-align: center;">
                                    <p style="color: hsl(20,20%,45%); margin: 0 0 15px 0; font-size: 15px;">
                                        For security reasons, this link will expire after one use.
                                    </p>
                                    <p style="color: hsl(20,30%,25%); margin: 0; font-weight: 600; font-family: 'Playfair Display', Georgia, serif;">
                                        Stay secure,<br>
                                        <span style="color: hsl(20,85%,50%);">The {$brandName} Security Team</span>
                                    </p>
                                </div>
                                
                            </div>
                            
                            <!-- Bottom Bar -->
                            <div style="background: linear-gradient(135deg, hsl(20,25%,8%) 0%, hsl(20,30%,12%) 100%); padding: 20px 30px; text-align: center;">
                                <p style="color: hsl(30,20%,95%); margin: 0 0 10px 0; font-size: 12px;">
                                    Account: {$user->email} • Request: {$current_date} at {$current_time}
                                </p>
                                <p style="color: hsl(30,15%,65%); margin: 0; font-size: 11px;">
                                    This is an automated security notification. Please do not reply to this email.
                                </p>
                            </div>
                            
                        </div>

                    </body>
                    </html>
                    HTML;

                send_email($user->email, $user->first_name . " " . $user->last_name, $subject, $message);
                
                // Optional SMS notification
                if($site_settings->security_notifications == "1" && !empty($user->mobile_number)){
                    $smsMessage = "🔐 {$brandName} password reset requested. If this wasn't you, contact support immediately. Link expires in {$expiry_time}.";
                    send_sms($user->mobile_number, $smsMessage);
                }
            }
        } else {
            $data = "Email doesn't exist in our system";
            $error = true;
        }
        
    } elseif($_POST["where"] == "reset-link"){     
        $check_link = $conn->prepare("SELECT user_id, time_expires FROM password_reset WHERE link1 = :link1 && link2 = :link2");
        $check_link->bindValue(":link1", $_POST["link1"]);
        $check_link->bindValue(":link2", $_POST["link2"]);
        $check_link->execute();
        
        if($check_link->rowCount()>0){
            $reset_record = $check_link->fetch(PDO::FETCH_OBJ); 
            
            if(strtotime($date_time) < strtotime($reset_record->time_expires)){
                if($_POST["password"] != $_POST["cpassword"]) {
                    $data = "Passwords do not match";
                    $error = true;
                } else {
                    // Validate password strength
                    if(strlen($_POST["password"]) < 8){
                        $data = "Password must be at least 8 characters long";
                        $error = true;
                    } else {
                        $update_password = $conn->prepare("UPDATE users SET `password`=:user_pass, updated_at=NOW() WHERE id=:user_id");
                        $update_password->bindValue(":user_pass", encrypt_pass($_POST["password"]));
                        $update_password->bindValue(":user_id", $reset_record->user_id);
                        
                        if($update_password->execute()){
                            $error = false; 
                            $data = "Your password has been reset successfully";
                            
                            // Clear reset link
                            $empty_link = $conn->prepare("UPDATE password_reset SET link1='', link2='', time_expires='' WHERE user_id=:user_id");
                            $empty_link->bindValue(":user_id", $reset_record->user_id);
                            $empty_link->execute();
                            
                            // Get user details
                            $user = get_user($reset_record->user_id, "first_name, last_name, mobile_number, email");
                            
                            // Send confirmation email
                            $confirmation_subject = "✅ Password Successfully Reset - {$brandName}";
                            $currentDateTime = date('F j, Y \a\t g:i A');
                            $loginUrl = rtrim($baseURL, "/") . "/login";
                            
                            $confirmation_message = <<<HTML
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Password Reset Confirmation - {$brandName}</title>
                                </head>
                                <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
                                    
                                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                                        
                                        <div style="background: linear-gradient(135deg, hsl(120,60%,40%) 0%, hsl(120,50%,50%) 100%); padding: 40px 30px; text-align: center;">
                                            <h1 style="font-family: 'Playfair Display', serif; color: white; font-size: 28px; margin: 0; font-weight: 600;">
                                                ✅ Password Reset Successful
                                            </h1>
                                            <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px;">
                                                Your {$brandName} account is now secured
                                            </p>
                                        </div>
                                        
                                        <div style="padding: 40px;">
                                            <div style="background: hsl(120,60%,95%); border-radius: 12px; padding: 25px; margin-bottom: 20px;">
                                                <h3 style="color: hsl(120,60%,30%); margin-top: 0; font-family: 'Playfair Display', serif; font-size: 18px;">
                                                    🔒 Security Update
                                                </h3>
                                                <p style="color: hsl(120,60%,30%); margin: 10px 0;">
                                                    Hello {$user->first_name}, your password was successfully reset on <strong>{$currentDateTime}</strong>.
                                                </p>
                                                <p style="color: hsl(120,60%,30%); margin: 10px 0;">
                                                    If this wasn't you, please contact support immediately.
                                                </p>
                                            </div>
                                            
                                            <div style="text-align: center;">
                                                <a href="{$loginUrl}" style="display: inline-block; background: linear-gradient(135deg, hsl(120,60%,40%) 0%, hsl(120,50%,50%) 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; font-size: 14px;">
                                                    🔓 Login with New Password
                                                </a>
                                            </div>
                                        </div>
                                        
                                        <div style="background: hsl(20,25%,8%); padding: 15px 30px; text-align: center;">
                                            <p style="color: hsl(30,15%,65%); margin: 0; font-size: 11px;">
                                                {$brandName} Security Notification • {$currentDateTime}
                                            </p>
                                        </div>
                                        
                                    </div>

                                </body>
                                </html>
                                HTML;

                            send_email($user->email, $user->first_name . " " . $user->last_name, $confirmation_subject, $confirmation_message);
                            
                            // Optional SMS notification
                            if($site_settings->security_notifications == "1" && !empty($user->mobile_number)){
                                $smsMessage = "✅ Your {$brandName} password has been successfully reset. Login: {$loginUrl}";
                                send_sms($user->mobile_number, $smsMessage);
                            }
                        }
                    }
                }
            } else {
                $data = "Reset link has expired. Please request a new password reset link.";
                $error = true;
            }
        } else {
            $data = "Invalid reset link. Please request a new password reset link.";
            $error = true;
        }
    }
    
    echo json_encode(["data"=>$data, "error"=>$error]);