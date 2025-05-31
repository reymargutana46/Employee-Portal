<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceRequestResource extends JsonResource
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
            'requestor' => $this->requestBy?->username ?? 'Unknown',
            // Full name with optional extname
            'requestTo' => trim(
                ($this->requestTo?->fname ?? '') . ' ' .
                    ($this->requestTo?->lname ?? '') .
                    ($this->requestTo?->extname ? ' ' . $this->requestTo->extname : '')
            ),
            'requestToId' => $this->requestTo->id,
            'title' => $this->title,
            'details' => $this->details,
            'type' => 'Request', // Replace with real type if available
            'status' => $this->status,
            'priority' => $this->priority,
            'createdAt' => $this->created_at?->toIso8601String(),
            'fromDate' => $this->from,
            'toDate' => $this->to,
            'rating' => $this->rating,
            'remarks' => $this->remarks,
        ];
    }
}
