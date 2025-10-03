import { Bell, Menu, X, User, User2, UserRoundCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Separator } from "./ui/separator";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useEffect } from "react";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const Header = ({ toggleSidebar, isSidebarCollapsed }: HeaderProps) => {
  const { user, userRoles, logout } = useAuthStore();
  const { notifications, unreadCount, fecthNotifications } =
    useNotificationStore();
  const navigate = useNavigate();

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleNotifications = () => {
    navigate("/notifications");
  };
  useEffect(() => {
    // Run the function immediately
    fecthNotifications();

    // Set interval to run it every 3 seconds
    const intervalId = setInterval(() => {
      fecthNotifications();
    }, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-4 rounded-md p-2 text-muted-foreground hover:bg-accent/10 hover:text-accent"
          aria-label="Toggle sidebar"
        >
          {isSidebarCollapsed ? <Menu /> : <X />}
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={handleNotifications}
          className="relative rounded-full p-2 text-muted-foreground hover:bg-accent/10 hover:text-accent"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 hover:bg-accent/10">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary">
                <User className="h-6 w-6 absolute top-1 left-1 text-white" />
              </div>
              <span className="hidden text-sm font-medium md:inline-block">
                {user.username}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              className="gap-2 mb-4 font-semibold"
              onClick={handleProfile}
            >
              <User2 className="w-4 h-4" />
              Profile
            </DropdownMenuItem>
            <Separator />
            <DropdownMenuLabel>
              <span className="flex gap-2">
                <UserRoundCog className="w-4 h-4 mt-1" /> Roles
              </span>
            </DropdownMenuLabel>
            <div className="px-2 py-1.5 flex flex-wrap gap-1">
              {userRoles.map((role) => {
                return (
                  <Badge
                    key={role.name}
                    variant="secondary"
                    className="capitalize"
                  >
                    {role.name}
                  </Badge>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;