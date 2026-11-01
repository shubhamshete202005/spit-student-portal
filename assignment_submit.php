<?php


require_once __DIR__ . '/session.php';

header('Content-Type: application/json');
$student = require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed.']);
    exit;
}

$body = json_body();
$code = trim((string)($body['subjectCode'] ?? ''));
if ($code === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing subjectCode.']);
    exit;
}

$conn = db_connect();

$stmt = $conn->prepare('SELECT subject_id, assignment_total FROM subjects WHERE subject_code = ?');
$stmt->bind_param('s', $code);
$stmt->execute();
$subject = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$subject || (int)$subject['assignment_total'] <= 0) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'Unknown subject or no assignments for this subject.']);
    exit;
}

$conn->begin_transaction();
try {
    $stmt = $conn->prepare('INSERT INTO assignment_submissions (student_id, subject_id, submitted_count)
                             VALUES (?, ?, 1)
                             ON DUPLICATE KEY UPDATE submitted_count = LEAST(submitted_count + 1, ?)');
    $total = (int)$subject['assignment_total'];
    $stmt->bind_param('iii', $student['student_id'], $subject['subject_id'], $total);
    $stmt->execute();
    $stmt->close();

    $stmt = $conn->prepare('SELECT submitted_count FROM assignment_submissions WHERE student_id = ? AND subject_id = ?');
    $stmt->bind_param('ii', $student['student_id'], $subject['subject_id']);
    $stmt->execute();
    $count = (int)$stmt->get_result()->fetch_assoc()['submitted_count'];
    $stmt->close();

    $conn->commit();
    echo json_encode(['ok' => true, 'submitted' => $count, 'total' => $total]);
} catch (mysqli_sql_exception $e) {
    $conn->rollback();
    error_log('assignment_submit failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not save submission.']);
}
