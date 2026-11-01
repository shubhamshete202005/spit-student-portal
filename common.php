<?php


declare(strict_types=1);

require_once __DIR__ . '/config.php';

// Turn off display_errors for API endpoints so PHP warnings never corrupt JSON payloads
ini_set('display_errors', '0');
error_reporting(E_ALL);


function send_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Send a standardized JSON error message and exit cleanly.
 */
function send_error(string $message, int $statusCode = 400, array $extra = []): void
{
    $response = array_merge(['ok' => false, 'error' => $message], $extra);
    send_json($response, $statusCode);
}

/**
 * Safely parse incoming JSON request body.
 */
function json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $_POST;
}

/**
 * Demo grading rule threshold (configurable):
 * Marks >= 40% is Pass, < 40% is Fail.
 */
function calculate_grade_status(float $marksObtained, float $maxMarks): array
{
    if ($maxMarks <= 0) {
        return ['percentage' => 0.0, 'status' => 'Pending', 'passed' => false];
    }
    $percentage = round(($marksObtained / $maxMarks) * 100, 2);
    $passed = ($percentage >= 40.0);
    return [
        'percentage' => $percentage,
        'status' => $passed ? 'Passed' : 'Failed',
        'passed' => $passed
    ];
}
