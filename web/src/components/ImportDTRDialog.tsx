/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, DragEvent, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDTRStore } from "@/store/useDTRStore";
import { Upload, File } from "lucide-react";
import axios from "@/utils/axiosInstance";
import { useToast } from "./ui/use-toast";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { Employee } from "@/types/employee";
import { createBiometricMapping, validateBiometricMapping, findEmployeeByName, createComprehensiveMapping, discoverBiometricIds } from "@/utils/employeeMapping";

type ParsedDTRRow = {
  day: string;
  employee_id?: number;
  employee_name?: string;
  amArrival: string;
  amDeparture: string;
  pmArrival: string;
  pmDeparture: string;
  undertimeHour: string;
  undertimeMinute: string;
};

// Convert Excel time (decimal) to HH:MM format
function convertTimeToString(value: any): string {
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

  return value?.toString() || "";
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


function mapCSVToDTRRows(data: any[], selectedEmployeeId: number | null, employees: any[] = []): ParsedDTRRow[] {
  const rows: ParsedDTRRow[] = [];
  
  console.log("Processing CSV data:", data.slice(0, 5)); // Log first 5 rows
  
  // Create comprehensive biometric ID mapping for all employees in CSV
  const { mapping: biometricToDbMapping, unmappedIds, mappedCount } = createComprehensiveMapping(data, employees);
  
  console.log(`=== MAPPING SUMMARY ===`);
  console.log(`Total mapped employees: ${mappedCount}`);
  console.log(`Unmapped biometric IDs: ${unmappedIds.length}`);
  
  if (unmappedIds.length > 0) {
    console.warn("Unmapped biometric IDs found:");
    unmappedIds.forEach(({ biometricId, csvName }) => {
      console.warn(`- ${csvName} (ID: ${biometricId}) - No matching employee found in database`);
    });
  }
  
  // Find header row and data start
  let dataStartRow = 0;
  for (let i = 0; i < Math.min(data.length, 10); i++) {
    if (data[i] && data[i].length > 0) {
      const firstCell = String(data[i][0] || "").toLowerCase();
      // Skip header rows
      if (firstCell.includes("id") || firstCell.includes("name") || firstCell.includes("employee")) {
        dataStartRow = i + 1;
        console.log(`Found header at row ${i}, data starts at ${dataStartRow}`);
        continue;
      }
      // If we find a numeric ID, this is data
      if (!isNaN(Number(data[i][0])) && Number(data[i][0]) > 0) {
        dataStartRow = i;
        console.log(`Found data starting at row ${i}`);
        break;
      }
    }
  }

  // Process each data row
  for (let i = dataStartRow; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 4) continue;

    // Extract data based on your CSV format:
    // Column 0: ID (Employee ID)
    // Column 1: Name 
    // Column 2: Department
    // Column 3: Date
    // Column 4: First time in (On-duty)
    // Column 5: First time out (Off-duty) 
    // Column 6: Second time in (On-duty)
    // Column 7: Second time out (Off-duty)

    const employeeIdRaw = String(row[0] || "").trim();
    const employeeName = String(row[1] || "").trim();
    const dateRaw = String(row[3] || "").trim();
    const timeIn1 = String(row[4] || "").trim();
    const timeOut1 = String(row[5] || "").trim();
    const timeIn2 = String(row[6] || "").trim();
    const timeOut2 = String(row[7] || "").trim();

    console.log(`Row ${i}: ID=${employeeIdRaw}, Name=${employeeName}, Date=${dateRaw}`);

    // Skip if no employee ID
    if (!employeeIdRaw || isNaN(Number(employeeIdRaw))) {
      console.log(`Skipping row ${i}: Invalid employee ID`);
      continue;
    }

    const biometricId = parseInt(employeeIdRaw);
    // Use the biometric ID directly as employee ID if not mapped
    const employeeId = biometricToDbMapping[biometricId] || biometricId;
    
    if (!biometricToDbMapping[biometricId]) {
      console.warn(`Warning: Biometric ID ${biometricId} not mapped to database employee, using biometric ID as employee ID`);
    } else {
      console.log(`Mapped biometric ID ${biometricId} to database employee ID ${employeeId}`);
    }

    // Extract day from date (format: 2025-08-01)
    let day = "";
    if (dateRaw) {
      const dateMatch = dateRaw.match(/\d{4}-\d{2}-(\d{2})/);
      if (dateMatch) {
        day = parseInt(dateMatch[1]).toString(); // Remove leading zero
      }
    }

    if (!day) {
      console.log(`Skipping row ${i}: Could not extract day from date ${dateRaw}`);
      continue;
    }

    console.log(`Processing: Employee ${employeeId}, Day ${day}, Times: ${timeIn1}|${timeOut1}|${timeIn2}|${timeOut2}`);

    // Skip rows with no time data
    if (!timeIn1 && !timeOut1 && !timeIn2 && !timeOut2) {
      console.log(`Skipping row ${i}: No time data`);
      continue;
    }

    rows.push({
      day: day,
      employee_id: employeeId,
      employee_name: employeeName, // Include the name from CSV
      amArrival: convertTimeToString(timeIn1),
      amDeparture: convertTimeToString(timeOut1),
      pmArrival: convertTimeToString(timeIn2),
      pmDeparture: convertTimeToString(timeOut2),
      undertimeHour: "",
      undertimeMinute: "",
    });
  }

  console.log(`Parsed ${rows.length} rows from CSV`);
  return processDTRRows(rows);
}

