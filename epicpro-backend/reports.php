<?php
header("Access-Control-Allow-Origin: *");  // Temporarily allow all origins for development
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");  // Allow HTTP methods
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With"); // Allow specific headers

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
                $stmt_reports = $conn->prepare("
                SELECT
                    e.code,
                    CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
                    DATE(a.punch_in_time) AS attendance_date,
                    a.punch_in_time,
                    a.punch_out_time,
                    CONCAT(
                        FLOOR(TIMESTAMPDIFF(SECOND, a.punch_in_time, IFNULL(a.punch_out_time, NOW())) / 3600), 
                        ' hour(s) ', 
                        FLOOR((TIMESTAMPDIFF(SECOND, a.punch_in_time, IFNULL(a.punch_out_time, NOW())) % 3600) / 60), 
                        ' minute(s)'
                    ) AS total_hours_worked,
                    CASE
                        WHEN a.punch_out_time IS NULL THEN 'Present'
                        ELSE 'Completed'
                    END AS attendance_status,
                    a.report
                FROM
                    employees e
                JOIN
                    employee_attendance a ON e.id = a.employee_id
                WHERE a.employee_id = ?
                ORDER BY
                    a.punch_in_time DESC
            ");
                $stmt_reports->bind_param('i', $_GET['user_id']);
                $stmt_reports->execute();
                $result = $stmt_reports->get_result();

                if ($result->num_rows > 0) {
                    $reports = $result->fetch_all(MYSQLI_ASSOC);
                    sendJsonResponse('success', $reports);
                } else {
                    sendJsonResponse('error', null, 'No reports found');
                }
            } else {
                // If no user_id provided, fetch all users
                $stmt_reports = $conn->prepare("
                SELECT
                    e.code,
                    CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
                    DATE(a.punch_in_time) AS attendance_date,
                    a.punch_in_time,
                    a.punch_out_time,
                    CONCAT(
                        FLOOR(TIMESTAMPDIFF(SECOND, a.punch_in_time, IFNULL(a.punch_out_time, NOW())) / 3600), 
                        ' hour(s) ', 
                        FLOOR((TIMESTAMPDIFF(SECOND, a.punch_in_time, IFNULL(a.punch_out_time, NOW())) % 3600) / 60), 
                        ' minute(s)'
                    ) AS total_hours_worked,
                    CASE
                        WHEN a.punch_out_time IS NULL THEN 'Present'
                        ELSE 'Completed'
                    END AS attendance_status,
                    a.report
                FROM
                    employees e
                JOIN
                    employee_attendance a ON e.id = a.employee_id
                ORDER BY
                    a.punch_in_time DESC
            ");
                $stmt_reports->execute();
                $result = $stmt_reports->get_result();

                if ($result->num_rows > 0) {
                    $reports = $result->fetch_all(MYSQLI_ASSOC);
                    sendJsonResponse('success', $reports);
                } else {
                    sendJsonResponse('error', null, 'No reports found');
                }
            }
            break;

        case 'add':
            // Capture POST data
            $employee_id = $_POST['employee_id'] ?? null;
            $punch_status = $_POST['punch_status'] ?? null;
            $punch_out_report = $_POST['punch_out_report'] ?? null;
            date_default_timezone_set('Asia/Kolkata');

            /** Validate */
            if (!$employee_id || !$punch_status) {
                sendJsonResponse('error', null, 'Please provide all required fields');
            }

            if ($punch_status == 'active') {
                $punch_in_time = date('Y-m-d H:i:s');

                // Check if the employee already has an active break
                $stmt = $conn->prepare("SELECT * FROM employee_attendance WHERE employee_id = ? AND status = 'active' LIMIT 1");
                $stmt->bind_param("i", $employee_id);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    sendJsonResponse('error', null, 'This employee is already punched in.');
                }

                $stmt = $conn->prepare("INSERT INTO employee_attendance (employee_id, punch_in_time, status) VALUES (?, ?, ?)");
                $stmt->bind_param('sss', $employee_id, $punch_in_time, $punch_status);
                if (!$stmt->execute()) {
                    sendJsonResponse('error', null, "Something went wrong while adding the punch details. Please try again.");
                }
                $employee_attendance_id = $stmt->insert_id;
                sendJsonResponse('success', ['user_id' => $employee_attendance_id], 'Punch-in recorded successfully!');
            } elseif ($punch_status == 'completed') {
                $punch_out_time = date('Y-m-d H:i:s');

                // For Break Out, check if there's an active break first
                $stmt = $conn->prepare("SELECT * FROM employee_attendance WHERE employee_id = ? AND status = 'active' LIMIT 1");
                $stmt->bind_param('i', $employee_id);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    // If there's an active punch, record the punch out time
                    $currentTime = date('Y-m-d H:i:s');
                    $updateStmt = $conn->prepare("UPDATE employee_attendance SET punch_out_time = ?, report = ?, status = 'completed' WHERE employee_id = ? AND status = 'active'");
                    $updateStmt->bind_param('ssi', $currentTime, $punch_out_report, $employee_id);
                    $updateStmt->execute();
                    // Respond with success
                    sendJsonResponse('success', null, 'Punch-out completed successfully!');
                } else {
                    // No active punch found
                    sendJsonResponse('error', null, 'No active punch-in record found for this employee.');
                }
            } else {
                // Respond with error if the user is not an admin
                sendJsonResponse('error', null, 'You do not have the required permissions to perform this action');
            }

            break;

        case 'get_punch_status':
            if (isset($_GET['user_id']) && is_numeric($_GET['user_id']) && $_GET['user_id'] > 0) {

                $stmt = $conn->prepare("SELECT * FROM employee_attendance WHERE employee_id = ? AND status = 'active' LIMIT 1");
                $stmt->bind_param("i", $_GET['user_id']);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    sendJsonResponse('success', null, 'This employee is already punched in.');
                } else {
                    sendJsonResponse('error', null, 'This employee is not punched in.');
                }
            }
            break;


        default:
            sendJsonResponse('error', null, 'Invalid action');
            break;
    }
} else {
    sendJsonResponse('error', null, 'Action parameter is missing');
}
