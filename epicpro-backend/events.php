<?php
    /* header("Access-Control-Allow-Origin: *"); // Allow React app
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");   // Allow HTTP methods
    header("Access-Control-Allow-Headers: Content-Type");         // Allow headers like JSON content
    header("Access-Control-Allow-Credentials: true");
    
    include 'db_connection.php';

    // Set the header for JSON response
    header('Content-Type: application/json');
    
    // SQL query to get all dapartments
    $sql = "SELECT * FROM events";

    // Get the result
    $result = $conn->query($sql);

    if ($_SERVER["REQUEST_METHOD"] == "GET") {
        if ($result->num_rows > 0) {
            // Fetch all rows as an associative array
            $events = $result->fetch_all(MYSQLI_ASSOC);
            
            echo json_encode([
                'status' => 'success',
                'data'   => $events
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'No event data available to display.'
            ]);
        }
    } else {
        // Handle the case where the request method is not GET
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid request method. Only GET is allowed.'
        ]);
    } */
?>

<?php
header("Access-Control-Allow-Origin: *"); // Allow React app
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");   // Allow HTTP methods
header("Access-Control-Allow-Headers: Content-Type");         // Allow headers like JSON content
header("Access-Control-Allow-Credentials: true");

// Include the database connection
include 'db_connection.php';

// Set the header for JSON response
header('Content-Type: application/json');

// Helper function to send JSON response
function sendJsonResponse($status, $data = null, $message = null) {
    header('Content-Type: application/json');
    if ($status === 'success') {
        echo json_encode(['status' => 'success', 'data' => $data, 'message' => $message]);
    } else {
        echo json_encode(['status' => 'error', 'message' => $message]);
    }
    exit;
}

// SQL query to get all dapartments
$sql = "SELECT * FROM events";

$action = !empty($_GET['action']) ? $_GET['action'] : 'view';

if (isset($action)) {
    switch ($action) {
        case 'view':
            if (isset($_GET['id']) && is_numeric($_GET['id']) && $_GET['id'] > 0) {
                // Prepare SELECT statement with WHERE clause using parameter binding
                $stmt = $conn->prepare("SELECT * FROM events WHERE id = ?");
                $stmt->bind_param("i", $_GET['id']); // Bind the id as an integer
                if ($stmt->execute()) {
                    $result = $stmt->get_result();
                    if ($result) {
                        $events = $result->fetch_all(MYSQLI_ASSOC);
                        sendJsonResponse('success', $events, null);
                    } else {
                        sendJsonResponse('error', null, "No leaves found : $conn->error");
                    }
                } else {
                    sendJsonResponse('error', null, "Failed to execute query : $stmt->error");
                }
            } else {
                // $result = $conn->query("SELECT * FROM employee_leaves");
                $result = $conn->query("SELECT * FROM events");
                if ($result) {
                    $events = $result->fetch_all(MYSQLI_ASSOC);
                    sendJsonResponse('success', $events);
                } else {
                    sendJsonResponse('error', null, "No records found $conn->error");
                }
            }
            break;

        case 'add':
            // Get form data
            $employee_id = isset($_POST['employee_id']) ? $_POST['employee_id'] : null;
            // $employee_id = 6;
            $event_name = $_POST['event_name'];
            $event_date = $_POST['event_date'];
            $event_type = $_POST['event_type'];

            // Validate the data (you can add additional validation as needed)
            if (empty($employee_id) || empty($event_name) || empty($event_date) || empty($event_type)) {
                sendJsonResponse('error', null, "All fields are required");
                exit;
            }

            // Prepare the insert query
            $stmt = $conn->prepare("INSERT INTO events (employee_id, event_name, event_date, event_type) VALUES (?, ?, ?, ?)");
            
            // Bind the parameters
            $stmt->bind_param("isss", $employee_id, $event_name, $event_date, $event_type);

            // Execute the query
            if ($stmt->execute()) {
                $id = $conn->insert_id;

                $addEventData = [
                    'id' => $id,
                    'employee_id' => $employee_id,
                    'event_name' => $event_name,
                    'event_date' => $event_date,  
                    'event_type' => $event_type
                ];
                // If successful, send success response
                sendJsonResponse('success', $addEventData, "Event added successfully");
            } else {
                sendJsonResponse('error', null, "Failed to add Event $stmt->error");
            }
            break;

        case 'edit':
            if (isset($_GET['event_id']) && is_numeric($_GET['event_id']) && $_GET['event_id'] > 0) {
                $id = $_GET['event_id'];
                // Validate and get POST data
                $employee_id = isset($_POST['employee_id']) ? $_POST['employee_id'] : null;
                $event_name = $_POST['event_name'];
                $event_date = $_POST['event_date'];
                $event_type = $_POST['event_type'];
                $updated_at = date('Y-m-d H:i:s'); // Set current timestamp for `updated_at`

                // Prepare the SQL update statement
                $stmt = $conn->prepare("UPDATE events SET employee_id = ?, event_name = ?, event_date = ?, event_type = ?, updated_at = ? WHERE id = ?");
                $stmt->bind_param("issssi", $employee_id, $event_name, $event_date, $event_type, $updated_at, $id);
    
                // Execute the statement and check for success
                if ($stmt->execute()) {

                    $updatedEventData = [
                        'id' => $id,
                        'employee_id' => $employee_id,
                        'event_name' => $event_name,
                        'event_date' => $event_date,
                        'event_type' => $event_type,
                        'updated_at' => $updated_at
                    ];
                    sendJsonResponse('success', $updatedEventData, 'Event updated successfully');
                } else {
                    sendJsonResponse('error', null, 'Failed to update event');
                }
                exit;
            } else {
                http_response_code(400);
                sendJsonResponse('error', null, 'Invalid Event ID');
                exit;
            }
            break;

        case 'delete':
            if (isset($_GET['event_id']) && is_numeric($_GET['event_id']) && $_GET['event_id'] > 0) {
                // Prepare DELETE statement
                $stmt = $conn->prepare("DELETE FROM events WHERE id = ?");
                $stmt->bind_param('i', $_GET['event_id']);
                if ($stmt->execute()) {
                    sendJsonResponse('success', null, 'Holiday deleted successfully');
                } else {
                    http_response_code(500);
                    sendJsonResponse('error', null, 'Failed to delete holiday');
                }
                exit;
            } else {
                http_response_code(400);
                sendJsonResponse('error', null, 'Invalid holiday ID');
                exit;
            }
            break;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
            exit;
    }
}

// Close the connection
$conn->close();
?>
