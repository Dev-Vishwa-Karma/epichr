<?php
    header("Access-Control-Allow-Origin: *"); // Allow React app
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
    }
?>