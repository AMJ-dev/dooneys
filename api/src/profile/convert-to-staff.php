<?php
require_once dirname(__DIR__, 2) . "/include/verify-user.php";

$error = false;
$data  = null;

try {
    $conn->beginTransaction();    
    if (!isset($_POST["id"])) throw new Exception("Invalid request");

    $user = get_user($_POST["id"], "email, first_name, last_name, mobile_number");

    if (!$user) throw new Exception("User not found");
    
    // Update user role to staff
    $stmt = $conn->prepare("UPDATE users SET `role` = 'staff', updated_at = NOW() WHERE id = :uid LIMIT 1");
    $stmt->bindValue(':uid', $_POST["id"], PDO::PARAM_INT);
    $stmt->execute();

    $conn->commit();

    $data = true;
    $error = false;

    // Email content
    $subject = "✨ Congratulations! You're Now {$comp_name} Staff";
    
    $current_date = date('F j, Y');
    $current_time = date('g:i A');
    $admin_url = rtrim($baseURL, "/") . "/admin";
    $dashboard_url = rtrim($baseURL, "/") . "/admin/dashboard";
    $help_url = rtrim($baseURL, "/") . "/help";
    $privacy_url = rtrim($baseURL, "/") . "/privacy-policy";
    $terms_url = rtrim($baseURL, "/") . "/terms";
    $year = date('Y');
    
    $brandName = htmlspecialchars($comp_name ?? "Doonneys Beauty");
    $supportEmail = htmlspecialchars($comp_email ?? "support@doonneys.com");
    $supportPhone = htmlspecialchars($comp_phone ?? "");
    $compLogo = $comp_logo ?? "";

    $message = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Upgrade - {$brandName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
    
    <!-- Main Container -->
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2%, transparent 2.5%); background-size: 50px 50px;"></div>
            
            <!-- Upgrade Icon -->
            <div style="position: relative; z-index: 2; margin-bottom: 20px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);">
                    <span style="font-size: 40px; color: hsl(20,85%,50%);">✨</span>
                </div>
            </div>
            
            <h1 style="font-family: 'Playfair Display', Georgia, serif; color: white; font-size: 32px; margin: 0; font-weight: 600; position: relative; z-index: 2;">
                Welcome to the Team!
            </h1>
            <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px; position: relative; z-index: 2;">
                Your account has been upgraded to {$brandName} Staff
            </p>
        </div>
        
        <!-- Content Area -->
        <div style="padding: 50px 40px;">
            
            <!-- Personal Greeting -->
            <div style="margin-bottom: 30px;">
                <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: hsl(20,30%,15%); margin: 0 0 15px 0; font-weight: 600;">
                    Congratulations, {$user->first_name}!
                </h2>
                <p style="color: hsl(20,20%,45%); font-size: 16px; margin: 0;">
                    We're excited to welcome you as a valued member of the {$brandName} team. Your account has been upgraded with administrative access.
                </p>
            </div>
            
            <!-- Upgrade Notification -->
            <div style="background: linear-gradient(135deg, hsl(210,50%,95%) 0%, hsl(210,50%,92%) 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(210,50%,80%);">
                <div style="display: flex; align-items: flex-start; gap: 15px; margin-bottom: 20px;">
                    <div style="background: hsl(210,50%,40%); color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 20px; flex-shrink: 0;">
                        🚀
                    </div>
                    <div>
                        <h3 style="color: hsl(210,50%,40%); margin: 0 0 10px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 20px;">
                            Account Upgrade Complete
                        </h3>
                        <p style="color: hsl(210,50%,30%); margin: 0; font-size: 15px;">
                            Your account has been upgraded from <strong>Customer</strong> to <strong>Staff</strong> with full administrative privileges.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Role Comparison -->
            <div style="background: linear-gradient(135deg, hsl(30,30%,94%) 0%, hsl(30,20%,96%) 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(30,20%,88%); box-shadow: 0 4px 20px -4px hsla(20,30%,20%,0.08);">
                <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 25px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                    <span>📊</span>
                    <span>Your New Access Level</span>
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; @media (max-width: 600px) { grid-template-columns: 1fr; }">
                    <!-- Previous Access -->
                    <div style="background: white; border-radius: 12px; padding: 25px; border: 2px solid hsl(30,20%,88%);">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div style="background: hsl(30,20%,88%); color: hsl(20,30%,25%); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 24px;">
                                👤
                            </div>
                            <h4 style="color: hsl(20,30%,25%); margin: 0; font-size: 16px;">Previous Role</h4>
                            <p style="color: hsl(20,20%,45%); font-weight: 600; margin: 5px 0 0 0;">Customer</p>
                        </div>
                        <ul style="list-style: none; padding-left: 0; margin: 0; font-size: 14px; color: hsl(20,20%,45%);">
                            <li style="padding: 8px 0; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: hsl(20,85%,50%);">✓</span>
                                Browse & shop products
                            </li>
                            <li style="padding: 8px 0; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: hsl(20,85%,50%);">✓</span>
                                Place orders & track shipments
                            </li>
                            <li style="padding: 8px 0; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: hsl(20,85%,50%);">✓</span>
                                Manage personal account
                            </li>
                        </ul>
                    </div>
                    
                    <!-- New Access -->
                    <div style="background: white; border-radius: 12px; padding: 25px; border: 2px solid hsl(20,85%,50%); position: relative; box-shadow: 0 4px 15px hsla(20,85%,50%,0.1);">
                        <div style="position: absolute; top: -10px; right: -10px; background: hsl(20,85%,50%); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                            NEW
                        </div>
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div style="background: hsl(20,85%,50%); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 24px;">
                                👔
                            </div>
                            <h4 style="color: hsl(20,30%,25%); margin: 0; font-size: 16px;">New Role</h4>
                            <p style="color: hsl(20,85%,50%); font-weight: 600; margin: 5px 0 0 0;">Staff Member</p>
                        </div>
                        <ul style="list-style: none; padding-left: 0; margin: 0; font-size: 14px; color: hsl(20,30%,25%);">
                            <li style="padding: 8px 0; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: hsl(20,85%,50%);">✨</span>
                                Access admin dashboard
                            </li>
                            <li style="padding: 8px 0; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: hsl(20,85%,50%);">✨</span>
                                Manage orders & inventory
                            </li>
                            <li style="padding: 8px 0; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: hsl(20,85%,50%);">✨</span>
                                View store analytics
                            </li>
                            <li style="padding: 8px 0; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: hsl(20,85%,50%);">✨</span>
                                Manage store content
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- New Capabilities -->
            <div style="background: white; border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(20,85%,50%); box-shadow: 0 8px 30px -8px hsla(20,85%,50%,0.15);">
                <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; text-align: center;">
                    🚀 Your New Administrative Powers
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin-bottom: 25px;">
                    <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: hsl(30,30%,94%); border-radius: 10px;">
                        <div style="background: hsl(20,85%,50%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 18px;">
                            📦
                        </div>
                        <div>
                            <p style="color: hsl(20,30%,15%); font-weight: 600; margin: 0 0 5px 0; font-size: 15px;">Store Management</p>
                            <p style="color: hsl(20,20%,45%); margin: 0; font-size: 14px;">Manage product listings, inventory, and store settings</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: hsl(30,30%,94%); border-radius: 10px;">
                        <div style="background: hsl(20,85%,50%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 18px;">
                            📊
                        </div>
                        <div>
                            <p style="color: hsl(20,30%,15%); font-weight: 600; margin: 0 0 5px 0; font-size: 15px;">Order Processing</p>
                            <p style="color: hsl(20,20%,45%); margin: 0; font-size: 14px;">Process customer orders, update statuses, and manage shipments</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: hsl(30,30%,94%); border-radius: 10px;">
                        <div style="background: hsl(20,85%,50%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 18px;">
                            👥
                        </div>
                        <div>
                            <p style="color: hsl(20,30%,15%); font-weight: 600; margin: 0 0 5px 0; font-size: 15px;">Customer Insights</p>
                            <p style="color: hsl(20,20%,45%); margin: 0; font-size: 14px;">Access customer data, purchase history, and store analytics</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Getting Started -->
            <div style="background: linear-gradient(135deg, hsl(120,40%,95%) 0%, hsl(120,40%,92%) 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(120,40%,80%);">
                <h3 style="color: hsl(120,40%,30%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; text-align: center;">
                    🎯 Getting Started Guide
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 12px; border: 1px solid hsl(120,40%,80%);">
                        <div style="background: hsl(20,85%,50%); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; font-size: 16px;">
                            1
                        </div>
                        <div>
                            <p style="color: hsl(20,30%,15%); font-weight: 600; margin: 0 0 5px 0; font-size: 15px;">Access Admin Panel</p>
                            <p style="color: hsl(20,20%,45%); margin: 0; font-size: 14px;">Log in to your account to access the store administration dashboard</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 12px; border: 1px solid hsl(120,40%,80%);">
                        <div style="background: hsl(20,85%,50%); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; font-size: 16px;">
                            2
                        </div>
                        <div>
                            <p style="color: hsl(20,30%,15%); font-weight: 600; margin: 0 0 5px 0; font-size: 15px;">Familiarize Yourself</p>
                            <p style="color: hsl(20,20%,45%); margin: 0; font-size: 14px;">Explore the admin interface and review available features</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 12px; border: 1px solid hsl(120,40%,80%);">
                        <div style="background: hsl(20,85%,50%); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; font-size: 16px;">
                            3
                        </div>
                        <div>
                            <p style="color: hsl(20,30%,15%); font-weight: 600; margin: 0 0 5px 0; font-size: 15px;">Contact Support</p>
                            <p style="color: hsl(20,20%,45%); margin: 0; font-size: 14px;">Reach out if you need assistance with your new administrative access</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Need Help -->
            <div style="background: linear-gradient(135deg, hsl(210,40%,98%) 0%, hsl(210,40%,96%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px solid hsl(210,40%,90%);">
                <h3 style="color: hsl(210,50%,40%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                    <span>💁</span>
                    <span>Need Assistance?</span>
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                    <a href="mailto:{$supportEmail}" style="display: block; background: hsl(210,50%,40%); color: white; text-decoration: none; padding: 14px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center;">
                        📧 Contact Support Team
                    </a>
                    <p style="color: hsl(20,20%,45%); margin: 10px 0; font-size: 14px; text-align: center;">
                        Our team is available to help you get started with your new administrative tools.
                    </p>
                </div>
            </div>
            
            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{$dashboard_url}" style="display: inline-block; background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); color: white; text-decoration: none; padding: 16px 36px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 6px 25px hsla(20,85%,50%,0.3);">
                    🚀 Access Admin Dashboard
                </a>
            </div>
            
            <!-- Closing -->
            <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid hsl(30,20%,88%); text-align: center;">
                <p style="color: hsl(20,20%,45%); margin: 0 0 15px 0; font-size: 15px;">
                    Thank you for being part of the {$brandName} team. We're excited to work with you!
                </p>
                <p style="color: hsl(20,30%,25%); margin: 0; font-weight: 600; font-family: 'Playfair Display', Georgia, serif;">
                    Welcome aboard,<br>
                    <span style="color: hsl(20,85%,50%);">The {$brandName} Leadership Team</span>
                </p>
            </div>
            
        </div>
        
        <!-- Bottom Bar -->
        <div style="background: linear-gradient(135deg, hsl(20,25%,8%) 0%, hsl(20,30%,12%) 100%); padding: 20px 30px; text-align: center;">
            <p style="color: hsl(30,20%,95%); margin: 0 0 10px 0; font-size: 12px;">
                Account: {$user->email} • Upgraded: {$current_date} at {$current_time}
            </p>
            <div style="display: flex; justify-content: center; gap: 20px; margin: 10px 0; @media (max-width: 600px) { flex-direction: column; gap: 10px; }">
                <a href="{$privacy_url}" style="color: hsl(30,15%,65%); text-decoration: none; font-size: 11px;">Privacy Policy</a>
                <a href="{$help_url}" style="color: hsl(30,15%,65%); text-decoration: none; font-size: 11px;">Help Center</a>
                <a href="{$terms_url}" style="color: hsl(30,15%,65%); text-decoration: none; font-size: 11px;">Terms of Service</a>
                <a href="mailto:{$supportEmail}" style="color: hsl(30,15%,65%); text-decoration: none; font-size: 11px;">Contact Us</a>
            </div>
            <p style="color: hsl(30,15%,65%); margin: 10px 0 0 0; font-size: 11px;">
                &copy; {$year} {$brandName}. All rights reserved.<br>
                This is an automated notification of account access upgrade.
            </p>
        </div>
        
    </div>

</body>
</html>
HTML;

    // Send email notification
    send_email($user->email, $user->first_name . " " . $user->last_name, $subject, $message);
    
    // Optional SMS notification
    if (!empty($user->mobile_number)) {
        $smsMessage = "✨ Welcome to the {$brandName} team! Your account has been upgraded to Staff. Access admin panel: {$dashboard_url}";
        send_sms($user->mobile_number, $smsMessage);
    }

} catch (Throwable $e) {
    $conn->rollBack();
    $error = true;
    $data  = $e->getMessage();
}

echo json_encode([
    "error" => $error,
    "data" => $data
]);