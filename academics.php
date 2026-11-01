<?php


declare(strict_types=1);

require_once __DIR__ . '/session.php';

$student = require_student();

try {
    $conn = db_connect();

    $res = $conn->query('SELECT subject_id, subject_code, subject_name, type, semester,
                                hours_l, hours_t, hours_p, marks_se, marks_te, marks_c,
                                credits, faculty, sort_order
                         FROM subjects ORDER BY sort_order ASC, subject_id ASC');
    $courses = $res ? $res->fetch_all(MYSQLI_ASSOC) : [];

    $theoryCount = 0;
    $labCount = 0;
    $nonCreditCount = 0;
    $totalCredits = 0;

    foreach ($courses as $c) {
        if ($c['type'] === 'Theory') {
            $theoryCount++;
            $totalCredits += (int)$c['credits'];
        } elseif ($c['type'] === 'Lab') {
            $labCount++;
            $totalCredits += (int)$c['credits'];
        } else {
            $nonCreditCount++;
        }
    }

    send_json([
        'ok' => true,
        'summary' => [
            'total_subjects' => count($courses),
            'total_credits'  => $totalCredits,
            'theory_count'   => $theoryCount,
            'lab_count'      => $labCount,
            'non_credit'     => $nonCreditCount,
        ],
        'courses' => $courses
    ]);
} catch (Throwable $e) {
    error_log('academics.php error: ' . $e->getMessage());
    send_error('Error loading academic details.', 500);
}
