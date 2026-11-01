<?php

declare(strict_types=1);

require_once __DIR__ . '/session.php';

$student = require_student();
$sid = (int)$student['student_id'];

try {
    $conn = db_connect();

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_body();
        $code = trim((string)($body['subject_code'] ?? ''));

        if ($code === '') {
            send_error('Subject code is required.', 400);
        }

        // Find subject
        $stmt = $conn->prepare('SELECT subject_id, assignment_total FROM subjects WHERE subject_code = ? LIMIT 1');
        $stmt->bind_param('s', $code);
        $stmt->execute();
        $sub = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$sub) {
            send_error('Subject not found.', 404);
        }

        $subId = (int)$sub['subject_id'];
        $maxTotal = (int)$sub['assignment_total'];

        // Upsert submission count (cannot exceed assignment_total)
        $upStmt = $conn->prepare('INSERT INTO assignment_submissions (student_id, subject_id, submitted_count)
                                  VALUES (?, ?, 1)
                                  ON DUPLICATE KEY UPDATE submitted_count = LEAST(submitted_count + 1, ?)');
        $upStmt->bind_param('iii', $sid, $subId, $maxTotal);
        $upStmt->execute();
        $upStmt->close();

        // Get new count
        $cntStmt = $conn->prepare('SELECT submitted_count FROM assignment_submissions WHERE student_id = ? AND subject_id = ?');
        $cntStmt->bind_param('ii', $sid, $subId);
        $cntStmt->execute();
        $newCount = (int)$cntStmt->get_result()->fetch_row()[0];
        $cntStmt->close();

        send_json([
            'ok'              => true,
            'message'         => 'Assignment marked as submitted.',
            'subject_code'    => $code,
            'submitted_count' => $newCount,
            'total'           => $maxTotal
        ]);
    }

    // GET: List assignments
    $stmt = $conn->prepare('SELECT s.subject_id, s.subject_code, s.subject_name, s.faculty,
                                   s.assignment_total, s.next_title, s.next_topic, s.next_due,
                                   s.icon, s.colour,
                                   COALESCE(a.submitted_count, 0) as submitted_count
                            FROM subjects s
                            LEFT JOIN assignment_submissions a ON a.subject_id = s.subject_id AND a.student_id = ?
                            WHERE s.assignment_total > 0
                            ORDER BY s.sort_order ASC');
    $stmt->bind_param('i', $sid);
    $stmt->execute();
    $assignments = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    send_json([
        'ok' => true,
        'assignments' => $assignments
    ]);
} catch (Throwable $e) {
    error_log('assignments.php error: ' . $e->getMessage());
    send_error('Error handling assignments request.', 500);
}
