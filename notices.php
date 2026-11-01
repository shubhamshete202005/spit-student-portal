<?php


declare(strict_types=1);

require_once __DIR__ . '/session.php';

require_login();

$category = trim((string)($_GET['category'] ?? 'All'));
$query = trim((string)($_GET['q'] ?? ''));

try {
    $conn = db_connect();

    $sql = 'SELECT notice_id, title, description, category, notice_date FROM notices WHERE 1=1';
    $params = [];
    $types = '';

    if ($category !== '' && $category !== 'All') {
        $sql .= ' AND category = ?';
        $params[] = $category;
        $types .= 's';
    }

    if ($query !== '') {
        $sql .= ' AND (title LIKE ? OR description LIKE ?)';
        $searchTerm = '%' . $query . '%';
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= 'ss';
    }

    $sql .= ' ORDER BY notice_date DESC';

    $stmt = $conn->prepare($sql);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $notices = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    send_json([
        'ok'      => true,
        'count'   => count($notices),
        'notices' => $notices
    ]);
} catch (Throwable $e) {
    error_log('notices.php error: ' . $e->getMessage());
    send_error('Error retrieving notices.', 500);
}
