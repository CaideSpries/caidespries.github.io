<?php
// Fetching form inputs and sanitizing
$name = htmlspecialchars($_POST['name']);
$email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
$subject = htmlspecialchars($_POST['subject']);
$message = htmlspecialchars($_POST['message']);

// Check for valid inputs
if (!$name || !$email || !$subject || !$message) {
    echo "Invalid input, please check your entries.";
    exit;
}

// Receiver email address
$to = "sprcai002@myuct.ac.za"; // Replace with your actual email address

// Email subject
$email_subject = "Contact Form Submission: " . $subject;

// Email body content
$body = "Name: $name\nEmail: $email\nSubject: $subject\n\nMessage:\n$message";

// Email headers
$headers = "From: $email\r\n";
$headers .= "Reply-To: $email\r\n";

// Sending email
if (mail($to, $email_subject, $body, $headers)) {
    echo "Message sent successfully.";
} else {
    echo "Message sending failed.";
}
?>

