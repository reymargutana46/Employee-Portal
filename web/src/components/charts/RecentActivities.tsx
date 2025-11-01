import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RecentLog } from "@/pages/Dashboard"
import { useAuthStore } from "@/store/useAuthStore";

interface RecentActivitiesProps {
  activities: RecentLog[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  // Handle case where activities might be undefined
  const safeActivities = activities || [];
  
  // Log for debugging
  console.log('RecentActivities received:', activities);
  console.log('Safe activities:', safeActivities);
  console.log('Number of safe activities:', safeActivities.length);
  
  // Get user from auth store
  const { user, userRoles } = useAuthStore();
  
  // Check user role
  const isPrincipal = userRoles.some(role => role.name.toLowerCase() === 'principal');
  const isStaff = userRoles.some(role => role.name.toLowerCase() === 'staff');
  const isFaculty = userRoles.some(role => role.name.toLowerCase() === 'faculty');
  
  // Log for debugging
  console.log('User roles:', userRoles);
  console.log('Is principal:', isPrincipal);
  console.log('Is staff:', isStaff);
  console.log('Is faculty:', isFaculty);
  
  // Determine how many activities to show based on user role
  // Staff and Faculty users should see 5 activities, Principal users should see 5, others should see 3
  const activityCount = isPrincipal ? 5 : (isStaff || isFaculty) ? 5 : 3;
  
  // Log for debugging
  console.log('Activity count to display:', activityCount);
  
  return (
    <div className="space-y-3">
      {safeActivities.length > 0 ? (
        (() => {
          const slicedActivities = safeActivities.slice(0, activityCount);
          console.log('Sliced activities:', slicedActivities);
          console.log('Number of sliced activities:', slicedActivities.length);
          return slicedActivities.map((activity, index) => {
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
          {isStaff || isFaculty
            ? "You haven't performed any activities yet" 
            : "No recent activities"}
        </div>
      )}
    </div>
  )
}
