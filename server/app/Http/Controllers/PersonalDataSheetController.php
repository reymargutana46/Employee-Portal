<?php

namespace App\Http\Controllers;

use App\Models\PersonalDataSheet;
use Auth;
use Illuminate\Http\Request;
use Storage;

class PersonalDataSheetController extends Controller
{
    public function index()
    {
        // Get the authenticated user
        $user = Auth::user();
        
        // Log user roles for debugging
        \Log::info('PDS Index - User roles: ' . json_encode($user->roles->pluck('name')));
        \Log::info('PDS Index - User: ' . $user->username);
        
        // Check if user is principal or secretary - they can see all files
        $isPrivilegedUser = false;
        foreach ($user->roles as $role) {
            if (in_array(strtolower($role->name), ['principal', 'secretary'])) {
                $isPrivilegedUser = true;
                break;
            }
        }
        
        if ($isPrivilegedUser) {
            \Log::info('PDS Index - User has principal or secretary role, fetching all files');
            $pds = PersonalDataSheet::all();
        } else {
            // Regular users (including admins) can only see their own files
            // Files where they are the owner or the uploader
            \Log::info('PDS Index - User is regular, fetching own files only');
            \Log::info('PDS Index - User username: ' . $user->username);
            
            // Get user's full name for matching
            $userFullName = $user->username; // Default to username
            if ($user->employee) {
                $userFullName = $user->employee->getFullName();
                \Log::info('PDS Index - User full name: ' . $userFullName);
            }
            
            $pds = PersonalDataSheet::where('owner_name', $userFullName)
                ->orWhere('uploader', $user->username)
                ->get();
                
            \Log::info('PDS Index - Found ' . $pds->count() . ' files for user');
            foreach ($pds as $file) {
                \Log::info('PDS Index - File ID: ' . $file->id . ', Owner: ' . $file->owner_name . ', Uploader: ' . $file->uploader);
            }
        }
        
        return $this->ok($pds);
    }

    public function upload(Request $request)
    {
        // Validate file and employeeName
        $request->validate([
            'file' => 'required|file|max:10240', // Max 10MB, adjust as needed
            'employeeName' => 'required|string|max:255',
        ]);

        $file = $request->file('file');
        $employeeName = $request->input('employeeName');

        // For all users, always use the authenticated user's full name
        $user = Auth::user();
        // Get the user's full name from their employee record
        if ($user->employee) {
            $employeeName = $user->employee->getFullName();
        } else {
            // Fallback to username if no employee record
            $employeeName = $user->username;
        }

        // Build a clean, unique filename: employeeName-slug + timestamp + extension
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension    = $file->getClientOriginalExtension();
        $filename     =  $originalName . $extension;


        $path = $file->storeAs('uploads', $filename, 'public'); // returns "uploads/filename.ext"

        $url = Storage::disk('public')->url($path); // Full URL for use in frontend
        $pds = PersonalDataSheet::create([
            'uploader' => Auth::user()->username, // Assuming user is authenticated
            'file_path' => $path,
            'file_name' => $filename,
            'file_size' => $file->getSize(),
            'file_type' => $file->getMimeType(),
            'owner_name' => $employeeName,
        ]);

        // Create activity log for the PDS upload
        \App\Models\ActivityLog::create([
            'performed_by' => $user->username,
            'action' => 'uploaded',
            'description' => "Uploaded PDS file: {$filename}",
            'entity_type' => PersonalDataSheet::class,
            'entity_id' => $pds->id,
        ]);

        return $this->ok($pds);
    }
    
