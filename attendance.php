<?php

declare(strict_types=1);

require_once __DIR__ . '/session.php';

$student = require_student();
$sid = (int)$student['student_id'];

try {
    $conn = db_connect();

    $stmt = $conn->prepare('SELECT s.subject_id, s.subject_code, s.subject_name, s.type, s.faculty,
                                   a.classes_conducted, a.classes_attended
                            FROM subjects s
                            LEFT JOIN attendance a ON a.subject_id = s.subject_id AND a.student_id = ?
                            ORDER BY s.sort_order ASC, s.subject_id ASC');
    $stmt->bind_param('i', $sid);
    $stmt->execute();
    $res = $stmt->get_result();

    $records = [];
    $totalAttended = 0;
    $totalConducted = 0;
    $subjectsOnTrack = 0;

    while ($row = $res->fetch_assoc()) {
        $conducted = $row['classes_conducted'] !== null
            ? (int)$row['classes_conducted']
            : ($row['type'] === 'Lab' ? 24 : 36);
        $attended = (int)($row['classes_attended'] ?? 0);
        $pct = ($conducted > 0) ? round(($attended / $conducted) * 100) : 0;

        $totalAttended += $attended;
        $totalConducted += $conducted;

        $onTrack = ($pct >= 75);
        if ($onTrack) {
            $subjectsOnTrack++;
        }

        $records[] = [
            'subject_id'        => (int)$row['subject_id'],
            'subject_code'      => $row['subject_code'],
            'subject_name'      => $row['subject_name'],
            'faculty'           => $row['faculty'],
            'classes_conducted' => $conducted,
            'classes_attended'  => $attended,
            'percentage'        => $pct,
            'on_track'          => $onTrack,
            'status'            => $pct >= 75 ? 'On Track' : ($pct >= 65 ? 'Below 75%' : 'Below 65%')
        ];
    }
    $stmt->close();

    $overallPct = ($totalConducted > 0) ? round(($totalAttended / $totalConducted) * 100) : 0;

    send_json([
        'ok' => true,
        'overall' => [
            'classes_attended'  => $totalAttended,
            'classes_conducted' => $totalConducted,
            'percentage'        => $overallPct,
            'on_track_count'    => $subjectsOnTrack,
            'total_subjects'    => count($records)
        ],
        'records' => $records
    ]);
} catch (Throwable $e) {
    error_log('attendance.php error: ' . $e->getMessage());
    send_error('Error loading attendance details.', 500);
}
