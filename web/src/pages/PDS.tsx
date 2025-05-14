
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, Filter, FileText, Eye, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PDS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock PDS data
  const pdsRecords = [
    { id: 1, employee: 'John Doe', position: 'Teacher', department: 'Science', lastUpdate: '2025-03-15' },
    { id: 2, employee: 'Jane Smith', position: 'Principal', department: 'Administration', lastUpdate: '2025-02-28' },
    { id: 3, employee: 'Mike Johnson', position: 'Staff', department: 'Maintenance', lastUpdate: '2025-04-01' },
    { id: 4, employee: 'Sarah Williams', position: 'Teacher', department: 'Mathematics', lastUpdate: '2025-03-20' },
    { id: 5, employee: 'Robert Brown', position: 'Secretary', department: 'Administration', lastUpdate: '2025-03-25' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal Data Sheet</h1>
          <p className="text-muted-foreground">Manage employee personal data sheets</p>
        </div>
        <Button className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>New PDS</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search PDS records..."
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
            <DropdownMenuLabel>Filter By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Department</DropdownMenuItem>
            <DropdownMenuItem>Position</DropdownMenuItem>
            <DropdownMenuItem>Last Update</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>PDS Records</CardTitle>
          <CardDescription>View and manage employee personal data sheets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left font-medium py-3 px-4">Employee</th>
                  <th className="text-left font-medium py-3 px-4">Position</th>
                  <th className="text-left font-medium py-3 px-4">Department</th>
                  <th className="text-left font-medium py-3 px-4">Last Update</th>
                  <th className="text-right font-medium py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pdsRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{record.employee}</td>
                    <td className="py-3 px-4">{record.position}</td>
                    <td className="py-3 px-4">{record.department}</td>
                    <td className="py-3 px-4">{record.lastUpdate}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end space-x-2">
                        <Button size="icon" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDS;
