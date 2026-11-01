<?php


declare(strict_types=1);

require_once __DIR__ . '/session.php';

require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error('Method Not Allowed. Use POST.', 405);
}

$body = json_body();

$studentId     = isset($body['student_id']) ? (int)$body['student_id'] : 0;
$subjectId     = isset($body['subject_id']) ? (int)$body['subject_id'] : 0;
$examType      = trim((string)($body['exam_type'] ?? ''));
$rawObtained   = $body['marks_obtained'] ?? null;
$rawMax        = $body['max_marks'] ?? 100.00;

// 1. Basic validation
if ($studentId <= 0) {
    send_error('Please select a valid student.', 400);
}
if ($subjectId <= 0) {
    send_error('Please select a valid subject.', 400);
}
if ($examType === '') {
    send_error('Please specify an exam type (e.g., In-Sem, Mid-Sem, End-Sem, Total).', 400);
}
if ($rawObtained === null || !is_numeric($rawObtained)) {
    send_error('Marks obtained must be a numeric value.', 400);
}
if ($rawMax === null || !is_numeric($rawMax)) {
    send_error('Maximum marks must be a numeric value.', 400);
}

$marksObtained = (float)$rawObtained;
$maxMarks      = (float)$rawMax;

// 2. Numerical validation
if ($marksObtained < 0) {
    send_error('Marks obtained cannot be negative.', 400);
}
if ($maxMarks <= 0) {
    send_error('Maximum marks must be greater than zero.', 400);
}
if ($marksObtained > $maxMarks) {
    send_error("Marks obtained ($marksObtained) cannot exceed maximum marks ($maxMarks).", 400);
}

try {
    $conn = db_connect();

    // Verify student exists
    $stCheck = $conn->prepare('SELECT student_id, roll_no, full_name FROM students WHERE student_id = ? LIMIT 1');
    $stCheck->bind_param('i', $studentId);
    $stCheck->execute();
    $student = $stCheck->get_result()->fetch_assoc();
    $stCheck->close();

    if (!$student) {
        send_error('Selected student does not exist.', 404);
    }

    // Verify subject exists
    $subCheck = $conn->prepare('SELECT subject_id, subject_code, subject_name FROM subjects WHERE subject_id = ? LIMIT 1');
    $subCheck->bind_param('i', $subjectId);
    $subCheck->execute();
    $subject = $subCheck->get_result()->fetch_assoc();
    $subCheck->close();

    if (!$subject) {
        send_error('Selected subject does not exist.', 404);
    }

    // Determine helper column values
    $inSemVal  = (strcasecmp($examType, 'In-Sem') === 0) ? (int)round($marksObtained) : null;
    $midSemVal = (strcasecmp($examType, 'Mid-Sem') === 0) ? (int)round($marksObtained) : null;
    $endSemVal = (strcasecmp($examType, 'End-Sem') === 0 || strcasecmp($examType, 'Total') === 0) ? (int)round($marksObtained) : null;

    // Perform atomic upsert: INSERT ... ON DUPLICATE KEY UPDATE
    // Unique key on (student_id, subject_id, exam_type) guarantees no duplicate rows
    $upsertStmt = $conn->prepare('
        INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained, max_marks, in_sem, mid_sem, end_sem)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            marks_obtained = VALUES(marks_obtained),
            max_marks      = VALUES(max_marks),
            in_sem         = COALESCE(VALUES(in_sem), in_sem),
            mid_sem        = COALESCE(VALUES(mid_sem), mid_sem),
            end_sem        = COALESCE(VALUES(end_sem), end_sem),
            updated_at     = CURRENT_TIMESTAMP
    ');

    $upsertStmt->bind_param(
        'iisddiii',
        $studentId,
        $subjectId,
        $examType,
        $marksObtained,
        $maxMarks,
        $inSemVal,
        $midSemVal,
        $endSemVal
    );

    $upsertStmt->execute();
    $affected = $upsertStmt->affected_rows;
    $upsertStmt->close();

    $isUpdate = ($affected === 2); // In MySQL, ON DUPLICATE KEY UPDATE returns 2 if row was updated

    $grade = calculate_grade_status($marksObtained, $maxMarks);

    send_json([
        'ok'             => true,
        'action'         => $isUpdate ? 'updated' : 'inserted',
        'message'        => 'Marks ' . ($isUpdate ? 'updated' : 'saved') . ' successfully.',
        'student'        => [
            'student_id' => $studentId,
            'roll_no'    => $student['roll_no'],
            'full_name'  => $student['full_name']
        ],
        'subject'        => [
            'subject_id'   => $subjectId,
            'subject_code' => $subject['subject_code'],
            'subject_name' => $subject['subject_name']
        ],
        'record'         => [
            'exam_type'      => $examType,
            'marks_obtained' => $marksObtained,
            'max_marks'      => $maxMarks,
            'percentage'     => $grade['percentage'],
            'status'         => $grade['status']
        ]
    ]);
} catch (Throwable $e) {
    error_log('save_marks.php error: ' . $e->getMessage());
    send_error('Error saving marks to database: ' . $e->getMessage(), 500);
}
