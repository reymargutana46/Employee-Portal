<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
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
                'fname' => $this->fname,
                'lname' => $this->lname,
                'mname' => $this->mname,
                'extname' => $this->extname,
                'username' => $this->user->username ?? null,
                'biod' => $this->biod,
                'position' => $this->position->title ?? null,
                'department' => $this->department->name ?? null,
                'email' => $this->email,
                'contactno' => $this->contactno,
                'workhours_id' => $this->workhour->id,
                'workhours_am' => $this->workhour->am ?? null,
                'workhours_pm' => $this->workhour->pm ?? null,
                'telno' => $this->telno,
        ];
    }
}
