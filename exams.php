<?php


declare(strict_types=1);

require_once __DIR__ . '/session.php';

require_student();

try {
    $conn = db_connect();

    $res = $conn->query('SELECT e.exam_id, e.exam_date, s.subject_code, s.subject_name, e.time_slot, e.venue
                         FROM exam_schedule e
                         JOIN subjects s ON s.subject_id = e.subject_id
                         ORDER BY e.exam_date ASC');
    $exams = $res ? $res->fetch_all(MYSQLI_ASSOC) : [];

    send_json([
        'ok'    => true,
        'exams' => $exams
    ]);
} catch (Throwable $e) {
    error_log('exams.php error: ' . $e->getMessage());
    send_error('Error loading exam schedule.', 500);
}
