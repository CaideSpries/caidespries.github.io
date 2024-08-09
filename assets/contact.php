<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="2487.6">
  <style type="text/css">
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica}
    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica; min-height: 14.0px}
  </style>
</head>
<body>
<p class="p1">&lt;?php</p>
<p class="p1">if ($_SERVER["REQUEST_METHOD"] == "POST") {</p>
<p class="p1"><span class="Apple-converted-space">    </span>$name = htmlspecialchars($_POST['name']);</p>
<p class="p1"><span class="Apple-converted-space">    </span>$email = htmlspecialchars($_POST['email']);</p>
<p class="p1"><span class="Apple-converted-space">    </span>$subject = htmlspecialchars($_POST['subject']);</p>
<p class="p1"><span class="Apple-converted-space">    </span>$message = htmlspecialchars($_POST['message']);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>$to = "your-email@example.com"; // Replace with your email address</p>
<p class="p1"><span class="Apple-converted-space">    </span>$headers = "From: " . $email . "\r\n" .</p>
<p class="p1"><span class="Apple-converted-space">               </span>"Reply-To: " . $email . "\r\n" .</p>
<p class="p1"><span class="Apple-converted-space">               </span>"X-Mailer: PHP/" . phpversion();</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>$fullMessage = "Name: " . $name . "\n" .</p>
<p class="p1"><span class="Apple-converted-space">                   </span>"Email: " . $email . "\n" .</p>
<p class="p1"><span class="Apple-converted-space">                   </span>"Subject: " . $subject . "\n" .</p>
<p class="p1"><span class="Apple-converted-space">                   </span>"Message: " . $message;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>if (mail($to, $subject, $fullMessage, $headers)) {</p>
<p class="p1"><span class="Apple-converted-space">        </span>echo "Your message has been sent. Thank you!";</p>
<p class="p1"><span class="Apple-converted-space">    </span>} else {</p>
<p class="p1"><span class="Apple-converted-space">        </span>echo "There was an error sending your message. Please try again later.";</p>
<p class="p1"><span class="Apple-converted-space">    </span>}</p>
<p class="p1">} else {</p>
<p class="p1"><span class="Apple-converted-space">    </span>echo "Invalid request method.";</p>
<p class="p1">}</p>
<p class="p1">?&gt;</p>
</body>
</html>
