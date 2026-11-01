<?php


declare(strict_types=1);

require_once __DIR__ . '/common.php';


function spit_start_session(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        $cookieParams = [
            'lifetime' => 0,
            'path'     => '/',
            'domain'   => '',
            'secure'   => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
            'httponly' => true,
            'samesite' => 'Lax',
        ];
        session_set_cookie_params($cookieParams);
        session_name('spit_portal_session');
        session_start();
    }
}

/**
 * Returns current authenticated user record, or null.
 */
function current_user(): ?array
{
    spit_start_session();
    if (empty($_SESSION['user_id']) || empty($_SESSION['role'])) {
        return null;
    }
    return [
        'user_id'    => (int)$_SESSION['user_id'],
        'username'   => (string)($_SESSION['username'] ?? ''),
        'role'       => (string)$_SESSION['role'],
        'student_id' => isset($_SESSION['student_id']) ? (int)$_SESSION['student_id'] : null,
    ];
}

/**
 * Returns current authenticated student details, or null if not a student.
 */
function current_student(): ?array
{
    $user = current_user();
    if (!$user || $user['role'] !== 'student' || empty($user['student_id'])) {
        return null;
    }

    try {
        $conn = db_connect();
        $stmt = $conn->prepare('SELECT student_id, roll_no, full_name, email, mobile, photo, batch, semester, cgpa, program, department FROM students WHERE student_id = ? LIMIT 1');
        $stmt->bind_param('i', $user['student_id']);
        $stmt->execute();
        $res = $stmt->get_result();
        $student = $res->fetch_assoc();
        $stmt->close();
        return $student ?: null;
    } catch (Throwable $e) {
        error_log('Error loading current student: ' . $e->getMessage());
        return null;
    }
}

/**
 * Enforces any logged in user (student or admin).
 */
function require_login(): array
{
    $user = current_user();
    if (!$user) {
        send_error('Authentication required. Please log in.', 401);
    }
    return $user;
}

/**
 * Enforces administrator role.
 */
function require_admin(): array
{
    $user = require_login();
    if ($user['role'] !== 'admin') {
        send_error('Forbidden: Administrator access required.', 403);
    }
    return $user;
}

/**
 * Enforces student role.
 */
function require_student(): array
{
    $student = current_student();
    if (!$student) {
        send_error('Forbidden: Student access required.', 403);
    }
    return $student;
}

// When called directly via GET /api/session.php, return the session state JSON
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'session.php') {
    spit_start_session();
    $user = current_user();
    if (!$user) {
        send_json(['ok' => false, 'logged_in' => false, 'role' => null]);
    }
    if ($user['role'] === 'student') {
        $student = current_student();
        send_json([
            'ok' => true,
            'logged_in' => true,
            'role' => 'student',
            'user' => [
                'username'   => $user['username'],
                'student_id' => $user['student_id'],
                'roll_no'    => $student['roll_no'] ?? $user['username'],
                'name'       => $student['full_name'] ?? '',
                'email'      => $student['email'] ?? '',
                'program'    => $student['program'] ?? '',
                'department' => $student['department'] ?? '',
            ]
        ]);
    } else {
        send_json([
            'ok' => true,
            'logged_in' => true,
            'role' => 'admin',
            'user' => [
                'username' => $user['username'],
                'role'     => 'admin'
            ]
        ]);
    }
}
