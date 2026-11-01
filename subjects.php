<?php


declare(strict_types=1);

require_once __DIR__ . '/session.php';

require_login();

try {
    $conn = db_connect();

    $res = $conn->query('SELECT subject_id, subject_code, subject_name, type, semester, credits, faculty, sort_order
                         FROM subjects ORDER BY sort_order ASC, subject_code ASC');
    $subjects = $res ? $res->fetch_all(MYSQLI_ASSOC) : [];

    send_json([
        'ok'       => true,
        'count'    => count($subjects),
        'subjects' => $subjects
    ]);
} catch (Throwable $e) {
    error_log('subjects.php error: ' . $e->getMessage());
    send_error('Error retrieving subjects catalogue.', 500);
}
