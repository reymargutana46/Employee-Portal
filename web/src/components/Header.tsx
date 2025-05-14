
import React from 'react';
import { Bell, Search, Menu, X, Moon, Sun, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from '@/store/useAuthStore';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const Header = ({ toggleSidebar, isSidebarCollapsed }: HeaderProps) => {
  const { user, userRoles, logout } = useAuthStore();



  // Get user name
  const userName = user?.lastname || "User";

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

        {/* <div className="hidden md:flex relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div> */}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* <button
          className="rounded-full p-2 text-muted-foreground hover:bg-accent/10 hover:text-accent"
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5" />
        </button> */}

        {/* <button
          className="rounded-full p-2 text-muted-foreground hover:bg-accent/10 hover:text-accent"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 hover:bg-accent/10">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary">
                <User className="h-6 w-6 absolute top-1 left-1 text-white" />
              </div>
              <span className="hidden text-sm font-medium md:inline-block">
                {userName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Roles</DropdownMenuLabel>
            <div className="px-2 py-1.5 flex flex-wrap gap-1">
              {userRoles.map(role =>{ return (
                <Badge key={role.name} variant="outline" className="capitalize">
                  {role.name}
                </Badge>
              )})}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
