CREATE DATABASE IF NOT EXISTS `spit_portal` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `spit_portal`;

CREATE TABLE IF NOT EXISTS `students` (
  `student_id` INT AUTO_INCREMENT PRIMARY KEY,
  `roll_no` VARCHAR(20) NOT NULL UNIQUE,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `mobile` VARCHAR(30) DEFAULT NULL,
  `photo` VARCHAR(255) DEFAULT NULL,
  `batch` VARCHAR(30) NOT NULL,
  `semester` TINYINT NOT NULL DEFAULT 1,
  `cgpa` VARCHAR(10) NOT NULL DEFAULT '—',
  `program` VARCHAR(150) NOT NULL DEFAULT 'Master of Computer Applications (MCA)',
  `department` VARCHAR(150) NOT NULL DEFAULT 'Computer Science and Engineering',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  `student_id` INT DEFAULT NULL UNIQUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `users` MODIFY COLUMN `role` ENUM('student', 'admin') NOT NULL DEFAULT 'student';

CREATE TABLE IF NOT EXISTS `subjects` (
  `subject_id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject_code` VARCHAR(20) NOT NULL UNIQUE,
  `subject_name` VARCHAR(150) NOT NULL,
  `type` ENUM('Theory','Lab','Non-Credit') NOT NULL,
  `semester` TINYINT NOT NULL DEFAULT 1,
  `hours_l` TINYINT NOT NULL DEFAULT 0,
  `hours_t` TINYINT NOT NULL DEFAULT 0,
  `hours_p` TINYINT NOT NULL DEFAULT 0,
  `marks_se` INT NOT NULL DEFAULT 0,
  `marks_te` INT NOT NULL DEFAULT 0,
  `marks_c` VARCHAR(5) NOT NULL DEFAULT '0',
  `credits` VARCHAR(5) NOT NULL DEFAULT '0',
  `faculty` VARCHAR(100) NOT NULL DEFAULT '',
  `icon` VARCHAR(20) NOT NULL DEFAULT 'book',
  `colour` CHAR(1) NOT NULL DEFAULT 'b',
  `assignment_total` INT NOT NULL DEFAULT 0,
  `next_title` VARCHAR(100) DEFAULT NULL,
  `next_topic` VARCHAR(150) DEFAULT NULL,
  `next_due` DATE DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `marks` (
  `mark_id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `exam_type` VARCHAR(50) NOT NULL DEFAULT 'End-Sem',
  `marks_obtained` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `max_marks` DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  `in_sem` INT DEFAULT NULL,
  `mid_sem` INT DEFAULT NULL,
  `end_sem` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_student_subject_exam` (`student_id`, `subject_id`, `exam_type`),
  CONSTRAINT `fk_marks_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_marks_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `attendance` (
  `attendance_id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `classes_conducted` INT NOT NULL DEFAULT 0,
  `classes_attended` INT NOT NULL DEFAULT 0,
  UNIQUE KEY `uniq_attendance` (`student_id`, `subject_id`),
  CONSTRAINT `fk_att_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `assignment_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `submitted_count` INT NOT NULL DEFAULT 0,
  UNIQUE KEY `uniq_submission` (`student_id`, `subject_id`),
  CONSTRAINT `fk_sub_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sub_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notices` (
  `notice_id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `category` ENUM('Academic','Examination','Event','Placement','Holiday','Other') NOT NULL,
  `notice_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_notice` (`title`, `notice_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `exam_schedule` (
  `exam_id` INT AUTO_INCREMENT PRIMARY KEY,
  `exam_date` DATE NOT NULL,
  `subject_id` INT NOT NULL,
  `time_slot` VARCHAR(50) NOT NULL,
  `venue` VARCHAR(50) NOT NULL,
  UNIQUE KEY `uniq_exam` (`exam_date`, `subject_id`),
  CONSTRAINT `fk_exam_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `upcoming_classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_date` DATE NOT NULL,
  `subject_id` INT NOT NULL,
  `time_slot` VARCHAR(50) NOT NULL,
  `session_type` VARCHAR(30) NOT NULL,
  `venue` VARCHAR(30) NOT NULL,
  `colour` CHAR(1) NOT NULL DEFAULT 'b',
  UNIQUE KEY `uniq_upcoming` (`class_date`, `subject_id`),
  CONSTRAINT `fk_upcoming_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `subjects` (`subject_code`, `subject_name`, `type`, `semester`, `hours_l`, `hours_t`, `hours_p`, `marks_se`, `marks_te`, `marks_c`, `credits`, `faculty`, `icon`, `colour`, `assignment_total`, `next_title`, `next_topic`, `next_due`, `sort_order`) VALUES
('MC501',  'Data Structures',            'Theory',     1, 3, 0, 2, 4, 9,  '4', '4', 'Prof. A. Deshmukh', 'code',  'b', 5, 'Assignment 3', 'Trees and Graphs',            '2026-10-10', 1),
('MC502',  'Database Management System', 'Theory',     1, 3, 0, 2, 5, 10, '4', '4', 'Prof. S. Iyer',     'db',    'g', 4, 'Lab 2',        'SQL Queries and Views',       '2026-10-13', 2),
('MC503',  'Software Engineering',       'Theory',     1, 3, 0, 2, 5, 10, '4', '4', 'Prof. M. Patil',    'gear',  'p', 4, 'Assignment 2', 'Software Development Models', '2026-10-16', 3),
('MA501',  'Linear Algebra',             'Theory',     1, 2, 1, 0, 5, 8,  '3', '3', 'Prof. R. Kulkarni', 'pi',    'o', 5, 'Assignment 3', 'Eigenvalues and Eigenvectors','2026-10-12', 4),
('MC504',  'Web Technology',             'Theory',     1, 0, 1, 4, 4, 9,  '3', '3', 'Prof. K. Jain',     'globe', 'r', 4, 'Assignment 2', 'HTML, CSS and JS',            '2026-10-14', 5),
('MC501L', 'Data Structures Lab',        'Lab',        1, 0, 0, 2, 2, 6,  '1', '1', 'Prof. A. Deshmukh', 'book',  'b', 0, NULL, NULL, NULL, 6),
('MC502L', 'DBMS Lab',                   'Lab',        1, 0, 0, 2, 2, 6,  '1', '1', 'Prof. S. Iyer',     'book',  'b', 0, NULL, NULL, NULL, 7),
('MC504L', 'Web Technology Lab',         'Lab',        1, 0, 0, 2, 2, 6,  '1', '1', 'Prof. K. Jain',     'book',  'b', 0, NULL, NULL, NULL, 8),
('AS501',  'Writing Skills',             'Non-Credit', 1, 1, 0, 2, 2, 5,  '2', '-', 'Prof. P. Sharma',   'book',  'b', 0, NULL, NULL, NULL, 9)
ON DUPLICATE KEY UPDATE `subject_name` = VALUES(`subject_name`), `faculty` = VALUES(`faculty`), `credits` = VALUES(`credits`);

INSERT INTO `students` (`roll_no`, `full_name`, `email`, `mobile`, `photo`, `batch`, `semester`, `cgpa`, `program`, `department`) VALUES
('MCA26001', 'Abhinav Singh', 'abhinav.singh@spit.ac.in', '+91 9876543210', '', '2026 - 2028', 1, '—', 'Master of Computer Applications (MCA)', 'Computer Science and Engineering'),
('MCA26002', 'Priya Sharma',  'priya.sharma@spit.ac.in',  '+91 9876543211', '', '2026 - 2028', 1, '—', 'Master of Computer Applications (MCA)', 'Computer Science and Engineering')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `email` = VALUES(`email`), `mobile` = VALUES(`mobile`);

INSERT INTO `users` (`username`, `password_hash`, `role`, `student_id`) VALUES
('admin', '$2y$10$k39CCrezo6Ic/6vY1kE0HO81dH4/Aq6KvwBQuvklusSx0oFN2Xkky', 'admin', NULL)
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

INSERT INTO `users` (`username`, `password_hash`, `role`, `student_id`)
SELECT 'MCA26001', '$2y$10$zadQo9M3Ibu9cCxjlJ87qesyP/4BoWcDU.cCH8GNhS9qsYd1oFQE6', 'student', student_id
FROM `students` WHERE `roll_no` = 'MCA26001'
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

INSERT INTO `users` (`username`, `password_hash`, `role`, `student_id`)
SELECT 'MCA26002', '$2y$10$zadQo9M3Ibu9cCxjlJ87qesyP/4BoWcDU.cCH8GNhS9qsYd1oFQE6', 'student', student_id
FROM `students` WHERE `roll_no` = 'MCA26002'
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

INSERT INTO `attendance` (`student_id`, `subject_id`, `classes_conducted`, `classes_attended`)
SELECT st.student_id, sub.subject_id,
       CASE sub.type WHEN 'Lab' THEN 24 ELSE 36 END,
       att.classes_attended
FROM `students` st
JOIN (
  SELECT 'MC501' code, 32 classes_attended UNION ALL
  SELECT 'MC502', 28 UNION ALL
  SELECT 'MC503', 27 UNION ALL
  SELECT 'MA501', 30 UNION ALL
  SELECT 'MC504', 24 UNION ALL
  SELECT 'MC501L', 20 UNION ALL
  SELECT 'MC502L', 14 UNION ALL
  SELECT 'MC504L', 20 UNION ALL
  SELECT 'AS501', 31
) att ON 1=1
JOIN `subjects` sub ON sub.subject_code = att.code
WHERE st.roll_no = 'MCA26001'
ON DUPLICATE KEY UPDATE `classes_attended` = VALUES(`classes_attended`), `classes_conducted` = VALUES(`classes_conducted`);

INSERT INTO `attendance` (`student_id`, `subject_id`, `classes_conducted`, `classes_attended`)
SELECT st.student_id, sub.subject_id,
       CASE sub.type WHEN 'Lab' THEN 24 ELSE 36 END,
       att.classes_attended
FROM `students` st
JOIN (
  SELECT 'MC501' code, 34 classes_attended UNION ALL
  SELECT 'MC502', 30 UNION ALL
  SELECT 'MC503', 29 UNION ALL
  SELECT 'MA501', 31 UNION ALL
  SELECT 'MC504', 26 UNION ALL
  SELECT 'MC501L', 22 UNION ALL
  SELECT 'MC502L', 18 UNION ALL
  SELECT 'MC504L', 22 UNION ALL
  SELECT 'AS501', 33
) att ON 1=1
JOIN `subjects` sub ON sub.subject_code = att.code
WHERE st.roll_no = 'MCA26002'
ON DUPLICATE KEY UPDATE `classes_attended` = VALUES(`classes_attended`), `classes_conducted` = VALUES(`classes_conducted`);

INSERT INTO `assignment_submissions` (`student_id`, `subject_id`, `submitted_count`)
SELECT st.student_id, sub.subject_id, a.done
FROM `students` st
JOIN (
  SELECT 'MC501' code, 3 done UNION ALL
  SELECT 'MC502', 2 UNION ALL
  SELECT 'MC503', 1 UNION ALL
  SELECT 'MA501', 2 UNION ALL
  SELECT 'MC504', 1
) a ON 1=1
JOIN `subjects` sub ON sub.subject_code = a.code
WHERE st.roll_no = 'MCA26001'
ON DUPLICATE KEY UPDATE `submitted_count` = VALUES(`submitted_count`);

INSERT INTO `upcoming_classes` (`class_date`, `subject_id`, `time_slot`, `session_type`, `venue`, `colour`)
SELECT '2026-10-09', subject_id, '9:00 AM – 11:00 AM', 'Lecture', 'LT-3', 'b' FROM `subjects` WHERE `subject_code` = 'MC502'
UNION ALL
SELECT '2026-10-12', subject_id, '1:00 PM – 3:00 PM', 'Tutorial', 'T-2', 'g' FROM `subjects` WHERE `subject_code` = 'MC503'
UNION ALL
SELECT '2026-10-14', subject_id, '10:00 AM – 12:00 PM', 'Lab', 'Lab-1', 'o' FROM `subjects` WHERE `subject_code` = 'MC501L'
ON DUPLICATE KEY UPDATE `time_slot` = VALUES(`time_slot`), `venue` = VALUES(`venue`);

INSERT INTO `exam_schedule` (`exam_date`, `subject_id`, `time_slot`, `venue`)
SELECT '2026-11-15', subject_id, '10:00 AM – 12:00 PM', 'LT-1' FROM `subjects` WHERE `subject_code` = 'MC501'
UNION ALL
SELECT '2026-11-16', subject_id, '10:00 AM – 12:00 PM', 'LT-1' FROM `subjects` WHERE `subject_code` = 'MC502'
UNION ALL
SELECT '2026-11-17', subject_id, '10:00 AM – 12:00 PM', 'LT-2' FROM `subjects` WHERE `subject_code` = 'MC503'
UNION ALL
SELECT '2026-11-17', subject_id, '2:00 PM – 4:00 PM',  'LT-2' FROM `subjects` WHERE `subject_code` = 'MA501'
UNION ALL
SELECT '2026-11-18', subject_id, '10:00 AM – 12:00 PM', 'LT-1' FROM `subjects` WHERE `subject_code` = 'MC504'
ON DUPLICATE KEY UPDATE `time_slot` = VALUES(`time_slot`), `venue` = VALUES(`venue`);

INSERT INTO `notices` (`title`, `description`, `category`, `notice_date`) VALUES
('Guest Lecture on Generative AI', 'Department of CSE is organizing a guest lecture on Generative AI by Dr. Ramesh Kumar, IIT Bombay. All MCA students are invited.', 'Event', '2026-10-05'),
('Mid-Semester Examination Schedule', 'The mid-semester examinations for Semester I (AY 2026-27) will be conducted from 15 Nov to 18 Nov 2026.', 'Examination', '2026-10-03'),
('Submission Guidelines for Lab Reports', 'Lab report submission guidelines for DS Lab, DBMS Lab and Web Technology Lab are now available.', 'Academic', '2026-10-01'),
('TechSprint 2026 – Inter-College Hackathon', 'Registration for TechSprint 2026 is now open. Form teams of 2–4 members. Last date to register: 20 Oct 2026.', 'Event', '2026-09-30'),
('Gandhi Jayanti Holiday', 'The institute will remain closed on 2 Oct 2026 on account of Gandhi Jayanti.', 'Holiday', '2026-09-28'),
('Important: MCA Program Meeting', 'All first year MCA students are required to attend the program orientation meeting on 6 Oct 2026 at 4:00 PM in the auditorium.', 'Other', '2026-09-25'),
('Placement Drive – TCS', 'Registrations are now open for TCS placement drive. Eligibility and registration details are available in the placement section.', 'Placement', '2026-09-22')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

INSERT INTO `marks` (`student_id`, `subject_id`, `exam_type`, `marks_obtained`, `max_marks`, `in_sem`)
SELECT st.student_id, sub.subject_id, 'In-Sem', m.in_sem, 20.00, m.in_sem
FROM `students` st
JOIN (
  SELECT 'MC501' code, 16 in_sem UNION ALL
  SELECT 'MC502', 18 UNION ALL
  SELECT 'MC503', 15 UNION ALL
  SELECT 'MA501', 17 UNION ALL
  SELECT 'MC504', 16 UNION ALL
  SELECT 'MC501L', 18 UNION ALL
  SELECT 'MC502L', 17 UNION ALL
  SELECT 'MC504L', 16 UNION ALL
  SELECT 'AS501', 18
) m ON 1=1
JOIN `subjects` sub ON sub.subject_code = m.code
WHERE st.roll_no = 'MCA26001'
ON DUPLICATE KEY UPDATE `marks_obtained` = VALUES(`marks_obtained`), `in_sem` = VALUES(`in_sem`);

INSERT INTO `marks` (`student_id`, `subject_id`, `exam_type`, `marks_obtained`, `max_marks`, `mid_sem`)
SELECT st.student_id, sub.subject_id, 'Mid-Sem', m.mid_sem, 30.00, m.mid_sem
FROM `students` st
JOIN (
  SELECT 'MC501' code, 24 mid_sem UNION ALL
  SELECT 'MC502', 26 UNION ALL
  SELECT 'MC503', 22 UNION ALL
  SELECT 'MA501', 25 UNION ALL
  SELECT 'MC504', 23
) m ON 1=1
JOIN `subjects` sub ON sub.subject_code = m.code
WHERE st.roll_no = 'MCA26001'
ON DUPLICATE KEY UPDATE `marks_obtained` = VALUES(`marks_obtained`), `mid_sem` = VALUES(`mid_sem`);

USE spit_portal;

SHOW TABLES;

SELECT COUNT(*) AS student_count FROM students;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS subject_count FROM subjects;
USE spit_portal;

SELECT
    a.attendance_id,
    s.roll_no,
    sub.subject_code,
    a.classes_conducted,
    a.classes_attended
FROM attendance a
JOIN students s ON a.student_id = s.student_id
JOIN subjects sub ON a.subject_id = sub.subject_id
WHERE s.roll_no = 'MCA260061'
  AND sub.subject_code = 'MC501';

UPDATE attendance a
JOIN students s ON a.student_id = s.student_id
JOIN subjects sub ON a.subject_id = sub.subject_id
SET
    a.classes_conducted = 36,
    a.classes_attended = 30
WHERE s.roll_no = 'MCA260061'
  AND sub.subject_code = 'MC501';
