<?php


declare(strict_types=1);

require_once __DIR__ . '/session.php';

$student = require_student();
$sid = (int)$student['student_id'];

try {
    $conn = db_connect();

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_body();
        $email = trim((string)($body['email'] ?? ''));
        $mobile = trim((string)($body['mobile'] ?? ''));

        if ($email === '') {
            send_error('Email address cannot be empty.', 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            send_error('Invalid email address format.', 400);
        }

        $stmt = $conn->prepare('UPDATE students SET email = ?, mobile = ? WHERE student_id = ?');
        $stmt->bind_param('ssi', $email, $mobile, $sid);
        $stmt->execute();
        $stmt->close();

        send_json([
            'ok'      => true,
            'message' => 'Profile details updated successfully.',
            'profile' => [
                'email'  => $email,
                'mobile' => $mobile
            ]
        ]);
    }

    // GET: Return current profile
    send_json([
        'ok'      => true,
        'profile' => [
            'student_id' => $sid,
            'roll_no'    => $student['roll_no'],
            'full_name'  => $student['full_name'],
            'email'      => $student['email'],
            'mobile'     => $student['mobile'],
            'batch'      => $student['batch'],
            'semester'   => (int)$student['semester'],
            'program'    => $student['program'],
            'department' => $student['department']
        ]
    ]);
} catch (Throwable $e) {
    error_log('settings.php error: ' . $e->getMessage());
    send_error('Error processing settings request.', 500);
}
