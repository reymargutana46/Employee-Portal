import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useEmployeeStore,
  EmployeeStatus,
} from "@/store/useEmployeeStore";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "../utils/axiosInstance";
import { Res } from "@/types/response";
import { Employee } from "@/types/employee";

const formSchema = z.object({
  fname: z.string().min(1, "Name is required"),
  lname: z.string().min(1, "Name is required"),
  mname: z.string().optional(),
  username: z.string().min(1, "Name is required"),
  extname: z.string().optional(),
  email: z.string().email("it must be valid email"),
  role: z.string(),
  bioid: z.string().optional(),
  workhour_am: z.string(),
  workhour_pm: z.string(),
  department: z.string(),
  position: z.string(),
  password: z.string().min(8, "Password must be 8 character long"),
  contactno: z.string(),
  telno: z.string(),
});

const AddEmployeeDialog = () => {
  const { addEmployee, fetchsetup } = useEmployeeStore();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { roles, departments, positions} = useEmployeeStore()

  // Fetch setup data when component mounts or dialog opens
  useEffect(() => {
    fetchsetup();
  }, [fetchsetup]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fname: "",
      lname: "",
      username: "",
      mname: "",
      extname: "",
      email: "",
      bioid: "",
      contactno: "",
      department: "",
      position: "",
      password: "",
      role: "Faculty",
      telno: "",
      workhour_am: "07:30",
      workhour_pm: "17:00",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // e.preventDefault();
    setIsLoading(true);

    // Mock API call - would be replaced with actual API call in integration
    axios
      .post<Res<Employee>>("/employee", { ...data })
      .then((res) => {
        setIsLoading(false);
        const employee = res.data.data;
        console.log(employee)
        addEmployee(employee);
        toast({
          title: "Employee Created",
          description: `${data.fname} ${data.lname} has been added as ${data.role} with work hours from ${data.workhour_am} to ${data.workhour_pm}`,
        });
        setOpen(false);
        form.reset();
        // setTimeout(() => {
        //   setIsLoading(false);
        //   toast({
        //     title: "Employee Created",
        //     description: `${name} has been added as ${role} with work hours from `,
        //   });
        //   setIsOpen(false);
        // }, 1000);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Employee</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[100vh] overflow-y-auto">
        <Form {...form}>
          <form
            className="items-center "
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <DialogHeader>
              <DialogTitle>Create New Employee</DialogTitle>
              <DialogDescription>
                Add a new employee to the system.
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
                    name="extname"
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
                            <Input {...field} className="col-span-3" />
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
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-col  gap-4">
                        <FormLabel htmlFor="name" className="">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="col-span-3"
                            type="password"
                            required
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
                <div className="w-full">
                <FormField
                  control={form.control}
                  name="bioid"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-col  gap-4">
                        <FormLabel htmlFor="name" className="">
                          Bio ID
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="col-span-3"
                            type="text"
                            required
                          />
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
                <div className="w-[30%]">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col  gap-4">
                          <FormLabel htmlFor="name" className="">
                            Role
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
                                {roles.map((role) => (
                                  <SelectItem
                                    key={role.id}
                                    value={role.name}
                                  >
                                    {role.name}
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
                                <SelectValue placeholder="Select building & section" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments
                                  .filter(department => department.name !== 'Admin Department')
                                  .map((deparment) => (
                                    <SelectItem
                                      key={deparment.id}
                                      value={deparment.name}
                                      className="capitalize"
                                    >
                                      {deparment.name}
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
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from(new Map(positions.map(position => [position.title, position])).values()).map((position) => (
                                  <SelectItem
                                    key={position.id}
                                    value={position.title}
                                    className="capitalize"
                                  >
                                    {position.title}
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
                              {/* <Clock className="mr-2 h-4 w-4 text-muted-foreground" /> */}
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
                              {/* <Clock className="mr-2 h-4 w-4 text-muted-foreground" /> */}
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Employee"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
