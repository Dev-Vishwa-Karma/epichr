<?php
header("Access-Control-Allow-Origin: *"); // Allow React app
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS");   // Allow HTTP methods
header("Access-Control-Allow-Headers: Content-Type");         // Allow headers like JSON content
header("Access-Control-Allow-Credentials: true");

// Include the database connection
include 'db_connection.php';

// Set the header for JSON response
header('Content-Type: application/json');

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

// File upload helper function
function uploadFile($file, $targetDir, $allowedTypes = [], $maxSize = 2 * 1024 * 1024)
{
    if ($file['error'] === UPLOAD_ERR_OK) {
        $fileType = mime_content_type($file['tmp_name']);
        error_log("Detected MIME Type: " . $fileType);
        $fileSize = $file['size'];

        // Validate file type
        if (!empty($allowedTypes) && !in_array($fileType, $allowedTypes)) {
            sendJsonResponse('error', null, "Invalid file type: $fileType");
        }

        // Validate file size
        if ($fileSize > $maxSize) {
            throw new Exception("File size exceeds the maximum allowed size of $maxSize bytes");
        }

        $originalFileName = $file['name'];
        $extension = pathinfo($originalFileName, PATHINFO_EXTENSION);
        
        if (!$extension) {
            $extension = 'pdf'; // Set default extension if missing
        }

        // Generate a unique file name
        $uniqueFileName = uniqid() . '-' . basename($file['name']);


        $targetPath = $targetDir . DIRECTORY_SEPARATOR . $uniqueFileName;

        // Ensure the target directory exists
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        // Move the file to the target directory
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return $targetPath;
        } else {
            throw new Exception("Failed to move uploaded file.");
        }
    } else {
        throw new Exception("File upload error: " . $file['error']);
    }
}

