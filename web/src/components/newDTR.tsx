
import { Database, CheckCircle, AlertCircle } from 'lucide-react';
import { FileUploader } from './FileUploader';
import { SheetSelector } from './SheetSelector';
import { ColumnMapper } from './ColumnMapper';
import { DataPreview } from './DataPreview';
import { parseFile, ParsedData } from '@/utils/fileParser';
import { mapRowToRecord, ColumnMappings } from '@/utils/dataMapper';
// Supabase imports removed - using local API




import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";


import { useState, useRef, DragEvent } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDTRStore } from "@/store/useDTRStore";
import { Upload, File } from "lucide-react";
import axios from "@/utils/axiosInstance";
import { isAxiosError } from "axios";
import { useToast } from "./ui/use-toast";

type ParsedDTRRow = {
  day: string;
  amArrival: string;
  amDeparture: string;
  pmArrival: string;
  pmDeparture: string;
  undertimeHour: string;
  undertimeMinute: string;
};

// Convert Excel time (decimal) to HH:MM format
function convertTimeToString(value: unknown): string {
  if (value === undefined || value === null || value === "") return "";

  // Convert Excel time (decimal) to HH:MM format
  if (typeof value === "number") {
    // Excel stores time as fraction of 24 hours
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  // If already a string with a colon, assume it's a time string
  if (typeof value === "string") {
    if (value.includes(":")) return value;

    // If it's a numeric string, treat it as Excel time
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      return convertTimeToString(numValue);
    }
  }

  return String(value) || "";
}

// Common processing function for both CSV and XLSX
function processDTRRows(rows: ParsedDTRRow[]): ParsedDTRRow[] {
  // Sort rows by day number
  rows.sort((a, b) => parseInt(a.day) - parseInt(b.day));

  // If we're missing day 1 but have other days, add it
  if (rows.length > 0 && parseInt(rows[0].day) > 1) {
    rows.unshift({
      day: "1",
      amArrival: "",
      amDeparture: "",
      pmArrival: "",
      pmDeparture: "",
      undertimeHour: "",
      undertimeMinute: "",
    });
  }

  return rows;
}

function mapCSVToDTRRows(data: unknown[][], startRow: number = 1): ParsedDTRRow[] {
  // Find the row with headers or day numbers
  let dataStartRow = startRow;
  let headerRowIndex = startRow - 1;

  // First look for headers
  for (let i = 0; i < data.length; i++) {
    if (
      data[i] &&
      Array.isArray(data[i]) &&
      data[i].some(
        (cell) =>
          cell === "Day" || (typeof cell === "string" && cell?.includes("Day"))
      )
    ) {
      headerRowIndex = i;
      dataStartRow = i + 1;
      break;
    }
  }

  // If no headers found, look for day numbers
  if (dataStartRow === startRow) {
    for (let i = startRow; i < data.length; i++) {
      if (data[i] && data[i][0] && !isNaN(Number(data[i][0]))) {
        dataStartRow = i;
        headerRowIndex = i - 1;
        break;
      }
    }
  }

  // Fallback to static row if nothing found
  if (dataStartRow === startRow) {
    dataStartRow = startRow; // Use the provided startRow
    headerRowIndex = startRow - 1;
  }

  // Extract rows
  const rows: ParsedDTRRow[] = [];
  for (let i = dataStartRow; i < data.length; i++) {
    const row = data[i];
    if (!row || !row.length) continue;

    const day = parseInt(String(row[0] ?? ""));
    if (isNaN(day) || day <= 0) continue;

    rows.push({
      day: day.toString(),
      amArrival: convertTimeToString(row[1]),
      amDeparture: convertTimeToString(row[2]),
      pmArrival: convertTimeToString(row[3]),
      pmDeparture: convertTimeToString(row[4]),
      undertimeHour: String(row[5] ?? ""),
      undertimeMinute: String(row[6] ?? ""),
    });
  }

  return processDTRRows(rows);
}

