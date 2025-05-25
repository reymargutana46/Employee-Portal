<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index()
    {
        $activityLogs = ActivityLog::with('user')->get()->map(function ($log) {
            return [
                'id' => $log->id,
                'performed_by' => $log->performed_by,
                'action' => $log->action,
                'description' => $log->description,
                'entity_type' => $log->entity_type,
                'entity_id' => $log->entity_id,
                'created_at' => $log->created_at_formatted,
                'user' => $log->user,
            ];
        });

        return $this->ok($activityLogs);
    }
}
