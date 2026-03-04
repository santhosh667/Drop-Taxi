<?php
header('Content-Type: application/json');

// Use PHPMailer from vendor
require_once('vendor/phpmailer/phpmailer/class.phpmailer.php');
require_once('vendor/phpmailer/phpmailer/class.smtp.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect and sanitize form data
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
    $msg = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

    if (!$name || !$email || !$msg) {
        echo json_encode(['status' => 'error', 'message' => 'Please fill all required fields correctly.']);
        exit;
    }

    $mail = new PHPMailer;

    // SMTP configuration
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'kuzhalicabs@gmail.com';
    $mail->Password = 'tvqx isai daak priv'; // App Password
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    $mail->setFrom('kuzhalicabs@gmail.com', 'Chennai Premium Drop Taxi Web');
    $mail->addAddress('kuzhalicabs@gmail.com'); // Recipient
    $mail->addReplyTo($email, $name);

    $mail->isHTML(true);
    $mail->Subject = "New Contact Message: " . $name;
    
    $body = "
    <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;'>
        <div style='background-color: #1ECB15; color: white; padding: 20px; text-align: center;'>
            <h1 style='margin: 0; font-size: 24px;'>New Contact Message</h1>
            <p style='margin: 5px 0 0;'>Chennai Premium Drop Taxi Services</p>
        </div>
        
        <div style='padding: 20px;'>
            <table style='width: 100%; border-collapse: collapse;'>
                <tr>
                    <td colspan='2' style='padding-bottom: 20px;'>
                        <h2 style='color: #1ECB15; border-bottom: 2px solid #f2f2f2; padding-bottom: 5px; margin-bottom: 15px;'>Contact Details</h2>
                    </td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold; width: 30%;'>Name:</td>
                    <td style='padding: 8px 0;'>$name</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Email:</td>
                    <td style='padding: 8px 0;'>$email</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Phone:</td>
                    <td style='padding: 8px 0;'>$phone</td>
                </tr>
                <tr>
                    <td colspan='2' style='padding: 20px 0 10px;'>
                        <h2 style='color: #1ECB15; border-bottom: 2px solid #f2f2f2; padding-bottom: 5px; margin-bottom: 15px;'>Message</h2>
                    </td>
                </tr>
                <tr>
                    <td colspan='2' style='padding: 10px; background-color: #f9f9f9; border-radius: 5px; font-style: italic;'>
                        " . nl2br($msg) . "
                    </td>
                </tr>
            </table>
        </div>
        
        <div style='background-color: #f2f2f2; padding: 15px; text-align: center; border-top: 1px solid #ddd; font-size: 12px; color: #777;'>
            <p style='margin: 0;'>This message was sent via the contact form on Chennaipremiumdroptaxi.com</p>
        </div>
    </div>";

    $mail->Body = $body;

    if ($mail->send()) {
        echo json_encode(['status' => 'success', 'message' => 'Your message has been sent successfully. We will get back to you soon.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to send message. Error: ' . $mail->ErrorInfo]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>
