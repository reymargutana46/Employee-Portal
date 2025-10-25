<?php
// Database connection script for PostgreSQL

try {
    // Connect to PostgreSQL database using environment variables
    $host = '127.0.0.1';
    $port = '5432';
    $dbname = 'employeeport';
    $username = 'postgres';
    $password = '4321';

    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to PostgreSQL database successfully!\n\n";
    
    // Check PDS table structure
    echo "=== PDS TABLE STRUCTURE ===\n";
    $stmt = $pdo->query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'personal_data_sheets' ORDER BY ordinal_position");
    while ($row = $stmt->fetch()) {
        echo $row['column_name'] . " (" . $row['data_type'] . ")\n";
    }
    
    echo "\n=== PDS RECORDS ===\n";
    $stmt = $pdo->query("SELECT id, file_name, owner_name, uploader, created_at FROM personal_data_sheets ORDER BY created_at DESC");
    while ($row = $stmt->fetch()) {
        echo "ID: " . $row['id'] . "\n";
        echo "  File Name: " . $row['file_name'] . "\n";
        echo "  Owner Name: " . $row['owner_name'] . "\n";
        echo "  Uploader: " . $row['uploader'] . "\n";
        echo "  Created At: " . $row['created_at'] . "\n\n";
    }
    
    echo "=== USERS AND ROLES ===\n";
    $stmt = $pdo->query("SELECT u.username, STRING_AGG(r.name, ', ') as roles FROM users u 
                        LEFT JOIN role_user ru ON u.username = ru.username_id 
                        LEFT JOIN roles r ON ru.role_id = r.id 
                        GROUP BY u.username 
                        ORDER BY u.username");
    while ($row = $stmt->fetch()) {
        echo "User: " . $row['username'] . " - Roles: " . $row['roles'] . "\n";
    }
    
    echo "\n=== ROLES TABLE ===\n";
    $stmt = $pdo->query("SELECT id, name FROM roles ORDER BY id");
    while ($row = $stmt->fetch()) {
        echo "Role ID: " . $row['id'] . " - Name: " . $row['name'] . "\n";
    }
    
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
?>