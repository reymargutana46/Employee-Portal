import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RecentLog } from "@/pages/Dashboard"


interface RecentActivitiesProps {
  activities: RecentLog[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <div className="space-y-8">
      {activities.map((activity, index) => (
        <div className="flex items-center" key={index}>

          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none capitalize">{activity.performed_by}</p>
            <p className="text-xs text-muted-foreground capitalize ">{activity.action}</p>
            <p className="text-sm text-muted-foreground capitalize">{activity.description}</p>
          </div>
          <div className="ml-auto font-medium text-xs text-muted-foreground">{activity.time}</div>
        </div>
      ))}
    </div>
  )
}
