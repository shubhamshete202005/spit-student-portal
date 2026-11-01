<?php

declare(strict_types=1);

require_once __DIR__ . '/session.php';

require_admin();

$conn = db_connect();


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_body();

    $rollNo    = strtoupper(trim((string)($body['roll_no'] ?? $body['student_id'] ?? '')));
    $fullName  = trim((string)($body['full_name'] ?? $body['name'] ?? ''));
    $email     = trim((string)($body['email'] ?? ''));
    $mobile    = trim((string)($body['mobile'] ?? ''));
    $batch     = trim((string)($body['batch'] ?? '2026 - 2028'));
    $semester  = isset($body['semester']) ? (int)$body['semester'] : 1;
    $password  = (string)($body['password'] ?? '');

    if ($rollNo === '') {
        send_error('Roll Number / Student ID is required.', 400);
    }
    if ($fullName === '') {
        send_error('Full Name is required.', 400);
    }
    if ($email === '') {
        send_error('Email address is required.', 400);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_error('Please enter a valid email address.', 400);
    }
    if ($password === '') {
        send_error('Initial password is required.', 400);
    }
    if ($semester < 1 || $semester > 8) {
        send_error('Semester must be between 1 and 8.', 400);
    }
    if ($batch === '') {
        $batch = '2026 - 2028';
    }

    // 2. Duplicate checks against students and users
    $dupStmt = $conn->prepare('SELECT student_id FROM students WHERE UPPER(roll_no) = UPPER(?) LIMIT 1');
    $dupStmt->bind_param('s', $rollNo);
    $dupStmt->execute();
    if ($dupStmt->get_result()->num_rows > 0) {
        $dupStmt->close();
        send_error("A student with Roll Number '$rollNo' already exists.", 409);
    }
    $dupStmt->close();

    $uDupStmt = $conn->prepare('SELECT user_id FROM users WHERE UPPER(username) = UPPER(?) LIMIT 1');
    $uDupStmt->bind_param('s', $rollNo);
    $uDupStmt->execute();
    if ($uDupStmt->get_result()->num_rows > 0) {
        $uDupStmt->close();
        send_error("A login account with username '$rollNo' already exists.", 409);
    }
    $uDupStmt->close();

    $conn->begin_transaction();
    try {
        $stStmt = $conn->prepare('
            INSERT INTO students (roll_no, full_name, email, mobile, batch, semester, cgpa, program, department)
            VALUES (?, ?, ?, ?, ?, ?, "—", "Master of Computer Applications (MCA)", "Computer Science and Engineering")
        ');
        $stStmt->bind_param('sssssi', $rollNo, $fullName, $email, $mobile, $batch, $semester);
        $stStmt->execute();
        $studentId = (int)$conn->insert_id;
        $stStmt->close();

        // Hash password securely
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        $uStmt = $conn->prepare('
            INSERT INTO users (username, password_hash, role, student_id)
            VALUES (?, ?, "student", ?)
        ');
        $uStmt->bind_param('ssi', $rollNo, $passwordHash, $studentId);
        $uStmt->execute();
        $uStmt->close();

        // Initialize default attendance rows (0 attended) so student portal views load seamlessly
        $attStmt = $conn->prepare('
            INSERT INTO attendance (student_id, subject_id, classes_conducted, classes_attended)
            SELECT ?, subject_id, CASE type WHEN "Lab" THEN 24 ELSE 36 END, 0
            FROM subjects
            ON DUPLICATE KEY UPDATE classes_conducted = VALUES(classes_conducted)
        ');
        $attStmt->bind_param('i', $studentId);
        $attStmt->execute();
        $attStmt->close();

        $conn->commit();

        $cntRes = $conn->query('SELECT COUNT(*) FROM students');
        $newTotal = $cntRes ? (int)$cntRes->fetch_row()[0] : 0;

        send_json([
            'ok'          => true,
            'message'     => "Student '$rollNo' ($fullName) added successfully.",
            'total_count' => $newTotal,
            'student'     => [
                'student_id' => $studentId,
                'roll_no'    => $rollNo,
                'full_name'  => $fullName,
                'email'      => $email,
                'mobile'     => $mobile,
                'batch'      => $batch,
                'semester'   => $semester,
                'program'    => 'Master of Computer Applications (MCA)',
                'department' => 'Computer Science and Engineering'
            ]
        ], 201);
    } catch (Throwable $e) {
        $conn->rollback();
        error_log('Error in admin_students.php POST: ' . $e->getMessage());
        send_error('Failed to create student record in database.', 500);
    }
}

// ----------------------------------------------------------------------------
// GET: Retrieve All Registered Students
// ----------------------------------------------------------------------------
try {
    // Explicit COUNT(*) from students table ensures accurate count regardless of pagination or limits
    $cntRes = $conn->query('SELECT COUNT(*) FROM students');
    $totalCount = $cntRes ? (int)$cntRes->fetch_row()[0] : 0;

    $res = $conn->query('SELECT student_id, roll_no, full_name, email, mobile, batch, semester, program, department, created_at
                         FROM students ORDER BY roll_no ASC');
    $students = $res ? $res->fetch_all(MYSQLI_ASSOC) : [];

    send_json([
        'ok'          => true,
        'total_count' => $totalCount,
        'count'       => $totalCount,
        'students'    => $students
    ]);
} catch (Throwable $e) {
    error_log('Error in admin_students.php GET: ' . $e->getMessage());
    send_error('Error retrieving students directory.', 500);
}
