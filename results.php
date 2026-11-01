<?php


declare(strict_types=1);

require_once __DIR__ . '/session.php';

$student = require_student();
$sid = (int)$student['student_id'];

try {
    $conn = db_connect();

    // Query all marks records belonging to this student
    $stmt = $conn->prepare('SELECT m.mark_id, m.subject_id, m.exam_type, m.marks_obtained, m.max_marks,
                                   m.in_sem, m.mid_sem, m.end_sem, m.updated_at,
                                   s.subject_code, s.subject_name, s.credits, s.type as subject_type
                            FROM marks m
                            JOIN subjects s ON s.subject_id = m.subject_id
                            WHERE m.student_id = ?
                            ORDER BY s.sort_order ASC, m.exam_type ASC');
    $stmt->bind_param('i', $sid);
    $stmt->execute();
    $res = $stmt->get_result();

    $results = [];
    $totalObtained = 0.0;
    $totalMax = 0.0;
    $passedCount = 0;
    $failedCount = 0;

    while ($row = $res->fetch_assoc()) {
        $obtained = (float)$row['marks_obtained'];
        $max = (float)$row['max_marks'];
        $grade = calculate_grade_status($obtained, $max);

        $totalObtained += $obtained;
        $totalMax += $max;

        if ($grade['passed']) {
            $passedCount++;
        } else {
            $failedCount++;
        }

        $results[] = [
            'mark_id'        => (int)$row['mark_id'],
            'subject_code'   => $row['subject_code'],
            'subject_name'   => $row['subject_name'],
            'subject_type'   => $row['subject_type'],
            'credits'        => $row['credits'],
            'exam_type'      => $row['exam_type'],
            'marks_obtained' => $obtained,
            'max_marks'      => $max,
            'percentage'     => $grade['percentage'],
            'status'         => $grade['status'],
            'updated_at'     => $row['updated_at']
        ];
    }
    $stmt->close();

    $overallGrade = calculate_grade_status($totalObtained, $totalMax);

    send_json([
        'ok' => true,
        'student' => [
            'roll_no'    => $student['roll_no'],
            'full_name'  => $student['full_name'],
            'semester'   => (int)$student['semester'],
            'program'    => $student['program'],
            'department' => $student['department']
        ],
        'summary' => [
            'total_obtained'     => $totalObtained,
            'total_max'          => $totalMax,
            'overall_percentage' => $overallGrade['percentage'],
            'overall_status'     => $overallGrade['status'],
            'passed_count'       => $passedCount,
            'failed_count'       => $failedCount,
            'total_records'      => count($results),
            'grading_policy'     => 'Demo Threshold: Minimum 40% required per exam component to pass.'
        ],
        'results' => $results
    ]);
} catch (Throwable $e) {
    error_log('results.php error: ' . $e->getMessage());
    send_error('Error retrieving exam results.', 500);
}
