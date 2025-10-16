<?php

namespace App\Http\Controllers;

use App\Http\Resources\ServiceRequestResource;
use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\Notification;
use App\Models\ServiceRequest;
use App\Models\User;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ServiceRequestController extends Controller
{

    protected $hasAccess;
    public function __construct()
    {
        $this->hasAccess = Auth::user()->hasRole(["Principal", "Secretary"]);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        if ($this->hasAccess) {
            $services = ServiceRequest::with(['requestBy', 'requestTo'])->get();
        } else {
            $employeeId = Auth::user()->employee->id;
            $username = Auth::user()->username;

            $services = ServiceRequest::with(['requestBy', 'requestTo'])
                ->where(function($query) use ($employeeId, $username) {
                    $query->where('request_to', $employeeId)
                          ->orWhere('request_by', $username);
                })
                ->get();
        }

        $data = ServiceRequestResource::collection($services);
        return $this->ok($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required',
            'details' => 'required',
            'priority' => 'required',
            'status' => 'required',
            'fromDate' => ['required', 'date'],
            'toDate' => ['required', 'date'],
            'requestTo' => ['required', 'exists:employees,id'],


        ]);
        $service = DB::transaction(function () use ($request) {
            $request_to = Employee::findOrFail($request->requestTo);

            $service = ServiceRequest::create(
                [
                    'title' => $request->title,
                    'details' => $request->details,
                    'request_by' => Auth::user()->username,
                    'request_to' => $request_to->id,
                    'status' => 'For Approval', // Always start with "For Approval"
                    'from' => $request->fromDate,
                    'to' => $request->toDate,
                    'priority' => $request->priority,
                    'rating' => 0,

                ]
            );
            ActivityLog::create([
                'performed_by' => Auth::user()->username,
                'action' => 'created',
                'description' => "Created service request {$service->title} for {$request_to->fname} {$request_to->lname}",
                'entity_type' => ServiceRequest::class,
                'entity_id' => $service->id,
            ]);

            // Notify the principal for approval
            $principal = User::whereHas('roles', function ($query) {
                $query->where('name', 'Principal');
            })->first();

            if ($principal) {
                Notification::create([
                    'username_id' => $principal->username,
                    'title' => "New Service Request for Approval",
                    'message' => "A new service request titled '{$service->title}' requires your approval",
                    'type' => "info",
                    'url' => "/service-requests",
                ]);
            }

            return $service;
        });

        return $this->created(new ServiceRequestResource($service));
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $service = ServiceRequest::findOrFail($id);
        return $this->ok($service);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'title' => 'required',
            'details' => 'required',
            'priority' => 'required',
            'status' => 'required',
            'fromDate' => ['required', 'date'],
            'toDate' => ['required', 'date'],
            'requestTo' => 'required',
            'rating' => 'required',
            'remarks' => 'required'
        ]);

        $service = DB::transaction(function () use ($request, $id) {
            $service = ServiceRequest::findOrFail($id);
            
            $request_to = Employee::findOrFail($request->requestTo);
            
            $service->update([
                'title' => $request->title,
                'details' => $request->details,
                'request_to' => $request_to->id,
                'status' => $request->status,
                'from' => $request->fromDate,
                'to' => $request->toDate,
                'priority' => $request->priority,
                'rating' => $request->rating,
                'remarks' => $request->remarks
            ]);
            
            ActivityLog::create([
                'performed_by' => Auth::user()->username,
                'action' => 'updated',
                'description' => "Updated service request {$service->title}",
                'entity_type' => ServiceRequest::class,
                'entity_id' => $service->id,
            ]);
            
            return $service;
        });

        return $this->ok(new ServiceRequestResource($service));
    }

    public function updateRating(Request $request, string $id)
    {
        $request->validate([
            'rating' => 'required',
            'remarks' => 'required'
        ]);

        $service = DB::transaction(function () use ($request, $id) {
            $service = ServiceRequest::with("requestTo")->findOrFail($id);
            $service->rating = $request->rating;
            $service->remarks = $request->remarks;
            $service->save();
            ActivityLog::create([
                'performed_by' => Auth::user()->username,
                'action' => 'completed',
                'description' => "Service request {$service->title} Completed",
                'entity_type' => ServiceRequest::class,
                'entity_id' => $service->id,
            ]);

            $user = User::where('username', $service->requestTo->username_id)->first();

            Notification::create([
                'username_id' => $user->username,
                'title' => "Service Request " . $service->title . " is completed",
                'message' => "Service request {$service->title} has been completed and rated by " . Auth::user()->employee->fname . " " . Auth::user()->employee->lname,
                'type' => "completed",
                'url' => "/service-requests",
            ]);

            return $service;
        });

        return $this->ok($service);
    }

    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required',
        ]);

        $service = DB::transaction(function () use ($request, $id) {
            $service = ServiceRequest::with("requestTo")->findOrFail($id);
            $oldStatus = $service->status;
            $service->status = $request->status;
            $service->save();
            
            $currentUser = Auth::user();
            $requestorUser = User::where('username', $service->request_by)->first();
            $assigneeUser = User::where('username', $service->requestTo->username_id)->first();
            
            ActivityLog::create([
                'performed_by' => $currentUser->username,
                'action' => 'updated',
                'description' => "Service request {$service->title} updated from {$oldStatus} to {$request->status}",
                'entity_type' => ServiceRequest::class,
                'entity_id' => $service->id,
            ]);
            
            // Handle different status transitions
            switch ($request->status) {
                case 'Pending':
                    // Principal approved - notify the assignee
                    if ($assigneeUser) {
                        Notification::create([
                            'username_id' => $assigneeUser->username,
                            'title' => "Service Request Assigned",
                            'message' => "You have been assigned a service request: {$service->title}",
                            'type' => "info",
                            'url' => "/service-requests",
                        ]);
                    }
                    
                    // Notify the requestor
                    if ($requestorUser) {
                        Notification::create([
                            'username_id' => $requestorUser->username,
                            'title' => "Service Request Approved",
                            'message' => "Your service request '{$service->title}' has been approved by the principal",
                            'type' => "success",
                            'url' => "/service-requests",
                        ]);
                    }
                    break;
                    
                case 'Rejected':
                    // Principal rejected - notify the requestor
                    if ($requestorUser) {
                        Notification::create([
                            'username_id' => $requestorUser->username,
                            'title' => "Service Request Rejected",
                            'message' => "Your service request '{$service->title}' has been rejected by the principal",
                            'type' => "error",
                            'url' => "/service-requests",
                        ]);
                    }
                    break;
                    
                case 'In Progress':
                    // Assignee started working - notify the requestor
                    if ($requestorUser) {
                        Notification::create([
                            'username_id' => $requestorUser->username,
                            'title' => "Service Request In Progress",
                            'message' => "Your service request '{$service->title}' is now being worked on",
                            'type' => "info",
                            'url' => "/service-requests",
                        ]);
                    }
                    break;
                    
                case 'Completed':
                    // Assignee completed - notify the requestor
                    if ($requestorUser) {
                        Notification::create([
                            'username_id' => $requestorUser->username,
                            'title' => "Service Request Completed",
                            'message' => "Your service request '{$service->title}' has been completed",
                            'type' => "success",
                            'url' => "/service-requests",
                        ]);
                    }
                    break;
            }
            
            return $service;
        });

        return $this->ok(new ServiceRequestResource($service));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $service = ServiceRequest::findOrFail($id);
        $service->delete();
        return $this->ok(['message' => 'Service request deleted successfully']);
    }
}