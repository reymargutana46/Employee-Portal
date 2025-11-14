"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Download,
  FileText,
  Upload,
  Trash2,
  Eye,
  Calendar,
  User,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

import axios from "@/store/usePersonalDataSheet";
import instance from "@/utils/axiosInstance";
import type { Res } from "@/types/response";
import { useAuthStore } from "@/store/useAuthStore";
import { UploadedFile, StagedFile, formatFileSize, getFileIcon } from "@/utils/pdsHelpers";

const PDS = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [stagedFile, setStagedFile] = useState<StagedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Check if user is principal or secretary
  const isPrivilegedUser = user?.roles?.some(role => 
    ['principal', 'secretary'].includes(role.name.toLowerCase())
  ) || false;

  const fetchAllFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      // Updated to match your backend route
      const response = await instance.get<Res<UploadedFile[]>>("/pds");

      if (!response.data.data) {
        throw new Error("Failed to fetch files");
      }

      const data = response.data.data;
      setUploadedFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Error",
        description: "Failed to load files from server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch all PDS files on component mount
  useEffect(() => {
    fetchAllFiles();
  }, [fetchAllFiles]);

  const handleFileSelection = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0]; // Only take the first file

    // Validate file type - updated to match backend validation
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description:
          "Please upload only PDF, Word documents, images, or text files.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // For all users, pre-fill employee name with their full name (no manual input)
    const defaultEmployeeName = user?.fullname ? user.fullname : user?.username || "";

    const newStagedFile: StagedFile = {
      file,
      employeeName: defaultEmployeeName,
    };

    setStagedFile(newStagedFile);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelection(e.dataTransfer.files);
  };

  const removeStagedFile = () => {
    setStagedFile(null);
  };

  // Updated upload function to match backend response
  const handleUpload = async () => {
    if (!stagedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file first.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!stagedFile.employeeName.trim()) {
      toast({
        title: "Missing employee information",
        description: "Please provide the employee name.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", stagedFile.file);
      formData.append("employeeName", stagedFile.employeeName);

      // Updated to match your backend route
      const response = await axios.post("/pds/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Clear staged file and form
      setStagedFile(null);

      // Refresh the files list
      await fetchAllFiles();

      toast({
        title: "File uploaded successfully",
        description:
          response.data.message ||
          "The PDS file has been uploaded successfully.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error.response?.data?.message ||
          "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Updated delete function
  const handleDeleteFile = async (id: number) => {
    try {
      const response = await axios.delete(`/pds/files/${id}`);

      if (response.status !== 200) {
        throw new Error("Delete failed");
      }

      // Refresh the files list
      await fetchAllFiles();

      toast({
        title: "File deleted",
        description: "The file has been removed from the system.",
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description:
          error.response?.data?.message || "Failed to delete the file.",
        variant: "destructive",
      });
    }
  };

  // Updated download function to use the view endpoint
  const handleDownloadFile = async (id: number, filename: string) => {
    try {
      const response = await axios.get(`/pds/files/${id}/view`, {
        responseType: "blob",
      });

      if (response.status !== 200) {
        throw new Error("Download failed");
      }

      // Get the content type from response headers
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      
      // Create blob with proper content type
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: "The file download has started.",
      });
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description:
          error.response?.data?.message || "Failed to download the file.",
        variant: "destructive",
      });
    }
  };

  // Updated view function to use authenticated API call and create blob URL
  const handleViewFile = async (file: UploadedFile) => {
    try {
      const response = await axios.get(`/pds/files/${file.id}/view`, {
        responseType: "blob",
      });

      if (response.status !== 200) {
        throw new Error("View failed");
      }

      // Get the content type from response headers
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      
      // Create blob with proper content type
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      // Open in a new tab
      window.open(url, "_blank", "noopener,noreferrer");
      
      // Clean up the blob URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
      toast({
        title: "Opening file",
        description: "The file is being opened in a new tab.",
      });
    } catch (error: any) {
      console.error("View error:", error);
      toast({
        title: "View failed",
        description: error.response?.data?.message || "Failed to open the file for viewing.",
        variant: "destructive",
      });
    }
  };

  // Updated template download function (if you have this endpoint)
  const downloadTemplate = () => {
    try {
      const filePath = "/CS-Form-No.-212-Personal-Data-Sheet-revised.xlsx";
      const a = document.createElement("a");
      a.href = filePath;
      a.download = "PDS_Template.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "Template downloaded",
        description: "PDS template has been downloaded to your device.",
      });
    } catch (error) {
      console.error("Template download error:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the template.",
        variant: "destructive",
      });
    }
  };

  const filteredFiles = uploadedFiles.filter(
    (file) =>
      file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.original_name &&
        file.original_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (file.owner_name &&
        file.owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading PDS files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Personal Data Sheet Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload, manage, and track employee personal data sheets
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2 hover:bg-blue-50"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Personal Data Sheet
          </CardTitle>
          <CardDescription>
            Select a single PDS file to upload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Select PDS File</h3>
                <p className="text-muted-foreground">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, Word documents, images, and text files (max
                  10MB)
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4"
              >
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                onChange={(e) => handleFileSelection(e.target.files)}
                className="hidden"
              />
            </div>
          </div>

          {/* Staged File Preview */}
          {stagedFile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">File Ready for Upload</h3>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    "Upload File"
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                <span className="text-2xl">
                  {getFileIcon(stagedFile.file.type)}
                </span>

                <div className="flex-1">
                  <div>
                    <p className="font-medium">{stagedFile.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(stagedFile.file.size)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Employee: {stagedFile.employeeName}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={removeStagedFile}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Section - Only show for privileged users */}
      {isPrivilegedUser && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by filename or employee..."
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Files Table */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Uploaded Files</CardTitle>
              <CardDescription>
                Showing <span className="font-bold">{filteredFiles.length}</span> of <span className="font-bold">{uploadedFiles.length}</span> files
                {isPrivilegedUser && (
                  <span> (All employees)</span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No files found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Upload your first PDS file to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b">
                  <tr>
                    <th className="text-left font-semibold py-4 px-6 text-gray-900">
                      File
                    </th>
                    <th className="text-left font-semibold py-4 px-6 text-gray-900">
                      Employee
                    </th>
                    <th className="text-left font-semibold py-4 px-6 text-gray-900">
                      Upload Date
                    </th>
                    <th className="text-right font-semibold py-4 px-6 text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file, index) => (
                    <tr
                      key={file.id}
                      className={`border-b hover:bg-gray-50/50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/25"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getFileIcon(file.file_type)}
                          </span>
                          <div>
                            <div className="font-medium text-gray-900">
                              {file.original_name || file.file_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatFileSize(file.file_size)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {file.owner_name || "Not specified"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(
                              file.uploaded_at || file.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewFile(file)}
                            title="View file"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDownloadFile(file.id, file.original_name || file.file_name)}
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete file"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete File</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {file.original_name || file.file_name}"? This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteFile(file.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDS;