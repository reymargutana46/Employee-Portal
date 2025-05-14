import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Workload, WorkloadType } from "@/types/workload";
import { useState, useEffect } from "react";
import { Calendar, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const editWorkloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  from: z.string().min(1, "From date is required"),
  to: z.string().min(1, "To date is required"),
  type: z.enum(["FACULTY", "STAFF"]),
});

type EditWorkloadFormValues = z.infer<typeof editWorkloadSchema>;

interface EditWorkloadDialogProps {
  workload: Workload;
  onSubmit: (id: string, data: Partial<Workload>) => Promise<void>;
}

export function EditWorkloadDialog({
  workload,
  onSubmit,
}: EditWorkloadDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditWorkloadFormValues>({
    resolver: zodResolver(editWorkloadSchema),
    defaultValues: {
      title: workload.title || "",
      from: workload.from
        ? new Date(workload.from).toISOString().split("T")[0]
        : "",
      to: workload.to ? new Date(workload.to).toISOString().split("T")[0] : "",
      type: workload.type as WorkloadType,
    },
  });

  useEffect(() => {
    if (open) {
      // Reset form with workload values when dialog opens
      form.reset({
        title: workload.title || "",
        from: workload.from
          ? new Date(workload.from).toISOString().split("T")[0]
          : "",
        to: workload.to
          ? new Date(workload.to).toISOString().split("T")[0]
          : "",
        type: workload.type as WorkloadType,
      });
    }
  }, [open, workload, form]);

  const handleSubmit = async (data: EditWorkloadFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(workload.id, data);
      setOpen(false);
    } catch (error) {
      console.error("Error updating workload:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Workload</DialogTitle>
          <DialogDescription>
            Update the basic information for this workload
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 py-4"
          >
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
                          <Input
                            {...field}
                            placeholder="Enter workload title"
                          />
                        </FormControl>
                        <FormDescription>
                          A descriptive title for this workload
                        </FormDescription>
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
                            field.onChange(value);
                          }}
                          defaultValue={field.value}
                          disabled={
                            workload.faculty_w_l == null ||
                            workload.staff_w_l == null
                          }
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
                        <FormDescription>
                          {workload.faculty_w_l || workload.staff_w_l
                            ? "Type cannot be changed for assigned workloads"
                            : "Select whether this is a faculty or staff workload"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
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
  );
}
