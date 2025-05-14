"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface DeleteWorkloadDialogProps {
  workloadId: string
  workloadTitle: string
  workloadType: string
  workloadDate?: string
  onDelete: (id: string) => Promise<void>
}

export function DeleteWorkloadDialog({
  workloadId,
  workloadTitle,
  workloadType,
  workloadDate,
  onDelete,
}: DeleteWorkloadDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(workloadId)
      setOpen(false)
    } catch (error) {
      console.error("Error deleting workload:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (e) {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1">
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Workload</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this workload? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{workloadTitle}</h3>
                {workloadDate && <p className="text-sm text-muted-foreground">{formatDate(workloadDate)}</p>}
              </div>
              <Badge>{workloadType}</Badge>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Workload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
