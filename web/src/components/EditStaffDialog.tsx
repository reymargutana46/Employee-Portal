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
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { StaffWorkload, Workload } from "@/types/workload"
import { useState, useEffect } from "react"
import { Clock, Settings } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const editStaffDetailsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  sched_from: z.string().min(1, "Schedule from is required"),
  sched_to: z.string().min(1, "Schedule to is required"),
})

type EditStaffDetailsFormValues = z.infer<typeof editStaffDetailsSchema>

interface EditStaffDetailsDialogProps {
  workload: Workload
  onSubmit: (id: string, data: Partial<StaffWorkload>) => Promise<void>
}

export function EditStaffDetailsDialog({ workload, onSubmit }: EditStaffDetailsDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditStaffDetailsFormValues>({
    resolver: zodResolver(editStaffDetailsSchema),
    defaultValues: {
      title: workload.staff_w_l?.title || "",
      description: workload.staff_w_l?.description || "",
      sched_from: workload.staff_w_l?.sched_from
        ? new Date(workload.staff_w_l.sched_from).toISOString().slice(0, 16)
        : "",
      sched_to: workload.staff_w_l?.sched_to ? new Date(workload.staff_w_l.sched_to).toISOString().slice(0, 16) : "",
    },
  })

  useEffect(() => {
    if (open) {
      // Reset form with workload values when dialog opens
      form.reset({
        title: workload.staff_w_l?.title || "",
        description: workload.staff_w_l?.description || "",
        sched_from: workload.staff_w_l?.sched_from
          ? new Date(workload.staff_w_l.sched_from).toISOString().slice(0, 16)
          : "",
        sched_to: workload.staff_w_l?.sched_to ? new Date(workload.staff_w_l.sched_to).toISOString().slice(0, 16) : "",
      })
    }
  }, [open, workload, form])

  const handleSubmit = async (data: EditStaffDetailsFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(workload.staff_w_l.id,{
          ...workload.staff_w_l,
          ...data,

      })
      setOpen(false)
    } catch (error) {
      console.error("Error updating staff details:", error)
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Staff Workload Details</DialogTitle>
          <DialogDescription>Update the specific details for this staff workload</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
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
