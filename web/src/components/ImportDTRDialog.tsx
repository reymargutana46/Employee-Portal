/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, DragEvent } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDTRStore } from "@/store/useDTRStore";
import { Upload, File } from "lucide-react";
import axios from "@/utils/axiosInstance";
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

function mapCSVToDTRRows(data: any[]): ParsedDTRRow[] {
  // Find the row with headers or day numbers
  let dataStartRow = -1;
  let headerRowIndex = -1;

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
  if (dataStartRow === -1) {
    for (let i = 0; i < data.length; i++) {
      if (data[i] && data[i][0] && !isNaN(Number(data[i][0]))) {
        dataStartRow = i;
        break;
      }
    }
  }

  // Fallback to static row if nothing found
  if (dataStartRow === -1) {
    dataStartRow = 14; // Default to row 14 as before
  }

  // Extract rows
  const rows: ParsedDTRRow[] = [];
  for (let i = dataStartRow; i < data.length; i++) {
    const row = data[i];
    if (!row || !row.length) continue;

    const day = parseInt(row[0]?.toString() || "");
    if (isNaN(day) || day <= 0) continue;

    rows.push({
      day: day.toString(),
      amArrival: convertTimeToString(row[1]),
      amDeparture: convertTimeToString(row[2]),
      pmArrival: convertTimeToString(row[3]),
      pmDeparture: convertTimeToString(row[4]),
      undertimeHour: row[5]?.toString() || "",
      undertimeMinute: row[6]?.toString() || "",
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
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedDTRRow[]>([]);
  const [filename, setFilename] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [month, setMonth] = useState("");

  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fetchDTR } = useDTRStore();

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
            const rows = mapCSVToDTRRows(csv);
            setParsedRows(rows);
            toast({
              title: "File Imported",
              description: `Parsed ${rows.length} rows from ${file.name}`,
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
          const rows = mapXLSXToDTRRows(ws);
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
    setLoading(true);
    try {
      const toSend = parsedRows
        .filter(
          (row) =>
            row.day &&
            (row.amArrival ||
              row.amDeparture ||
              row.pmArrival ||
              row.pmDeparture)
        )
        .map((row) => ({
          day: row.day,
          am_arrival: row.amArrival,
          am_departure: row.amDeparture,
          pm_arrival: row.pmArrival,
          pm_departure: row.pmDeparture,
          undertime_hour: row.undertimeHour,
          undertime_minute: row.undertimeMinute,
        }));

      await axios.post("/dtr/import", {
        employee_name: employeeName,
        month,
        records: toSend,
      }).then((res) => {
        fetchDTR()
      });



      toast({
        title: "DTR Imported",
        description: `Successfully imported records for ${
          parsedRows.length
        } days for ${employeeName || "employee"}.`,
      });
      setOpen(false);
      setParsedRows([]);
      setFilename("");
      setEmployeeName("");
      setMonth("");
    } catch (err: any) {
      console.log(err);
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
                Employee Name:
              </span>
              <span className="text-lg font-semibold">{employeeName}</span>
            </div>
          )}

          {parsedRows.length > 0 && (
            <div className="flex-grow overflow-y-auto border rounded mb-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
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
