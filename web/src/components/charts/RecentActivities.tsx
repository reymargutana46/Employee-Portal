import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RecentLog } from "@/pages/Dashboard"
import { useAuthStore } from "@/store/useAuthStore";

interface RecentActivitiesProps {
  activities: RecentLog[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  // Handle case where activities might be undefined
  const safeActivities = activities || [];
  
  // Get user roles from auth store
  const { userRoles } = useAuthStore();
  
  // Check user role
  const isPrincipal = userRoles.some(role => role.name.toLowerCase() === 'principal');
  const isStaff = userRoles.some(role => role.name.toLowerCase() === 'staff');
  
  // Determine how many activities to show based on user role
  // Staff users should see 5 activities, Principal users should see 5, others should see 3
  const activityCount = isPrincipal ? 5 : (isStaff ? 5 : 3);
  
  return (
    <div className="space-y-3">
      {safeActivities.length > 0 ? (
        safeActivities.slice(0, activityCount).map((activity, index) => (
          <div className="flex items-start" key={index}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {activity.performed_by ? activity.performed_by.charAt(0) : '?'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-2 flex-1 min-w-0">
              <p className="text-sm font-medium leading-none capitalize truncate">
                {activity.performed_by || 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground capitalize truncate">
                {activity.action || 'No action'}
              </p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description || 'No description'}
                </p>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {activity.time || 'Unknown time'}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-muted-foreground text-sm">
          No recent activities
        </div>
      )}
    </div>
  )
}