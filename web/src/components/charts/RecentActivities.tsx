import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RecentLog } from "@/pages/Dashboard"
import { useAuthStore } from "@/store/useAuthStore";

interface RecentActivitiesProps {
  activities: RecentLog[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  // Handle case where activities might be undefined
  const safeActivities = activities || [];
  
  // Get user from auth store
  const { user, userRoles } = useAuthStore();
  
  // Check user role
  const isPrincipal = userRoles.some(role => role.name.toLowerCase() === 'principal');
  const isSecretary = userRoles.some(role => role.name.toLowerCase() === 'secretary');
  const isStaff = userRoles.some(role => role.name.toLowerCase() === 'staff');
  const isFaculty = userRoles.some(role => role.name.toLowerCase() === 'faculty');
  const isAdmin = userRoles.some(role => role.name.toLowerCase() === 'admin');
  
  // Determine how many activities to show based on user role
  // Admin, Staff, Faculty, and Secretary users should see 5 activities, Principal users should see 10, others should see 5
  const activityCount = isPrincipal ? 10 : (isAdmin || isStaff || isFaculty || isSecretary) ? 5 : 5;
  
  return (
    <div className="space-y-3">
      {safeActivities.length > 0 ? (
        (() => {
          // For principal users, we want to show activities from oldest to latest
          // For other users, we show from latest to oldest (default behavior)
          const displayActivities = isPrincipal 
            ? safeActivities.slice(0, activityCount) // Already ordered from oldest to latest in backend
            : safeActivities.slice(0, activityCount); // Default slice from beginning
          
          return displayActivities.map((activity, index) => {
            // Check if this activity was performed by the current user
            const isCurrentUserActivity = activity.performed_by === user?.username;
            
            return (
              <div className="flex items-start" key={index}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {activity.performed_by ? activity.performed_by.charAt(0) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2 flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none capitalize truncate">
                    {activity.performed_by || 'Unknown'}
                    {isCurrentUserActivity && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        You
                      </span>
                    )}
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
            );
          });
        })()
      ) : (
        <div className="text-center py-4 text-muted-foreground text-sm">
          {(isStaff || isFaculty || isSecretary || isAdmin)
            ? "You haven't performed any activities yet" 
            : "No recent activities"}
        </div>
      )}
    </div>
  )
}