<?php

namespace App\Http\Controllers;

use App\Models\PersonalDataSheet;
use Auth;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Storage;
use Str;

class PersonalDataSheetController extends Controller
{
    public function index()
    {
        $pds = PersonalDataSheet::all();
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

        // Build a clean, unique filename: employeeName-slug + timestamp + extension
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension    = $file->getClientOriginalExtension();
        $filename     =  $originalName . $extension;


        $path = $file->storeAs('uploads', $filename, 'public'); // returns "uploads/filename.ext"

        $url = Storage::disk('public')->url($path); // Full URL for use in frontend
        $pds = PersonalDataSheet::create([
            'uploader' => Auth::user()->username, // Assuming user is authenticated
            'file_path' => $url,
            'file_name' => $filename,
            'file_size' => $file->getSize(),
            'file_type' => $file->getMimeType(),
            'owner_name' => $employeeName,
        ]);

        return $this->ok($pds);
    }
    public function viewFile($id)
    {
        try {
            $pds = PersonalDataSheet::findOrFail($id);

            // Check if file exists
            if (!Storage::disk('public')->exists($pds->file_path)) {
                return $this->badRequest('File not found');
            }

            // Return file for viewing/download
            echo $pds->file_path, $pds->original_name;
            return Storage::disk('public')->response($pds->file_path, $pds->original_name);
        } catch (\Exception $e) {
            return $this->badRequest('Unable to retrieve file');
        }
    }

    // Add this method to get file info
    public function getFile($id)
    {
        try {
            $pds = PersonalDataSheet::findOrFail($id);

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
            return $this->badRequest('File not found');
        }
    }
    public function deleteFile($id)
    {
        try {
            $pds = PersonalDataSheet::findOrFail($id);

            // Check if user has permission to delete (optional)
            // if ($pds->uploader !== Auth::user()->username && !Auth::user()->hasRole('admin')) {
            //     return $this->unauthorized('You do not have permission to delete this file');
            // }

            // Delete the physical file
            if (Storage::disk('public')->exists($pds->file_path)) {
                Storage::disk('public')->delete($pds->file_path);
            }

            // Delete the database record
            $pds->delete();

            return $this->ok(null, 'File deleted successfully');
        } catch (\Exception $e) {

            return $this->badRequest('Failed to delete file', 500);
        }
    }
}
