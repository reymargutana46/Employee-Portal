import { Upload } from 'lucide-react';
import { ChangeEvent } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors p-6"
      >
        <div className="flex flex-col items-center justify-center py-4">
          <Upload className="w-12 h-12 mb-4 text-gray-400" />
          <p className="mb-2 text-sm text-gray-600">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">CSV, XLS, or XLSX files</p>
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".csv,.xls,.xlsx"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};
