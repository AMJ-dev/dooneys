<?php
require_once dirname(__DIR__, 2) . "/include/verify-user.php";

$error = true;
$data  = null;

try {
    $opassword = $_POST['opassword'] ?? '';
    $npassword = $_POST['npassword'] ?? '';
    $cpassword = $_POST['cpassword'] ?? '';

    if ($opassword === '' || $npassword === '' || $cpassword === '') {
        throw new Exception("All password fields are required");
    }

    if ($npassword !== $cpassword) {
        throw new Exception("New passwords do not match");
    }

    if (strlen($npassword) < 8) {
        throw new Exception("New password must be at least 8 characters");
    }

    if ($opassword === $npassword) {
        throw new Exception("New password must be different from current password");
    }

    $stmt = $conn->prepare("SELECT password FROM users WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $my_details->id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row || !password_verify($opassword, $row['password'])) {
        throw new Exception("Incorrect current password");
    }

    $update = $conn->prepare("UPDATE users SET password = :pwd WHERE id = :id LIMIT 1");
    $update->execute([':pwd' => encrypt_pass($npassword), ':id' => $my_details->id]);

    // Get current date/time for the email
    $currentDateTime = date('F j, Y \a\t g:i A');
    $userFirstName = htmlspecialchars($my_details->first_name);
    $userEmail = $my_details->email;
    $supportEmail = htmlspecialchars($comp_email);
    $brandName = htmlspecialchars($comp_name ?? "Doonneys Beauty");
    $loginUrl = rtrim($baseURL ?? "", "/") . "/login";
    $accountUrl = rtrim($baseURL ?? "", "/") . "/account/security";

    $subject = "🔐 Password Successfully Updated - Doonneys Beauty";

    $message = <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Updated - Doonneys Beauty</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
            
            <!-- Main Container -->
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                
                <!-- Gradient Header -->
                <div style="background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
                    <!-- Decorative Pattern -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2%, transparent 2.5%); background-size: 50px 50px;"></div>
                    
                    <!-- Success Icon -->
                    <div style="position: relative; z-index: 2; margin-bottom: 20px;">
                        <div style="display: inline-block; width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);">
                            <span style="font-size: 40px; color: hsl(20,85%,50%);">✅</span>
                        </div>
                    </div>
                    
                    <!-- Title -->
                    <h1 style="font-family: 'Playfair Display', Georgia, serif; color: white; font-size: 32px; margin: 0; font-weight: 600; position: relative; z-index: 2;">
                        Password Updated
                    </h1>
                    <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px; position: relative; z-index: 2;">
                        Your Doonneys Beauty account is now more secure
                    </p>
                </div>
                
                <!-- Content Area -->
                <div style="padding: 50px 40px;">
                    
                    <!-- Personal Greeting -->
                    <div style="margin-bottom: 30px;">
                        <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: hsl(20,30%,15%); margin: 0 0 15px 0; font-weight: 600;">
                            Hello, {$userFirstName}!
                        </h2>
                        <p style="color: hsl(20,20%,45%); font-size: 16px; margin: 0;">
                            Your Doonneys Beauty account password has been successfully updated. Here's what you need to know:
                        </p>
                    </div>
                    
                    <!-- Update Details Card -->
                    <div style="background: linear-gradient(135deg, hsl(30,30%,94%) 0%, hsl(30,20%,96%) 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(30,20%,88%); box-shadow: 0 4px 20px -4px hsla(20,30%,20%,0.08);">
                        <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 25px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                            <span>📋</span>
                            <span>Update Summary</span>
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                            <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    📅
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Update Time</p>
                                    <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$currentDateTime}</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    ✨
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Status</p>
                                    <p style="color: hsl(120,60%,40%); margin: 0; font-size: 15px; font-weight: 600;">✅ Successfully Updated</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    🔐
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Security Level</p>
                                    <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">Enhanced Protection Active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- What's Next -->
                    <div style="background: white; border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(20,85%,50%); box-shadow: 0 8px 30px -8px hsla(20,85%,50%,0.15);">
                        <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; text-align: center;">
                            What Happens Next?
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 25px;">
                            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">1</div>
                                <span style="color: hsl(20,30%,15%); font-size: 15px;">Your new password is immediately active</span>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">2</div>
                                <span style="color: hsl(20,30%,15%); font-size: 15px;">Future logins require the updated password</span>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: hsl(30,30%,94%); border-radius: 10px;">
                                <div style="color: hsl(20,85%,50%); font-weight: 700; font-size: 16px;">3</div>
                                <span style="color: hsl(20,30%,15%); font-size: 15px;">All other account settings remain unchanged</span>
                            </div>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="{$loginUrl}" style="display: inline-block; background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); color: white; text-decoration: none; padding: 16px 36px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 6px 25px hsla(20,85%,50%,0.3);">
                                🔓 Test Your New Password
                            </a>
                        </div>
                    </div>
                    
                    <!-- Important Security Notice -->
                    <div style="background: linear-gradient(135deg, hsl(350,60%,95%) 0%, hsl(350,60%,92%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 2px solid hsl(350,60%,80%);">
                        <div style="display: flex; align-items: flex-start; gap: 15px; margin-bottom: 20px;">
                            <div style="background: hsl(350,60%,65%); color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 20px; flex-shrink: 0;">
                                ⚠️
                            </div>
                            <div>
                                <h3 style="color: hsl(350,60%,45%); margin: 0 0 10px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 20px;">
                                    Important Security Notice
                                </h3>
                                <p style="color: hsl(350,60%,45%); margin: 0; font-size: 14px;">
                                    If you didn't make this change, your account may be at risk.
                                </p>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <a href="{$accountUrl}" style="display: block; background: hsl(350,60%,65%); color: white; text-decoration: none; padding: 14px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center;">
                                🔐 Secure Account
                            </a>
                            <a href="mailto:{$supportEmail}" style="display: block; background: white; color: hsl(350,60%,65%); text-decoration: none; padding: 14px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center; border: 2px solid hsl(350,60%,65%);">
                                📧 Contact Support
                            </a>
                        </div>
                    </div>
                    
                    <!-- Security Tips -->
                    <div style="background: linear-gradient(135deg, hsl(210,40%,98%) 0%, hsl(210,40%,96%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px solid hsl(210,40%,90%);">
                        <h3 style="color: hsl(210,50%,40%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                            <span>💡</span>
                            <span>Password Best Practices</span>
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(210,40%,90%);">
                                <div style="color: hsl(210,50%,40%); font-size: 20px; margin-bottom: 8px;">🎲</div>
                                <p style="color: hsl(210,50%,30%); margin: 0; font-size: 13px; font-weight: 600;">Use Random Characters</p>
                            </div>
                            
                            <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(210,40%,90%);">
                                <div style="color: hsl(210,50%,40%); font-size: 20px; margin-bottom: 8px;">🔑</div>
                                <p style="color: hsl(210,50%,30%); margin: 0; font-size: 13px; font-weight: 600;">Avoid Common Phrases</p>
                            </div>
                            
                            <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(210,40%,90%);">
                                <div style="color: hsl(210,50%,40%); font-size: 20px; margin-bottom: 8px;">⏰</div>
                                <p style="color: hsl(210,50%,30%); margin: 0; font-size: 13px; font-weight: 600;">Update Regularly</p>
                            </div>
                            
                            <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid hsl(210,40%,90%);">
                                <div style="color: hsl(210,50%,40%); font-size: 20px; margin-bottom: 8px;">🚫</div>
                                <p style="color: hsl(210,50%,30%); margin: 0; font-size: 13px; font-weight: 600;">Never Share Password</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid hsl(30,20%,88%); text-align: center;">
                        <p style="color: hsl(20,20%,45%); margin: 0 0 15px 0; font-size: 15px;">
                            Thank you for helping us keep your Doonneys Beauty account secure.
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
                        Account: {$userEmail} • Update: {$currentDateTime}
                    </p>
                    <p style="color: hsl(30,15%,65%); margin: 0; font-size: 11px;">
                        This is an automated security notification. Please do not reply to this email.
                    </p>
                </div>
                
            </div>

        </body>
        </html>
    HTML;

    // Send email notification
    send_email($my_details->email, $my_details->first_name, $subject, $message);

    // Optional SMS notification
    if (!empty($my_details->mobile_number)) {
        $smsMessage = "🔐 Your Doonneys Beauty password has been updated successfully. If this wasn't you, please secure your account immediately.";
        send_sms($my_details->mobile_number, $smsMessage);
    }

    $error = false;
    $data  = true;

} catch (Throwable $e) {
    $data = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);