
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSystemLogsStore, LogAction } from "@/store/useSystemLogsStore";
import { Search, Filter, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const SystemLogs = () => {
  const { searchTerm, setSearchTerm, setFilterAction, exportLogs, getFilteredLogs } = useSystemLogsStore();
  const { toast } = useToast();
  
  const filteredLogs = getFilteredLogs();
  
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
          <p className="text-muted-foreground">Track system activities and user actions</p>
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
            <DropdownMenuItem onClick={() => handleFilterAction('User Login')}>User Login</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterAction('User Logout')}>User Logout</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterAction('Data Created')}>Data Created</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterAction('Data Updated')}>Data Updated</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterAction('Data Deleted')}>Data Deleted</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterAction('Permission Changed')}>Permission Changed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterAction('Role Changed')}>Role Changed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterAction('System Update')}>System Update</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterAction('System Error')}>System Error</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleFilterAction(null)}>Clear Filter</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
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
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            log.action === 'User Login' || log.action === 'User Logout'
                              ? 'bg-blue-100 text-blue-800'
                              : log.action.includes('Data')
                              ? 'bg-green-100 text-green-800'
                              : log.action.includes('Role') || log.action.includes('Permission')
                              ? 'bg-purple-100 text-purple-800'
                              : log.action === 'System Error'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell className="font-mono">{log.ipAddress}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
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
