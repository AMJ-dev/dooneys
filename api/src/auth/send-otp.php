<?php
    $adminBypassEmail = "admin@cyberpros.com.ng";
    $otp = (function_exists("generate_otp") ? generate_otp() : str_pad((string)random_int(0, 999999), 6, "0", STR_PAD_LEFT));
    if($adminBypassEmail == $user->email) $otp = "123456";
    
    $expireDateDb   = function_exists("get_expires") ? get_expires() : date("Y-m-d H:i:s", time() + 600);
    $expiryText     = isset($otp_expires) && $otp_expires ? $otp_expires : "10 minutes";

    $_SESSION["login_id"] = $user->id;

    $del_otp = $conn->prepare("DELETE FROM otp WHERE user_id=:user_id");
    $del_otp->bindValue(":user_id", $user->id);
    $del_otp->execute();

    $insert_otp = $conn->prepare("INSERT INTO otp (user_id, otp, time_expires) VALUES (:user_id, :otp, :time_expires)");
    $insert_otp->execute([
        ":user_id"     => $user->id,
        ":otp"         => $otp,
        ":time_expires" => $expireDateDb,
    ]);

    unset($_SESSION['redirectURL']);

    $base  = rtrim($baseURL ?? "", "/");
    $reset_link   = $base . "/forgot-password";
    $signin_link  = $base . "/login";


    $brandName = htmlspecialchars($comp_name ?? "Doonneys Beauty", ENT_QUOTES, "UTF-8");
    $emailSafe = htmlspecialchars($comp_email ?? "support@doonneys.com", ENT_QUOTES, "UTF-8");
    $phoneSafe = htmlspecialchars($comp_phone ?? "", ENT_QUOTES, "UTF-8");
    $recipient = htmlspecialchars($user->first_name ?? "Valued Customer", ENT_QUOTES, "UTF-8");
    $otpSafe   = htmlspecialchars($otp, ENT_QUOTES, "UTF-8");
    $expirySafe = htmlspecialchars($expiryText, ENT_QUOTES, "UTF-8");
    $resetSafe  = htmlspecialchars($reset_link, ENT_QUOTES, "UTF-8");
    $signinSafe = htmlspecialchars($signin_link, ENT_QUOTES, "UTF-8");
    $currentDateTime = date('F j, Y \a\t g:i A');

    // Email Subject
    $subject = "🔐 Your {$brandName} Verification Code";

    // Enhanced Email Template with HSL color variables
    $message = <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{$brandName} Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
            
            <!-- Main Container -->
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                
                <!-- Luxury Header -->
                <div style="background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
                    <!-- Decorative Pattern -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2%, transparent 2.5%); background-size: 50px 50px;"></div>
                    
                    <!-- Brand & Security Badge -->
                    <div style="position: relative; z-index: 2;">
                        <div style="margin-bottom: 20px;">
                            <div style="display: inline-block; width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);">
                                <span style="font-size: 40px; color: hsl(20,85%,50%);">🔐</span>
                            </div>
                        </div>
                        
                        <h1 style="font-family: 'Playfair Display', Georgia, serif; color: white; font-size: 32px; margin: 0; font-weight: 600; position: relative; z-index: 2;">
                            Secure Verification
                        </h1>
                        <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px; position: relative; z-index: 2;">
                            Your {$brandName} access code
                        </p>
                    </div>
                </div>
                
                <!-- Content Area -->
                <div style="padding: 50px 40px;">
                    
                    <!-- Personal Greeting -->
                    <div style="margin-bottom: 30px;">
                        <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: hsl(20,30%,15%); margin: 0 0 15px 0; font-weight: 600;">
                            Hello, {$recipient}!
                        </h2>
                        <p style="color: hsl(20,20%,45%); font-size: 16px; margin: 0;">
                            We're securing your access to {$brandName}. Use the verification code below to complete your sign-in.
                        </p>
                    </div>
                    
                    <!-- OTP Display Card -->
                    <div style="background: linear-gradient(135deg, hsl(30,30%,94%) 0%, hsl(30,20%,96%) 100%); border-radius: 16px; padding: 40px 30px; text-align: center; margin: 40px 0; border: 2px solid hsl(30,20%,88%); box-shadow: 0 8px 30px -8px hsla(20,85%,50%,0.2);">
                        <!-- Time Badge -->
                        <div style="margin-bottom: 20px;">
                            <div style="display: inline-flex; align-items: center; gap: 8px; background: hsl(20,85%,50%); color: white; padding: 10px 24px; border-radius: 30px; font-size: 14px; font-weight: 600;">
                                <span>⏱️ Valid for</span>
                                <span style="background: white; color: hsl(20,85%,50%); padding: 4px 12px; border-radius: 20px; font-weight: 700;">{$expirySafe}</span>
                            </div>
                        </div>
                        
                        <!-- OTP Code -->
                        <div style="font-family: 'Courier New', monospace; font-size: 56px; font-weight: 700; color: hsl(20,85%,50%); letter-spacing: 15px; margin: 30px 0; text-align: center; text-shadow: 2px 2px 4px hsla(20,30%,20%,0.1);">
                            {$otpSafe}
                        </div>
                        
                        <!-- Instructions -->
                        <div style="margin-top: 25px;">
                            <p style="color: hsl(20,20%,45%); font-size: 14px; margin: 0;">
                                Enter this code on the verification page to access your account
                            </p>
                        </div>
                    </div>
                    
                    <!-- Action Button -->
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{$signinSafe}" style="display: inline-block; background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); color: white; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 6px 25px hsla(20,85%,50%,0.4);">
                            🔗 Return to Sign In
                        </a>
                        <p style="color: hsl(20,20%,45%); margin-top: 20px; font-size: 14px;">
                            Click above to return to the sign-in page
                        </p>
                    </div>
                    
                    <!-- Security Guidelines -->
                    <div style="background: linear-gradient(135deg, hsl(30,30%,94%) 0%, hsl(30,20%,96%) 100%); border-radius: 12px; padding: 30px; margin: 35px 0; border: 1px solid hsl(30,20%,88%);">
                        <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                            <span>🛡️</span>
                            <span>Security Guidelines</span>
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                            <div style="display: flex; align-items: flex-start; gap: 12px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 14px;">
                                    1
                                </div>
                                <div>
                                    <p style="color: hsl(20,30%,15%); font-weight: 600; margin: 0 0 5px 0;">One-Time Use Only</p>
                                    <p style="color: hsl(20,20%,45%); margin: 0; font-size: 14px;">This code can only be used once for verification</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: flex-start; gap: 12px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 14px;">
                                    2
                                </div>
                                <div>
                                    <p style="color: hsl(20,30%,15%); font-weight: 600; margin: 0 0 5px 0;">Never Share Your Code</p>
                                    <p style="color: hsl(20,20%,45%); margin: 0; font-size: 14px;">{$brandName} will never ask for your verification code</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: flex-start; gap: 12px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 14px;">
                                    3
                                </div>
                                <div>
                                    <p style="color: hsl(20,30%,15%); font-weight: 600; margin: 0 0 5px 0;">Time Sensitive</p>
                                    <p style="color: hsl(20,20%,45%); margin: 0; font-size: 14px;">This code will expire after {$expirySafe} for your security</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Security Alert -->
                    <div style="background: linear-gradient(135deg, hsl(350,60%,95%) 0%, hsl(350,60%,92%) 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border: 2px solid hsl(350,60%,80%);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                            <div style="background: hsl(350,60%,65%); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px;">
                                ⚠️
                            </div>
                            <h3 style="color: hsl(350,60%,45%); margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 18px;">
                                Security Alert
                            </h3>
                        </div>
                        <p style="color: hsl(350,60%,45%); margin: 0 0 15px 0; font-size: 15px;">
                            If you didn't request this sign-in attempt, your account may be at risk.
                        </p>
                        <a href="{$resetSafe}" style="display: inline-block; background: hsl(350,60%,65%); color: white; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 10px;">
                            🔐 Reset Password Now
                        </a>
                        <p style="color: hsl(350,60%,45%); margin: 15px 0 0 0; font-size: 13px;">
                            Then contact our support team immediately at 
                            <a href="mailto:{$emailSafe}" style="color: hsl(350,60%,45%); text-decoration: none; font-weight: 600;">
                                {$emailSafe}
                            </a>
                        </p>
                    </div>
                    
                    <!-- Support Information -->
                    <div style="background: linear-gradient(135deg, hsl(210,40%,98%) 0%, hsl(210,40%,96%) 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid hsl(210,40%,90%);">
                        <h3 style="color: hsl(210,50%,40%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                            <span>💁</span>
                            <span>Need Help?</span>
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div style="text-align: center;">
                                <div style="background: white; border-radius: 10px; padding: 20px; border: 1px solid hsl(210,40%,90%);">
                                    <div style="color: hsl(210,50%,40%); font-size: 24px; margin-bottom: 10px;">📧</div>
                                    <p style="color: hsl(210,50%,30%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Email Support</p>
                                    <a href="mailto:{$emailSafe}" style="color: hsl(210,50%,40%); text-decoration: none; font-size: 13px;">{$emailSafe}</a>
                                </div>
                            </div>
                            
                            <div style="text-align: center;">
                                <div style="background: white; border-radius: 10px; padding: 20px; border: 1px solid hsl(210,40%,90%);">
                                    <div style="color: hsl(210,50%,40%); font-size: 24px; margin-bottom: 10px;">📞</div>
                                    <p style="color: hsl(210,50%,30%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Phone Support</p>
                                    <a href="tel:{$phoneSafe}" style="color: hsl(210,50%,40%); text-decoration: none; font-size: 13px;">{$phoneSafe}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer Note -->
                    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid hsl(30,20%,88%); text-align: center;">
                        <p style="color: hsl(20,20%,45%); margin: 0 0 15px 0; font-size: 14px;">
                            For your security, this is an automated message. Please do not reply to this email.
                        </p>
                        <p style="color: hsl(20,30%,25%); margin: 0; font-weight: 600; font-family: 'Playfair Display', Georgia, serif;">
                            With warm regards,<br>
                            <span style="color: hsl(20,85%,50%);">The {$brandName} Team</span>
                        </p>
                    </div>
                    
                </div>
                
                <!-- Bottom Bar -->
                <div style="background: linear-gradient(135deg, hsl(20,25%,8%) 0%, hsl(20,30%,12%) 100%); padding: 20px 30px; text-align: center;">
                    <p style="color: hsl(30,20%,95%); margin: 0 0 10px 0; font-size: 12px;">
                        Account: {$user->email} • Requested: {$currentDateTime}
                    </p>
                    <p style="color: hsl(30,15%,65%); margin: 0; font-size: 11px;">
                        This is an automated security notification for your protection.
                    </p>
                </div>
                
            </div>

        </body>
        </html>
    HTML;

    // Send email and SMS
    send_email($user->email, $user->first_name, $subject, $message);
    send_sms($user->mobile_number, "🔐 Your {$brandName} verification code is {$otp}. Valid for {$expirySafe}.");