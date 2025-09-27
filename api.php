<?php
/**
 * EU AI Act Incident Reporting Platform - API Endpoints
 * Created for: Fabrizio Degni
 */

require_once 'config.php';

// Handle CORS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}

class IncidentAPI {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $path = trim($path, '/');
        $segments = explode('/', $path);

        try {
            switch ($method) {
                case 'GET':
                    $this->handleGet($segments);
                    break;
                case 'POST':
                    $this->handlePost($segments);
                    break;
                case 'PUT':
                    $this->handlePut($segments);
                    break;
                case 'DELETE':
                    $this->handleDelete($segments);
                    break;
                default:
                    respondJson(['error' => 'Method not allowed'], 405);
            }
        } catch (Exception $e) {
            respondJson(['error' => $e->getMessage()], 500);
        }
    }

    private function handleGet($segments) {
        $endpoint = $segments[1] ?? '';

        switch ($endpoint) {
            case 'incidents':
                $this->getIncidents();
                break;
            case 'incident':
                $incident_id = $segments[2] ?? '';
                if (empty($incident_id)) {
                    respondJson(['error' => 'Incident ID required'], 400);
                }
                $this->getIncident($incident_id);
                break;
            case 'statistics':
                $this->getStatistics();
                break;
            default:
                respondJson(['error' => 'Endpoint not found'], 404);
        }
    }

    private function handlePost($segments) {
        $endpoint = $segments[1] ?? '';
        $data = json_decode(file_get_contents('php://input'), true);

        switch ($endpoint) {
            case 'incident':
                $this->createIncident($data);
                break;
            case 'submit':
                $incident_id = $data['incident_id'] ?? '';
                if (empty($incident_id)) {
                    respondJson(['error' => 'Incident ID required'], 400);
                }
                $this->submitIncident($incident_id);
                break;
            default:
                respondJson(['error' => 'Endpoint not found'], 404);
        }
    }

    private function handlePut($segments) {
        $endpoint = $segments[1] ?? '';
        $data = json_decode(file_get_contents('php://input'), true);

        switch ($endpoint) {
            case 'incident':
                $incident_id = $segments[2] ?? '';
                if (empty($incident_id)) {
                    respondJson(['error' => 'Incident ID required'], 400);
                }
                $this->updateIncident($incident_id, $data);
                break;
            case 'status':
                $incident_id = $segments[2] ?? '';
                $new_status = $data['status'] ?? '';
                if (empty($incident_id) || empty($new_status)) {
                    respondJson(['error' => 'Incident ID and status required'], 400);
                }
                $this->updateStatus($incident_id, $new_status, $data['notes'] ?? '');
                break;
            default:
                respondJson(['error' => 'Endpoint not found'], 404);
        }
    }

    private function getIncidents() {
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 25);
        $status = $_GET['status'] ?? '';
        $classification = $_GET['classification'] ?? '';

        $offset = ($page - 1) * $limit;

        $where_conditions = [];
        $params = [];

        if (!empty($status)) {
            $where_conditions[] = "i.status = ?";
            $params[] = $status;
        }

        if (!empty($classification)) {
            $where_conditions[] = "FIND_IN_SET(?, ai.incident_classification)";
            $params[] = $classification;
        }

        $where_clause = !empty($where_conditions) ? "WHERE " . implode(" AND ", $where_conditions) : "";

        $sql = "SELECT i.incident_id, i.reference_number, i.status, i.date_created, i.date_submitted,
                       ai.market_surveillance_authority_name, ai.incident_classification, ai.report_type,
                       ais.system_name, id.estimated_users_affected,
                       pc.organization_name as provider_name
                FROM incidents i
                LEFT JOIN administrative_info ai ON i.incident_id = ai.incident_id
                LEFT JOIN ai_system_info ais ON i.incident_id = ais.incident_id
                LEFT JOIN incident_details id ON i.incident_id = id.incident_id
                LEFT JOIN contacts pc ON i.incident_id = pc.incident_id AND pc.contact_type = 'provider'
                $where_clause
                ORDER BY i.date_created DESC
                LIMIT ? OFFSET ?";

        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->db->query($sql, $params);
        $incidents = $stmt->fetchAll();

        // Get total count
        $count_sql = "SELECT COUNT(*) as total FROM incidents i 
                     LEFT JOIN administrative_info ai ON i.incident_id = ai.incident_id 
                     $where_clause";
        $count_params = array_slice($params, 0, -2); // Remove limit and offset
        $count_stmt = $this->db->query($count_sql, $count_params);
        $total = $count_stmt->fetch()['total'];

        respondJson([
            'incidents' => $incidents,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    private function getIncident($incident_id) {
        // Get main incident data
        $incident_sql = "SELECT * FROM incidents WHERE incident_id = ?";
        $stmt = $this->db->query($incident_sql, [$incident_id]);
        $incident = $stmt->fetch();

        if (!$incident) {
            respondJson(['error' => 'Incident not found'], 404);
        }

        // Get related data
        $admin_info = $this->db->query("SELECT * FROM administrative_info WHERE incident_id = ?", [$incident_id])->fetch();
        $ai_system = $this->db->query("SELECT * FROM ai_system_info WHERE incident_id = ?", [$incident_id])->fetch();
        $incident_details = $this->db->query("SELECT * FROM incident_details WHERE incident_id = ?", [$incident_id])->fetch();
        $provider_analysis = $this->db->query("SELECT * FROM provider_analysis WHERE incident_id = ?", [$incident_id])->fetch();
        $general_comments = $this->db->query("SELECT * FROM general_comments WHERE incident_id = ?", [$incident_id])->fetch();

        // Get contacts
        $contacts = $this->db->query("SELECT * FROM contacts WHERE incident_id = ?", [$incident_id])->fetchAll();
        $contacts_by_type = [];
        foreach ($contacts as $contact) {
            $contacts_by_type[$contact['contact_type']] = $contact;
        }

        // Get authority actions
        $actions = $this->db->query("SELECT * FROM authority_actions WHERE incident_id = ? ORDER BY action_date DESC", [$incident_id])->fetchAll();

        respondJson([
            'incident' => $incident,
            'administrative_info' => $admin_info,
            'ai_system_info' => $ai_system,
            'incident_details' => $incident_details,
            'provider_analysis' => $provider_analysis,
            'general_comments' => $general_comments,
            'contacts' => $contacts_by_type,
            'authority_actions' => $actions
        ]);
    }

    private function createIncident($data) {
        if (empty($data)) {
            respondJson(['error' => 'No data provided'], 400);
        }

        $incident_id = $this->db->generateIncidentId();

        try {
            $this->db->getConnection()->beginTransaction();

            // Create main incident record
            $this->db->query(
                "INSERT INTO incidents (incident_id, status, created_by_ip) VALUES (?, 'draft', ?)",
                [$incident_id, $_SERVER['REMOTE_ADDR'] ?? 'unknown']
            );

            // Save form data to appropriate tables
            $this->saveFormData($incident_id, $data);

            // Log audit trail
            logAuditTrail($incident_id, 'create');

            $this->db->getConnection()->commit();

            respondJson(['incident_id' => $incident_id, 'message' => 'Incident created successfully']);

        } catch (Exception $e) {
            $this->db->getConnection()->rollBack();
            throw $e;
        }
    }

    private function updateIncident($incident_id, $data) {
        try {
            $this->db->getConnection()->beginTransaction();

            // Update incident timestamp
            $this->db->query(
                "UPDATE incidents SET date_last_modified = CURRENT_TIMESTAMP WHERE incident_id = ?",
                [$incident_id]
            );

            // Save form data
            $this->saveFormData($incident_id, $data, true);

            // Log audit trail
            logAuditTrail($incident_id, 'update');

            $this->db->getConnection()->commit();

            respondJson(['message' => 'Incident updated successfully']);

        } catch (Exception $e) {
            $this->db->getConnection()->rollBack();
            throw $e;
        }
    }

    private function submitIncident($incident_id) {
        try {
            $this->db->getConnection()->beginTransaction();

            // Update status to submitted
            $this->db->query(
                "UPDATE incidents SET status = 'submitted', date_submitted = CURRENT_TIMESTAMP WHERE incident_id = ?",
                [$incident_id]
            );

            // Log audit trail
            logAuditTrail($incident_id, 'submit', 'status', 'draft', 'submitted');

            $this->db->getConnection()->commit();

            respondJson(['message' => 'Incident submitted successfully']);

        } catch (Exception $e) {
            $this->db->getConnection()->rollBack();
            throw $e;
        }
    }

    private function updateStatus($incident_id, $new_status, $notes) {
        try {
            $this->db->getConnection()->beginTransaction();

            // Get current status
            $current = $this->db->query("SELECT status FROM incidents WHERE incident_id = ?", [$incident_id])->fetch();

            if (!$current) {
                respondJson(['error' => 'Incident not found'], 404);
            }

            // Update status
            $this->db->query(
                "UPDATE incidents SET status = ? WHERE incident_id = ?",
                [$new_status, $incident_id]
            );

            // Add authority action
            $this->db->query(
                "INSERT INTO authority_actions (incident_id, action_type, action_description, status_changed_to) VALUES (?, 'status_change', ?, ?)",
                [$incident_id, $notes, $new_status]
            );

            // Log audit trail
            logAuditTrail($incident_id, 'status_change', 'status', $current['status'], $new_status);

            $this->db->getConnection()->commit();

            respondJson(['message' => 'Status updated successfully']);

        } catch (Exception $e) {
            $this->db->getConnection()->rollBack();
            throw $e;
        }
    }

    private function getStatistics() {
        $stats_sql = "SELECT 
            COUNT(*) as total_incidents,
            COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_count,
            COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review_count,
            COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_count,
            COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count
        FROM incidents";

        $stmt = $this->db->query($stats_sql);
        $stats = $stmt->fetch();

        // Get classification breakdown
        $class_sql = "SELECT ai.incident_classification, COUNT(*) as count
                     FROM incidents i
                     JOIN administrative_info ai ON i.incident_id = ai.incident_id
                     WHERE i.status != 'draft'
                     GROUP BY ai.incident_classification";

        $class_stmt = $this->db->query($class_sql);
        $classifications = $class_stmt->fetchAll();

        respondJson([
            'overall' => $stats,
            'by_classification' => $classifications
        ]);
    }

    private function saveFormData($incident_id, $data, $is_update = false) {
        // Administrative info
        if (isset($data['administrative_info'])) {
            $admin_data = $data['administrative_info'];

            if ($is_update) {
                // Update existing record
                $sql = "UPDATE administrative_info SET 
                       market_surveillance_authority_name = ?, authority_reference_number = ?,
                       date_report_submission = ?, date_incident_from = ?, date_incident_to = ?,
                       date_time_detection = ?, manufacturer_awareness_date = ?, report_type = ?,
                       expected_next_report_date = ?, incident_classification = ?, submitter_type = ?,
                       other_submitter_description = ?, incident_already_reported_to = ?, under_regulation_law = ?
                       WHERE incident_id = ?";
                $params = [
                    $admin_data['market_surveillance_authority_name'] ?? null,
                    $admin_data['authority_reference_number'] ?? null,
                    $admin_data['date_report_submission'] ?? null,
                    $admin_data['date_incident_from'] ?? null,
                    $admin_data['date_incident_to'] ?? null,
                    $admin_data['date_time_detection'] ?? null,
                    $admin_data['manufacturer_awareness_date'] ?? null,
                    $admin_data['report_type'] ?? null,
                    $admin_data['expected_next_report_date'] ?? null,
                    is_array($admin_data['incident_classification']) ? implode(',', $admin_data['incident_classification']) : $admin_data['incident_classification'],
                    $admin_data['submitter_type'] ?? null,
                    $admin_data['other_submitter_description'] ?? null,
                    $admin_data['incident_already_reported_to'] ?? null,
                    $admin_data['under_regulation_law'] ?? null,
                    $incident_id
                ];
            } else {
                // Insert new record
                $sql = "INSERT INTO administrative_info (
                       incident_id, market_surveillance_authority_name, authority_reference_number,
                       date_report_submission, date_incident_from, date_incident_to, date_time_detection,
                       manufacturer_awareness_date, report_type, expected_next_report_date,
                       incident_classification, submitter_type, other_submitter_description,
                       incident_already_reported_to, under_regulation_law
                       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $params = [
                    $incident_id,
                    $admin_data['market_surveillance_authority_name'] ?? null,
                    $admin_data['authority_reference_number'] ?? null,
                    $admin_data['date_report_submission'] ?? null,
                    $admin_data['date_incident_from'] ?? null,
                    $admin_data['date_incident_to'] ?? null,
                    $admin_data['date_time_detection'] ?? null,
                    $admin_data['manufacturer_awareness_date'] ?? null,
                    $admin_data['report_type'] ?? null,
                    $admin_data['expected_next_report_date'] ?? null,
                    is_array($admin_data['incident_classification']) ? implode(',', $admin_data['incident_classification']) : $admin_data['incident_classification'],
                    $admin_data['submitter_type'] ?? null,
                    $admin_data['other_submitter_description'] ?? null,
                    $admin_data['incident_already_reported_to'] ?? null,
                    $admin_data['under_regulation_law'] ?? null
                ];
            }

            $this->db->query($sql, $params);
        }

        // Similar implementations for other data sections...
        // AI System Info, Contacts, Incident Details, Provider Analysis, General Comments
        // (Implementation continues with similar patterns for other tables)
    }
}

// Initialize and handle the request
$api = new IncidentAPI();
$api->handleRequest();
?>