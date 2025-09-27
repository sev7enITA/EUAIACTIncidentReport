<?php
/**
 * EU AI Act Incident Reporting Platform - Database Configuration
 * Created for: Fabrizio Degni
 * Version: 1.0.0
 * Date: September 2025
 */

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'ai_incident_reporting');
define('DB_USER', 'ai_incident_app');
define('DB_PASS', 'SecurePassword123!');
define('DB_CHARSET', 'utf8mb4');

// Application configuration
define('APP_NAME', 'EU AI Act Incident Reporting Platform');
define('APP_VERSION', '1.0.0');
define('ADMIN_EMAIL', 'admin@fabriziodegni.com');

// Security settings
define('MAX_UPLOAD_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_ORIGINS', ['https://yourdomain.com', 'http://localhost']);
define('SESSION_TIMEOUT', 3600); // 1 hour

// Error reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

class Database {
    private static $instance = null;
    private $pdo;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->pdo;
    }

    public function query($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Database query error: " . $e->getMessage());
            throw new Exception("Database operation failed");
        }
    }

    public function generateIncidentId() {
        $year = date('Y');
        $stmt = $this->query("SELECT COUNT(*) as count FROM incidents WHERE YEAR(date_created) = ?", [$year]);
        $result = $stmt->fetch();
        $sequence = str_pad($result['count'] + 1, 6, '0', STR_PAD_LEFT);
        return "INC-{$year}-{$sequence}";
    }
}

// Utility functions
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

function respondJson($data, $status = 200) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function logAuditTrail($incident_id, $action_type, $field_changed = null, $old_value = null, $new_value = null) {
    $db = Database::getInstance();
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

    $db->query(
        "INSERT INTO audit_trail (incident_id, action_type, field_changed, old_value, new_value, user_ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [$incident_id, $action_type, $field_changed, $old_value, $new_value, $ip, $user_agent]
    );
}
?>