<?php


declare(strict_types=1);

require_once __DIR__ . '/session.php';

header('Content-Type: application/javascript; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$student = current_student();
if (!$student) {
    http_response_code(401);
    echo "if (typeof location !== 'undefined') location.replace('login.html');";
    exit;
}

try {
    $conn = db_connect();
    $sid = (int)$student['student_id'];

    // 1. Subjects catalog
    $res = $conn->query('SELECT subject_id, subject_code, subject_name, type, hours_l, hours_t, hours_p,
                                marks_se, marks_te, marks_c, credits, faculty, icon, colour,
                                assignment_total, next_title, next_topic, next_due
                         FROM subjects ORDER BY sort_order ASC, subject_id ASC');
    $subjectRows = $res ? $res->fetch_all(MYSQLI_ASSOC) : [];

    // 2. Attendance records for current student
    $attendance = [];
    $stmt = $conn->prepare('SELECT subject_id, classes_attended FROM attendance WHERE student_id = ?');
    $stmt->bind_param('i', $sid);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $attendance[(int)$row['subject_id']] = (int)$row['classes_attended'];
    }
    $stmt->close();

    // 3. Marks & results for current student
    // Fetch all marks entered for this student
    $marksBySubject = [];
    $detailedResults = [];
    $stmt = $conn->prepare('SELECT m.subject_id, m.exam_type, m.marks_obtained, m.max_marks, m.in_sem, m.mid_sem, m.end_sem,
                                   s.subject_code, s.subject_name
                            FROM marks m
                            JOIN subjects s ON s.subject_id = m.subject_id
                            WHERE m.student_id = ?
                            ORDER BY s.sort_order ASC, m.mark_id ASC');
    $stmt->bind_param('i', $sid);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $sId = (int)$row['subject_id'];
        if (!isset($marksBySubject[$sId])) {
            $marksBySubject[$sId] = [];
        }
        $marksBySubject[$sId][$row['exam_type']] = [
            'obtained' => (float)$row['marks_obtained'],
            'max'      => (float)$row['max_marks'],
            'in_sem'   => $row['in_sem'],
            'mid_sem'  => $row['mid_sem'],
            'end_sem'  => $row['end_sem'],
        ];

        $pct = ($row['max_marks'] > 0) ? round(((float)$row['marks_obtained'] / (float)$row['max_marks']) * 100, 1) : 0;
        $status = ($pct >= 40.0) ? 'Pass' : 'Fail';
        $detailedResults[] = [
            'subject_code'   => $row['subject_code'],
            'subject_name'   => $row['subject_name'],
            'exam_type'      => $row['exam_type'],
            'marks_obtained' => (float)$row['marks_obtained'],
            'max_marks'      => (float)$row['max_marks'],
            'percentage'     => $pct,
            'status'         => $status
        ];
    }
    $stmt->close();

    // 4. Assignment submissions for current student
    $submitted = [];
    $stmt = $conn->prepare('SELECT subject_id, submitted_count FROM assignment_submissions WHERE student_id = ?');
    $stmt->bind_param('i', $sid);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $submitted[(int)$row['subject_id']] = (int)$row['submitted_count'];
    }
    $stmt->close();

    // Assemble courses array and student arrays matching data.js structure
    $courses = [];
    $attArr = [];
    $inSemArr = [];
    $midArr = [];
    $endSemArr = [];
    $totalArr = [];

    foreach ($subjectRows as $s) {
        $sidKey = (int)$s['subject_id'];
        $hasAssign = ((int)$s['assignment_total'] > 0);

        $row = [
            $s['subject_code'],
            $s['subject_name'],
            $s['type'],
            (int)$s['hours_l'],
            (int)$s['hours_t'],
            (int)$s['hours_p'],
            (int)$s['marks_se'],
            (int)$s['marks_te'],
            $s['marks_c'],
            $s['credits'],
            $s['faculty'],
        ];

        if ($hasAssign) {
            $row[] = $submitted[$sidKey] ?? 0;
            $row[] = (int)$s['assignment_total'];
            $row[] = $s['next_title'];
            $row[] = $s['next_topic'];
            $row[] = $s['next_due'];
            $row[] = $s['icon'];
            $row[] = $s['colour'];
        } else {
            $row[] = 0;
            $row[] = 0;
        }
        $courses[] = $row;
        $attArr[] = $attendance[$sidKey] ?? 0;

        // Marks resolution for subject
        $subjMarks = $marksBySubject[$sidKey] ?? [];

        // In-Sem
        $inVal = null;
        if (isset($subjMarks['In-Sem'])) {
            $inVal = (int)$subjMarks['In-Sem']['obtained'];
        } else {
            // Check if any mark row has in_sem column
            foreach ($subjMarks as $mEntry) {
                if ($mEntry['in_sem'] !== null) {
                    $inVal = (int)$mEntry['in_sem'];
                    break;
                }
            }
        }
        $inSemArr[] = $inVal ?? 0;

        // Mid-Sem
        $midVal = null;
        if (isset($subjMarks['Mid-Sem'])) {
            $midVal = (int)$subjMarks['Mid-Sem']['obtained'];
        } else {
            foreach ($subjMarks as $mEntry) {
                if ($mEntry['mid_sem'] !== null) {
                    $midVal = (int)$mEntry['mid_sem'];
                    break;
                }
            }
        }
        $midArr[] = $midVal;

        // End-Sem
        $endVal = null;
        if (isset($subjMarks['End-Sem'])) {
            $endVal = (float)$subjMarks['End-Sem']['obtained'];
        } else {
            foreach ($subjMarks as $mEntry) {
                if ($mEntry['end_sem'] !== null) {
                    $endVal = (float)$mEntry['end_sem'];
                    break;
                }
            }
        }
        $endSemArr[] = $endVal;

        // Total
        $totVal = null;
        if (isset($subjMarks['Total'])) {
            $totVal = (float)$subjMarks['Total']['obtained'];
        } elseif ($endVal !== null) {
            // If end-sem is entered (e.g. 85/100 or combined)
            $totVal = ($inVal !== null || $midVal !== null) ? (($inVal ?? 0) + ($midVal ?? 0) + $endVal) : $endVal;
        }
        $totalArr[] = $totVal;
    }

    // 5. Upcoming classes
    $upcoming = [];
    $res = $conn->query('SELECT uc.class_date, s.subject_name, uc.time_slot, uc.session_type, uc.venue, uc.colour
                         FROM upcoming_classes uc
                         JOIN subjects s ON s.subject_id = uc.subject_id
                         ORDER BY uc.class_date ASC');
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $upcoming[] = [
                $row['class_date'],
                $row['subject_name'],
                $row['time_slot'],
                $row['session_type'],
                $row['venue'],
                $row['colour']
            ];
        }
    }

    // 6. Exam schedule
    $exams = [];
    $res = $conn->query('SELECT e.exam_date, s.subject_code, s.subject_name, e.time_slot, e.venue
                         FROM exam_schedule e
                         JOIN subjects s ON s.subject_id = e.subject_id
                         ORDER BY e.exam_date ASC');
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $exams[] = [
                $row['exam_date'],
                $row['subject_code'],
                $row['subject_name'],
                $row['time_slot'],
                $row['venue']
            ];
        }
    }

    // 7. Notices
    $notices = [];
    $res = $conn->query('SELECT title, description, category, notice_date
                         FROM notices ORDER BY notice_date DESC');
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $notices[] = [
                $row['title'],
                $row['description'],
                $row['category'],
                $row['notice_date']
            ];
        }
    }

    $roll = $student['roll_no'];
    $studentsObj = [
        $roll => [
            'name'     => $student['full_name'],
            'roll'     => $student['roll_no'],
            'email'    => $student['email'],
            'mobile'   => $student['mobile'] ?? '',
            'photo'    => $student['photo'] ?? '',
            'batch'    => $student['batch'],
            'sem'      => (int)$student['semester'],
            'cgpa'     => $student['cgpa'],
            'att'      => $attArr,
            'inSem'    => $inSemArr,
            'mid'      => $midArr,
            'endSem'   => $endSemArr,
            'total'    => $totalArr,
            'results'  => $detailedResults
        ]
    ];

    $dbObj = [
        'program'    => $student['program'],
        'dept'       => $student['department'],
        'semCredits' => 24,
        'courses'    => $courses,
        'upcoming'   => $upcoming,
        'exams'      => $exams,
        'notices'    => $notices
    ];

    $jsonOpts = JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;
    $studentsJson = json_encode($studentsObj, $jsonOpts);
    $dbJson = json_encode($dbObj, $jsonOpts);

} catch (Throwable $e) {
    error_log('Bootstrap database error: ' . $e->getMessage());
    echo 'console.error("Database error loading portal bootstrap data.");';
    exit;
}
?>
/* SPIT Student Portal — Live session-backed bootstrap */
if (typeof P === 'undefined') {
  window.P = {
    home: "M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",
    book: "M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z",
    cal: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
    file: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8",
    bell: "M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4",
    gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-2-4-2 1-2-1-1-2H9L8 7 6 8 4 7l-2 4 2 1v2l-2 1 2 4 2-1 2 1 1 2h4l1-2 2-1 2 1 2-4-2-1z",
    search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5",
    arrow: "M5 12h14M13 6l6 6-6 6",
    chart: "M5 21V10M12 21V3M19 21v-7",
    trend: "M3 17l6-6 4 4 8-8",
    flask: "M9 3h6M10 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-10V3",
    grad: "M2 9l10-5 10 5-10 5zM6 11v5c3 3 9 3 12 0v-5",
    check: "M5 12l5 5 9-10",
    alert: "M12 8v5M12 17h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
    users: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a6 6 0 0 1 3 6",
    shield: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z",
    lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
    out: "M9 21H4V3h5M16 17l5-5-5-5M21 12H9",
    globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
    db: "M4 6c0-2 16-2 16 0v12c0 2-16 2-16 0zM4 12c0 2 16 2 16 0",
    code: "M8 7l-5 5 5 5M16 7l5 5-5 5",
    menu: "M3 6h18M3 12h18M3 18h18",
    chev: "M6 9l6 6 6-6",
    chev2: "M9 6l6 6-6 6",
    left: "M15 6l-6 6 6 6",
    brief: "M3 7h18v13H3zM9 7V4h6v3",
    pen: "M4 20l4-1 11-11-3-3L5 16zM14 6l3 3",
    mega: "M3 11v3l12 5V6zM15 9a3 3 0 0 1 0 6M6 14l1 6h3l-1-5",
    info: "M12 11v5M12 8h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
    x: "M6 6l12 12M18 6L6 18",
    pi: "M5 7h14M9 7v12M15 7v10a2 2 0 0 0 2 2",
    cam: "M4 8h4l2-3h4l2 3h4v12H4zM12 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    dl: "M12 4v12M7 11l5 5 5-5M5 20h14",
    monitor: "M3 4h18v12H3zM8 21h8M12 16v5",
    acc: "M12 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 8l7 1 7-1M12 9v6l-3 6M12 15l3 6",
    palette: "M12 3a9 9 0 1 0 0 18c2 0 2-2 1-3s0-3 2-3h3a3 3 0 0 0 3-3c0-5-4-9-9-9z",
    mail: "M3 5h18v14H3zM3 6l9 7 9-7",
    phone: "M7 3h10v18H7zM11 18h2",
  };
}
if (typeof ic === 'undefined') {
  window.ic = (n, c = "") => `<svg class="i ${c}" viewBox="0 0 24 24"><path d="${P[n]}"/></svg>`;
}
if (typeof LOGO === 'undefined') {
  window.LOGO = `<svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M24 3v5M21 8h6l2 5H19zM13 13h22v6H13zM10 19h28M12 22v16M18 22v16M24 22v16M30 22v16M36 22v16M8 38h32M5 42h38"/></svg>`;
}
if (typeof bldg === 'undefined') {
  window.bldg = function(bg = true) {
    let w = "";
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 9; c++)
        w += `<rect x="${58 + c * 24}" y="${142 + r * 27}" width="12" height="15"/>`;
    return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b2f78"/><stop offset="1" stop-color="#7fb2f0"/></linearGradient></defs>${bg ? '<rect width="400" height="300" fill="url(#sk)"/>' : ""}<g fill="${bg ? "#ece8df" : "none"}" stroke="${bg ? "none" : "#8fb0ee"}"><rect x="260" y="70" width="70" height="180"/><rect x="40" y="130" width="290" height="120"/></g><g fill="${bg ? "#6f8db8" : "none"}" stroke="${bg ? "none" : "#8fb0ee"}">${w}</g><text x="295" y="105" fill="#1a3a8a" font-size="16" font-weight="800" transform="rotate(-8 295 105)" text-anchor="middle">SPIT</text>${bg ? '<g fill="#2f7a3a"><circle cx="120" cy="215" r="26"/><circle cx="190" cy="205" r="30"/><circle cx="30" cy="190" r="34"/></g><rect y="250" width="400" height="50" fill="#1d4a2a"/>' : ""}</svg>`;
  };
}

window.STUDENTS = <?php echo $studentsJson; ?>;
window.DB = <?php echo $dbJson; ?>;
