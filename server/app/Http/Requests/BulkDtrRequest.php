<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkDtrRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'employee_name' => ['required', 'string'],
            'month' => ['required', 'string',  function ($attribute, $value, $fail) {
                $value = ucwords(strtolower(trim($value)));

                // Remove any time-related content from the input string
                $value = preg_replace('/\s+\d{1,2}:\d{2}\s*(am|pm)/i', '', $value);

                if (preg_match('/^([A-Za-z]+)$/', $value)) {
                    // Valid month only (e.g. "January") with current year
                    $dateString = "$value " . now()->year;
                } elseif (preg_match('/^([A-Za-z]+)\s+(\d{4})$/', $value, $matches)) {
                    // Valid month + year (e.g. "January 2025")
                    $dateString = "{$matches[1]} {$matches[2]}";
                } else {
                    $fail("The $attribute must be a valid month or month and year (e.g. January or January 2025).");
                    return;
                }

                // Parse the constructed month and year string
                try {
                    $date = \Carbon\Carbon::parse($dateString);

                    // Check if the parsed date year is valid (the month is correct)
                    if ($date->year < 1900 || $date->year > now()->year + 1) {
                        $fail("The $attribute must be a valid month or month and year (e.g. January or January 2025).");
                    }
                } catch (\Exception $e) {
                    $fail("The $attribute must be a valid month or month and year (e.g. January or January 2025).");
                }
            },],
            'records' => ['required', 'array'],
            'records.*.day' => ['required', 'string'],
            'records.*.am_arrival' => ['required', 'string'],
            'records.*.am_departure' => ['required', 'string'],
            'records.*.pm_arrival' => ['required', 'string'],
            'records.*.pm_departure' => ['required', 'string'],
            'records.*.undertime_hour' => ['nullable', 'string'],
            'records.*.undertime_minute' => ['nullable', 'string'],
        ];
    }
}
