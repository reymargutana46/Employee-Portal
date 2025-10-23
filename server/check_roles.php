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

// Query roles table
try {
    $roles = Capsule::table('roles')->get();
    echo "Roles in database:\n";
    foreach ($roles as $role) {
        echo "- " . $role->name . " (ID: " . $role->id . ")\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
