
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Workload, WorkloadType } from "@/types/workload"
import { useState } from "react"
import { Calendar, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const createWorkloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  from: z.string().min(1, "From date is required"),
  to: z.string().min(1, "To date is required"),
  type: z.enum(["FACULTY", "STAFF"]),
})

type CreateWorkloadFormValues = z.infer<typeof createWorkloadSchema>

interface CreateWorkloadDialogProps {
  onSubmit: (data: Partial<Workload>) => Promise<void>
}

export function CreateWorkloadDialog({ onSubmit }: CreateWorkloadDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateWorkloadFormValues>({
    resolver: zodResolver(createWorkloadSchema),
    defaultValues: {
      title: "",
      from: "",
      to: "",
      type: "FACULTY",
    },
  })

  const handleSubmit = async (data: CreateWorkloadFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      form.reset()
      setOpen(false)
    } catch (error) {
      console.error("Error creating workload:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" id="create-workload-trigger">
          <Plus className="h-4 w-4" />
          Create Workload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Workload</DialogTitle>
          <DialogDescription>
            Create a new workload that can later be assigned to faculty or staff members
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
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
                        <FormDescription>A descriptive title for this workload</FormDescription>
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Workload"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
