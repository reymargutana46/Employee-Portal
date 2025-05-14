

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/StarRating"

// Define the form schema with Zod
const formSchema = z.object({
  rating: z
    .number()
    .min(1, {
      message: "Please select a rating",
    })
    .max(5),
  remarks: z.string().min(5, {
    message: "Remarks must be at least 5 characters",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface RatingDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (rating: number, remarks: string) => void
}

export function RatingDialog({ isOpen, onOpenChange, onSubmit }: RatingDialogProps) {
  const [selectedRating, setSelectedRating] = useState(0)

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      remarks: "",
    },
  })

  // Handle form submission
  function handleSubmit(data: FormValues) {
    onSubmit(data.rating, data.remarks)
    form.reset()
    setSelectedRating(0)
  }

  // Handle rating change
  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating)
    form.setValue("rating", rating)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate the Service</DialogTitle>
          <DialogDescription>Please rate the service and provide any feedback.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <StarRating rating={selectedRating} onRatingChange={handleRatingChange} interactive={true} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Share your feedback about the service" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={selectedRating === 0}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