function mapXLSXToDTRRows(wsData: XLSX.WorkSheet, selectedEmployeeId: number | null): ParsedDTRRow[] {
  const rows: ParsedDTRRow[] = [];
  
  // Find employee_id column by checking headers (row 13 or nearby)
  let employeeIdColumn = '';
  for (let headerRow = 10; headerRow <= 15; headerRow++) {
    for (let col = 0; col < 26; col++) { // Check columns A-Z
      const colLetter = String.fromCharCode(65 + col);
      const headerCell = wsData[`${colLetter}${headerRow}`];
      const headerValue = (headerCell?.w || headerCell?.v || '').toString().toLowerCase();
      
      if (headerValue.includes('employee_id') || headerValue.includes('employeeid') || headerValue === 'employee id') {
        employeeIdColumn = colLetter;
        break;
      }
    }
    if (employeeIdColumn) break;
  }
  
  for (let i = 14; i <= 44; i++) {
    // loop through reasonable range
    const cell = wsData[`A${i}`];
    const dayRaw = cell?.w ?? cell?.v;
    const day = parseInt(dayRaw?.toString().trim()); // Trim the day string
    if (isNaN(day)) break; // stop loop if A cell is no longer a number
    
    // Get employee_id from the file or use selected employee
    let employeeId: number | undefined;
    if (employeeIdColumn && wsData[`${employeeIdColumn}${i}`]) {
      const empIdRaw = wsData[`${employeeIdColumn}${i}`]?.w ?? wsData[`${employeeIdColumn}${i}`]?.v;
      employeeId = parseInt(empIdRaw?.toString() || "");
      if (isNaN(employeeId)) employeeId = undefined;
    } else {
      employeeId = selectedEmployeeId || undefined;
    }
    
    rows.push({
      day: day.toString(),
      employee_id: employeeId,
      amArrival: convertTimeToString(wsData[`B${i}`]?.w?.toLowerCase()),
      amDeparture: convertTimeToString(wsData[`C${i}`]?.w?.toLowerCase()),
      pmArrival: convertTimeToString(wsData[`D${i}`]?.w?.toLowerCase()),
      pmDeparture: convertTimeToString(wsData[`E${i}`]?.w?.toLowerCase()),
      undertimeHour: convertTimeToString(wsData[`F${i}`]?.w?.toLowerCase()),
      undertimeMinute: wsData[`G${i}`]?.w,
    });
  }
  return rows;
}

