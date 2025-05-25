import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSystemLogsStore, type LogAction } from "@/store/useSystemLogsStore";
import { Search, Filter, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect } from "react";

const SystemLogs = () => {
  const {
    searchTerm,
    setSearchTerm,
    setFilterAction,
    exportLogs,
    getFilteredLogs,
    fetchLogs,
  } = useSystemLogsStore();
  const { toast } = useToast();

  const filteredLogs = getFilteredLogs();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  const handleFilterAction = (action: LogAction | null) => {
    setFilterAction(action);

    if (action) {
      toast({
        title: "Filter Applied",
        description: `Showing logs with action: ${action}`,
      });
    } else {
      toast({
        title: "Filter Cleared",
        description: "Showing all logs",
      });
    }
  };

  const handleExport = () => {
    exportLogs();
    toast({
      title: "Export Complete",
      description: "System logs have been exported to CSV",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
          <p className="text-muted-foreground">
            Track system activities and user actions
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
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
            <DropdownMenuLabel>Filter By Action</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleFilterAction("created")}>
              Created
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterAction("updated")}>
              Updated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterAction("deleted")}>
              Deleted
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterAction("approved")}>
              Approved
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterAction("assign")}>
              Assign
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterAction("completed")}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleFilterAction(null)}>
              Clear Filter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <Button
          variant="outline"
          onClick={handleExport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.performed_by}</TableCell>
                      <TableCell>
                        <span
                          className={`capitalize inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            log.action === "created"
                              ? "bg-green-100 text-green-800"
                              : log.action === "updated"
                              ? "bg-amber-100 text-amber-800"
                              : log.action === "deleted"
                              ? "bg-red-100 text-red-800"
                              : log.action === "approved"
                              ? "bg-blue-100 text-blue-800"
                              : log.action === "assign"
                              ? "bg-purple-100 text-purple-800"
                              : log.action === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell>{log.description}</TableCell>
                      <TableCell>{log.entity_type}</TableCell>
                      <TableCell className="font-mono">
                        {log.entity_id}
                      </TableCell>
                      <TableCell>{log.created_at}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLogs;
