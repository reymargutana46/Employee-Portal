
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Employee } from "@/types/employee";

interface ViewEmployeeDialogProps {
  employee: Employee;
}

const ViewEmployeeDialog = ({ employee }: ViewEmployeeDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
          <DialogDescription>
            Full information about {employee.fname} {employee.lname}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Personal Information</h3>
            <div className="mt-2 space-y-2">
              <p><span className="font-medium">Name:</span> {employee.fname} {employee.mname || ''} {employee.lname} {employee.extname || ''}</p>
              <p><span className="font-medium">Username:</span> {employee.username}</p>
              <p><span className="font-medium">Bio:</span> {employee.biod}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Work Information</h3>
            <div className="mt-2 space-y-2">
              <p><span className="font-medium">Position:</span> {employee.position}</p>
              <p><span className="font-medium">Department:</span> {employee.department}</p>
              <p><span className="font-medium">Work Hours:</span> {employee.workhours_am} - {employee.workhours_pm}</p>
            </div>
          </div>
          <div className="col-span-2">
            <h3 className="font-semibold">Contact Information</h3>
            <div className="mt-2 space-y-2">
              <p><span className="font-medium">Email:</span> {employee.email}</p>
              <p><span className="font-medium">Contact Number:</span> {employee.contactno}</p>
              <p><span className="font-medium">Telephone:</span> {employee.telno}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewEmployeeDialog;
