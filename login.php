<?php


declare(strict_types=1);

require_once __DIR__ . '/session.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error('Method Not Allowed. Use POST.', 405);
}

$body = json_body();
$username = trim((string)($body['studentId'] ?? $body['username'] ?? ''));
$password = (string)($body['password'] ?? '');

if ($username === '' || $password === '') {
    send_error('Enter your student ID or username and password.', 400);
}

try {
    $conn = db_connect();

    // Query user by username (case-insensitive comparison via UPPER)
    $stmt = $conn->prepare('SELECT user_id, username, password_hash, role, student_id FROM users WHERE UPPER(username) = UPPER(?) LIMIT 1');
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        send_error('Incorrect student ID/username or password. Check both and try again.', 401);
    }

    // Authentication successful: prevent session fixation
    spit_start_session();
    session_regenerate_id(true);

    $_SESSION['user_id'] = (int)$user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];

    if ($user['role'] === 'student') {
        $_SESSION['student_id'] = (int)$user['student_id'];

        // Retrieve student's roll number and full name
        $sStmt = $conn->prepare('SELECT roll_no, full_name FROM students WHERE student_id = ? LIMIT 1');
        $sStmt->bind_param('i', $user['student_id']);
        $sStmt->execute();
        $student = $sStmt->get_result()->fetch_assoc();
        $sStmt->close();

        $roll = $student['roll_no'] ?? $user['username'];
        $name = $student['full_name'] ?? 'Student';

        send_json([
            'ok'       => true,
            'role'     => 'student',
            'roll'     => $roll,
            'name'     => $name,
            'redirect' => 'dashboard.html'
        ]);
    } else {
        // Administrator login
        $_SESSION['student_id'] = null;
        send_json([
            'ok'       => true,
            'role'     => 'admin',
            'username' => $user['username'],
            'redirect' => 'admin.html'
        ]);
    }
} catch (Throwable $e) {
    error_log('Login error: ' . $e->getMessage());
    send_error('Unable to connect to the database. Please verify MySQL on port 3306.', 500);
}
