<?php
header("Access-Control-Allow-Origin: *");  // Temporarily allow all origins for development
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");  // Allow HTTP methods
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With"); // Allow specific headers
header("Access-Control-Allow-Headers: Content-Type, Authorization, ngrok-skip-browser-warning");

// Handle preflight (OPTIONS) requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Respond with 200 status code for OPTIONS requests
    header("HTTP/1.1 200 OK");
    exit();
}

// Include the database connection
include 'db_connection.php';

// Helper function to send JSON response
function sendJsonResponse($status, $data = null, $message = null)
{
    header('Content-Type: application/json');
    if ($status === 'success') {
        echo json_encode(['status' => 'success', 'data' => $data, 'message' => $message]);
    } else {
        echo json_encode(['status' => 'error', 'message' => $message]);
    }
    exit;
}

// Helper function to validate user ID
function validateId($id)
{
    return isset($id) && is_numeric($id) && $id > 0;
}

$action = !empty($_GET['action']) ? $_GET['action'] : 'view';

// Main action handler
if (isset($action)) {
    switch ($action) {
        case 'view':
            if (isset($_GET['user_id']) && is_numeric($_GET['user_id']) && $_GET['user_id'] > 0) {
                // Fetch employee activities
                $stmt_activities = $conn->prepare("
                SELECT 
                e.id AS employee_id,
                e.first_name AS first_name,
                e.last_name AS last_name,
                e.address_line1 AS location,
                CASE 
                WHEN DATE(ea.break_in_time) = CURDATE() 
                    THEN CONCAT(DATE_FORMAT(ea.break_in_time, '%H:%i'), ' - Today')
                WHEN DATE(ea.break_in_time) = CURDATE() - INTERVAL 1 DAY 
                    THEN CONCAT(DATE_FORMAT(ea.break_in_time, '%H:%i'), ' - Yesterday')
                ELSE DATE_FORMAT(ea.break_in_time, '%d-%M-%Y %h:%i %p')
                END AS formatted_date,
                ea.break_reason,
                'Break In' AS break_status,
                ea.break_in_time AS activity_time
            FROM employee_activitys ea
            JOIN employees e ON ea.employee_id = e.id
            WHERE ea.employee_id = ?

            UNION ALL

            SELECT 
                e.id AS employee_id,
                e.first_name AS first_name,
                e.last_name AS last_name,
                e.address_line1 AS location,
                CASE 
                WHEN DATE(ea.break_out_time) = CURDATE() 
                    THEN CONCAT(DATE_FORMAT(ea.break_out_time, '%H:%i'), ' - Today')
                WHEN DATE(ea.break_out_time) = CURDATE() - INTERVAL 1 DAY 
                    THEN CONCAT(DATE_FORMAT(ea.break_out_time, '%H:%i'), ' - Yesterday')
                ELSE DATE_FORMAT(ea.break_out_time, '%d-%M-%Y %h:%i %p')
                END AS formatted_date,
                NULL AS break_reason,
                'Break Out' AS break_status,
                ea.break_out_time AS activity_time
            FROM employee_activitys ea
            JOIN employees e ON ea.employee_id = e.id
            WHERE ea.employee_id = ? AND ea.break_out_time IS NOT NULL

            ORDER BY activity_time DESC
            ");
                $stmt_activities->bind_param('ii', $_GET['user_id'], $_GET['user_id']);
                $stmt_activities->execute();
                $result = $stmt_activities->get_result();

                if ($result->num_rows > 0) {
                    $activities = $result->fetch_all(MYSQLI_ASSOC);
                    sendJsonResponse('success', $activities);
                } else {
                    sendJsonResponse('error', null, 'No activities found');
                }
            } else {
                // If no user_id provided, fetch all users
                $stmt_activities = $conn->prepare("
                SELECT 
                e.id AS employee_id,
                e.first_name AS first_name,
                e.last_name AS last_name,
                e.address_line1 AS location,
                CASE 
                WHEN DATE(ea.break_in_time) = CURDATE() 
                    THEN CONCAT(DATE_FORMAT(ea.break_in_time, '%H:%i'), ' - Today')
                WHEN DATE(ea.break_in_time) = CURDATE() - INTERVAL 1 DAY 
                    THEN CONCAT(DATE_FORMAT(ea.break_in_time, '%H:%i'), ' - Yesterday')
                ELSE DATE_FORMAT(ea.break_in_time, '%d-%M-%Y %h:%i %p')
                END AS formatted_date,
                ea.break_reason,
                'Break In' AS break_status,
                ea.break_in_time AS activity_time
            FROM employee_activitys ea
            JOIN employees e ON ea.employee_id = e.id

            UNION ALL

            SELECT 
                e.id AS employee_id,
                e.first_name AS first_name,
                e.last_name AS last_name,
                e.address_line1 AS location,
                CASE 
                WHEN DATE(ea.break_out_time) = CURDATE() 
                    THEN CONCAT(DATE_FORMAT(ea.break_out_time, '%H:%i'), ' - Today')
                WHEN DATE(ea.break_out_time) = CURDATE() - INTERVAL 1 DAY 
                    THEN CONCAT(DATE_FORMAT(ea.break_out_time, '%H:%i'), ' - Yesterday')
                ELSE DATE_FORMAT(ea.break_out_time, '%d-%M-%Y %h:%i %p')
                END AS formatted_date,
                NULL AS break_reason,
                'Break Out' AS break_status,
                ea.break_out_time AS activity_time
            FROM employee_activitys ea
            JOIN employees e ON ea.employee_id = e.id
            WHERE ea.break_out_time IS NOT NULL

            ORDER BY activity_time DESC
            ");
                $stmt_activities->execute();
                $result = $stmt_activities->get_result();

                if ($result->num_rows > 0) {
                    $activities = $result->fetch_all(MYSQLI_ASSOC);
                    sendJsonResponse('success', $activities);
                } else {
                    sendJsonResponse('error', null, 'No activities found');
                }
            }
            break;

        case 'add':
            // Capture POST data
            $employee_id = $_POST['employee_id'] ?? null;
            $break_status = $_POST['break_status'] ?? null;
            $break_reason = $_POST['break_reason'] ?? null;
            date_default_timezone_set('Asia/Kolkata');

            /** Validate */
            if (!$employee_id || !$break_status) {
                sendJsonResponse('error', null, 'Please provide all required fields');
            }

            if ($break_status == 'active') {
                $break_in_time = date('Y-m-d H:i:s');

                // Check if the employee already has an active break
                $stmt = $conn->prepare("SELECT * FROM employee_activitys WHERE employee_id = ? AND status = 'active' LIMIT 1");
                $stmt->bind_param("i", $employee_id);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    sendJsonResponse('error', null, 'This employee is already on an active break');
                }

                $stmt = $conn->prepare("INSERT INTO employee_activitys (employee_id, break_in_time, break_reason, status) VALUES (?, ?, ?, ?)");
                $stmt->bind_param('ssss', $employee_id, $break_in_time, $break_reason, $break_status);
                if (!$stmt->execute()) {
                    sendJsonResponse('error', null, "Something went wrong while adding the break details. Please try again.");
                }
                $employee_activity_id = $stmt->insert_id;
                sendJsonResponse('success', ['user_id' => $employee_activity_id], 'Break has been successfully added!');
            } 
            elseif ($break_status == 'completed') {
                $break_out_time = date('Y-m-d H:i:s');

                // For Break Out, check if there's an active break first
                $stmt = $conn->prepare("SELECT * FROM employee_activitys WHERE employee_id = ? AND status = 'active' LIMIT 1");
                $stmt->bind_param('i', $employee_id);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    // If there's an active break, record the break out time
                    $currentTime = date('Y-m-d H:i:s');
                    $updateStmt = $conn->prepare("UPDATE employee_activitys SET break_out_time = ?, status = 'completed' WHERE employee_id = ? AND status = 'active'");
                    $updateStmt->bind_param('si', $currentTime, $employee_id);
                    $updateStmt->execute();
                    // Respond with success
                    sendJsonResponse('success', null, 'Break has been successfully completed!');
                } else {
                    // No active break found
                    sendJsonResponse('error', null, 'No active break is currently recorded for this employee.');
                }
            } else {
                // Respond with error if the user is not an admin
                sendJsonResponse('error', null, 'You do not have the required permissions to perform this action');
            }
            break;

        default:
            sendJsonResponse('error', null, 'Invalid action');
            break;
    }
} else {
    sendJsonResponse('error', null, 'Action parameter is missing');
}
