/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Workload } from "@/types/workload"
import { useEffect, useState } from "react"
import { useEmployeeStore } from "@/store/useEmployeeStore"
import { Check, ChevronsUpDown, BookOpen, Users, MapPin, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useWorkloadStore } from "@/store/useWorkloadstore"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

const facultyAssignSchema = z.object({
  assignee_id: z.string().min(1, "Assignee is required"),
  subject: z.string().min(1, "Subject is required"),
  classId: z.string().min(1, "Class is required"),
  schedFrom: z.string().min(1, "Schedule from is required"),
  schedTo: z.string().min(1, "Schedule to is required"),
  academyearId: z.string().min(1, "Academic year is required"),
  quarter: z.string().min(1, "Quarter is required"),
  roomId: z.string().min(1, "Room is required"),
})

const staffAssignSchema = z.object({
  assignee_id: z.string().min(1, "Assignee is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  schedFrom: z.string().min(1, "Schedule from is required"),
  schedTo: z.string().min(1, "Schedule to is required"),
})

interface AssignWorkloadDialogProps {
  workload: Workload
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (workloadId: string, data: Partial<Workload>) => Promise<void>
}

export function AssignWorkloadDialog({ workload, open, onOpenChange, onSubmit }: AssignWorkloadDialogProps) {
  const { fetchRooms, rooms } = useWorkloadStore()
  const { employees, fetchEmployee, getFullName } = useEmployeeStore()
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formSchema = workload.type === "FACULTY" ? facultyAssignSchema : staffAssignSchema

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assignee_id: "",
      ...(workload.type === "FACULTY"
        ? { subject: "", classId: "", academyearId: "", quarter: "", roomId: "", schedFrom: "", schedTo: "" }
        : { title: "", description: "", schedFrom: "", schedTo: "" }),
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

      // Reset form when dialog opens with a different workload
      form.reset({
        assignee_id: "",
        ...(workload.type === "FACULTY"
          ? { subject: "", classId: "", academyearId: "", quarter: "", roomId: "", schedFrom: "", schedTo: "" }
          : { title: "", description: "", schedFrom: "", schedTo: "" }),
      })
    }
  }, [open, fetchEmployee, fetchRooms, employees, rooms, workload, form])

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await onSubmit(workload.id, {
        ...data,
        type: workload.type,
      })
      form.reset()
    } catch (error) {
      console.error("Error assigning workload:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (e) {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Workload</DialogTitle>
          <DialogDescription>
            Assign this workload to a {workload.type.toLowerCase()} member and provide additional details
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/30 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{workload.title}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(workload.from)} - {formatDate(workload.to)}
              </p>
            </div>
            <Badge>{workload.type}</Badge>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

            {workload.type === "FACULTY" && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Faculty Workload Details
                    </h3>
                    <Separator />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
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

            {workload.type === "STAFF" && (
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Assigning..." : "Assign Workload"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
