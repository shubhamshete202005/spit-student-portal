<?php

declare(strict_types=1);

require_once __DIR__ . '/session.php';

require_admin();

$filterStudentId = isset($_GET['student_id']) && is_numeric($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
$filterSubjectId = isset($_GET['subject_id']) && is_numeric($_GET['subject_id']) ? (int)$_GET['subject_id'] : 0;

try {
    $conn = db_connect();

    $sql = 'SELECT m.mark_id, m.student_id, m.subject_id, m.exam_type, m.marks_obtained, m.max_marks,
                   m.in_sem, m.mid_sem, m.end_sem, m.updated_at,
                   s.roll_no, s.full_name, s.batch, s.semester,
                   sub.subject_code, sub.subject_name, sub.credits, sub.type as subject_type
            FROM marks m
            JOIN students s ON s.student_id = m.student_id
            JOIN subjects sub ON sub.subject_id = m.subject_id
            WHERE 1=1';

    $params = [];
    $types = '';

    if ($filterStudentId > 0) {
        $sql .= ' AND m.student_id = ?';
        $params[] = $filterStudentId;
        $types .= 'i';
    }

    if ($filterSubjectId > 0) {
        $sql .= ' AND m.subject_id = ?';
        $params[] = $filterSubjectId;
        $types .= 'i';
    }

    $sql .= ' ORDER BY s.roll_no ASC, sub.sort_order ASC, m.mark_id ASC';

    $stmt = $conn->prepare($sql);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $res = $stmt->get_result();

    $records = [];
    $totalMarksObtained = 0.0;
    $totalMaxMarks = 0.0;
    $passCount = 0;
    $failCount = 0;

    while ($row = $res->fetch_assoc()) {
        $obtained = (float)$row['marks_obtained'];
        $max = (float)$row['max_marks'];
        $grade = calculate_grade_status($obtained, $max);

        $totalMarksObtained += $obtained;
        $totalMaxMarks += $max;

        if ($grade['passed']) {
            $passCount++;
        } else {
            $failCount++;
        }

        $records[] = [
            'mark_id'        => (int)$row['mark_id'],
            'student_id'     => (int)$row['student_id'],
            'roll_no'        => $row['roll_no'],
            'full_name'      => $row['full_name'],
            'batch'          => $row['batch'],
            'semester'       => (int)$row['semester'],
            'subject_id'     => (int)$row['subject_id'],
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

    $overallGrade = calculate_grade_status($totalMarksObtained, $totalMaxMarks);

    send_json([
        'ok'      => true,
        'count'   => count($records),
        'summary' => [
            'total_records'      => count($records),
            'passed_count'       => $passCount,
            'failed_count'       => $failCount,
            'pass_percentage'    => (count($records) > 0) ? round(($passCount / count($records)) * 100, 1) : 0.0,
            'overall_percentage' => $overallGrade['percentage'],
        ],
        'results' => $records
    ]);
} catch (Throwable $e) {
    error_log('admin_results.php error: ' . $e->getMessage());
    send_error('Error retrieving admin marks records.', 500);
}
