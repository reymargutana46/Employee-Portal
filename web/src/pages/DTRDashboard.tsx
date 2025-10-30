"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  BarChart4,
  List,
} from "lucide-react";
import { useDTRStore } from "@/store/useDTRStore";
import TimeInOutDialog from "@/components/TimeInOutDialog";
import { useToast } from "@/hooks/use-toast";
import { ImportDTRDialog } from "@/components/ImportDTRDialog";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import DTRExport from "@/components/exports/DTRExport";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { startOfMonth, endOfMonth } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/useAuthStore";
import { MonthPicker } from "@/components/MonthPicker";
import DTRCalendarView from "@/components/dtr/CalendarView";
import DTRListView from "@/components/dtr/ListView";
import DTRSummaryView from "@/components/dtr/SummaryView";

const DTRDashboard = () => {
  const {
    searchTerm,
    records,
    setSearchTerm,
    filterByStatus,
    filterByDateRange,
    selectedDate,
    setSelectedDate,
    exportData,
    getFilteredRecords,
    fetchDTR,
  } = useDTRStore();

  const { employees, fetchEmployee, getFullName } = useEmployeeStore();
  const { toast } = useToast();

  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<string>("calendar");

  // Fetch data on component mount
  useEffect(() => {
    fetchEmployee();
    fetchDTR();
  }, [fetchEmployee, fetchDTR]);

  // Apply date range filter when selected month changes
  useEffect(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    filterByDateRange(start, end);

    toast({
      title: "Month Selected",
      description: `Showing records for ${start.toLocaleString("default", {
        month: "long",
        year: "numeric",
      })}`,
    });
  }, [selectedMonth, filterByDateRange, toast]);

  // Get filtered records
  const filteredRecords = getFilteredRecords().filter((record) => {
    // Filter by selected employee if not "all"
    if (selectedEmployee !== "all" && record.employee !== selectedEmployee) {
      return false;
    }
    return true;
  });

  const { userRoles } = useAuth();
  const { canDoAction } = useAuthStore();
  const isSecretary = userRoles.some((role) => role.name === "secretary");
  const isAdmin = userRoles.some(
    (role) =>
      role.name === "secretary" ||
      role.name === "admin" ||
      role.name === "principal"
  );
  const isStaff = userRoles.some((role) => role.name === "staff");

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/DTR-Blank-Form.xlsx"; // path relative to public folder
    link.download = "DTR-Blank-Form.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const summary = {
      total: filteredRecords.length,
      present: filteredRecords.filter((r) => r.status === "Present").length,
      leave: filteredRecords.filter((r) => r.status === "Leave").length,
      // absent: filteredRecords.filter((r) => r.status === "Absent").length,
      // late: filteredRecords.filter((r) => r.status === "Late").length,
    };
    return summary;
  };

  const summary = calculateSummary();

  // Create date range from selected month for child components
  const dateRange = {
    from: startOfMonth(selectedMonth),
    to: endOfMonth(selectedMonth),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Daily Time Record
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage attendance records
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TimeInOutDialog />
          {isSecretary && <ImportDTRDialog />}
          {!isStaff && (
            <Button variant="secondary" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" /> Download Template
            </Button>
          )}
          {isSecretary && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Export</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
                <DTRExport DTRs={records} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Employee Selection */}
            {canDoAction(["secretary", "admin"]) && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Employee
                </label>
                <Select
                  value={selectedEmployee}
                  onValueChange={setSelectedEmployee}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id.toString()}
                      >
                        {getFullName(employee)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Month Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Month</label>
              <MonthPicker
                value={selectedMonth}
                onChange={setSelectedMonth}
                className="w-full"
              />
            </div>

            {/* View Mode Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                View Mode
              </label>
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="flex-1"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex-1"
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
                {/* <Button
                  variant={viewMode === "summary" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("summary")}
                  className="flex-1"
                >
                  <BarChart4 className="h-4 w-4 mr-2" />
                  Summary
                </Button> */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Records
                </p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Present
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.present}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Leave
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {summary.leave}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-amber-600">{summary.late}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Main Content Area */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>
            {viewMode === "calendar"
              ? "Calendar View"
              : viewMode === "list"
              ? "List View"
              : "Summary View"}
          </CardTitle>
          <CardDescription>
            {viewMode === "calendar"
              ? "Visual representation of attendance"
              : viewMode === "list"
              ? "Detailed list of attendance records"
              : "Statistical summary of attendance"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === "calendar" && (
            <DTRCalendarView
              records={filteredRecords}
              dateRange={dateRange}
              isAdmin={isAdmin}
              isSecretary={isSecretary}
              onRefresh={fetchDTR}
            />
          )}

          {viewMode === "list" && (
            <DTRListView
              records={filteredRecords}
              isAdmin={isAdmin}
              isSecretary={isSecretary}
              onRefresh={fetchDTR}
            />
          )}

          {viewMode === "summary" && (
            <DTRSummaryView
              records={filteredRecords}
              dateRange={dateRange}
              selectedEmployee={selectedEmployee}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DTRDashboard;
