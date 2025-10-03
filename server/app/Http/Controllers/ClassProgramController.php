<?php

namespace App\Http\Controllers;

use App\Models\ClassProgram;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ClassProgramController extends Controller
{
    /**
     * Display a listing of class programs
     */
    public function index()
    {
        try {
            $classPrograms = ClassProgram::with('creator')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $classPrograms,
                'message' => 'Class programs retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve class programs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created class program
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'grade_section' => 'required|string|max:255',
            'school_year' => 'required|string|max:255',
            'adviser_teacher' => 'required|string|max:255',
            'male_learners' => 'required|integer|min:0',
            'female_learners' => 'required|integer|min:0',
            'schedule_data' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $classProgram = ClassProgram::create([
                'grade_section' => $request->grade_section,
                'school_year' => $request->school_year,
                'adviser_teacher' => $request->adviser_teacher,
                'male_learners' => $request->male_learners,
                'female_learners' => $request->female_learners,
                'schedule_data' => $request->schedule_data,
                'created_by' => Auth::user()->username,
            ]);

            return response()->json([
                'success' => true,
                'data' => $classProgram->load('creator'),
                'message' => 'Class program created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create class program',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified class program
     */
    public function show($id)
    {
        try {
            $classProgram = ClassProgram::with('creator')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $classProgram,
                'message' => 'Class program retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Class program not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified class program
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'grade_section' => 'sometimes|required|string|max:255',
            'school_year' => 'sometimes|required|string|max:255',
            'adviser_teacher' => 'sometimes|required|string|max:255',
            'male_learners' => 'sometimes|required|integer|min:0',
            'female_learners' => 'sometimes|required|integer|min:0',
            'schedule_data' => 'sometimes|required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $classProgram = ClassProgram::findOrFail($id);
            $classProgram->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $classProgram->load('creator'),
                'message' => 'Class program updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update class program',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified class program from storage
     */
    public function destroy($id)
    {
        try {
            $classProgram = ClassProgram::findOrFail($id);
            $classProgram->delete();

            return response()->json([
                'success' => true,
                'message' => 'Class program deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete class program',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}