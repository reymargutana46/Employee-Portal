import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import type { RequestPriority } from "@/types/serviceRequest"

interface PriorityBadgeProps {
  priority: RequestPriority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  switch (priority) {
    case "Low":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          Low
        </Badge>
      )
    case "Medium":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Medium
        </Badge>
      )
    case "High":
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          High
        </Badge>
      )
    case "Urgent":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          <AlertCircle className="mr-1 h-3 w-3" /> Urgent
        </Badge>
      )
  }
}
