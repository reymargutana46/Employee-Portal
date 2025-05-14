<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmployeeUpdateRequest extends FormRequest
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
            'fname' => 'required|string|max:255',
            'lname' => 'required|string|max:255',
            'mname' => 'nullable|string|max:255',
            'extname' => 'nullable|string|max:50',
            'biod' => 'nullable|string',
            'deleted' => 'boolean',
            'email' => 'required|email|unique:employees,email,' . $this->id,
            'contactno' => 'nullable|string|max:20',
            'telno' => 'nullable|string|max:20',
        ];
    }
}
