import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEmployeeStore, EmployeeStatus } from "@/store/useEmployeeStore";
import AddEmployeeDialog from "@/components/AddEmployeeDialog";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import ViewEmployeeDialog from "@/components/ViewEmployeeDialog";
import EditEmployeeDialog from "@/components/EditEmployeeDialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Department } from "@/types/employee";
import { useAuthStore } from "@/store/useAuthStore";

const Employees = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    searchTerm,
    departments,
    setSearchTerm,
    setSorting,
    setFilterDepartment,
    setFilterStatus,
    exportData,
    getFilteredEmployees,
    deleteEmployee,
    fetchEmployee,
    fetchsetup,
  } = useEmployeeStore();

  const { toast } = useToast();
  const { canDoAction } = useAuthStore();
  const filteredEmployees = getFilteredEmployees().filter((employee) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.fname.toLowerCase().includes(searchLower) ||
      employee.lname.toLowerCase().includes(searchLower) ||
      (employee.mname && employee.mname.toLowerCase().includes(searchLower))
    );
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchsetup();
    fetchEmployee();
  }, []);

  const handleSort = (field: string) => {
    setSorting(field as keyof (typeof filteredEmployees)[0]);
    toast({
      title: "Sorting Applied",
      description: `Sorted by ${field}`,
    });
  };

  const handleFilterDepartment = (department: Department | null) => {
    setFilterDepartment(department);
    if (department) {
      toast({
        title: "Filter Applied",
        description: `Showing employees from ${department} department`,
      });
    }
  };

  const handleFilterStatus = (status: EmployeeStatus | null) => {
    setFilterStatus(status);
    if (status) {
      toast({
        title: "Filter Applied",
        description: `Showing employees with ${status} status`,
      });
    }
  };

  const handleExport = () => {
    exportData();
    toast({
      title: "Export Complete",
      description: "Employee data has been exported to CSV",
    });
  };

  const handleDelete = (id: number, name: string) => {
    deleteEmployee(id);
    toast({
      title: "Employee Removed",
      description: `${name} has been removed from the system`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage employee information and records
          </p>
        </div>
        {canDoAction(["admin"]) && <AddEmployeeDialog />}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter By Department</DropdownMenuLabel>
            {departments.map((department) => (
              <DropdownMenuItem
                key={department.id}
                onClick={() => handleFilterDepartment(department)}
              >
                {department.name}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter By Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleFilterStatus("Active")}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterStatus("On Leave")}>
              On Leave
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterStatus("Inactive")}>
              Inactive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterStatus("Suspended")}>
              Suspended
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setFilterDepartment(null);
                setFilterStatus(null);
                toast({
                  title: "Filters Cleared",
                  description: "Showing all employees",
                });
              }}
            >
              Clear Filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSort("name")}>
              Name (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("department")}>
              Department
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("position")}>
              Position
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("dateHired")}>
              Date Hired (Latest)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("status")}>
              Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          onClick={handleExport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Employee List</CardTitle>
          <CardDescription>
            A list of all employees in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left font-medium py-3 px-4">Name</th>
                  <th className="text-left font-medium py-3 px-4">Position</th>
                  <th className="text-left font-medium py-3 px-4">
                    Department
                  </th>
                  <th className="text-left font-medium py-3 px-4">
                    Work Hours
                  </th>
                  <th className="text-right font-medium py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">{`${employee.fname} ${employee.lname}`}</td>
                      <td className="py-3 px-4">{employee.position}</td>
                      <td className="py-3 px-4">{employee.department}</td>
                      <td className="py-3 px-4">{`${employee.workhours_am}AM - ${employee.workhours_pm}`}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <ViewEmployeeDialog employee={employee} />
                          {canDoAction(["admin", "principal", "secretary"]) && (
                            <EditEmployeeDialog employee={employee} />
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              handleDelete(employee.id, employee.lname)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;
