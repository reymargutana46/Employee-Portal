<?php

namespace App\Http\Controllers;

use App\Http\Resources\ServiceRequestResource;
use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Calculation\Web\Service;

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

            $services = ServiceRequest::with(['requestBy', 'requestTo'])
                ->where('request_to', $employeeId)
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
        // echo $request;
        $request_to = Employee::findOrFail($request->requestTo);

        $service = ServiceRequest::create(
            [
                'title' => $request->title,
                'details' => $request->details,
                'request_by' => Auth::user()->username,
                'request_to' => $request_to->id,
                'status' => $request->status,
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
            'from' => ['required', 'date'],
            'to' => ['required', 'date'],
            'requested_by' => 'required',
            'requested_to' => 'required',
            'rating' => 'required',
            'remarks' => 'required'
        ]);
    }

    public function updateRating(Request $request, string $id)
    {
        $request->validate([
            'rating' => 'required',
            'remarks' => 'required'
        ]);
        $service = ServiceRequest::findOrFail($id);
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
        return $this->ok($service);
    }

    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required',
        ]);
        $service = ServiceRequest::findOrFail($id);
        $service->status = $request->status;
        $service->save();
         ActivityLog::create([
            'performed_by' => Auth::user()->username,
            'action' => 'updated',
            'description' => "Service request {$service->title} updated to {$request->status}",
            'entity_type' => ServiceRequest::class,
            'entity_id' => $service->id,
        ]);
        return $this->ok($service);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $service = ServiceRequest::findOrFail($id);
        $service->delete();
    }
}
