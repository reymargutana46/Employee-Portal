import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { FacultyWorkload, Workload } from "@/types/workload"
import { useState, useEffect } from "react"
import { BookOpen, Clock, MapPin, Settings } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useWorkloadStore } from "@/store/useWorkloadstore"

const editFacultyDetailsSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  classId: z.string().min(1, "Class is required"),
  sched_from: z.string().min(1, "Schedule from is required"),
  sched_to: z.string().min(1, "Schedule to is required"),
  acadyearId: z.number().min(1, "Academic year is required"),
  quarter: z.string().min(1, "Quarter is required"),
  room_id: z.string().min(1, "Room is required"),
})

type EditFacultyDetailsFormValues = z.infer<typeof editFacultyDetailsSchema>

interface EditFacultyDetailsDialogProps {
  workload: Workload
  onSubmit: (id: string, data: Omit<FacultyWorkload, "room">) => Promise<void>
}

export function EditFacultyDetailsDialog({ workload, onSubmit }: EditFacultyDetailsDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { rooms, fetchRooms } = useWorkloadStore()

  const form = useForm<EditFacultyDetailsFormValues>({
    resolver: zodResolver(editFacultyDetailsSchema),
    defaultValues: {
      subject: workload.faculty_w_l?.subject || "",
      classId: workload.faculty_w_l?.classId || "",
      sched_from: workload.faculty_w_l?.sched_from
        ? new Date(workload.faculty_w_l.sched_from).toISOString().slice(0, 16)
        : "",
      sched_to: workload.faculty_w_l?.sched_to
        ? new Date(workload.faculty_w_l.sched_to).toISOString().slice(0, 16)
        : "",
      acadyearId: Number(workload.faculty_w_l?.acadyearId),
      quarter: workload.faculty_w_l?.quarter?.toString() || "",
      room_id: workload.faculty_w_l?.room_id || "",
    },
  })

  useEffect(() => {
    if (open) {
      fetchRooms()

      // Log the current workload data to debug


      // Reset form with workload values when dialog opens
      form.reset({
        subject: workload.faculty_w_l?.subject || "",
        classId: workload.faculty_w_l?.classId || "",
        sched_from: workload.faculty_w_l?.sched_from
          ? new Date(workload.faculty_w_l.sched_from).toISOString().slice(0, 16)
          : "",
        sched_to: workload.faculty_w_l?.sched_to
          ? new Date(workload.faculty_w_l.sched_to).toISOString().slice(0, 16)
          : "",
        acadyearId: Number(workload.faculty_w_l?.acadyearId),
        quarter: workload.faculty_w_l?.quarter?.toString() || "",
        // Ensure room_id is a string
        room_id: workload.faculty_w_l?.room_id ? workload.faculty_w_l.room_id.toString() : "",
      })
    }
  }, [open, workload, form, fetchRooms])

  const handleSubmit = async (data: EditFacultyDetailsFormValues) => {
    setIsSubmitting(true)
    try {
      const { room, ...facultyWorkloadData } = workload.faculty_w_l // Explicitly omit room here
      await onSubmit(workload.faculty_w_l.id, {
        ...facultyWorkloadData, // Spread the rest of the data
        ...data, // Merge form data
      })
      setOpen(false)
    } catch (error) {
      console.error("Error updating faculty details:", error)
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Settings className="h-3.5 w-3.5" />
          Edit Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Faculty Workload Details</DialogTitle>
          <DialogDescription>Update the specific details for this faculty workload</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
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
                      name="acadyearId"
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
                      name="room_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Room
                          </FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              console.log("Selected room:", value)
                              field.onChange(value)
                            }}
                          >
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
                      name="sched_from"
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
                      name="sched_to"
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
