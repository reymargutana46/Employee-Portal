<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkLoadHdrResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'from' => $this->from,
            'to' => $this->to,
            'assignee_id' => $this->assignee_id,
            'created_by' => $this->created_by,
            'type' => $this->type,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'faculty_w_l' => $this->facultyWL ? new FacultyWLResource($this->facultyWL) : null,
            'staff_w_l' => $this->staffWL ? new StaffWLResource($this->staffWL) : null,
        ];
    }
}
