<?php
// Database configuration
$host = "localhost";         // Database host (e.g., localhost)
$username = "root";          // Database username
$password = "";          // Database password
$database = "epic_hr";       // Name of your database



// $host = "mysql-2a70dfa1-testing-3bf5.c.aivencloud.com";         // Database host (e.g., localhost)
// $username = "avnadmin";          // Database username
// $port = "23092";
// $password = "AVNS_pcv08lfN9iuFrr1ofKU";          // Database password
// $database = "epichr";       // Name of your database

// Create a connection
$conn = new mysqli($host, $username, $password, $database);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Optional: Set charset (recommended for UTF-8)
$conn->set_charset("utf8mb4");
?>
