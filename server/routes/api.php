<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\Auth\AuthenticationController;
use App\Http\Controllers\ClassProgramController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DTRController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PersonalDataSheetController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ServiceRequestController;
use App\Http\Controllers\SetupController;
use App\Http\Controllers\WorkloadController;
use App\Models\ActivityLog;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::post('/register', [AuthenticationController::class, 'register']);

Route::post('/login', [AuthenticationController::class, 'login']);

Route::prefix('pds')->controller(PersonalDataSheetController::class)->group(function () {
    Route::get('/files/{id}/view', 'viewFile');
});

Route::middleware(['auth:sanctum'])->group(function () {

    Route::get('/logout', [AuthenticationController::class, 'logout']);

    Route::prefix('accounts')
        ->controller(AccountController::class)->group(
            function () {

                Route::get('/', 'index');
                Route::get('/page/dashboard', 'dashboard');
                Route::get('/me', 'me');
                Route::get('/{id}', 'show');

                Route::post('/', 'store')->middleware('role:Admin');
                Route::post('/change-password', 'changePassword');
                Route::put('/{username}', 'update')->middleware('role:Admin|Principal|Secretary');
                Route::put('/update/profile', 'updateProfile');

                Route::delete('/{id}', 'destroy')->middleware('role:Admin');
            }
        );

    Route::prefix('employee')
        ->controller(EmployeeController::class)->group(
            function () {
                Route::get('/', 'index');
                Route::get('/role/roles', 'roles');
                Route::get('/{id}', 'show');
                Route::post('/', 'store')->middleware('role:Admin');
                Route::put('/{id}', 'update')->middleware('role:Admin|Principal|Secretary');;
                Route::delete('/{id}', 'destroy')->middleware('role:Admin');
            }
        );


    Route::prefix('leaves')
        ->controller(LeaveController::class)->group(function () {

            Route::middleware('role:Admin|Faculty|Secretary')->group(function () {



                Route::put('/{id}', 'update');

                Route::delete('/{id}', 'destroy');
            });
            Route::post('/', 'store');
            Route::get('/', 'index');
            Route::get('/types/all', 'leaveTypes');
            Route::get('/{id}', 'show');

            Route::post('/decision', 'decision')->middleware(("role:Principal"));
        });

    Route::prefix('service-request')->controller(ServiceRequestController::class)
        ->group(function () {

            Route::get('/', 'index');
            Route::get('/{id}', 'show');
            Route::post('/', 'store');
            Route::put('/', 'update');
            Route::delete('/', 'destroy');
            Route::post('/{id}/status', 'updateStatus');
            Route::post('/rate/{id}', 'updateRating');
            Route::post('/{id}/rating', 'updateRating');
        });


    Route::prefix('dtr')->controller(DTRController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::post('/import', 'bulkStore');
        Route::put('/', 'update');
        Route::delete('/leave/{leave_id}/am/{am_id}/pm/{pm_id}', 'destroy');
    });


    Route::prefix('workload')->controller(WorkloadController::class)->group(function () {

        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::get('/schedule', 'show');
        Route::post('/staff', 'storeStaff');
        Route::post('/faculty', 'storeFaculty');
        Route::post('/staff/assign', 'assignStaff');
        Route::post('/faculty/assign', 'assignFaculty');
        Route::put('/{id}/staff', 'updateStaff');
        Route::put('/{id}/faculty', 'updateFaculty');
        Route::delete('/{id}', 'destroy');
    });


    Route::prefix('class-programs')->controller(ClassProgramController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::get('/{id}', 'show');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
    });


    Route::prefix('/set-up')->controller(SetupController::class)->group(function () {
        Route::get('/role', 'roles');
        Route::get('/department', 'departments');
        Route::get('/position', 'positions');
        Route::get('/rooms', 'rooms');
    });


    Route::prefix('activity-logs')->controller(ActivityLogController::class)->group(function () {
        Route::get('/', 'index');
    });

    Route::prefix('notifications')->controller(NotificationController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::put('/{id}/read', 'markAsRead');
        Route::delete('/{id}', 'destroy');
        Route::delete('/clear/all', 'deleteAll');
        Route::get('/{id}', 'show');
        Route::put('/mark/all/read', 'markAllAsRead');
    });


    Route::prefix('pds')->controller(PersonalDataSheetController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/upload', 'upload');
        Route::get('/files/{id}', 'getFile');
        Route::delete('/files/{id}', 'deleteFile');
        // Route::get('/files/{id}/view', 'viewFile');
    });
});

