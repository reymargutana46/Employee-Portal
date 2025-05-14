<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'username' => $this->username,
            'fullname' => $this->employee->getfullName(),
            'firstname' => $this->employee->fname,
            'lastname' => $this->employee->lname,
            'email' => $this->employee->email,
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
        ];
    }
}
