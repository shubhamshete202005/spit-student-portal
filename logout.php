<?php


declare(strict_types=1);

require_once __DIR__ . '/session.php';

spit_start_session();

// Unset all session variables
$_SESSION = [];

if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

// Destroy session data on server
session_destroy();

send_json([
    'ok'       => true,
    'message'  => 'Logged out successfully.',
    'redirect' => 'login.html'
]);