function mapXLSXToDTRRows(wsData: XLSX.WorkSheet): ParsedDTRRow[] {
  // Find the row with the headers or day numbers
  const rows: ParsedDTRRow[] = [];

  for (let i = 14; i <= 44; i++) {
    // loop through reasonable range
    const cell = wsData[`A${i}`];
    const dayRaw = cell?.w ?? cell?.v;
    const day = parseInt(dayRaw?.toString().trim()); // Trim the day string
    console.log(wsData[`F${i}`]?.w?.toLowerCase());
    if (isNaN(day)) break; // stop loop if A cell is no longer a number
    rows.push({
      day: day.toString(),
      amArrival: convertTimeToString(wsData[`B${i}`]?.w?.toLowerCase()),
      amDeparture: convertTimeToString(wsData[`C${i}`]?.w?.toLowerCase()),
      pmArrival: convertTimeToString(wsData[`D${i}`]?.w?.toLowerCase()),
      pmDeparture: convertTimeToString(wsData[`E${i}`]?.w?.toLowerCase()),
      undertimeHour: convertTimeToString(wsData[`F${i}`]?.w?.toLowerCase()),
      undertimeMinute: wsData[`G${i}`]?.w,
    });
    console.log(rows);
  }
  return rows;
}

export function ImportDTRDialog() {

  const [open, setOpen] = useState(false);
const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [startRow, setStartRow] = useState<number>(1);
  const [columnMappings, setColumnMappings] = useState<ColumnMappings>({
    employeeName: -1,
    employeeId: -1,
    date: -1,
    timeIn: -1,
    timeOut: -1,
    timeIn2: -1,
    timeOut2: -1,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleFileSelect = async (file: File) => {
    try {
      const data = await parseFile(file);
      setParsedData(data);
      setSelectedSheet(data.sheets[0]);
      setUploadStatus({ type: null, message: '' });
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const handleMappingChange = (field: string, columnIndex: number) => {
    setColumnMappings((prev) => ({
      ...prev,
      [field]: columnIndex,
    }));
  };

  const getHeaderRow = (): string[] => {
    if (!parsedData || !selectedSheet) return [];
    const sheetData = parsedData.data[selectedSheet];
    if (!sheetData || sheetData.length === 0) return [];

    const headerRowIndex = Math.max(0, startRow - 1);
    const headerRow = sheetData[headerRowIndex];

    return Array.isArray(headerRow)
      ? headerRow.map((cell) => String(cell ?? ''))
      : [];
  };

  const handleMigrate = async () => {
    if (!parsedData || !selectedSheet) return;

    if (columnMappings.employeeName === -1 || columnMappings.date === -1 || columnMappings.timeIn === -1) {
      setUploadStatus({
        type: 'error',
        message: 'Please map all required fields (Employee Name, Date, Time In)',
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const sheetData = parsedData.data[selectedSheet];
      const dataRows = sheetData.slice(startRow);

      const records: any[] = [];
      for (const row of dataRows) {
        if (!Array.isArray(row) || row.length === 0) continue;
        const record = mapRowToRecord(row, columnMappings);

        console.log(columnMappings);
        if (record) {
          records.push(record);
        }
      }

      if (records.length === 0) {
        setUploadStatus({
          type: 'error',
          message: 'No valid records found to import',
        });
        setIsUploading(false);
        return;
      }

      try {
        // Helper function to convert ISO datetime to time format
        const convertToTimeFormat = (dateTimeStr: string | undefined): string => {
          if (!dateTimeStr) return '';
          
          // If it's already in time format (e.g., "8:30 AM"), return as is
          if (dateTimeStr.includes('AM') || dateTimeStr.includes('PM')) {
            return dateTimeStr;
          }
          
          // If it's an ISO datetime string, extract just the time part
          if (dateTimeStr.includes('T')) {
            const date = new Date(dateTimeStr);
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours || 12; // 0 should be 12
            const minutesStr = minutes < 10 ? '0' + minutes : minutes;
            return `${hours}:${minutesStr} ${ampm}`;
          }
          
          // Return as is if it doesn't match any pattern
          return dateTimeStr;
        };
        
        // Use local API endpoint
        const requestData = {
          employee_name: 'Multi-Employee Import',
          month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          records: records.map(record => ({
            employee_id: record.employee_id, // Include employee_id for backend processing
            // employee_name will be set by backend using database employee data
            day: new Date(record.date).getDate().toString(),
            am_arrival: convertToTimeFormat(record.time_in),
            am_departure: convertToTimeFormat(record.time_out),
            pm_arrival: convertToTimeFormat(record.time_in2),
            pm_departure: convertToTimeFormat(record.time_out2),
            undertime_hour: '0',
            undertime_minute: '0'
          }))
        };
        
        const response = await axios.post('/dtr/import', requestData);
        
        console.log('Import successful:', response.data);
        const count = records.length;
        setUploadStatus({
          type: 'success',
          message: `Successfully imported ${count} records!`,
        });
      } catch (error: unknown) {
        console.error('Import error:', error);
        let errorMessage = 'Failed to import data';
        
        if (isAxiosError(error)) {
          if (error.response?.status === 422) {
            const validationErrors = error.response.data;
            console.error('Validation errors:', validationErrors);
            errorMessage = `Validation failed: ${JSON.stringify(validationErrors)}`;
          } else if (error.response?.status === 404) {
            const errorData = error.response.data;
            if (errorData?.message?.includes('not found')) {
              const employeeName = records[0]?.employee_name || 'Unknown';
              errorMessage = `Employee not found in database. Please check the employee name: "${employeeName}"`;
            } else {
              errorMessage = errorData?.message || 'Resource not found';
            }
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else {
            errorMessage = `HTTP ${error.response?.status}: ${error.message}`;
          }
        } else if (error instanceof Error) {
          errorMessage = `Failed to import data: ${error.message}`;
        }
        
        setUploadStatus({
          type: 'error',
          message: errorMessage,
        });
      }
      setIsUploading(false);
      setParsedData(null);
      setSelectedSheet('');
      setColumnMappings({
        employeeName: -1,
        employeeId: -1,
        date: -1,
        timeIn: -1,
        timeOut: -1,
        timeIn2: -1,
        timeOut2: -1,
      });
      setStartRow(1);
    } catch (error: unknown) {
      setUploadStatus({
        type: 'error',
        message: `Failed to import data: ${(error as Error).message || 'Unknown error'}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Import DTR
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-4xl w-full max-h-[90vh] flex flex-col outline-none overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle>Import Daily Time Record (CSV/XLSX)</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col flex-grow overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="container mx-auto px-4 py-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-3">
                  <Database className="w-10 h-10 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">DTR Data Migration</h1>
                <p className="text-gray-600 text-sm">Import your time records from CSV, XLS, or XLSX files</p>
              </div>

              {uploadStatus.type && (
                <div
                  className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                    uploadStatus.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {uploadStatus.type === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <p className="text-sm">{uploadStatus.message}</p>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-lg p-6">
                {!parsedData ? (
                  <FileUploader onFileSelect={handleFileSelect} />
                ) : (
                  <div className="space-y-5">
                    <SheetSelector
                      sheets={parsedData.sheets}
                      selectedSheet={selectedSheet}
                      onSheetChange={setSelectedSheet}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Starting Row (data begins)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={startRow}
                        onChange={(e) => setStartRow(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Row number where actual data starts (skip headers)
                      </p>
                    </div>

                    <ColumnMapper
                      columns={getHeaderRow()}
                      mappings={columnMappings}
                      onMappingChange={handleMappingChange}
                    />
                    

                    {parsedData.data[selectedSheet] && parsedData.data[selectedSheet].length > 0 && (
                      <DataPreview data={parsedData.data[selectedSheet]} startRow={startRow} />
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setParsedData(null);
                          setSelectedSheet('');
                          setColumnMappings({
                            employeeName: 0,
                            employeeId: 0,
                            date: 0,
                            timeIn: 0,
                            timeOut: 0,
                            timeIn2: 0,
                            timeOut2: 0,
                          });
                          setStartRow(1);
                          setUploadStatus({ type: null, message: '' });
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleMigrate}
                        disabled={isUploading}
                        className="flex-1"
                      >
                        {isUploading ? 'Importing...' : 'Import to Database'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
