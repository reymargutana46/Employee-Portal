import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Plus } from "lucide-react";
import { Employee } from "@/types/employee";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { toast } from "sonner";
import axios from '../utils/axiosInstance';
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { useToast } from "@/hooks/use-toast";
import { Res } from "@/types/response";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  fname: z.string().min(1, "Name is required"),
  lname: z.string().min(1, "Name is required"),
  mname: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Name is required"),
  extName: z.string().optional(),
  email: z.string().email("it must be valid email"),
  workhour_am: z.string(),
  workhour_pm: z.string(),
  department: z.string(),
  position: z.string(),
  contactno: z.string(),
  telno: z.string(),
});

interface EditEmployeeDialogProps {
  employee: Employee;
}

const EditEmployeeDialog = ({ employee }: EditEmployeeDialogProps) => {
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee);
  const { departments } = useEmployeeStore();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const positions = [
    { value: "Teacher", label: "Teacher" },
    { value: "Principal", label: "Principal" },
    { value: "Secretary", label: "Secretary" },
    { value: "Librarian", label: "Librarian" },
    { value: "Vice Principal", label: "Vice Principal" },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fname: employee.fname,
      lname: employee.lname,
      username: employee.username,
      mname: employee.mname || "",
      extName: employee.extname || "",
      email: employee.email,
      contactno: employee.contactno,
      department: employee.department,
      position: employee.position,
      telno: employee.telno,
      workhour_am: employee.workhours_am,
      workhour_pm: employee.workhours_pm,
    },
  });

  // Reset form when employee prop changes or when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        fname: employee.fname,
        lname: employee.lname,
        username: employee.username,
        mname: employee.mname || "",
        extName: employee.extname || "",
        email: employee.email,
        contactno: employee.contactno,
        department: employee.department,
        position: employee.position,
        telno: employee.telno,
        workhour_am: employee.workhours_am,
        workhour_pm: employee.workhours_pm,
      });
    }
  }, [employee, open, form]);

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    const updatedEmployee: Partial<Employee> = {
      fname: data.fname,
      lname: data.lname,
      mname: data.mname,
      username: data.username,
      extname: data.extName,
      email: data.email,
      contactno: data.contactno,
      department: data.department,
      position: data.position,
      telno: data.telno,
      workhours_am: data.workhour_am,
      workhours_pm: data.workhour_pm
    };

    axios
      .put<Res<Employee>>(`/employee/${employee.id}`, { ...data })
      .then((res) => {
        setIsLoading(false);
        
        updateEmployee(employee.id, updatedEmployee);
        
        toast({
          title: "Employee Updated",
          description: `${data.fname} ${data.lname} has been updated`,
        });
        
        setOpen(false);
      })
      .catch((err) => {
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to update employee",
          variant: "destructive",
        });
      });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      // Reset form when dialog closes
      if (!isOpen) {
        form.reset();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[100vh] overflow-y-auto">
        <Form {...form}>
          <form
            className="items-center "
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <DialogHeader>
              <DialogTitle>Update Employee</DialogTitle>
              <DialogDescription>
                Update employee details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-8 py-4">
              <div className="flex justify-between space-x-10">
                <div className="w-[80%]">
                  <FormField
                    control={form.control}
                    name="fname"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col  gap-4">
                          <FormLabel htmlFor="name" className="">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="col-span-3" required />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-[20%]">
                  <FormField
                    control={form.control}
                    name="extName"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col  gap-4">
                          <FormLabel htmlFor="name" className="">
                            Ext
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="col-span-3" />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-between space-x-10">
                <div className="w-[50%]">
                  <FormField
                    control={form.control}
                    name="mname"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col  gap-4">
                          <FormLabel htmlFor="name" className="">
                            Middle Name
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="col-span-3" required />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-[50%]">
                  <FormField
                    control={form.control}
                    name="lname"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col  gap-4">
                          <FormLabel htmlFor="name" className="">
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="col-span-3" required />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-col  gap-4">
                        <FormLabel htmlFor="name" className="">
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="col-span-3" required />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-between space-x-10">
                <div className="w-[70%]">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col  gap-4">
                          <FormLabel htmlFor="name" className="">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="col-span-3" required />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-between space-x-10">
                <div className="w-[50%]">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col  gap-4">
                          <FormLabel htmlFor="name" className="">
                            Building & Section
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments?.map((department) => (
                                  <SelectItem
                                    key={department.id}
                                    value={department.name}
                                  >
                                    {department.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-[50%]">
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col  gap-4">
                          <FormLabel htmlFor="name" className="">
                            Position
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {positions.map((position) => (
                                  <SelectItem
                                    key={position.value}
                                    value={position.value}
                                  >
                                    {position.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-between space-x-10">
                <div className="w-[50%]">
                  <FormField
                    control={form.control}
                    name="workhour_am"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col  gap-4">
                          <FormLabel htmlFor="name" className="">
                            Time In
                          </FormLabel>
                          <FormControl>
                            <div className="col-span-3 flex items-center">
                              <Input
                                id="timeIn"
                                type="time"
                                {...field}
                                required
                              />
                            </div>
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-[50%]">
                  <FormField
                    control={form.control}
                    name="workhour_pm"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col  gap-4">
                          <FormLabel htmlFor="name" className="">
                            Time Out
                          </FormLabel>
                          <FormControl>
                            <div className="col-span-3 flex items-center">
                              <Input
                                id="timeOut"
                                type="time"
                                {...field}
                                required
                              />
                            </div>
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-between space-x-10">
                <div className="w-[50%]">
                  <FormField
                    control={form.control}
                    name="contactno"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col  gap-4">
                          <FormLabel htmlFor="name" className="">
                            Contact
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="col-span-3" required />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-[50%]">
                  <FormField
                    control={form.control}
                    name="telno"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col  gap-4">
                          <FormLabel htmlFor="name" className="">
                            Tel. No.
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="col-span-3" required />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!form.formState.isDirty}>
                {isLoading ? "Updating..." : "Update Employee"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
export default EditEmployeeDialog;