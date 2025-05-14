<?php

namespace App\Http\Controllers;
use Illuminate\Http\JsonResponse;
abstract class Controller
{

    protected function ok($data = null, string $message = 'OK'): JsonResponse
    {
        return response()->json([
            'status' => true,
            'message' => $message,
            'data' => $data,
        ], 200);
    }

    protected function created($data = null, string $message = 'Created'): JsonResponse
    {
        return response()->json([
            'status' => true,
            'message' => $message,
            'data' => $data,
        ], 201);
    }

    protected function notFound(string $message = 'Not Found'): JsonResponse
    {
        return response()->json([
            'status' => false,
            'message' => $message,
        ], 404);
    }

    protected function badRequest(string $message = 'Bad Request'): JsonResponse
    {
        return response()->json([
            'status' => false,
            'message' => $message,
        ], 400);
    }

    protected function serverError(string $message = 'Server Error'): JsonResponse
    {
        return response()->json([
            'status' => false,
            'message' => $message,
        ], 500);
    }
}
