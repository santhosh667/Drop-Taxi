$(document).ready(function () {
    $('#send_message').click(function (e) {

        //Stop form submission & check the validation
        e.preventDefault();

        // Variable declaration
        var error = false;
        var name = $('#name').val();
        var email = $('#email').val();
        var phone = $('#phone').val();
        var message = $('#message').val();

        $('#name,#email,#phone,#message').click(function () {
            $(this).removeClass("error_input");
        });

        // Form field validation
        if (name.length == 0) {
            var error = true;
            $('#name').addClass("error_input");
        } else {
            $('#name').removeClass("error_input");
        }
        if (email.length == 0 || email.indexOf('@') == '-1') {
            var error = true;
            $('#email').addClass("error_input");
        } else {
            $('#email').removeClass("error_input");
        }
        if (phone.length == 0) {
            var error = true;
            $('#phone').addClass("error_input");
        } else {
            $('#phone').removeClass("error_input");
        }
        if (message.length == 0) {
            var error = true;
            $('#message').addClass("error_input");
        } else {
            $('#message').removeClass("error_input");
        }

        // If there is no validation error, next to process the WhatsApp redirection
        if (error == false) {
            // Disable submit button
            $('#send_message').attr({ 'disabled': 'true', 'value': 'Redirecting...' });

            // Gather data
            var name = $('#name').val();
            var email = $('#email').val();
            var phone = $('#phone').val();
            var msg = $('#message').val();

            // Build WhatsApp message
            let waMessage = `📬 *New Contact Inquiry*\n`;
            waMessage += `━━━━━━━━━━━━━━━━━━\n\n`;
            waMessage += `👤 *Sender Info*\n`;
            waMessage += `• Name: ${name}\n`;
            waMessage += `• Email: ${email}\n`;
            waMessage += `• Phone: ${phone}\n\n`;
            waMessage += `💬 *Message*\n`;
            waMessage += `${msg}\n\n`;
            waMessage += `━━━━━━━━━━━━━━━━━━\n`;
            waMessage += `_Sent from ChennaipremiumDropTaxi.com_`;

            // WhatsApp phone number
            const whatsappNumber = '918681083503';
            const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(waMessage)}`;

            // Show success and open WhatsApp
            $('#contact_form').fadeOut(500, function () {
                $('#success_message').text('Redirecting to WhatsApp...').fadeIn(500);

                setTimeout(() => {
                    window.open(whatsappURL, '_blank');
                    // Reset button and form after some time (in case they come back)
                    setTimeout(() => {
                        $('#send_message').removeAttr('disabled').val('Send via WhatsApp');
                        window.location.reload();
                    }, 2000);
                }, 1000);
            });
        }
    });
});
