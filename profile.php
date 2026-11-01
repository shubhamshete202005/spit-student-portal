<?php


require_once __DIR__ . '/session.php';

header('Content-Type: application/json');
$student = require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed.']);
    exit;
}

$body = json_body();
$email = trim((string)($body['email'] ?? $student['email']));
$mobile = trim((string)($body['mobile'] ?? $student['mobile']));

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Enter a valid email address.']);
    exit;
}

$conn = db_connect();
$stmt = $conn->prepare('UPDATE students SET email = ?, mobile = ? WHERE student_id = ?');
$stmt->bind_param('ssi', $email, $mobile, $student['student_id']);
$stmt->execute();
$ok = $stmt->affected_rows >= 0; // 0 rows changed is still a successful no-op
$stmt->close();

echo json_encode(['ok' => $ok, 'email' => $email, 'mobile' => $mobile]);
