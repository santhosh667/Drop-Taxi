<?php
header('Content-Type: application/json');

// Use PHPMailer from vendor
require_once('vendor/phpmailer/phpmailer/class.phpmailer.php');
require_once('vendor/phpmailer/phpmailer/class.smtp.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect and sanitize form data
    $trip_type = filter_input(INPUT_POST, 'trip_type', FILTER_SANITIZE_STRING);
    $car_model = filter_input(INPUT_POST, 'car_model', FILTER_SANITIZE_STRING);
    $date = filter_input(INPUT_POST, 'date', FILTER_SANITIZE_STRING);
    $time = filter_input(INPUT_POST, 'time', FILTER_SANITIZE_STRING);
    $return_date = filter_input(INPUT_POST, 'return_date', FILTER_SANITIZE_STRING);
    $return_time = filter_input(INPUT_POST, 'return_time', FILTER_SANITIZE_STRING);
    $distance = filter_input(INPUT_POST, 'distance', FILTER_SANITIZE_STRING);
    $price = filter_input(INPUT_POST, 'price', FILTER_SANITIZE_STRING);
    $adults = filter_input(INPUT_POST, 'adults', FILTER_SANITIZE_NUMBER_INT);
    $children = filter_input(INPUT_POST, 'children', FILTER_SANITIZE_NUMBER_INT);
    $luggage = filter_input(INPUT_POST, 'luggage', FILTER_SANITIZE_NUMBER_INT);
    $mobile = filter_input(INPUT_POST, 'mobile', FILTER_SANITIZE_STRING);
    $alt_mobile = filter_input(INPUT_POST, 'alt_mobile', FILTER_SANITIZE_STRING);
    $title = filter_input(INPUT_POST, 'title', FILTER_SANITIZE_STRING);
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $pickup_address = filter_input(INPUT_POST, 'pickup_address', FILTER_SANITIZE_STRING);
    $drop_address = filter_input(INPUT_POST, 'drop_address', FILTER_SANITIZE_STRING);
    $remarks = filter_input(INPUT_POST, 'remarks', FILTER_SANITIZE_STRING);
    $source = filter_input(INPUT_POST, 'source', FILTER_SANITIZE_STRING);

    if (!$name || !$mobile || !$email) {
        echo json_encode(['status' => 'error', 'message' => 'Please fill all required fields.']);
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
    $mail->Subject = "New Booking Request: " . $trip_type;
    
    $body = "
    <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;'>
        <div style='background-color: #1ECB15; color: white; padding: 20px; text-align: center;'>
            <h1 style='margin: 0; font-size: 24px;'>New Booking Inquiry</h1>
            <p style='margin: 5px 0 0;'>Chennai Premium Drop Taxi Services</p>
        </div>
        
        <div style='padding: 20px;'>
            <table style='width: 100%; border-collapse: collapse;'>
                <tr>
                    <td colspan='2' style='padding-bottom: 20px;'>
                        <h2 style='color: #1ECB15; border-bottom: 2px solid #f2f2f2; padding-bottom: 5px; margin-bottom: 15px;'>Trip Details</h2>
                    </td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold; width: 40%;'>Trip Type:</td>
                    <td style='padding: 8px 0;'>$trip_type</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Vehicle:</td>
                    <td style='padding: 8px 0;'>$car_model</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Pick-up Date:</td>
                    <td style='padding: 8px 0;'>$date</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Pick-up Time:</td>
                    <td style='padding: 8px 0;'>$time</td>
                </tr>";

    if ($return_date) {
        $body .= "
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Return Date:</td>
                    <td style='padding: 8px 0;'>$return_date</td>
                </tr>";
    }
    if ($return_time) {
        $body .= "
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Return Time:</td>
                    <td style='padding: 8px 0;'>$return_time</td>
                </tr>";
    }
    if ($distance) {
        $body .= "
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Est. Distance:</td>
                    <td style='padding: 8px 0;'>$distance KM</td>
                </tr>";
    }
    if ($price) {
        $body .= "
                <tr>
                    <td style='padding: 8px 0; font-weight: bold; color: #1ECB15; font-size: 18px;'>Est. Price:</td>
                    <td style='padding: 8px 0; color: #1ECB15; font-size: 18px; font-weight: bold;'>₹$price</td>
                </tr>";
    }

    $body .= "
                <tr>
                    <td colspan='2' style='padding: 20px 0 10px;'>
                        <h2 style='color: #1ECB15; border-bottom: 2px solid #f2f2f2; padding-bottom: 5px; margin-bottom: 15px;'>Customer Details</h2>
                    </td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Name:</td>
                    <td style='padding: 8px 0;'>$title $name</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Email:</td>
                    <td style='padding: 8px 0;'>$email</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Mobile:</td>
                    <td style='padding: 8px 0;'>$mobile</td>
                </tr>";

    if ($alt_mobile) {
        $body .= "
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Alt. Mobile:</td>
                    <td style='padding: 8px 0;'>$alt_mobile</td>
                </tr>";
    }

    $body .= "
                <tr>
                    <td colspan='2' style='padding: 20px 0 10px;'>
                        <h2 style='color: #1ECB15; border-bottom: 2px solid #f2f2f2; padding-bottom: 5px; margin-bottom: 15px;'>Requirements & Locations</h2>
                    </td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Adults:</td>
                    <td style='padding: 8px 0;'>$adults</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Children:</td>
                    <td style='padding: 8px 0;'>$children</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Luggage:</td>
                    <td style='padding: 8px 0;'>$luggage</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Pick-up Address:</td>
                    <td style='padding: 8px 0;'>$pickup_address</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Drop Address:</td>
                    <td style='padding: 8px 0;'>$drop_address</td>
                </tr>";

    if ($remarks) {
        $body .= "
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Remarks:</td>
                    <td style='padding: 8px 0;'>$remarks</td>
                </tr>";
    }

    $body .= "
            </table>
        </div>
        
        <div style='background-color: #f9f9f9; padding: 15px; text-align: center; border-top: 1px solid #ddd; font-size: 12px; color: #777;'>
            <p style='margin: 0;'>This inquiry was submitted from Chennaipremiumdroptaxi.com</p>
        </div>
    </div>";

    $mail->Body = $body;

    if ($mail->send()) {
        echo json_encode(['status' => 'success', 'message' => 'Your booking request has been sent! We will contact you soon.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to send email. Error: ' . $mail->ErrorInfo]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>
