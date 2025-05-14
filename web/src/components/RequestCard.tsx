
import { Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { ServiceRequest } from "@/types/serviceRequest"
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge"
import { StarRating } from "@/components/StarRating"

interface RequestCardProps {
  request: ServiceRequest
  onViewRequest: (request: ServiceRequest) => void
}

export function RequestCard({ request, onViewRequest }: RequestCardProps) {
  return (
    <Card key={request.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="line-clamp-1">{request.title}</CardTitle>
            <CardDescription>{request.type}</CardDescription>
          </div>
          <PriorityBadge priority={request.priority} />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">

              <div>
                <p className="text-sm font-medium">From: {request.requestor}</p>
                <p className="text-xs text-muted-foreground">Submitted: {request.createdAt}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">

              <div>
                <p className="text-sm font-medium">To: {request.requestTo}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground line-clamp-2">{request.details}</p>
          </div>
          <div className="flex justify-between items-center">
            <StatusBadge status={request.status} />
            {request.rating ? (
              <div className="flex items-center">
                <StarRating rating={request.rating} />
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full" onClick={() => onViewRequest(request)}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
