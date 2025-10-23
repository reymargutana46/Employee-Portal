<?php
require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Set up database connection
$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'pgsql',
    'host'      => '127.0.0.1',
    'database'  => 'employeeportal',
    'username'  => 'postgres',
    'password'  => '1234',
    'charset'   => 'utf8',
    'prefix'    => '',
    'schema'    => 'public',
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();

// Check a specific user's roles (replace 'Jamie' with the username you're testing with)
$username = 'Jamie'; // Change this to the username you're testing with

try {
    // Get user
    $user = Capsule::table('users')->where('username', $username)->first();

    if (!$user) {
        echo "User '$username' not found.\n";
        exit;
    }

    echo "User: " . $user->username . "\n";

    // Get user's roles
    $userRoles = Capsule::table('roles')
        ->join('role_user', 'roles.id', '=', 'role_user.role_id')
        ->where('role_user.username_id', $user->username)
        ->get();

    echo "Roles:\n";
    foreach ($userRoles as $role) {
        echo "- " . $role->name . " (ID: " . $role->id . ")\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
