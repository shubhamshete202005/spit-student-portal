<?php


declare(strict_types=1);

require_once __DIR__ . '/session.php';

$student = require_student();
$sid = (int)$student['student_id'];

try {
    $conn = db_connect();

    // Attendance summary
    $attStmt = $conn->prepare('SELECT SUM(classes_attended) as total_att, SUM(classes_conducted) as total_cond
                               FROM attendance WHERE student_id = ?');
    $attStmt->bind_param('i', $sid);
    $attStmt->execute();
    $attRow = $attStmt->get_result()->fetch_assoc();
    $attStmt->close();

    $totalAtt = (int)($attRow['total_att'] ?? 0);
    $totalCond = (int)($attRow['total_cond'] ?? 0);
    $attPct = ($totalCond > 0) ? round(($totalAtt / $totalCond) * 100) : 0;

    // Upcoming classes
    $upcoming = [];
    $upRes = $conn->query('SELECT uc.class_date, s.subject_name, uc.time_slot, uc.session_type, uc.venue, uc.colour
                           FROM upcoming_classes uc
                           JOIN subjects s ON s.subject_id = uc.subject_id
                           ORDER BY uc.class_date ASC LIMIT 5');
    if ($upRes) {
        $upcoming = $upRes->fetch_all(MYSQLI_ASSOC);
    }

    // Recent notices
    $notices = [];
    $notRes = $conn->query('SELECT notice_id, title, description, category, notice_date
                            FROM notices ORDER BY notice_date DESC LIMIT 5');
    if ($notRes) {
        $notices = $notRes->fetch_all(MYSQLI_ASSOC);
    }

    send_json([
        'ok' => true,
        'student' => [
            'name'       => $student['full_name'],
            'roll_no'    => $student['roll_no'],
            'batch'      => $student['batch'],
            'semester'   => (int)$student['semester'],
            'cgpa'       => $student['cgpa'],
            'department' => $student['department'],
            'program'    => $student['program']
        ],
        'attendance' => [
            'classes_attended'  => $totalAtt,
            'classes_conducted' => $totalCond,
            'percentage'        => $attPct
        ],
        'upcoming' => $upcoming,
        'notices'  => $notices
    ]);
} catch (Throwable $e) {
    error_log('dashboard.php error: ' . $e->getMessage());
    send_error('Error loading dashboard data.', 500);
}
