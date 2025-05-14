/* eslint-disable prefer-const */
import { useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import axios from "../utils/axiosInstance";
import { DTRList } from "@/types/dtr";

// Helper function to convert 12-hour format to 24-hour format
const convertTo24Hour = (timeStr) => {
  if (!timeStr) return "";

  // Check if it's already in a valid format for time input
  if (timeStr.match(/^\d{1,2}:\d{2}$/)) return timeStr;

  try {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    hours = parseInt(hours, 10);

    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  } catch (e) {
    console.error("Error parsing time:", e);
    return "";
  }
};

// Convert 24-hour format back to 12-hour format with AM/PM
const convertTo12Hour = (timeStr) => {
  if (!timeStr) return "";

  try {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);

    const amPm = hour >= 12 ? 'PM' : 'AM';
    const twelveHour = hour % 12 || 12;

    return `${twelveHour}:${minutes} ${amPm}`;
  } catch (e) {
    console.error("Error converting time:", e);
    return "";
  }
};

interface ActionsProps {
  record: DTRList;
  onUpdate: () => void;
}

export default function DTRActions({ record, onUpdate }: ActionsProps) {
  const [rectifyOpen, setRectifyOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DTRList>({
    employee: record.employee || "",
    date: record.date || "",
    am_arrival: record.am_arrival || "",
    am_departure: record.am_departure || "",
    pm_arrival: record.pm_arrival || "",
    pm_departure: record.pm_departure || "",
    am_id: record.am_id || null,
    employee_id: record.employee_id,
    leave_id: record.leave_id || null,
    pm_id: record.pm_id || null,
    status: record.status,
    type: record.type || null
  });

  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Map the input field names to the state property names
    const fieldMapping = {
      amArrival: "am_arrival",
      amDeparture: "am_departure",
      pmArrival: "pm_arrival",
      pmDeparture: "pm_departure"
    };

    const stateField = fieldMapping[name] || name;

    // For time inputs, convert from 24-hour format to 12-hour format with AM/PM
    if (Object.keys(fieldMapping).includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [stateField]: value ? convertTo12Hour(value) : ""
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [stateField]: value
      }));
    }
  };

  const handleSubmitRectify = async () => {
    try {
      setLoading(true);
      // Update the DTR record via API
      const response = await axios.put("/dtr", formData);

      // Show success message
      toast({
        title: "DTR Updated",
        description: "The time record has been successfully updated.",
        variant: "default",
      });

      // Close the dialog and refresh data
      setRectifyOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating DTR:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update the time record.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      // Delete the DTR record via API
      const response = await fetch(`/api/dtr/${record.am_id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to delete the time record"
        );
      }

      // Show success message
      toast({
        title: "DTR Deleted",
        description: "The time record has been successfully deleted.",
        variant: "default",
      });

      // Close the dialog and refresh data
      setDeleteOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error deleting DTR:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete the time record.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-more-vertical"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">

          <DropdownMenuItem onClick={() => setRectifyOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Rectify</span>
          </DropdownMenuItem>
          {/* <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rectify Dialog */}
      <Dialog open={rectifyOpen} onOpenChange={setRectifyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rectify DTR</DialogTitle>
            <DialogDescription>
              Make corrections to the Daily Time Record.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employee" className="text-right">
                Employee Name
              </Label>
              <Input
                id="employee"
                name="employee"
                value={formData.employee}
                onChange={handleChange}
                className="col-span-3"
                disabled
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="col-span-3"
                disabled
              />
            </div>

            <Card className="border-dashed">
              <CardHeader className="py-2">
                <CardTitle className="text-sm font-medium">
                  Morning Shift
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amArrival">AM Arrival</Label>
                    <Input
                      id="amArrival"
                      name="amArrival"
                      type="time"
                      value={convertTo24Hour(formData.am_arrival)}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amDeparture">AM Departure</Label>
                    <Input
                      id="amDeparture"
                      name="amDeparture"
                      type="time"
                      value={convertTo24Hour(formData.am_departure)}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="py-2">
                <CardTitle className="text-sm font-medium">
                  Afternoon Shift
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pmArrival">PM Arrival</Label>
                    <Input
                      id="pmArrival"
                      name="pmArrival"
                      type="time"
                      value={convertTo24Hour(formData.pm_arrival)}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pmDeparture">PM Departure</Label>
                    <Input
                      id="pmDeparture"
                      name="pmDeparture"
                      type="time"
                      value={convertTo24Hour(formData.pm_departure)}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRectifyOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitRectify}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time record? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
