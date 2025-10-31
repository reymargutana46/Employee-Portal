// Helper functions for PDS component

export interface UploadedFile {
  id: number;
  file_path: string;
  file_url: string;
  file_name: string;
  original_name: string;
  file_size: string | number;
  file_type: string;
  uploader: string;
  created_at: string;
  updated_at: string;
  uploaded_at: string;
  owner_name: string | null;
}

export interface StagedFile {
  file: File;
  employeeName: string;
}

export const formatFileSize = (bytes: string | number) => {
  const numBytes = typeof bytes === "string" ? Number.parseInt(bytes) : bytes;
  if (numBytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return (
    Number.parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

export const getFileIcon = (type: string) => {
  if (type.includes("pdf")) return "📄";
  if (type.includes("word") || type.includes("document")) return "📝";
  if (type.includes("image")) return "🖼️";
  return "📁";
};