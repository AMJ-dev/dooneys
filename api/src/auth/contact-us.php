<?php
require_once dirname(__DIR__, 2).'/include/set-header.php';

try {
    // Get site branding
    $brandName = htmlspecialchars($comp_name ?? "Doonneys Beauty");
    $supportEmail = htmlspecialchars($comp_email ?? "support@doonneys.com");
    $supportPhone = htmlspecialchars($comp_phone ?? "");

    $required = ["name", "email", "message"];
    foreach ($required as $r) {
        if (!isset($_POST[$r]) || trim($_POST[$r]) === "") {
            echo json_encode(["error" => true, "data" => "Please fill in all required fields"]);
            exit;
        }
    }

    $name = trim($_POST["name"]);
    $email = trim($_POST["email"]);
    $message = trim($_POST["message"]);
    
    // Optional fields
    $subject = isset($_POST["subject"]) ? trim($_POST["subject"]) : "General Inquiry";
    $phone = isset($_POST["phone"]) ? trim($_POST["phone"]) : "Not provided";

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["error" => true, "data" => "Please enter a valid email address"]);
        exit;
    }

    // Format current date and time
    $currentDate = date('F j, Y');
    $currentTime = date('g:i A');
    $year = date('Y');
    
    // Generate reference ID
    $referenceId = "CNT" . strtoupper(substr(md5($email . time()), 0, 8));
    
    // Escape HTML for security
    $nameSafe = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $emailSafe = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
    $subjectSafe = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
    $phoneSafe = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
    $messageSafe = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
    
    // URLs

    // Email to Customer (Confirmation)
    $customerSubject = "✨ Thank You for Contacting {$brandName}";
    
    $customerHtml = <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Contact Confirmation - {$brandName}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
            
            <!-- Main Container -->
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, hsl(20,85%,50%) 0%, hsl(15,70%,55%) 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2%, transparent 2.5%); background-size: 50px 50px;"></div>
                    
                    <!-- Icon and Title -->
                    <div style="position: relative; z-index: 2;">
                        <div style="display: inline-block; width: 70px; height: 70px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); margin-bottom: 20px;">
                            <span style="font-size: 32px; color: hsl(20,85%,50%);">💌</span>
                        </div>
                        <h1 style="font-family: 'Playfair Display', Georgia, serif; color: white; font-size: 32px; margin: 0; font-weight: 600;">
                            Message Received
                        </h1>
                        <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px;">
                            Thank you for reaching out to {$brandName}
                        </p>
                    </div>
                </div>
                
                <!-- Content Area -->
                <div style="padding: 50px 40px;">
                    
                    <!-- Greeting -->
                    <div style="margin-bottom: 30px;">
                        <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; color: hsl(20,30%,15%); margin: 0 0 15px 0; font-weight: 600;">
                            Hello, {$nameSafe}!
                        </h2>
                        <p style="color: hsl(20,20%,45%); font-size: 16px; margin: 0;">
                            We've received your message and our beauty experts will get back to you within 24-48 hours.
                        </p>
                    </div>
                    
                    <!-- Message Summary Card -->
                    <div style="background: linear-gradient(135deg, hsl(30,30%,94%) 0%, hsl(30,20%,96%) 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(30,20%,88%);">
                        <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 25px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                            <span>📋</span>
                            <span>Your Message Summary</span>
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    📅
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Submitted</p>
                                    <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$currentDate} at {$currentTime}</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    📧
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Contact Email</p>
                                    <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$emailSafe}</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    📞
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Phone Number</p>
                                    <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px;">{$phoneSafe}</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 12px; border: 1px solid hsl(30,20%,88%);">
                                <div style="background: hsl(20,85%,50%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 16px;">
                                    🏷️
                                </div>
                                <div style="flex: 1;">
                                    <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Reference ID</p>
                                    <p style="color: hsl(20,85%,50%); margin: 0; font-size: 15px; font-weight: 600;">#{$referenceId}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Your Message -->
                    <div style="background: white; border-radius: 16px; padding: 30px; margin: 30px 0; border: 2px solid hsl(20,85%,50%); box-shadow: 0 8px 30px -8px hsla(20,85%,50%,0.1);">
                        <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                            <span>💬</span>
                            <span>Your Message</span>
                        </h3>
                        
                        <div style="background: hsl(30,30%,94%); border-radius: 12px; padding: 25px; border-left: 4px solid hsl(20,85%,50%);">
                            <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px; line-height: 1.7;">
                                {$messageSafe}
                            </p>
                        </div>
                        
                        <div style="margin-top: 25px; padding: 15px; background: linear-gradient(135deg, hsl(210,40%,98%) 0%, hsl(210,40%,96%) 100%); border-radius: 10px;">
                            <p style="color: hsl(210,50%,40%); margin: 0; font-size: 14px; font-weight: 600;">
                                📝 Subject: {$subjectSafe}
                            </p>
                        </div>
                    </div>
                    
                    <!-- Next Steps -->
                    <div style="background: linear-gradient(135deg, hsl(120,40%,97%) 0%, hsl(120,40%,94%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 2px solid hsl(120,40%,80%);">
                        <h3 style="color: hsl(120,50%,35%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                            <span>⏳</span>
                            <span>What Happens Next?</span>
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                            <div style="display: flex; align-items: flex-start; gap: 12px; padding: 15px; background: white; border-radius: 10px; border: 1px solid hsl(120,40%,85%);">
                                <div style="background: hsl(120,50%,35%); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 14px;">
                                    1
                                </div>
                                <div>
                                    <p style="color: hsl(120,50%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Review by Experts</p>
                                    <p style="color: hsl(120,50%,35%); margin: 0; font-size: 13px;">Our beauty specialists will review your inquiry</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: flex-start; gap: 12px; padding: 15px; background: white; border-radius: 10px; border: 1px solid hsl(120,40%,85%);">
                                <div style="background: hsl(120,50%,35%); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 14px;">
                                    2
                                </div>
                                <div>
                                    <p style="color: hsl(120,50%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Personalized Response</p>
                                    <p style="color: hsl(120,50%,35%); margin: 0; font-size: 13px;">You'll receive a detailed, personalized response</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: flex-start; gap: 12px; padding: 15px; background: white; border-radius: 10px; border: 1px solid hsl(120,40%,85%);">
                                <div style="background: hsl(120,50%,35%); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; font-size: 14px;">
                                    3
                                </div>
                                <div>
                                    <p style="color: hsl(120,50%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">Follow-up Assistance</p>
                                    <p style="color: hsl(120,50%,35%); margin: 0; font-size: 13px;">We'll ensure all your questions are fully answered</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Urgent Notice -->
                    <div style="background: linear-gradient(135deg, hsl(350,60%,95%) 0%, hsl(350,60%,92%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 2px solid hsl(350,60%,80%);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                            <div style="color: hsl(350,60%,65%); font-size: 24px;">⚡</div>
                            <h3 style="color: hsl(350,60%,45%); margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 18px;">
                                Need Urgent Assistance?
                            </h3>
                        </div>
                        <p style="color: hsl(350,60%,45%); margin: 0 0 15px 0; font-size: 14px;">
                            For order-related emergencies or immediate support:
                        </p>
                        <div style="text-align: center;">
                            <a href="tel:{$supportPhone}" style="display: inline-block; background: hsl(350,60%,65%); color: white; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-right: 10px;">
                                📞 Call Now
                            </a>
                            <a href="mailto:{$supportEmail}" style="display: inline-block; background: white; color: hsl(350,60%,65%); text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: 600; font-size: 14px; border: 2px solid hsl(350,60%,65%);">
                                📧 Email Support
                            </a>
                        </div>
                    </div>
                    
        
                    
                    <!-- Footer -->
                    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid hsl(30,20%,88%); text-align: center;">
                        <p style="color: hsl(20,20%,45%); margin: 0 0 15px 0; font-size: 15px;">
                            Thank you for choosing {$brandName}. We appreciate the opportunity to assist you.
                        </p>
                        <p style="color: hsl(20,30%,25%); margin: 0; font-weight: 600; font-family: 'Playfair Display', Georgia, serif;">
                            Warmly,<br>
                            <span style="color: hsl(20,85%,50%);">The {$brandName} Team</span>
                        </p>
                    </div>
                    
                </div>
                
                <!-- Bottom Bar -->
                <div style="background: linear-gradient(135deg, hsl(20,25%,8%) 0%, hsl(20,30%,12%) 100%); padding: 20px 30px; text-align: center;">
                    <p style="color: hsl(30,20%,95%); margin: 0 0 10px 0; font-size: 12px;">
                        Reference: #{$referenceId} • Submitted: {$currentDate} at {$currentTime}
                    </p>
                    <div style="display: flex; justify-content: center; gap: 20px; margin: 10px 0; @media (max-width: 600px) { flex-direction: column; gap: 10px; }">
                        <a href="mailto:{$supportEmail}" style="color: hsl(30,15%,65%); text-decoration: none; font-size: 11px;">Contact Support</a>
                    </div>
                    <p style="color: hsl(30,15%,65%); margin: 10px 0 0 0; font-size: 11px;">
                        &copy; {$year} {$brandName}. All rights reserved.<br>
                        This is an automated confirmation. Please do not reply to this email.
                    </p>
                </div>
                
            </div>

        </body>
        </html>
        HTML;

    // Email to Admin (Notification)
    $adminSubject = "📨 New Contact Message from {$nameSafe} - #{$referenceId}";
    
    $adminHtml = <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Message - {$brandName}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: hsl(30,20%,98%); color: hsl(20,30%,15%); line-height: 1.6;">
            
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px hsla(20,30%,20%,0.15);">
                
                <!-- Admin Header -->
                <div style="background: linear-gradient(135deg, hsl(210,50%,40%) 0%, hsl(210,60%,50%) 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="font-family: 'Playfair Display', Georgia, serif; color: white; font-size: 28px; margin: 0; font-weight: 600;">
                        New Contact Message
                    </h1>
                    <p style="font-size: 16px; color: rgba(255, 255, 255, 0.95); margin-top: 10px;">
                        Action Required - Customer Inquiry
                    </p>
                </div>
                
                <!-- Admin Content -->
                <div style="padding: 40px 30px;">
                    
                    <!-- Priority Alert -->
                    <div style="background: linear-gradient(135deg, hsl(45,90%,95%) 0%, hsl(45,90%,92%) 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 2px solid hsl(45,90%,70%);">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <div style="color: hsl(45,90%,50%); font-size: 20px;">🚨</div>
                            <h3 style="color: hsl(45,90%,30%); margin: 0; font-size: 16px; font-weight: 600;">
                                New Customer Inquiry
                            </h3>
                        </div>
                        <p style="color: hsl(45,90%,30%); margin: 0; font-size: 14px;">
                            Please respond within 24-48 hours • Reference: #{$referenceId}
                        </p>
                    </div>
                    
                    <!-- Customer Details -->
                    <div style="margin-bottom: 30px;">
                        <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: hsl(20,30%,15%); margin: 0 0 20px 0; font-weight: 600;">
                            Customer Information
                        </h2>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                            <div style="background: hsl(30,30%,94%); border-radius: 10px; padding: 15px;">
                                <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 13px;">Customer Name</p>
                                <p style="color: hsl(20,30%,15%); margin: 0; font-size: 16px; font-weight: 600;">{$nameSafe}</p>
                            </div>
                            
                            <div style="background: hsl(30,30%,94%); border-radius: 10px; padding: 15px;">
                                <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 13px;">Contact Email</p>
                                <p style="color: hsl(20,30%,15%); margin: 0; font-size: 16px;">
                                    <a href="mailto:{$emailSafe}" style="color: hsl(20,85%,50%); text-decoration: none;">
                                        {$emailSafe}
                                    </a>
                                </p>
                            </div>
                            
                            <div style="background: hsl(30,30%,94%); border-radius: 10px; padding: 15px;">
                                <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 13px;">Phone Number</p>
                                <p style="color: hsl(20,30%,15%); margin: 0; font-size: 16px;">{$phoneSafe}</p>
                            </div>
                            
                            <div style="background: hsl(30,30%,94%); border-radius: 10px; padding: 15px;">
                                <p style="color: hsl(20,30%,25%); font-weight: 600; margin: 0 0 5px 0; font-size: 13px;">Submitted</p>
                                <p style="color: hsl(20,30%,15%); margin: 0; font-size: 16px;">{$currentDate} {$currentTime}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Message Content -->
                    <div style="margin-bottom: 30px;">
                        <h3 style="color: hsl(20,30%,25%); margin-top: 0; margin-bottom: 15px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px;">
                            Message Content
                        </h3>
                        
                        <div style="background: hsl(30,30%,94%); border-radius: 12px; padding: 25px; border-left: 4px solid hsl(210,50%,40%);">
                            <p style="color: hsl(20,30%,15%); margin: 0; font-size: 15px; line-height: 1.7;">
                                {$messageSafe}
                            </p>
                        </div>
                        
                        <div style="margin-top: 15px; padding: 12px; background: hsl(210,50%,40%); border-radius: 8px; text-align: center;">
                            <p style="color: white; margin: 0; font-size: 14px; font-weight: 600;">
                                Subject: {$subjectSafe}
                            </p>
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div style="background: linear-gradient(135deg, hsl(210,40%,98%) 0%, hsl(210,40%,96%) 100%); border-radius: 16px; padding: 25px; margin: 30px 0;">
                        <h3 style="color: hsl(210,50%,40%); margin-top: 0; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px;">
                            Quick Actions
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <a href="mailto:{$emailSafe}" style="display: block; background: hsl(210,50%,40%); color: white; text-decoration: none; padding: 15px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center;">
                                📧 Reply via Email
                            </a>
                            
                            <a href="tel:{$phoneSafe}" style="display: block; background: hsl(120,50%,35%); color: white; text-decoration: none; padding: 15px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center;">
                                📞 Call Customer
                            </a>
                        </div>
                    </div>
                    
                    <!-- Reference -->
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid hsl(30,20%,88%);">
                        <p style="color: hsl(20,20%,45%); margin: 0; font-size: 13px;">
                            Reference ID: #{$referenceId} • Sent: {$currentTime}
                        </p>
                    </div>
                    
                </div>
                
                <!-- Bottom Bar -->
                <div style="background: hsl(20,25%,8%); padding: 15px 30px; text-align: center;">
                    <p style="color: hsl(30,15%,65%); margin: 0; font-size: 11px;">
                        {$brandName} Admin Notification • {$currentDate}
                    </p>
                </div>
                
            </div>

        </body>
        </html>
        HTML;

    // Send confirmation email to customer
    send_email($email, $name, $customerSubject, $customerHtml);
    
    send_email($supportEmail, "Support Team", $adminSubject, $adminHtml);
    
    echo json_encode(["error" => false, "data" => "Thank you for your message! We'll get back to you within 24-48 hours."]);
    
} catch (Exception $e) {
    echo json_encode(["error" => true, "data" => "We encountered an error. Please try again or contact us directly."]);
}