// Main action handler
if (isset($action)) {
    switch ($action) {
        case 'view':
            if (isset($_GET['user_id']) && validateId($_GET['user_id'])) {
                // Prepare SELECT statement with WHERE clause using a placeholder to prevent SQL injection
                // $stmt = $conn->prepare("SELECT * FROM employees WHERE id = ? AND deleted_at IS NULL");
                // Get specific employee with department info
                $stmt = $conn->prepare("
                    SELECT e.*, 
                        d.department_name, 
                        d.department_head 
                    FROM employees e
                    LEFT JOIN departments d ON e.department_id = d.id
                    WHERE e.id = ? AND e.deleted_at IS NULL
                ");
                $stmt->bind_param('i', $_GET['user_id']);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    $employee = $result->fetch_assoc();
                    sendJsonResponse('success', $employee);
                } else {
                    sendJsonResponse('error', null, 'Employee not found');
                }
            } else {
                // Check if the role filter is passed via URL, e.g., role=employee or role=all
                $roleFilter = isset($_GET['role']) ? $_GET['role'] : 'all';
                if ($roleFilter == 'employee') {
                    // If 'employee' role filter is passed, show only employees with role 'employee'
                    // $stmt = $conn->prepare("SELECT * FROM employees WHERE role = 'employee' AND deleted_at IS NULL");
                    $stmt = $conn->prepare("
                        SELECT e.*, 
                            d.department_name, 
                            d.department_head 
                        FROM employees e
                        LEFT JOIN departments d ON e.department_id = d.id
                        WHERE e.role = 'employee' AND e.deleted_at IS NULL
                        ORDER BY e.id DESC
                    ");
                } else if ($roleFilter == 'admin') {
                    $stmt = $conn->prepare("
                        SELECT e.*, 
                            d.department_name, 
                            d.department_head 
                        FROM employees e
                        LEFT JOIN departments d ON e.department_id = d.id
                        WHERE (e.role = 'admin' OR e.role = 'super_admin') 
                        AND e.deleted_at IS NULL
                        ORDER BY e.id DESC
                    ");
                } else {
                    // If no filter or 'all', show all employees
                    $stmt = $conn->prepare("
                        SELECT e.*, 
                            d.department_name, 
                            d.department_head 
                        FROM employees e
                        LEFT JOIN departments d ON e.department_id = d.id
                        WHERE e.deleted_at IS NULL
                        ORDER BY e.id DESC
                    ");
                }

                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows > 0) {
                    $users = $result->fetch_all(MYSQLI_ASSOC);
                    sendJsonResponse('success', $users);
                } else {
                    sendJsonResponse('error', null, 'No users found');
                }
            }
            break;

        case 'add':
            // Capture and sanitize POST data
            $logged_in_user_id = $_POST['logged_in_employee_id'] ?? null; // Get logged-in user ID
            $logged_in_user_role = $_POST['logged_in_employee_role'] ?? null; // Get logged-in user role

            // Capture and sanitize POST data
            $data = [
                'code' => $_POST['code'] ?? null,
                'department_id' => $_POST['department_id'] ?? null,
                'first_name' => $_POST['first_name'] ?? null,
                'last_name' => $_POST['last_name'] ?? null,
                'username' => $_POST['username'] ?? null,
                'email' => $_POST['email'] ?? null,
                'role' => $_POST['selected_role'] ?? null,
                'profile' => $_FILES['photo']['name'] ?? null,
                'dob' => $_POST['dob'] ?? null,
                'gender' => $_POST['gender'] ?? null,
                'password' => $_POST['password'] ?? null,
                'joining_date' => $_POST['joining_date'] ?? null,
                'mobile_no1' => $_POST['mobile_no1'] ?? null,
                'mobile_no2' => $_POST['mobile_no2'] ?? null,
                'address_line1' => $_POST['address_line1'] ?? null,
                'address_line2' => $_POST['address_line2'] ?? null,
                'emergency_contact1' => $_POST['emergency_contact1'] ?? null,
                'emergency_contact2' => $_POST['emergency_contact2'] ?? null,
                'emergency_contact3' => $_POST['emergency_contact3'] ?? null,
                'frontend_skills' => $_POST['frontend_skills'] ?? null,
                'backend_skills' => $_POST['backend_skills'] ?? null,
                'account_holder_name' => $_POST['account_holder_name'] ?? null,
                'account_number' => $_POST['account_number'] ?? null,
                'ifsc_code' => $_POST['ifsc_code'] ?? null,
                'bank_name' => $_POST['bank_name'] ?? null,
                'bank_address' => $_POST['bank_address'] ?? null,
                'aadhar_card_number' => $_POST['aadhar_card_number'] ?? null,
                'aadhar_card_file' => $_FILES['aadhar_card_file']['name'] ?? null,
                'pan_card_number' => $_POST['pan_card_number'] ?? null,
                'pan_card_file' => $_FILES['pan_card_file']['name'] ?? null,
                'driving_license_number' => $_POST['driving_license_number'] ?? null,
                'driving_license_file' => $_FILES['driving_license_file']['name'] ?? null,
                'facebook_url' => $_POST['facebook_url'] ?? null,
                'twitter_url' => $_POST['twitter_url'] ?? null,
                'linkedin_url' => $_POST['linkedin_url'] ?? null,
                'instagram_url' => $_POST['instagram_url'] ?? null,
                'upwork_profile_url' => $_POST['upwork_profile_url'] ?? null,
                'resume' => $_FILES['resume']['name'] ?? null,
            ];

            // Upload profile image
            $profileImage = $_FILES['photo'] ?? null;
            if ($profileImage) {
                try {
                    // Upload to profile folder
                    $profilePath = uploadFile($profileImage, 'uploads/profiles', ['image/jpeg', 'image/png']);
                    
                    if ($profilePath) {
                        $data['profile'] = $profilePath;
            
                        // Generate the same file name for the gallery
                        $galleryPath = str_replace('profiles', 'gallery', $profilePath);
            
                        // Copy the file to the gallery folder
                        if (!copy($profilePath, $galleryPath)) {
                            throw new Exception("Failed to copy image to gallery folder.");
                        }
                    }
                } catch (Exception $e) {
                    sendJsonResponse('error', null, $e->getMessage());
                    exit;
                }
            }

            // Upload Aadhaar card
            $aadharCardFile = $_FILES['aadhar_card_file'] ?? null;
            if ($aadharCardFile) {
                $data['aadhar_card_file'] = uploadFile($aadharCardFile, 'uploads/documents/aadhar', ['application/pdf', 'application/msword', 'text/plain', 'image/jpeg', 'image/png']);
            }

            // Upload PAN card
            $panCardFile = $_FILES['pan_card_file'] ?? null;
            if ($panCardFile) {
                $data['pan_card_file'] = uploadFile($panCardFile, 'uploads/documents/pan', ['application/pdf', 'application/msword', 'text/plain', 'image/jpeg', 'image/png']);
            }

            // Upload driving license
            $drivingLicenseFile = $_FILES['driving_license_file'] ?? null;
            if ($drivingLicenseFile) {
                $data['driving_license_file'] = uploadFile($drivingLicenseFile, 'uploads/documents/driving_license', ['application/pdf', 'application/msword', 'text/plain', 'image/jpeg', 'image/png']);
            }

            // Upload resume
            $resumeFile = $_FILES['resume'] ?? null;
            if ($resumeFile) {
                $data['resume'] = uploadFile($resumeFile, 'uploads/documents/resumes', ['application/pdf', 'application/msword', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
            }

            if (in_array(strtolower($logged_in_user_role), ['admin', 'super_admin'])) {
                $created_by = $logged_in_user_id;
            }

            // Get the previous employee id and generate the new employee id
            if ($data['code'] != null) {
                $next_user_code = $data['code']; // Use the value from $data['code']
            } else {
                // Proceed with the existing code to generate the next employee code
                $stmt = $conn->prepare("SELECT code FROM employees ORDER BY id DESC LIMIT 1");
                $stmt->execute();
                $result = $stmt->get_result();
                $row = $result->fetch_assoc();
                if ($row) {
                    $previous_employee_id = $row['code'];
                    // Extract numeric part of the employee_id
                    $employee_number = (int)substr($previous_employee_id, 3);
                    $next_employee_id_number = $employee_number + 1;
                    $next_user_code = "EMP" . str_pad($next_employee_id_number, 3, "0", STR_PAD_LEFT);
                } else {
                    $next_user_code = "EMP001";
                }
            }

            $role = !empty($data['role']) ? $data['role'] : 'employee';

            // Insert into employees table
            $stmt = $conn->prepare(
                "INSERT INTO employees 
                (department_id, code, first_name, last_name, username, email, role, profile, dob, gender, password, joining_date, mobile_no1, mobile_no2, address_line1, address_line2, 
                emergency_contact1, emergency_contact2, emergency_contact3, frontend_skills, backend_skills, account_holder_name, account_number, ifsc_code, bank_name, bank_address,
                aadhar_card_number, aadhar_card_file, pan_card_number, pan_card_file, driving_license_number, driving_license_file, facebook_url, twitter_url, linkedin_url, instagram_url, upwork_profile_url, resume, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );

            // Bind parameters dynamically (use an array to store the data)
            $stmt->bind_param(
                'issssssssssssssssssssssssssssssssssssss',
                $data['department_id'],
                $next_user_code,
                $data['first_name'],
                $data['last_name'],
                $data['username'],
                $data['email'],
                $role,
                $data['profile'],
                $data['dob'],
                $data['gender'],
                $data['password'],
                $data['joining_date'],
                $data['mobile_no1'],
                $data['mobile_no2'],
                $data['address_line1'],
                $data['address_line2'],
                $data['emergency_contact1'],
                $data['emergency_contact2'],
                $data['emergency_contact3'],
                $data['frontend_skills'],
                $data['backend_skills'],
                $data['account_holder_name'],
                $data['account_number'],
                $data['ifsc_code'],
                $data['bank_name'],
                $data['bank_address'],
                $data['aadhar_card_number'],
                $data['aadhar_card_file'],
                $data['pan_card_number'],
                $data['pan_card_file'],
                $data['driving_license_number'],
                $data['driving_license_file'],
                $data['facebook_url'],
                $data['twitter_url'],
                $data['linkedin_url'],
                $data['instagram_url'],
                $data['upwork_profile_url'],
                $data['resume'],
                $created_by
            );

            if ($stmt->execute()) {
                // Fix: Get the last inserted employee ID
                $employee_id = $conn->insert_id;

                $salaryDetails = $_POST['salaryDetails'] ?? [];

                // Check if salary details are not empty.
                if (!empty($salaryDetails)) {
                    // Insert salary details into the salary_details table
                    $salary_stmt = $conn->prepare(
                        "INSERT INTO salary_details (employee_id, source, amount, from_date, to_date) 
                        VALUES (?, ?, ?, ?, ?)"
                    );

                    foreach ($salaryDetails as $detail) {
                        // Trim and validate fields to ensure there is no empty data
                        $source = isset($detail['source']) ? trim($detail['source']) : '';
                        $amount = isset($detail['amount']) && is_numeric($detail['amount']) && $detail['amount'] !== '' ? (int)$detail['amount'] : null;
                        $from_date = isset($detail['from_date']) && !empty($detail['from_date']) ? $detail['from_date'] : null;
                        $to_date = isset($detail['to_date']) && !empty($detail['to_date']) ? $detail['to_date'] : null;

                        // Skip the insertion if any of the required fields are empty or invalid
                        if (empty($source) || $amount === null || $from_date === null || $to_date === null) {
                            continue; // Skip this salary detail if data is invalid
                        }

                        // Bind the parameters for each salary entry
                        $salary_stmt->bind_param(
                            'issss',
                            $employee_id,
                            $detail['source'],
                            $amount,
                            $from_date,
                            $to_date
                        );

                        // Execute the insert for each salary detail
                        if (!$salary_stmt->execute()) {
                            $salary_error = $salary_stmt->error;
                            sendJsonResponse('error', null, "Failed to add salary detail: $salary_error");
                            exit; // Exit if any insert fails
                        }
                    }
                }

                // Fetch department details based on department_id
                $dept_stmt = $conn->prepare("SELECT department_name, department_head FROM departments WHERE id = ?");
                $dept_stmt->bind_param("i", $data['department_id']);
                $dept_stmt->execute();
                $dept_result = $dept_stmt->get_result();
                $department = $dept_result->fetch_assoc();

                // If department exists, get its details
                $department_name = $department['department_name'] ?? null;
                $department_head = $department['department_head'] ?? null;

                $created_at = date('Y-m-d H:i:s');
                
                // Insert profile image into gallery if uploaded
                if (!empty($data['profile'])) {
                    $gallery_stmt = $conn->prepare(
                        "INSERT INTO gallery (employee_id, url, created_at, created_by) VALUES (?, ?, ?, ?)"
                    );

                    $gallery_stmt->bind_param('issi', $employee_id, $galleryPath, $created_at, $created_by);
                    
                    if (!$gallery_stmt->execute()) {
                        $gallery_error = $gallery_stmt->error;
                        sendJsonResponse('error', null, "Failed to add profile image to gallery: $gallery_error");
                        exit;
                    }
                }

                sendJsonResponse('success', [
                    'id' => $employee_id,
                    'department_id' => $data['department_id'],
                    'department_name' => $department_name,
                    'department_head' => $department_head,
                    'code' => $data['code'],
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'email' => $data['email'],
                    'role' => $role,
                    'created_by' => $created_by,
                    'created_at' => $created_at
                ], 'Employee and salary details added successfully');
            } else {
                $error = $stmt->error;
                sendJsonResponse('error', null, "Failed to add employee details: $error");
            }
            break;

            // Edit existing user case
        case 'edit':
            if (isset($_GET['user_id']) && validateId($_GET['user_id'])) {
                $id = $_GET['user_id'];

                // Ensure logged-in user data is provided in the API request
                if (empty($_POST['logged_in_employee_id']) || empty($_POST['logged_in_employee_role'])) {
                    sendJsonResponse('error', null, "Missing logged-in user details");
                    exit;
                }

                $logged_in_user_id = $_POST['logged_in_employee_id']; // Logged-in user's ID
                $logged_in_role = $_POST['logged_in_employee_role']; // Logged-in user's role

                // Initialize data array
                $data = [];

                // Capture and sanitize POST data for each field conditionally
                if (!empty($_POST['department_id'])) {
                    $data['department_id'] = $_POST['department_id'];
                }
                if (!empty($_POST['first_name'])) {
                    $data['first_name'] = $_POST['first_name'];
                }
                if (!empty($_POST['last_name'])) {
                    $data['last_name'] = $_POST['last_name'];
                }
                if (!empty($_POST['username'])) {
                    $data['username'] = $_POST['username'];
                }
                if (!empty($_POST['email'])) {
                    $data['email'] = $_POST['email'];
                }
                if (!empty($_POST['selected_role'])) {
                    $data['role'] = $_POST['selected_role'];
                }
                if (!empty($_POST['about_me'])) {
                    $data['about_me'] = $_POST['about_me'];
                }
                if (!empty($_POST['gender'])) {
                    $data['gender'] = $_POST['gender'];
                }
                if (!empty($_POST['dob'])) {
                    $data['dob'] = $_POST['dob'];
                }
                if (!empty($_POST['joining_date'])) {
                    $data['joining_date'] = $_POST['joining_date'];
                }
                if (!empty($_POST['job_role'])) {
                    $data['job_role'] = $_POST['job_role'];
                }
                if (!empty($_POST['mobile_no1'])) {
                    $data['mobile_no1'] = $_POST['mobile_no1'];
                }
                if (!empty($_POST['mobile_no2'])) {
                    $data['mobile_no2'] = $_POST['mobile_no2'];
                }
                if (!empty($_POST['address_line1'])) {
                    $data['address_line1'] = $_POST['address_line1'];
                }
                if (!empty($_POST['address_line2'])) {
                    $data['address_line2'] = $_POST['address_line2'];
                }
                if (!empty($_POST['emergency_contact1'])) {
                    $data['emergency_contact1'] = $_POST['emergency_contact1'];
                }
                if (!empty($_POST['emergency_contact2'])) {
                    $data['emergency_contact2'] = $_POST['emergency_contact2'];
                }
                if (!empty($_POST['emergency_contact3'])) {
                    $data['emergency_contact3'] = $_POST['emergency_contact3'];
                }
                if (!empty($_POST['frontend_skills'])) {
                    $data['frontend_skills'] = $_POST['frontend_skills'];
                }
                if (!empty($_POST['backend_skills'])) {
                    $data['backend_skills'] = $_POST['backend_skills'];
                }
                if (!empty($_POST['account_holder_name'])) {
                    $data['account_holder_name'] = $_POST['account_holder_name'];
                }
                if (!empty($_POST['account_number'])) {
                    $data['account_number'] = $_POST['account_number'];
                }
                if (!empty($_POST['ifsc_code'])) {
                    $data['ifsc_code'] = $_POST['ifsc_code'];
                }
                if (!empty($_POST['bank_name'])) {
                    $data['bank_name'] = $_POST['bank_name'];
                }
                if (!empty($_POST['bank_address'])) {
                    $data['bank_address'] = $_POST['bank_address'];
                }
                if (!empty($_POST['source'])) {
                    $data['source'] = $_POST['source'];
                }
                if (!empty($_POST['amount'])) {
                    $data['amount'] = $_POST['amount'];
                }
                if (!empty($_POST['from_date'])) {
                    $data['from_date'] = $_POST['from_date'];
                }
                if (!empty($_POST['to_date'])) {
                    $data['to_date'] = $_POST['to_date'];
                }
                if (!empty($_POST['aadhar_card_number'])) {
                    $data['aadhar_card_number'] = $_POST['aadhar_card_number'];
                }
                if (!empty($_POST['driving_license_number'])) {
                    $data['driving_license_number'] = $_POST['driving_license_number'];
                }
                if (!empty($_POST['pan_card_number'])) {
                    $data['pan_card_number'] = $_POST['pan_card_number'];
                }
                if (!empty($_POST['facebook_url'])) {
                    $data['facebook_url'] = $_POST['facebook_url'];
                }
                if (!empty($_POST['twitter_url'])) {
                    $data['twitter_url'] = $_POST['twitter_url'];
                }
                if (!empty($_POST['linkedin_url'])) {
                    $data['linkedin_url'] = $_POST['linkedin_url'];
                }
                if (!empty($_POST['instagram_url'])) {
                    $data['instagram_url'] = $_POST['instagram_url'];
                }
                if (!empty($_POST['upwork_profile_url'])) {
                    $data['upwork_profile_url'] = $_POST['upwork_profile_url'];
                }
                // File uploads: handle files only if they are present
                // Upload profile image
                $profileImage = $_FILES['photo'];
                if ($profileImage) {
                    try {
                        // Upload to profile folder
                        $profilePath = uploadFile($profileImage, 'uploads/profiles', ['image/jpeg', 'image/png']);
                        
                        if ($profilePath) {
                            $data['profile'] = $profilePath;
                
                            // Generate the same file name for the gallery
                            $galleryPath = str_replace('profiles', 'gallery', $profilePath);
                
                            // Copy the file to the gallery folder
                            if (!copy($profilePath, $galleryPath)) {
                                throw new Exception("Failed to copy image to gallery folder.");
                            }
                        }
                    } catch (Exception $e) {
                        sendJsonResponse('error', null, $e->getMessage());
                        exit;
                    }
                }

                // Upload Aadhaar card
                $aadharCardFile = $_FILES['aadhar_card_file'];
                if ($aadharCardFile) {
                    $data['aadhar_card_file'] = uploadFile($aadharCardFile, 'uploads/documents/aadhar', ['application/pdf', 'application/msword', 'text/plain', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream']);
                }

                // Upload PAN card
                $panCardFile = $_FILES['pan_card_file'];
                if ($panCardFile) {
                    $data['pan_card_file'] = uploadFile($panCardFile, 'uploads/documents/pan', ['application/pdf', 'application/msword', 'text/plain', 'image/jpeg', 'image/png']);
                }

                // Upload driving license
                $drivingLicenseFile = $_FILES['driving_license_file'];
                if ($drivingLicenseFile) {
                    $data['driving_license_file'] = uploadFile($drivingLicenseFile, 'uploads/documents/driving_license', ['application/pdf', 'application/msword', 'text/plain', 'image/jpeg', 'image/png']);
                }

                // Upload resume
                $resumeFile = $_FILES['resume'];
                if ($resumeFile) {
                    $data['resume'] = uploadFile($resumeFile, 'uploads/documents/resumes', ['application/pdf', 'application/msword', 'text/plain', 'application/octet-stream']);
                }

                // Check if admin or super_admin is updating another user's profile
                if ($logged_in_user_id != $id && ($logged_in_role === 'admin' || $logged_in_role === 'super_admin')) {
                    $data['updated_by'] = $logged_in_user_id; // Store admin/super_admin ID
                }

                $data['updated_at'] = date('Y-m-d H:i:s');

                // Prepare SQL UPDATE statement
                $updateColumns = [];
                $updateValues = [];
                $types = ''; // Prepare bind_param types dynamically

                // Dynamically create column assignments and bind parameters
                foreach ($data as $column => $value) {
                    $updateColumns[] = "$column = ?";
                    $updateValues[] = $value;
                    $types .= 's'; // Assuming all fields are strings, adjust if necessary
                }

                // SQL query
                $sql = "UPDATE employees SET " . implode(', ', $updateColumns) . " WHERE id = ?";
                $updateValues[] = $id;
                $types .= 'i'; // For integer id

                $stmt = $conn->prepare($sql);
                $stmt->bind_param($types, ...$updateValues);

                if ($stmt->execute()) {
                    // Insert new profile image into the gallery
                    if (!empty($data['profile'])) {
                        $insert_gallery_sql = "INSERT INTO gallery (employee_id, url, created_at, created_by) VALUES (?, ?, ?, ?)";
                        $insert_gallery_stmt = $conn->prepare($insert_gallery_sql);
                        $created_at = date('Y-m-d H:i:s');
                        $insert_gallery_stmt->bind_param('issi', $id, $galleryPath, $created_at, $data['updated_by']);
                        $insert_gallery_stmt->execute();
                    }

                    $salaryDetails = $_POST['salaryDetails'] ?? [];

                    // Update salary details into the salary_details table
                    $salary_stmt = $conn->prepare(
                        "UPDATE salary_details SET source = ?, amount = ?, from_date = ?, to_date = ?, updated_at = ? WHERE employee_id = ? AND id = ?"
                    );
                    $updated_at = date('Y-m-d H:i:s');

                    foreach ($salaryDetails as $detail) {
                        // Ensure that the `id` field is present in the incoming data
                        if (!isset($detail['id'])) {
                            sendJsonResponse('error', null, "Salary detail ID is missing.");
                            exit;
                        }

                        // Bind the parameters for each salary entry
                        $salary_stmt->bind_param(
                            'sssssii',
                            $detail['source'],
                            $detail['amount'],
                            $detail['from_date'],
                            $detail['to_date'],
                            $updated_at,
                            $id,
                            $detail['id'] // Auto-increment ID
                        );

                        // Execute the insert for each salary detail
                        if (!$salary_stmt->execute()) {
                            $salary_error = $salary_stmt->error;
                            sendJsonResponse('error', null, "Failed to add salary detail: $salary_error");
                            exit; // Exit if any insert fails
                        }
                    }

                    // Fetch department details based on department_id
                    if (!empty($data['department_id'])) {
                        $dept_stmt = $conn->prepare("SELECT department_name, department_head FROM departments WHERE id = ?");
                        $dept_stmt->bind_param("i", $data['department_id']);
                        $dept_stmt->execute();
                        $dept_result = $dept_stmt->get_result();
                        $department = $dept_result->fetch_assoc();

                        // If department exists, get its details
                        $department_name = $department['department_name'] ?? null;
                        $department_head = $department['department_head'] ?? null;
                    }

                    $updatedData = [
                        'id' => $id,
                        'first_name' => $data['first_name'],
                        'last_name' => $data['last_name'],
                        'username' => $data['username'],
                        'profile' => $data['profile'],
                        'email' => $data['email'],
                        'dob' => $data['dob'],
                        'address_line1' => $data['address_line1'],
                        'role' => $data['role'],
                        'mobile_no1' => $data['mobile_no1'],
                        'about_me' => $data['about_me'],
                        'joining_date' => $data['joining_date'],
                        'job_role' => $data['job_role'],
                        'facebook_url' => $data['facebook_url'],
                        'twitter_url' => $data['twitter_url'],
                        'department_name' => $department_name,
                        'department_head' => $department_head,
                    ];

                    sendJsonResponse('success', $updatedData, "Employee and salary details updated successfully");
                } else {
                    $error = $stmt->error;
                    sendJsonResponse('error', null, "Failed to update employee details: $error");
                }
            } else {
                sendJsonResponse('error', null, 'Invalid user ID');
            }
            break;

            case 'delete':
                // Get request body
                $json = file_get_contents('php://input');
                $data = json_decode($json, true);
            
                if (isset($data['user_id']) && validateId($data['user_id'])) {
                    $id = $data['user_id'];
                    $deleted_by = null;
            
                    // Check if logged-in user ID and role are provided
                    if (isset($data['logged_in_employee_id']) && isset($data['logged_in_employee_role'])) {
                        $logged_in_user_id = $data['logged_in_employee_id'];
                        $logged_in_user_role = strtolower($data['logged_in_employee_role']); // Convert to lowercase for consistency
            
                        // Allow only admin and super admin to set deleted_by
                        if ($logged_in_user_role === 'admin' || $logged_in_user_role === 'super_admin') {
                            $deleted_by = $logged_in_user_id;
                        }
                    }
            
                    // Prepare the SQL query based on role condition
                    if ($deleted_by) {
                        $stmt = $conn->prepare("UPDATE employees SET deleted_at = NOW(), deleted_by = ? WHERE id = ?");
                        $stmt->bind_param('ii', $deleted_by, $id);
                    } else {
                        $stmt = $conn->prepare("UPDATE employees SET deleted_at = NOW() WHERE id = ?");
                        $stmt->bind_param('i', $id);
                    }
            
                    if ($stmt->execute()) {
                        // Soft delete from salary_details table
                        $stmt = $conn->prepare("UPDATE salary_details SET deleted_at = NOW() WHERE employee_id = ?");
                        $stmt->bind_param('i', $id);
                        if ($stmt->execute()) {
                            sendJsonResponse('success', null, 'Employee and salary details deleted successfully');
                        } else {
                            $error = $stmt->error;
                            sendJsonResponse('error', null, "Failed to delete salary details: $error");
                        }
                    } else {
                        sendJsonResponse('error', null, 'Failed to delete employee details');
                    }
                } else {
                    sendJsonResponse('error', null, 'Invalid user ID');
                }
                break;            

        case 'check-login':
            $email = $_POST['email'] ?? null;
            $password = $_POST['password'] ?? null;

            /** Validate */
            if (!$email || !$password) {
                sendJsonResponse('error', null, 'Please provide all required fields');
            }

            $stmt = $conn->prepare("SELECT * FROM employees WHERE email = ? AND deleted_at IS NULL LIMIT 1");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();

            /** Validate email */
            if ($result->num_rows == 0) {
                sendJsonResponse('error', null, 'Invalid Email or Account Deleted.');
            } else {
                $row = $result->fetch_assoc();
                if ($password != $row['password']) {
                    sendJsonResponse('error', null, 'Invalid Password.');
                } else {
                    sendJsonResponse('success', $row, 'Login successful!');
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
