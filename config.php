<?php
declare(strict_types=1);

// Never commit database credentials. For local development, create api/config.local.php
// from api/config.local.php.example and enter your own local database settings there.
$localConfig = __DIR__ . '/config.local.php';
if (is_file($localConfig)) {
    require_once $localConfig;
}

// Environment variables can be used instead of a local config file.
if (!defined('DB_HOST')) define('DB_HOST', getenv('SPIT_DB_HOST') ?: '127.0.0.1');
if (!defined('DB_PORT')) define('DB_PORT', (int)(getenv('SPIT_DB_PORT') ?: 3306));
if (!defined('DB_USER')) define('DB_USER', getenv('SPIT_DB_USER') ?: 'root');
if (!defined('DB_PASS')) define('DB_PASS', getenv('SPIT_DB_PASS') ?: '');
if (!defined('DB_NAME')) define('DB_NAME', getenv('SPIT_DB_NAME') ?: 'spit_portal');

function db_connect(): mysqli
{
    static $conn = null;
    if ($conn instanceof mysqli && @$conn->ping()) {
        return $conn;
    }

    mysqli_report(MYSQLI_REPORT_OFF);
    $conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

    if ($conn->connect_error) {
        error_log('Database connection error [' . $conn->connect_errno . ']: ' . $conn->connect_error);
        throw new RuntimeException('Database service is currently unavailable. Check local database configuration and ensure MySQL is running.');
    }

    if (!$conn->set_charset('utf8mb4')) {
        error_log('Failed setting utf8mb4 charset: ' . $conn->error);
    }
    return $conn;
}
