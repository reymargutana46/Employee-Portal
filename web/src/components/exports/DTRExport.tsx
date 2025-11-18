import { useState, useMemo, useEffect } from "react";
import { DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, parse, startOfMonth, endOfMonth, isEqual, parseISO } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Check,
  CalendarIcon,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { Employee } from "@/types/employee";
import axios from "@/utils/axiosInstance";

interface Dtrecord {
  id: number;
  employee_id: number;
  employee_name: string;
  date: string;
  am_time_in: string | null;
  am_time_out: string | null;
  pm_time_in: string | null;
  pm_time_out: string | null;
  undertime_hour?: number;
  undertime_minute?: number;
}

interface DTRExportProps {
}

export default function DTRExport() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [openMonthPicker, setOpenMonthPicker] = useState(false);
  const [openEmployeeSelect, setOpenEmployeeSelect] = useState(false);
  const [regularHours, setRegularHours] = useState("8:00 AM - 5:00 PM");
  const [saturdayHours, setSaturdayHours] = useState("8:00 AM - 12:00 PM");
  const [dtrecords, setDtrecords] = useState<Dtrecord[]>([]);
  const [filteredDTRs, setFilteredDTRs] = useState<Dtrecord[]>([]);
  const { employees } = useEmployeeStore();

  // Fetch dtrecords data
  useEffect(() => {
    const fetchDtrecords = async () => {
      try {
        const response = await axios.get('/dtr/raw');
        setDtrecords(response.data.data || []);
      } catch (error) {
        console.error('Error fetching dtrecords:', error);
      }
    };
    
    fetchDtrecords();
  }, []);

  // All months for the picker
  const months = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    []
  );

  // Format the selected month and year string
  const selectedMonthYear = useMemo(() => {
    return format(selectedDate, "MMMM yyyy");
  }, [selectedDate]);

  // Calculate start and end dates based on selected month
  const { startDate, endDate } = useMemo(() => {
    return {
      startDate: startOfMonth(selectedDate),
      endDate: endOfMonth(selectedDate),
    };
  }, [selectedDate]);

  // Generate days array based on month
  const days = useMemo(() => {
    if (!startDate || !endDate) return [];

    const result = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      result.push({
        day: currentDate.getDate(),
        date: new Date(currentDate),
        formattedDate: format(currentDate, "MMM dd, yyyy"),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }, [startDate, endDate]);

  // Filter DTRs based on selected employee and month
  useEffect(() => {
    if (!selectedEmployee) {
      setFilteredDTRs([]);
      return;
    }

    const filtered = dtrecords.filter(dtr => {
      // Match employee by comparing employee_id
      const isEmployeeMatch = dtr.employee_id === selectedEmployee.id;

      if (!isEmployeeMatch) return false;

      // Parse the date string and check if it falls within the selected month
      try {
        // Backend returns dates as strings, parse them
        const dtrDate = parseISO(dtr.date);
        return (
          dtrDate.getMonth() === selectedDate.getMonth() &&
          dtrDate.getFullYear() === selectedDate.getFullYear()
        );
      } catch (error) {
        console.error("Error parsing date:", error);
        return false;
      }
    });
    console.log(filtered);
    setFilteredDTRs(filtered);
  }, [selectedEmployee, selectedDate, dtrecords]);

  // Find DTR entry for a specific day
  const getDTRForDay = (dayFormatted) => {
    const filt = filteredDTRs.find(dtr => {
      // Check if dtr.date exists and is valid
      if (!dtr.date) return false;
      
      try {
        // Backend returns dates as strings, format them to compare
        const dtrDate = format(parseISO(dtr.date), 'MMM dd, yyyy');
        return dtrDate === dayFormatted;
      } catch (error) {
        console.error("Error parsing dtr.date:", dtr.date, error);
        return false;
      }
    });
    console.log(filt);
    return filt;
  };

  const handlePrint = () => {
    // Create a printable version in a new window
    const printWindow = window.open("", "_blank", "width=1000,height=800");

    if (printWindow) {
      // Create the print content with actual DTR data
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Daily Time Record - Print</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 12px;
            }
            .container {
              border: 1px solid #000;
              padding: 10px;
              max-width: 7.5in;
              margin: 0 auto;
              page-break-inside: avoid;
            }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .font-bold { font-weight: bold; }
            .text-xl { font-size: 1rem; }
            .mb-2 { margin-bottom: 0.3rem; }
            .mb-4 { margin-bottom: 0.5rem; }
            .flex { display: flex; }
            .w-full { width: 100%; }
            .w-2/3 { width: 66.666667%; }
            .w-1/2 { width: 50%; }
            .w-2/5 { width: 40%; }
            .w-3/5 { width: 60%; }
            .w-1/3 { width: 33.333333%; }
            .items-center { align-items: center; }
            .flex-col { flex-direction: column; }
            .justify-between { justify-content: space-between; }
            .border-b { border-bottom: 1px solid #000; }
            .text-xs { font-size: 0.65rem; }
            .text-sm { font-size: 0.75rem; }
            .my-4 { margin: 0.5rem 0; }
            .mt-8 { margin-top: 1rem; }
            .mt-4 { margin-top: 0.5rem; }
            .h-6 { height: 1rem; }
            .leave-day { background-color: #f8d7da; }

            table {
              width: 100%;
              border-collapse: collapse;
              margin: 0.5rem 0;
            }
            table th, table td {
              border: 1px solid #000;
              padding: 1px 2px;
              font-size: 0.7rem;
              text-align: center;
              vertical-align: middle;
              height: 18px;
            }
            table th {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            table td:first-child {
              font-weight: bold;
            }

            @media print {
              @page {
                size: letter portrait;
                margin: 1in;
              }
              body {
                padding: 0;
                margin: 0;
                font-size: 11px;
              }
              .container {
                border: 1px solid #000;
                padding: 8px;
                max-width: 100%;
                margin: 0;
                page-break-inside: avoid;
              }
              .leave-day {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              table th, table td {
                font-size: 0.65rem;
                padding: 1px;
                height: 16px;
              }
              .text-xl { font-size: 0.9rem; }
              .text-xs { font-size: 0.6rem; }
              .text-sm { font-size: 0.7rem; }
              .my-4 { margin: 0.3rem 0; }
              .mt-8 { margin-top: 0.8rem; }
              .mt-4 { margin-top: 0.4rem; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="text-left font-bold">Civil Service Form No. 48</div>
            <div class="text-center font-bold text-xl mb-2">DAILY TIME RECORD</div>

            <div class="flex flex-col items-center mb-2">
              <div class="border-b text-center w-2/3">${
                selectedEmployee
                  ? selectedEmployee.extname
                    ? selectedEmployee.extname +
                      " " +
                      selectedEmployee.fname +
                      " " +
                      selectedEmployee.lname
                    : selectedEmployee.fname + " " + selectedEmployee.lname
                  : ""
              }</div>
              <div class="text-xs">(Name)</div>
            </div>

            <div class="flex flex-col items-center mb-4">
              <div class="text-xs">(For the month of <span class="underline">${selectedMonthYear}</span>)</div>
            </div>

            <div class="flex mb-2">
              <div class="w-2/5 text-left">
                Official hours for arrival<br/>and departure
              </div>

            </div>

            <div class="flex mb-4">
              <div class="w-2/5"></div>
              <div class="w-3/5 flex">
                <div class="w-1/3 text-left">Regular days:</div>
                <div class="w-2/3 border-b">${regularHours}</div>
              </div>
            </div>

            <div class="flex mb-4">
              <div class="w-2/5"></div>
              <div class="w-3/5 flex">
                <div class="w-1/3 text-left">Saturdays:</div>
                <div class="w-2/3 border-b">${saturdayHours}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th rowspan="2">Day</th>
                  <th colspan="2">AM</th>
                  <th colspan="2">PM</th>
                  <th colspan="2">UNDERTIME</th>
                </tr>
                <tr>
                  <th>Arrival</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Departure</th>
                  <th>Hours</th>
                  <th>Minutes</th>
                </tr>
              </thead>
              <tbody>
                ${days
                  .map(
                    (day) => {
                      const dtrEntry = getDTRForDay(day.formattedDate);

                      return `
                        <tr>
                          <td>${day.day}</td>
                          <td>${
                            dtrEntry && dtrEntry.am_time_in
                              ? (() => {
                                  try {
                                    return format(parseISO(dtrEntry.am_time_in), 'h:mm a');
                                  } catch (e) {
                                    return dtrEntry.am_time_in;
                                  }
                                })()
                              : ""
                          }</td>
                          <td>${
                            dtrEntry && dtrEntry.am_time_out
                              ? (() => {
                                  try {
                                    return format(parseISO(dtrEntry.am_time_out), 'h:mm a');
                                  } catch (e) {
                                    return dtrEntry.am_time_out;
                                  }
                                })()
                              : ""
                          }</td>
                          <td>${
                            dtrEntry && dtrEntry.pm_time_in
                              ? (() => {
                                  try {
                                    return format(parseISO(dtrEntry.pm_time_in), 'h:mm a');
                                  } catch (e) {
                                    return dtrEntry.pm_time_in;
                                  }
                                })()
                              : ""
                          }</td>
                          <td>${
                            dtrEntry && dtrEntry.pm_time_out
                              ? (() => {
                                  try {
                                    return format(parseISO(dtrEntry.pm_time_out), 'h:mm a');
                                  } catch (e) {
                                    return dtrEntry.pm_time_out;
                                  }
                                })()
                              : ""
                          }</td>
                          <td></td>
                          <td></td>
                        </tr>
                      `;
                    }
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="text-center text-xs my-4" style="font-style: italic; margin: 1rem 0;">
              I certify on my honor that the above is a true and correct report of the<br/>
              hours of work performed, record of which was made daily at the time of<br/>
              arrival and departure from office.
            </div>

            <div class="text-center mt-8">
              <div style="margin: 2rem 0;">
                <div class="border-b" style="height: 20px; width: 300px; margin: 0 auto;"></div>
                <div class="text-sm mt-1">Employee's Signature</div>
              </div>
            </div>

            <div class="mt-8" style="display: flex; margin: 0; padding: 0; margin-bottom: 0;">
              <div style="width: 50%; margin: 0; padding: 0; border: 0; margin-bottom: 0;">
                <div class="border-b" style="height: 20px; margin: 0; padding: 0; border-right: 0; margin-bottom: 0;"></div>
              </div>
              <div style="width: 50%; margin: 0; padding: 0; border: 0; margin-bottom: 0;">
                <div class="border-b" style="height: 20px; margin: 0; padding: 0; border-left: 0; margin-bottom: 0;"></div>
              </div>
            </div>

            <div style="margin: 0; padding: 0; margin-top: -1px;">
              <div class="w-full text-center">
                <div class="border-b" style="height: 20px; margin: 0; padding: 0; margin-top: 0;"></div>
              </div>
            </div>

            <div class="mt-1 font-bold">
              VERIFIED as to the prescribed office hours
              <div class="text-center mt-4">
                <div class="border-b" style="height: 20px; width: 300px; margin: 0 auto;"></div>
                <div class="text-sm font-normal mt-1">In Charge</div>
              </div>
            </div>
          </div>

          <script>
            // Auto print when the window loads
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Daily Time Record</h2>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="default" className="bg-green-600 hover:bg-green-700">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </div>

      {/*  Start Condition Rendering for admin and secretary and show filtering settings example: user.role.name =='Secretary' && 
      <FilterComponent /> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Employee Select with Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Employee</label>
          <Popover
            open={openEmployeeSelect}
            onOpenChange={setOpenEmployeeSelect}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openEmployeeSelect}
                className="w-full justify-between"
              >
                {selectedEmployee
                  ? selectedEmployee.extname
                    ? selectedEmployee.extname +
                      " " +
                      selectedEmployee.fname +
                      " " +
                      selectedEmployee.lname
                    : selectedEmployee.fname + " " + selectedEmployee.lname
                  : "Select employee..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search employee..."
                  className="h-9"
                />
                <CommandList>
                  <CommandEmpty>No employee found.</CommandEmpty>
                  <CommandGroup>
                    {employees.map((employee) => (
                      <CommandItem
                        key={employee.id}
                        value={employee.lname}
                        onSelect={() => {
                          setSelectedEmployee(employee);
                          setOpenEmployeeSelect(false);
                        }}
                      >
                        {employee.extname
                          ? employee.extname +
                            " " +
                            employee.fname +
                            " " +
                            employee.lname
                          : employee.fname + " " + employee.lname}
                        <Check
                          className={cn(
                            "ml-auto",
                            selectedEmployee?.id === employee.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Month/Year Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Month/Year</label>
          <Popover open={openMonthPicker} onOpenChange={setOpenMonthPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedMonthYear}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <div className="p-2">
                {/* Year Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setSelectedYear(selectedYear - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="font-medium text-center">{selectedYear}</div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setSelectedYear(selectedYear + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Month Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {months.map((month, index) => {
                    const isSelected =
                      selectedDate.getMonth() === index &&
                      selectedDate.getFullYear() === selectedYear;

                    return (
                      <Button
                        key={month}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "h-9 w-full text-xs",
                          isSelected &&
                            "bg-blue-500 text-white hover:bg-blue-600",
                          !isSelected && "text-gray-800"
                        )}
                        onClick={() => {
                          const newDate = new Date(selectedYear, index, 1);
                          setSelectedDate(newDate);
                          setOpenMonthPicker(false);
                        }}
                      >
                        {month}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Regular Hours */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Regular Hours</label>
          <input
            type="text"
            value={regularHours}
            onChange={(e) => setRegularHours(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g. 8:00 AM - 5:00 PM"
          />
        </div>

        {/* Saturday Hours */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Saturday Hours</label>
          <input
            type="text"
            value={saturdayHours}
            onChange={(e) => setSaturdayHours(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g. 8:00 AM - 12:00 PM"
          />
        </div>
      </div>
      {/* END OF condition */}

      <div className="border rounded p-4 overflow-auto max-h-96">
        <div className="text-center font-bold mb-2">PREVIEW</div>

        <div className="border border-black p-4">
          <div className="text-left font-bold">Civil Service Form No. 48</div>
          <div className="text-center font-bold text-xl mb-2">
            DAILY TIME RECORD
          </div>

          <div className="flex flex-col items-center mb-2">
            <div className="border-b border-black text-center w-2/3">
              {selectedEmployee
                ? selectedEmployee.extname
                  ? selectedEmployee.extname +
                    " " +
                    selectedEmployee.fname +
                    " " +
                    selectedEmployee.lname
                  : selectedEmployee.fname + " " + selectedEmployee.lname
                : ""}
            </div>
            <div className="text-xs">(Name)</div>
          </div>

          <div className="flex flex-col items-center mb-4">
            <div className="text-normal">
              (For the month of{" "}
              <span className="underline">
                {"      "} {selectedMonthYear}
                {"     "}
              </span>
              )
            </div>
          </div>

          <div className="flex mb-2">
            <div className="w-2/5 text-left">
              Official hours for arrival
              <br />
              and departure
            </div>
            <div className="w-3/5 flex h-fit ">
              <div className="w-1/3 text-left">Regular days:</div>
              <div className="w-2/3 border-b border-black">{regularHours}</div>
            </div>
          </div>

          <div className="flex mb-4">
            <div className="w-2/5"></div>
            <div className="w-3/5 flex">
              <div className="w-1/3 text-left">Saturdays:</div>
              <div className="w-2/3 border-b border-black">{saturdayHours}</div>
            </div>
          </div>

          <table className="w-full border-collapse border border-black text-sm">
            <thead>
              <tr>
                <th rowSpan={2} className="border border-black bg-gray-100">
                  Day
                </th>
                <th colSpan={2} className="border border-black bg-gray-100">
                  AM
                </th>
                <th colSpan={2} className="border border-black bg-gray-100">
                  PM
                </th>
                <th colSpan={2} className="border border-black bg-gray-100">
                  UNDERTIME
                </th>
              </tr>
              <tr>
                <th className="border border-black bg-gray-100">Arrival</th>
                <th className="border border-black bg-gray-100">Departure</th>
                <th className="border border-black bg-gray-100">Arrival</th>
                <th className="border border-black bg-gray-100">Departure</th>
                <th className="border border-black bg-gray-100">Hours</th>
                <th className="border border-black bg-gray-100">Minutes</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day, index) => {
                const dtrEntry = getDTRForDay(day.formattedDate);

                return (
                  <tr key={index}>
                    <td className="border border-black text-center">{day.day}</td>
                    <td className="border border-black h-6">
                      {dtrEntry && dtrEntry.am_time_in
                        ? (() => {
                            try {
                              return format(parseISO(dtrEntry.am_time_in), 'h:mm a');
                            } catch (e) {
                              return dtrEntry.am_time_in;
                            }
                          })()
                        : ""}
                    </td>
                    <td className="border border-black h-6">
                      {dtrEntry && dtrEntry.am_time_out
                        ? (() => {
                            try {
                              return format(parseISO(dtrEntry.am_time_out), 'h:mm a');
                            } catch (e) {
                              return dtrEntry.am_time_out;
                            }
                          })()
                        : ""}
                    </td>
                    <td className="border border-black h-6">
                      {dtrEntry && dtrEntry.pm_time_in
                        ? (() => {
                            try {
                              return format(parseISO(dtrEntry.pm_time_in), 'h:mm a');
                            } catch (e) {
                              return dtrEntry.pm_time_in;
                            }
                          })()
                        : ""}
                    </td>
                    <td className="border border-black h-6">
                      {dtrEntry && dtrEntry.pm_time_out
                        ? (() => {
                            try {
                              return format(parseISO(dtrEntry.pm_time_out), 'h:mm a');
                            } catch (e) {
                              return dtrEntry.pm_time_out;
                            }
                          })()
                        : ""}
                    </td>
                    <td className="border border-black h-6"></td>
                    <td className="border border-black h-6"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Certification preview */}
          <div className="text-center text-xs my-4" style={{ fontStyle: 'italic', margin: '1rem 0' }}>
            I certify on my honor that the above is a true and correct report of the<br/>
            hours of work performed, record of which was made daily at the time of<br/>
            arrival and departure from office.
          </div>

          {/* Employee Signature - centered */}
          <div className="text-center mt-8">
            <div style={{ margin: '2rem 0' }}>
              <div className="border-b border-black" style={{ height: '20px', width: '300px', margin: '0 auto' }}></div>
              <div className="text-xs mt-1">Employee's Signature</div>
            </div>
          </div>

          {/* Two horizontal lines above VERIFIED */}
          <div className="mt-8" style={{ display: 'flex', margin: 0, padding: 0, marginBottom: 0 }}>
            <div style={{ width: '50%', margin: 0, padding: 0, border: 0, marginBottom: 0 }}>
              <div className="border-b border-black" style={{ height: '20px', margin: 0, padding: 0, borderRight: 0, marginBottom: 0 }}></div>
            </div>
            <div style={{ width: '50%', margin: 0, padding: 0, border: 0, marginBottom: 0 }}>
              <div className="border-b border-black" style={{ height: '20px', margin: 0, padding: 0, borderLeft: 0, marginBottom: 0 }}></div>
            </div>
          </div>

          {/* Third horizontal line above VERIFIED */}
          <div style={{ margin: 0, padding: 0, marginTop: '-1px' }}>
            <div className="w-full text-center">
              <div className="border-b border-black" style={{ height: '20px', margin: 0, padding: 0, marginTop: 0 }}></div>
            </div>
          </div>

          {/* Verification section */}
          <div className="mt-1 font-bold text-xs">
            VERIFIED as to the prescribed office hours:
            <div className="text-center mt-4">
              <div className="border-b border-black" style={{ height: '20px', width: '300px', margin: '0 auto' }}></div>
              <div className="text-xs font-normal mt-1">In Charge</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
