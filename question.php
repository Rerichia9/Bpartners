<?php
    $email = $_POST['email'];
    $name = $_POST['name'];
    $message = $_POST['message'];
    $email = htmlspecialchars($email);
    $name = htmlspecialchars($name);
    $message = htmlspecialchars($message);

    $email = urldecode($email);
    $name = urldecode($name);
    $message = urldecode($message);

    $email = trim($email);
    $name = trim($name);
    $message = trim($message);
    $mailto = 'maximsen@gmail.com, partners@bpartners.io';
	$subject = 'Отклик на bpartners.io';
	$headers="Content-type:text/html;charset=utf-8\r\n";
	$headers .= "From: no-reply@megapartners.io\r\n";
	$messages = "Отклик на bpartners.io<br><br>Имя: $name,<br>
	<br>Email: $email,<br><br> Сообщение:<br> $message";

	if(mail($mailto, $subject, $messages, $headers)) {
		echo 'true';
	} else {
		echo 'false';
    }
?>
