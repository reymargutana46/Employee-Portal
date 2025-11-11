<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmployeeStoreRequest extends FormRequest
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
            'fname' => 'required',
            'lname' => 'required',
            'mname' => ['nullable', 'string'],
            'extname' => ['nullable', 'string'],
            'username' => ['required', 'unique:users,username'],
            'password' => 'required',
            "bioid" => 'nullable',
            'position',
            'department',
            'email' => ['required', 'unique:employees,email', 'email'],
            'contactno' => 'nullable',
            'workhour_am' => ['required', 'regex:/^([01]\d|2[0-3]):[0-5]\d$/'],
            'workhour_pm' => ['required', 'regex:/^([01]\d|2[0-3]):[0-5]\d$/'],
            'telno' => 'nullable',
            'role' => ['required', 'exists:roles,name']
        ];
    }
}
