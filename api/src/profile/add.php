<?php
require_once dirname(__DIR__, 2) . "/include/verify-admin.php";

$error = false;
$data  = null;

try {

    $first_name    = trim($_POST["first_name"] ?? "");
    $last_name     = trim($_POST["last_name"] ?? "");
    $email         = trim($_POST["email"] ?? "");
    $mobile_number = trim($_POST["mobile_number"] ?? "");

    if (!$first_name || !$last_name || !$email || !$mobile_number) {
        throw new Exception("All fields are required");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email address");
    }

    $check = $conn->prepare("
        SELECT id 
        FROM users 
        WHERE email = :email 
           OR mobile_number = :mobile
        LIMIT 1
    ");
    $check->bindValue(":email", $email);
    $check->bindValue(":mobile", $mobile_number);
    $check->execute();

    if ($check->rowCount() > 0) {
        throw new Exception("Email or phone number already exists");
    }

    $plain_password = bin2hex(random_bytes(4));
    $hashed_password = encrypt_pass($plain_password);

    $stmt = $conn->prepare("
        INSERT INTO users
        (first_name, last_name, email, mobile_number, password, role, status, created_at)
        VALUES
        (:first_name, :last_name, :email, :mobile, :password, 'staff', '1', NOW())
    ");

    $stmt->bindValue(":first_name", $first_name);
    $stmt->bindValue(":last_name", $last_name);
    $stmt->bindValue(":email", $email);
    $stmt->bindValue(":mobile", $mobile_number);
    $stmt->bindValue(":password", $hashed_password);
    $stmt->execute();

    $user_id = $conn->lastInsertId();

    require_once __DIR__."/complete-sign-up.php";

    if(isset($_POST["role_id"])) {
        $stmt = $conn->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (:user_id, :role_id)");
        $stmt->bindValue(":user_id", $user_id);
        $stmt->bindValue(":role_id", $_POST["role_id"]);
        $stmt->execute();
    }

    $data = ["id" => $user_id, "email" => $email];
    
    // Email content
    $subject = "✨ Welcome to " . htmlspecialchars($comp_name) . " - Your Staff Account is Ready!";
    
    // URLs
    $login_url = rtrim($baseURL, "/") . "/login";
    $dashboard_url = rtrim($baseURL, "/") . "/admin/dashboard";
    $password_reset_url = rtrim($baseURL, "/") . "/account/security";
    $help_url = rtrim($baseURL, "/") . "/help";
    $privacy_url = rtrim($baseURL, "/") . "/privacy-policy";
    $year = date("Y");
    
    $brandName = htmlspecialchars($comp_name ?? "Doonneys Beauty");
    $supportEmail = htmlspecialchars($comp_email ?? "support@doonneys.com");
    $supportPhone = htmlspecialchars($comp_phone ?? "");
    $current_date = date('F j, Y');
    $current_time = date('g:i A');

    $message = <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to {$brandName} Staff</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
            
            <!-- Main Container -->
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2%, transparent 2.5%); background-size: 50px 50px;"></div>
                    
                    <!-- Welcome Icon -->
                    <div style="position: relative; z-index: 2; margin-bottom: 20px;">
                        <div style="display: inline-block; width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);">
                            <span style="font-size: 40px; color: hsl(20,85%,50%);">🎉</span>
                        </div>
                    </div>
                    
                    <h1 style="font-family: 'Playfair Display', Georgia, serif; color: white; font-size: 32px; margin: 0; font-weight: 600; position: relative; z-index: 2;">
                        Welcome to the Team!
                    </h1>
                    <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px; position: relative; z-index: 2;">
                        Your {$brandName} Staff Account is Ready
                    </p>
                </div>
                
                <!-- Content Area -->
                <div style="padding: 50px 40px;">
                    
                    <!-- Personal Greeting -->
                    <div style="margin-bottom: 30px;">
                        <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: hsl(20,30%,15%); margin: 0 0 15px 0; font-weight: 600;">
                            Welcome, {$first_name}!
                        </h2>
                        <p style="color: hsl(20,20%,45%); font-size: 16px; margin: 0;">
                            We're thrilled to welcome you to the {$brandName} team. Your staff account has been created and is ready for use.
                        </p>
                    </div>
                    
                    <!-- Account Details -->
                    <div style="background: linear-gradient(135deg, hsl(30,30%,94%) 0%, hsl(30,20%,96%) 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(30,20%,88%); box-shadow: 0 4px 20px -4px hsla(20,30%,20%,0.08);">
                        <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 25px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                            <span>🔐</span>
                            <span>Your Login Credentials</span>
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                            <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    📧
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Email Address</p>
                                    <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px; font-family: monospace;">{$email}</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 2px solid hsl(20,85%,50%); box-shadow: 0 4px 15px hsla(20,85%,50%,0.1);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    🔑
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Temporary Password</p>
                                    <p style="color: hsl(20,85%,50%); margin: 0; font-size: 15px; font-weight: 700; font-family: monospace; letter-spacing: 1px;">{$plain_password}</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    📅
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Account Created</p>
                                    <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$current_date} at {$current_time}</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    👔
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Account Role</p>
                                    <p style="color: hsl(20,85%,50%); margin: 0; font-size: 15px; font-weight: 600;">Staff Member</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Security Notice -->
                    <div style="background: linear-gradient(135deg, hsl(350,60%,95%) 0%, hsl(350,60%,92%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 2px solid hsl(350,60%,80%);">
                        <div style="display: flex; align-items: flex-start; gap: 15px; margin-bottom: 15px;">
                            <div style="background: hsl(350,60%,65%); color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 20px; flex-shrink: 0;">
                                ⚠️
                            </div>
                            <div>
                                <h3 style="color: hsl(350,60%,45%); margin: 0 0 10px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 20px;">
                                    Important Security Notice
                                </h3>
                                <p style="color: hsl(350,60%,45%); margin: 0; font-size: 15px;">
                                    This is a <strong>temporary password</strong>. For security, change it immediately after your first login.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Getting Started -->
                    <div style="background: white; border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(20,85%,50%); box-shadow: 0 8px 30px -8px hsla(20,85%,50%,0.15);">
                        <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; text-align: center;">
                            🚀 Getting Started
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin-bottom: 25px;">
                            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: hsl(30,30%,94%); border-radius: 10px;">
                                <div style="background: hsl(20,85%,50%); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; font-size: 16px;">
                                    1
                                </div>
                                <div>
                                    <p style="color: hsl(20,30%,15%); font-weight: 600; margin: 0 0 5px 0; font-size: 15px;">Login to Your Account</p>
                                    <p style="color: hsl(20,20%,45%); margin: 0; font-size: 14px;">Use the credentials above to access your staff dashboard</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: hsl(30,30%,94%); border-radius: 10px;">
                                <div style="background: hsl(20,85%,50%); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; font-size: 16px;">
                                    2
                                </div>
                                <div>
                                    <p style="color: hsl(20,30%,15%); font-weight: 600; margin: 0 0 5px 0; font-size: 15px;">Change Your Password</p>
                                    <p style="color: hsl(20,20%,45%); margin: 0; font-size: 14px;">Navigate to Account Settings to set a new, secure password</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: hsl(30,30%,94%); border-radius: 10px;">
                                <div style="background: hsl(20,85%,50%); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; font-size: 16px;">
                                    3
                                </div>
                                <div>
                                    <p style="color: hsl(20,30%,15%); font-weight: 600; margin: 0 0 5px 0; font-size: 15px;">Complete Your Profile</p>
                                    <p style="color: hsl(20,20%,45%); margin: 0; font-size: 14px;">Add your profile photo and update your contact information</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: hsl(30,30%,94%); border-radius: 10px;">
                                <div style="background: hsl(20,85%,50%); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; font-size: 16px;">
                                    4
                                </div>
                                <div>
                                    <p style="color: hsl(20,30%,15%); font-weight: 600; margin: 0 0 5px 0; font-size: 15px;">Explore Admin Features</p>
                                    <p style="color: hsl(20,20%,45%); margin: 0; font-size: 14px;">Familiarize yourself with the staff tools and reporting features</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Need Help -->
                    <div style="background: linear-gradient(135deg, hsl(210,40%,98%) 0%, hsl(210,40%,96%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px solid hsl(210,40%,90%);">
                        <h3 style="color: hsl(210,50%,40%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                            <span>💁</span>
                            <span>Need Help?</span>
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; @media (max-width: 600px) { grid-template-columns: 1fr; }">
                            <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid hsl(210,40%,90%); text-align: center;">
                                <div style="color: hsl(210,50%,40%); font-size: 24px; margin-bottom: 10px;">📧</div>
                                <p style="color: hsl(210,50%,30%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Email Support</p>
                                <a href="mailto:{$supportEmail}" style="color: hsl(210,50%,40%); text-decoration: none; font-size: 13px;">{$supportEmail}</a>
                            </div>
                            
                            <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid hsl(210,40%,90%); text-align: center;">
                                <div style="color: hsl(210,50%,40%); font-size: 24px; margin-bottom: 10px;">🔗</div>
                                <p style="color: hsl(210,50%,30%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Help Center</p>
                                <a href="{$help_url}" style="color: hsl(210,50%,40%); text-decoration: none; font-size: 13px;">Visit Help Center</a>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{$login_url}" style="display: inline-block; background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); color: white; text-decoration: none; padding: 16px 36px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 6px 25px hsla(20,85%,50%,0.3); margin: 0 10px 10px 0;">
                            🔗 Login to Your Account
                        </a>
                        <a href="{$password_reset_url}" style="display: inline-block; background: white; color: hsl(20,85%,50%); text-decoration: none; padding: 16px 36px; border-radius: 50px; font-weight: 600; font-size: 16px; border: 2px solid hsl(20,85%,50%); margin: 0 0 10px 10px;">
                            🔐 Change Password
                        </a>
                    </div>
                    
                    <!-- Closing -->
                    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid hsl(30,20%,88%); text-align: center;">
                        <p style="color: hsl(20,20%,45%); margin: 0 0 15px 0; font-size: 15px;">
                            Once again, welcome to the {$brandName} team. We look forward to achieving great things together!
                        </p>
                        <p style="color: hsl(20,30%,25%); margin: 0; font-weight: 600; font-family: 'Playfair Display', Georgia, serif;">
                            Warm regards,<br>
                            <span style="color: hsl(20,85%,50%);">The {$brandName} Leadership Team</span>
                        </p>
                    </div>
                    
                </div>
                
                <!-- Bottom Bar -->
                <div style="background: linear-gradient(135deg, hsl(20,25%,8%) 0%, hsl(20,30%,12%) 100%); padding: 20px 30px; text-align: center;">
                    <p style="color: hsl(30,20%,95%); margin: 0 0 10px 0; font-size: 12px;">
                        Account: {$email} • Created: {$current_date} at {$current_time}
                    </p>
                    <div style="display: flex; justify-content: center; gap: 20px; margin: 10px 0; @media (max-width: 600px) { flex-direction: column; gap: 10px; }">
                        <a href="{$privacy_url}" style="color: hsl(30,15%,65%); text-decoration: none; font-size: 11px;">Privacy Policy</a>
                        <a href="{$help_url}" style="color: hsl(30,15%,65%); text-decoration: none; font-size: 11px;">Help Center</a>
                        <a href="mailto:{$supportEmail}" style="color: hsl(30,15%,65%); text-decoration: none; font-size: 11px;">Contact Support</a>
                    </div>
                    <p style="color: hsl(30,15%,65%); margin: 10px 0 0 0; font-size: 11px;">
                        &copy; {$year} {$brandName}. All rights reserved.<br>
                        This email was sent to {$email} because you were added as a staff member.
                    </p>
                </div>
                
            </div>

        </body>
        </html>
        HTML;

    // Send email notification
    send_email($email, $first_name, $subject, $message);
    
    // Optional SMS notification
    if (!empty($mobile_number)) {
        $smsMessage = "✨ Welcome to {$brandName}! Your staff account is ready. Email: {$email} | Temp Password: {$plain_password} | Login: {$login_url}";
        send_sms($mobile_number, $smsMessage);
    }

} catch (Throwable $e) {
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data"  => $data
]);