export function ImportDTRDialog() {
  const { toast } = useToast();
  const { employees, fetchEmployee } = useEmployeeStore();

  const [open, setOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedDTRRow[]>([]);
  const [filename, setFilename] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [month, setMonth] = useState("");

  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fetchDTR } = useDTRStore();

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const extractEmployeeName = (data: any[]) => {
    // Look for name field in various locations
    for (let i = 0; i < data.length && i < 15; i++) {
      if (!data[i]) continue;

      for (let j = 0; j < data[i]?.length; j++) {
        const cellValue = String(data[i][j] || "").trim();

        // Check for "(Name)" or similar patterns
        if (cellValue === "(Name)" || cellValue.includes("Name")) {
          // Check the cell to the right or below for the actual name
          if (data[i][j + 1]) return String(data[i][j + 1]).trim();
          if (data[i + 1] && data[i + 1][j])
            return String(data[i + 1][j]).trim();
        }
      }
    }

    // Fallback to the original method
    const nameCell = data[4]?.[0] ?? "";
    return nameCell ? String(nameCell).trim() : "";
  };

  const extractMonth = (data: any[][]) => {
    for (let i = 0; i < data.length && i < 15; i++) {
      if (!data[i]) continue;

      for (let j = 0; j < data[i].length; j++) {
        const cellValue = String(data[i][j] || "").trim();

        if (
          cellValue.toLowerCase().includes("for the month of") ||
          cellValue.toLowerCase().includes("month")
        ) {
          // Try to get the value to the right
          if (data[i][j + 2]) return String(data[i][j + 2]).trim();
          else
            toast({
              variant: "destructive",
              title: "Import Error",
              description: "No Month included in the DTR file",
            });
        }
      }
    }

    return null;
  };

  const handleFile = (file: File) => {
    setFilename(file.name);

    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        complete: (results) => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const csv = results.data as any[];
            setEmployeeName(extractEmployeeName(csv));
            setMonth(extractMonth(csv));
            const rows = mapCSVToDTRRows(csv, selectedEmployeeId, employees);
            setParsedRows(rows);
            
            // Show import summary
            const uniqueEmployees = new Set(rows.filter(row => row.employee_id).map(row => row.employee_id)).size;
            const rowsWithEmployeeId = rows.filter(row => row.employee_id).length;
            
            toast({
              title: "File Imported",
              description: `Parsed ${rows.length} rows from ${file.name}. Found ${uniqueEmployees} employees with ${rowsWithEmployeeId} valid records.`,
            });
          } catch (err) {
            console.error("CSV parsing error:", err);
            toast({
              variant: "destructive",
              title: "Import Error",

              description: "Failed to parse CSV file.",
            });
          }
        },
        error: () => {
          toast({
            variant: "destructive",
            title: "Import Error",

            description: "Failed to parse CSV file.",
          });
        },
      });
    } else if (file.name.endsWith(".xlsx")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const wsName = workbook.SheetNames[0];
          const ws = workbook.Sheets[wsName];
          const wsData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
          setEmployeeName(extractEmployeeName(wsData));
          setMonth(extractMonth(wsData));
          console.log(ws);
          const rows = mapXLSXToDTRRows(ws, selectedEmployeeId);
          setParsedRows(rows);

          // HERE
          console.log(rows);
          console.log(wsData);
          toast({
            title: "File Imported",
            description: `Parsed ${rows.length} rows from ${file.name}`,
          });
        } catch (err) {
          console.error("XLSX parsing error:", err);
          toast({
            variant: "destructive",
            title: "Import Error",

            description: "Failed to parse XSLX file.",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File",

        description: "Unable to read file type.",
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleSave = async () => {
    // Ensure month is present
    if (!month) {
      toast({
        variant: "destructive",
        title: "No Month Selected",
        description: "Please select a month before importing.",
      });
      return;
    }

    // Ensure we actually have parsed rows
    if (parsedRows.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data to Import",
        description: "Please upload a file before importing.",
      });
      return;
    }

    // Check if we have any rows with employee_id, if not, require selection
    const rowsWithEmployeeId = parsedRows.filter(row => row.employee_id);
    if (rowsWithEmployeeId.length === 0 && !selectedEmployeeId) {
      toast({
        variant: "destructive",
        title: "No Employee Information",
        description: "Your file doesn't contain employee_id data. Please select an employee from the dropdown.",
      });
      return;
    }

    // Filter and prepare records for import
    const toSend = parsedRows
      .filter(
        (row) =>
          row.day &&
          (row.employee_id || selectedEmployeeId) && // Must have employee_id from CSV or selection
          (row.amArrival ||
            row.amDeparture ||
            row.pmArrival ||
            row.pmDeparture)
      )
      .map((row) => ({
        day: row.day,
        employee_id: row.employee_id || selectedEmployeeId, // Use CSV employee_id or selected one
        employee_name: row.employee_name, // Send employee name for backend processing
        am_arrival: row.amArrival,
        am_departure: row.amDeparture,
        pm_arrival: row.pmArrival,
        pm_departure: row.pmDeparture,
        undertime_hour: row.undertimeHour,
        undertime_minute: row.undertimeMinute,
      }));

    console.log("Final records to send to backend:", toSend);

    if (toSend.length === 0) {
      toast({
        variant: "destructive",
        title: "No Valid Records",
        description: "No valid DTR records found to import. Make sure your file contains employee_id for each row.",
      });
      return;
    }

    // Count unique employees
    const uniqueEmployees = new Set(toSend.map(row => row.employee_id));
    const employeeCount = uniqueEmployees.size;

    setLoading(true);
    try {
      const response = await axios.post("/dtr/import", {
        employee_name: "Multi-Employee Import", // This will be overridden by backend using actual employee names
        month,
        records: toSend,
      });

      const responseData: any = response.data;
      const stats = responseData?.data || {};
      const importedCount: number = stats.imported_count ?? toSend.length;
      const skippedCount: number = stats.skipped_count ?? 0;

      fetchDTR();

      toast({
        title: "DTR Imported",
        description:
          skippedCount > 0
            ? `Imported ${importedCount} records for ${employeeCount} employees, skipped ${skippedCount} invalid rows.`
            : `Successfully imported ${importedCount} records for ${employeeCount} employees.`,
      });

      setOpen(false);
      setParsedRows([]);
      setFilename("");
      setEmployeeName("");
      setSelectedEmployeeId(null);
      setMonth("");
    } catch (err: any) {
      console.log(err);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: err?.response?.data?.message || "Failed to import DTR records",
      });
    } finally {
      setLoading(false);
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
        className="max-w-4xl w-full max-h-[90vh] flex flex-col outline-none"
      >
        <DialogHeader>
          <DialogTitle>Import Daily Time Record (CSV/XLSX)</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col flex-grow overflow-hidden">
          <div className="my-2">
            <div
              className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-all
                  ${
                    dragActive
                      ? "border-primary bg-purple-50"
                      : "border-muted bg-background"
                  }
                `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              tabIndex={0}
              role="button"
              aria-label="Upload file"
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-1" />
              <span className="font-medium text-base">
                Drag and drop a .csv or .xlsx file here, or click to select one
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                Supported formats: <strong>.csv, .xlsx</strong>
              </span>
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileInput}
                tabIndex={-1}
              />
            </div>
            {filename && (
              <p className="text-xs text-muted-foreground mt-2">
                <File className="inline w-4 h-4 mr-1" />{" "}
                <span className="font-medium">{filename}</span>
              </p>
            )}
          </div>
          {month && (
            <div className="mb-2 flex flex-col gap-1 items-start">
              <span className="text-sm text-muted-foreground">Month of</span>
              <span className="text-lg font-semibold">{month}</span>
            </div>
          )}
          {employeeName && (
            <div className="mb-2 flex flex-col gap-1 items-start">
              <span className="text-sm text-muted-foreground">
                Employee (Optional - for single employee files):
              </span>
              <Select 
                value={selectedEmployeeId?.toString() || ""} 
                onValueChange={(value) => setSelectedEmployeeId(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select employee (optional for multi-employee files)" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter(emp => `${emp.fname} ${emp.lname}`.toLowerCase().includes(employeeName.toLowerCase()))
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.fname} {employee.lname}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {parsedRows.length > 0 && (
            <>
              <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="text-sm text-blue-800">
                  <strong>Import Summary:</strong>
                  <br />
                  • Total rows: {parsedRows.length}
                  <br />
                  • Employees detected: {new Set(parsedRows.filter(row => row.employee_id).map(row => row.employee_id)).size}
                  <br />
                  • Rows with employee_id: {parsedRows.filter(row => row.employee_id).length}
                  <br />
                  • Rows without employee_id: {parsedRows.filter(row => !row.employee_id).length}
                  {parsedRows.filter(row => !row.employee_id).length > 0 && (
                    <>
                      <br />
                      <span className="text-orange-600 font-medium">
                        ⚠️ Some employees are not mapped to database. Check console for details.
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-grow overflow-y-auto border rounded mb-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>AM Arrival</TableHead>
                      <TableHead>AM Departure</TableHead>
                      <TableHead>PM Arrival</TableHead>
                      <TableHead>PM Departure</TableHead>
                      <TableHead>UT Hour</TableHead>
                      <TableHead>UT Min</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.day}</TableCell>
                        <TableCell className={row.employee_id ? "text-green-600 font-medium" : "text-red-500"}>
                          {row.employee_id || "Missing"}
                        </TableCell>
                        <TableCell>{row.amArrival}</TableCell>
                        <TableCell>{row.amDeparture}</TableCell>
                        <TableCell>{row.pmArrival}</TableCell>
                        <TableCell>{row.pmDeparture}</TableCell>
                        <TableCell>{row.undertimeHour}</TableCell>
                        <TableCell>{row.undertimeMinute}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            onClick={handleSave}
            disabled={parsedRows.length === 0 || loading}
            className={loading ? "opacity-70 pointer-events-none" : ""}
          >
            {loading ? "Saving..." : "Save Imported"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
