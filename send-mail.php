<?php
/**
 * Skrypt obsługi formularza kontaktowego
 * Kancelaria Adwokacka Bartłomiej Tutak
 */

// Konfiguracja - ZMIEŃ NA SWÓJ EMAIL
$recipient_email = 'kancelaria.tutak@outlook.com';
$email_subject_prefix = '[Strona WWW] ';

// Nagłówki CORS (jeśli potrzebne)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Odpowiedź tylko na POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metoda niedozwolona']);
    exit;
}

// Pobierz dane z formularza
$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$email = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : '';
$phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$subject = isset($_POST['subject']) ? trim(strip_tags($_POST['subject'])) : 'Brak tematu';
$message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';
$privacy = isset($_POST['privacy']) ? true : false;

// Walidacja
$errors = [];

if (empty($name)) {
    $errors[] = 'Imię i nazwisko jest wymagane';
}

if (empty($email)) {
    $errors[] = 'Adres e-mail jest wymagany';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Nieprawidłowy adres e-mail';
}

if (empty($message)) {
    $errors[] = 'Wiadomość jest wymagana';
} elseif (strlen($message) < 10) {
    $errors[] = 'Wiadomość musi mieć co najmniej 10 znaków';
}

if (!$privacy) {
    $errors[] = 'Musisz zaakceptować politykę prywatności';
}

// Prosta ochrona przed spamem - honeypot
if (!empty($_POST['website'])) {
    // Bot wypełnił ukryte pole
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Wykryto spam']);
    exit;
}

// Jeśli są błędy, zwróć je
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// Mapowanie tematów na polski
$subject_labels = [
    'konsultacja' => 'Umówienie konsultacji',
    'karne' => 'Prawo karne',
    'cywilne' => 'Prawo cywilne',
    'rodzinne' => 'Prawo rodzinne',
    'spadkowe' => 'Prawo spadkowe',
    'gospodarcze' => 'Prawo gospodarcze',
    'inne' => 'Inne'
];

$subject_text = isset($subject_labels[$subject]) ? $subject_labels[$subject] : $subject;

// Przygotuj treść maila
$email_subject = $email_subject_prefix . $subject_text . ' - ' . $name;

$email_body = "Nowa wiadomość z formularza kontaktowego na stronie:\n\n";
$email_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$email_body .= "DANE KONTAKTOWE:\n";
$email_body .= "Imię i nazwisko: $name\n";
$email_body .= "E-mail: $email\n";
$email_body .= "Telefon: " . ($phone ? $phone : 'Nie podano') . "\n";
$email_body .= "Temat: $subject_text\n\n";
$email_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$email_body .= "TREŚĆ WIADOMOŚCI:\n\n";
$email_body .= $message . "\n\n";
$email_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$email_body .= "Data wysłania: " . date('d.m.Y H:i:s') . "\n";
$email_body .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";

// Nagłówki maila
$headers = "From: $name <$email>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Wyślij mail
$mail_sent = mail($recipient_email, $email_subject, $email_body, $headers);

if ($mail_sent) {
    // Opcjonalnie: wyślij potwierdzenie do nadawcy
    $confirmation_subject = "Potwierdzenie otrzymania wiadomości - Kancelaria Adwokacka Bartłomiej Tutak";
    $confirmation_body = "Szanowny/a $name,\n\n";
    $confirmation_body .= "Dziękujemy za kontakt z Kancelarią Adwokacką.\n";
    $confirmation_body .= "Otrzymaliśmy Państwa wiadomość i postaramy się odpowiedzieć najszybciej jak to możliwe.\n\n";
    $confirmation_body .= "Temat: $subject_text\n\n";
    $confirmation_body .= "Treść wiadomości:\n$message\n\n";
    $confirmation_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    $confirmation_body .= "Z poważaniem,\n";
    $confirmation_body .= "Kancelaria Adwokacka Tutak Spółka Partnerska\n";
    $confirmation_body .= "Plac Zwycięstwa 11/6, Złota Kamienica, 76-200 Słupsk\n";
    $confirmation_body .= "Tel: 884-375-553\n";
    $confirmation_body .= "E-mail: kancelaria.tutak@outlook.com\n";
    
    $confirmation_headers = "From: Kancelaria Adwokacka <$recipient_email>\r\n";
    $confirmation_headers .= "Reply-To: $recipient_email\r\n";
    $confirmation_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    mail($email, $confirmation_subject, $confirmation_body, $confirmation_headers);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Wiadomość została wysłana. Dziękujemy za kontakt!'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Wystąpił błąd podczas wysyłania wiadomości. Proszę spróbować później lub skontaktować się telefonicznie.'
    ]);
}
?>
