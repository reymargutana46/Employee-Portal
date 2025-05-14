import { useState, useEffect } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDTRStore } from "@/store/useDTRStore";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { useToast } from "@/hooks/use-toast";
import { format, setDate } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "./ui/separator";
import { AttendanceStatus, DTRList } from "@/types/dtr";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import axios from "../utils/axiosInstance";
import { Res } from "@/types/response";

const TimeInOutDialog = () => {
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [amArrival, setAmArrival] = useState("");
  const [amDeparture, setAmDeparture] = useState("");
  const [pmArrival, setPmArrival] = useState("");
  const [pmDeparture, setPmDeparture] = useState("");
  const [undertimeHour, setUndertimeHour] = useState("");
  const [undertimeMinute, setUndertimeMinute] = useState("");

  const { fetchDTR } = useDTRStore();
  const { employees, fetchEmployee } = useEmployeeStore();
  const { toast } = useToast();
  const { userRoles } = useAuth();

  const isSecretary = userRoles.some((role) => role.name === "secretary");

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  useEffect(() => {
    if (amArrival && amDeparture && pmArrival && pmDeparture) {
      const { hours, minutes } = calculateUndertime();
      setUndertimeHour(hours.toString());
      setUndertimeMinute(minutes.toString());
    }
  }, [amArrival, amDeparture, pmArrival, pmDeparture]);

  const calculateUndertime = () => {
    if (!amArrival || !amDeparture || !pmArrival || !pmDeparture)
      return { hours: 0, minutes: 0 };

    const standardHours = 8; // 8 hours standard work day

    const [amArrivalHour, amArrivalMin] = amArrival.split(":").map(Number);
    const [amDepartureHour, amDepartureMin] = amDeparture
      .split(":")
      .map(Number);
    const [pmArrivalHour, pmArrivalMin] = pmArrival.split(":").map(Number);
    const [pmDepartureHour, pmDepartureMin] = pmDeparture
      .split(":")
      .map(Number);

    const morningMinutes =
      amDepartureHour * 60 +
      amDepartureMin -
      (amArrivalHour * 60 + amArrivalMin);
    const afternoonMinutes =
      pmDepartureHour * 60 +
      pmDepartureMin -
      (pmArrivalHour * 60 + pmArrivalMin);

    const totalMinutes = morningMinutes + afternoonMinutes;
    const expectedMinutes = standardHours * 60;

    const undertimeMinutes = Math.max(0, expectedMinutes - totalMinutes);

    return {
      hours: Math.floor(undertimeMinutes / 60),
      minutes: undertimeMinutes % 60,
    };
  };

  const handleHourChange = (e) => {
    const value = e.target.value;
    if (value === "" || (parseInt(value) >= 0 && !isNaN(parseInt(value)))) {
      setUndertimeHour(value);
    }
  };

  const handleMinuteChange = (e) => {
    const value = e.target.value;
    if (
      value === "" ||
      (parseInt(value) >= 0 && parseInt(value) <= 59 && !isNaN(parseInt(value)))
    ) {
      setUndertimeMinute(value);
    }
  };

  const handleSubmit = () => {
    if (!selectedEmployee) {
      toast({
        title: "Validation Error",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }

    if (!amArrival || !amDeparture || !pmArrival || !pmDeparture) {
      toast({
        title: "Validation Error",
        description: "Please fill in all time fields",
        variant: "destructive",
      });
      return;
    }

    const [arrivalHour, arrivalMin] = amArrival.split(":").map(Number);
    // Explicitly type status as AttendanceStatus
    const status: AttendanceStatus =
      arrivalHour > 8 || (arrivalHour === 8 && arrivalMin > 0)
        ? "Late"
        : "Present";

    const undertimeHours = undertimeHour === "" ? 0 : parseInt(undertimeHour);
    const undertimeMinutes =
      undertimeMinute === "" ? 0 : parseInt(undertimeMinute);

    const record = {
      date: format(date, "yyyy-MM-dd"),
      amArrival,
      amDeparture,
      pmArrival,
      pmDeparture,
      undertimeHours,
      undertimeMinutes,
      status,
      employee: selectedEmployee,
    };
    axios
      .post<Res<DTRList>>("/dtr", record)
      .then((res) => {
        fetchDTR();
        toast({
          title: "DTR Recorded",
          description: "Daily time record has been saved successfully",
        });
        setAmArrival("");
        setAmDeparture("");
        setPmArrival("");
        setPmDeparture("");
        setDate(null);
        setSelectedEmployee("");
        setUndertimeHour("");
        setUndertimeMinute("");
      })

    console.log(record);

    setOpen(false);
  };

  if (!isSecretary) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Manual DTR Entry</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[100vh]">
        <DialogHeader>
          <DialogTitle>Manual DTR Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Popover>
              <Label className="">Month</Label>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon />
                  {date ? format(date, "PPP") : <span>Pick Month</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="space-y-2">
              <Label>Employee Name</Label>
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-72">
                    {employees && employees.length > 0 ? (
                      employees.map((employee) => (
                        <SelectItem
                          key={employee.id}
                          value={`${employee.fname} ${employee.lname}`}
                        >
                          {`${employee.fname} ${employee.lname}`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        No employees found
                      </SelectItem>
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amArrival">AM Arrival</Label>
                <Input
                  id="amArrival"
                  type="time"
                  value={amArrival}
                  onChange={(e) => setAmArrival(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amDeparture">AM Departure</Label>
                <Input
                  id="amDeparture"
                  type="time"
                  value={amDeparture}
                  onChange={(e) => setAmDeparture(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pmArrival">PM Arrival</Label>
                <Input
                  id="pmArrival"
                  type="time"
                  value={pmArrival}
                  onChange={(e) => setPmArrival(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pmDeparture">PM Departure</Label>
                <Input
                  id="pmDeparture"
                  type="time"
                  value={pmDeparture}
                  onChange={(e) => setPmDeparture(e.target.value)}
                />
              </div>
            </div>
            <Separator />
            {amArrival && amDeparture && pmArrival && pmDeparture && (
              <div className="space-y-2 border-t pt-4">
                <h3 className="text-sm font-medium">Undertime Calculation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Hours:{" "}
                    </span>
                    <span className="font-medium">
                      {calculateUndertime().hours}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Minutes:{" "}
                    </span>
                    <span className="font-medium">
                      {calculateUndertime().minutes}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {/* <h1 className="text-center">Under Time</h1>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="undertimeHour">Hour</Label>
                <Input
                  id="undertimeHour"
                  type="number"
                  min="0"
                  max={12}
                  value={undertimeHour}
                  onChange={handleHourChange}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="undertimeMinute">Minute</Label>
                <Input
                  id="undertimeMinute"
                  type="number"
                  min="0"
                  max="59"
                  value={undertimeMinute}
                  onChange={handleMinuteChange}
                  placeholder="0"
                />
              </div>
            </div> */}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save DTR</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimeInOutDialog;
