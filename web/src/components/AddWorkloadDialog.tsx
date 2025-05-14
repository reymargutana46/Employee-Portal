
import { DialogTrigger } from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Workload, WorkloadType } from "@/types/workload"
import { useEffect, useState } from "react"
import { useEmployeeStore } from "@/store/useEmployeeStore"
import { Check, ChevronsUpDown, Plus, Calendar, Clock, BookOpen, Users, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useWorkloadStore } from "@/store/useWorkloadstore"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const workloadSchema = z
  .object({
    // Workload Header (Step 1)
    title: z.string().min(1, "Title is required"),
    from: z.string().min(1, "From date is required"),
    to: z.string().min(1, "To date is required"),
    type: z.enum(["FACULTY", "STAFF"]),

    // Assignee (Step 2)
    assignee_id: z.string().min(1, "Assignee is required"),

    // Conditional fields based on type (Step 3)
    subject: z.string().optional(),
    classId: z.string().optional(),
    academyearId: z.string().optional(),
    quarter: z.string().optional(),
    roomId: z.string().optional(),
    schedFrom: z.string().optional(),
    schedTo: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      // Validate faculty-specific fields
      if (data.type === "FACULTY") {
        return (
          !!data.subject &&
          !!data.classId &&
          !!data.academyearId &&
          !!data.quarter &&
          !!data.roomId &&
          !!data.schedFrom &&
          !!data.schedTo
        )
      }
      // Validate staff-specific fields
      if (data.type === "STAFF") {
        return !!data.description && !!data.schedFrom && !!data.schedTo
      }
      return true
    },
    {
      message: "Please fill in all required fields for the selected workload type",
      path: ["type"],
    },
  )

type WorkloadFormValues = z.infer<typeof workloadSchema>

interface AddWorkloadDialogProps {
  onSubmit: (data: Partial<Workload>) => void
}

export function AddWorkloadDialog({ onSubmit }: AddWorkloadDialogProps) {
  const [open, setOpen] = useState(false)
  const [workloadType, setWorkloadType] = useState<WorkloadType>("FACULTY")
  const { fetchRooms, rooms } = useWorkloadStore()
  const { employees, fetchEmployee, getFullName } = useEmployeeStore()
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<WorkloadFormValues>({
    resolver: zodResolver(workloadSchema),
    defaultValues: {
      type: "FACULTY",
      title: "",
      from: "",
      to: "",
      assignee_id: "",
    },
  })

  useEffect(() => {
    if (open) {
      if (!employees || employees.length === 0) {
        fetchEmployee()
      }
      if (!rooms || rooms.length === 0) {
        fetchRooms()
      }
    }
  }, [open, fetchEmployee, fetchRooms, employees, rooms])

  const handleSubmit = async (data: WorkloadFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      form.reset()
      setOpen(false)
    } catch (error) {
      console.error("Error submitting workload:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Workload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Workload</DialogTitle>
          <DialogDescription>Create a new workload assignment for faculty or staff members</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            {/* Step 1: Workload Header Information */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Workload Information</h3>
                  <Separator />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workload Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter workload title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            From Date
                          </FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            To Date
                          </FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workload Type</FormLabel>
                        <Select
                          onValueChange={(value: WorkloadType) => {
                            field.onChange(value)
                            setWorkloadType(value)
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select workload type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FACULTY">Faculty</SelectItem>
                            <SelectItem value="STAFF">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Select whether this is a faculty or staff workload</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Assignee Information */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Assignee Information
                  </h3>
                  <Separator />

                  <FormField
                    control={form.control}
                    name="assignee_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Assignee</FormLabel>
                        <FormDescription>Select the employee to assign this workload to</FormDescription>
                        <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={assigneeOpen}
                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                              >
                                {field.value
                                  ? employees?.find((employee) => employee.id.toString() === field.value)
                                    ? getFullName(employees.find((employee) => employee.id.toString() === field.value)!)
                                    : "Select assignee"
                                  : "Select assignee"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Search employee..." />
                              <CommandList>
                                <CommandEmpty>No employee found.</CommandEmpty>
                                <CommandGroup className="max-h-[200px] overflow-y-auto">
                                  {employees?.map((employee) => (
                                    <CommandItem
                                      key={employee.id}
                                      value={getFullName(employee)}
                                      onSelect={() => {
                                        form.setValue("assignee_id", employee.id.toString())
                                        setAssigneeOpen(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          employee.id.toString() === field.value ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      {getFullName(employee)}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Type-specific Details */}
            {workloadType === "FACULTY" && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Faculty Workload Details</h3>
                    <Separator />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Subject
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter subject name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="classId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Select class" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="academyearId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Academic Year</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Select academic year" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quarter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quarter</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select quarter" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">First Quarter</SelectItem>
                                  <SelectItem value="2">Second Quarter</SelectItem>
                                  <SelectItem value="3">Third Quarter</SelectItem>
                                  <SelectItem value="4">Fourth Quarter</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="roomId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Room
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select room" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {rooms?.map((room) => (
                                  <SelectItem key={room.id} value={room.id.toString()}>
                                    {room.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="schedFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Schedule From
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="datetime-local" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="schedTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Schedule To
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="datetime-local" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {workloadType === "STAFF" && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Staff Workload Details</h3>
                    <Separator />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter task title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter detailed description of the task"
                              rows={4}
                              className="resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="schedFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Schedule From
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="datetime-local" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="schedTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Schedule To
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="datetime-local" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Workload"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