    public function viewFile($id)
    {
        try {
            $pds = PersonalDataSheet::findOrFail($id);
            
            // Check if user has permission to view this file
            $user = Auth::user();
            $isPrivilegedUser = false;
            foreach ($user->roles as $role) {
                if (in_array(strtolower($role->name), ['principal', 'secretary'])) {
                    $isPrivilegedUser = true;
                    break;
                }
            }
            
            if (!$isPrivilegedUser) {
                // Regular users (including admins) can only view their own files
                // Get user's full name for matching
                $userFullName = $user->username; // Default to username
                if ($user->employee) {
                    $userFullName = $user->employee->getFullName();
                }
                
                if ($pds->owner_name !== $userFullName && $pds->uploader !== $user->username) {
                    return $this->unauthorized('You do not have permission to view this file');
                }
            }

            // Check if file exists
            if (!Storage::disk('public')->exists($pds->file_path)) {
                return $this->badRequest('File not found');
            }

            // Return file for viewing/download
            $filePath = storage_path("app/public/" . $pds->file_path);
            
            // Set appropriate headers based on file type
            $headers = [
                'Content-Type' => $pds->file_type,
                'Content-Disposition' => 'inline; filename="' . $pds->file_name . '"'
            ];
            
            // For PDF files, we want to display inline
            if (strpos($pds->file_type, 'pdf') !== false) {
                $headers['Content-Disposition'] = 'inline; filename="' . $pds->file_name . '"';
            }
            // For other files, we might want to download them
            else {
                $headers['Content-Disposition'] = 'attachment; filename="' . $pds->file_name . '"';
            }

            return response()->file($filePath, $headers);
        } catch (\Exception $e) {
            \Log::error('PDS View Error: ' . $e->getMessage());
            return $this->badRequest('Unable to retrieve file: ' . $e->getMessage());
        }
    }

    // Add this method to get file info
    public function getFile($id)
    {
        try {
            $pds = PersonalDataSheet::findOrFail($id);
            
            // Check if user has permission to view this file
            $user = Auth::user();
            $isPrivilegedUser = false;
            foreach ($user->roles as $role) {
                if (in_array(strtolower($role->name), ['principal', 'secretary'])) {
                    $isPrivilegedUser = true;
                    break;
                }
            }
            
            if (!$isPrivilegedUser) {
                // Regular users (including admins) can only view their own files
                // Get user's full name for matching
                $userFullName = $user->username; // Default to username
                if ($user->employee) {
                    $userFullName = $user->employee->getFullName();
                }
                
                if ($pds->owner_name !== $userFullName && $pds->uploader !== $user->username) {
                    return $this->unauthorized('You do not have permission to view this file');
                }
            }

            return $this->ok([
                'id' => $pds->id,
                'file_name' => $pds->file_name,
                'original_name' => $pds->original_name,
                'file_url' => $pds->file_url,
                'file_size' => $pds->file_size,
                'file_type' => $pds->file_type,
                'owner_name' => $pds->owner_name,
                'uploader' => $pds->uploader,
                'uploaded_at' => $pds->uploaded_at,
            ]);
        } catch (\Exception $e) {
            return $this->badRequest('File not found: ' . $e->getMessage());
        }
    }
    
    public function deleteFile($id)
    {
        try {
            $pds = PersonalDataSheet::findOrFail($id);
            
            // Check if user has permission to delete this file
            $user = Auth::user();
            $isPrivilegedUser = false;
            foreach ($user->roles as $role) {
                if (in_array(strtolower($role->name), ['principal', 'secretary'])) {
                    $isPrivilegedUser = true;
                    break;
                }
            }
            
            if (!$isPrivilegedUser) {
                // Regular users (including admins) can only delete their own files
                if ($pds->uploader !== $user->username) {
                    return $this->unauthorized('You do not have permission to delete this file');
                }
            }

            // Delete the physical file
            if (Storage::disk('public')->exists($pds->file_path)) {
                Storage::disk('public')->delete($pds->file_path);
            }

            // Delete the database record
            $pds->delete();

            return $this->ok(null, 'File deleted successfully');
        } catch (\Exception $e) {

            return $this->badRequest('Failed to delete file: ' . $e->getMessage(), 500);
        }
    }
}