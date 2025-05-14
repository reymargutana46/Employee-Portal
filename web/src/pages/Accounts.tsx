import { useEffect, useState } from "react";
import {
  Search,
  User,
  Shield,
  ChevronRight,
  Loader2,
  Check,
  X,
  Plus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import type { Role } from "@/types/user";
import type { User as UserType } from "@/types/user";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import axios from "@/utils/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmployeeStore } from "@/store/useEmployeeStore";

export default function Accounts() {
  // Get users and auth functions from Zustand store
  const { users, fetchUser, canManageRoles, canDoAction, user, UpdateUserRole } = useAuthStore();
  const { roles, fetchsetup } = useEmployeeStore();
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [remainingRoles, setRemainingRoles] = useState<Role[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Check if current user can manage roles
  const canManage = canManageRoles();

  // Fetch users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        await fetchsetup();
        await fetchUser();
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
        setLoading(false);
      }
    };

    loadUsers();
  }, [fetchUser]);

  // Set initial selected user when users are loaded
  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      handleSelectUser(users[0]);
    }
  }, [users, selectedUser]);

  // Filter users based on search query
  const filteredUsers = users?.filter(
    (user) =>
      user.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
    setUserRoles(user.roles || []);
    setRemainingRoles(
      roles.filter(
        (role) => !user.roles?.some((userRole) => userRole.name === role.name)
      )
    );
  };

  const addRole = (role: Role) => {
    if (!selectedUser) return;

    if (!userRoles.some((r) => r.name === role.name)) {
      const updatedUserRoles = [...userRoles, role];
      setUserRoles(updatedUserRoles);
      setRemainingRoles(remainingRoles.filter((r) => r.name !== role.name));
    }
  };

  const removeRole = (role: Role) => {
    if (!selectedUser) return;

    const updatedUserRoles = userRoles.filter((r) => r.name !== role.name);
    setUserRoles(updatedUserRoles);

    if (!remainingRoles.some((r) => r.name === role.name)) {
      setRemainingRoles([...remainingRoles, role]);
    }
  };

  const moveRoleUp = (index: number) => {
    if (index > 0) {
      const newRoles = [...userRoles];
      const temp = newRoles[index];
      newRoles[index] = newRoles[index - 1];
      newRoles[index - 1] = temp;
      setUserRoles(newRoles);
    }
  };

  const moveRoleDown = (index: number) => {
    if (index < userRoles.length - 1) {
      const newRoles = [...userRoles];
      const temp = newRoles[index];
      newRoles[index] = newRoles[index + 1];
      newRoles[index + 1] = temp;
      setUserRoles(newRoles);
    }
  };

  const saveUserChanges = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      // Update user with new roles
      await axios.put(`/accounts/${selectedUser.username}`, userRoles);

      // Refresh user list
      await fetchUser();
      if (user.username === selectedUser.username) {
        UpdateUserRole(userRoles);
      }

      toast.success("User roles updated successfully");
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  // Get initials for avatar
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase();
  };



  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Account Management
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage user accounts and permissions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - User list */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Users</CardTitle>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9 w-full"
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="px-4 pb-4">
                {filteredUsers.length > 0 ? (
                  <div className="space-y-1">
                    {filteredUsers.map((user) => {

                      return (
                        <button
                          key={user.username}
                          className={`w-full text-left p-3 rounded-md flex items-center gap-3 transition-colors ${
                            selectedUser?.username === user.username
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => handleSelectUser(user)}
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs">
                              {getInitials(user.firstname, user.lastname)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {user.firstname} {user.lastname}
                              </p>
                              <ChevronRight
                                className={`h-4 w-4 ${
                                  selectedUser?.username === user.username
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground truncate">
                                @{user.username}
                              </p>

                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <User className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground font-medium">
                      No users found
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main content area */}
        <Card className="md:col-span-2">
          {selectedUser ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(
                        selectedUser.firstname,
                        selectedUser.lastname
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">
                      {selectedUser.firstname} {selectedUser.lastname}
                    </CardTitle>
                    {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      @{selectedUser.username}
                      {getPrimaryRole(selectedUser.roles) && (
                        <Badge variant="secondary" className="capitalize">
                          {getPrimaryRole(selectedUser.roles)?.name}
                        </Badge>
                      )}
                    </div> */}
                  </div>
                </div>
              </CardHeader>

              <div className="px-6 pb-6">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="mb-6">
                    <TabsTrigger
                      value="details"
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      User Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="roles"
                      className="flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Role Management
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Username
                        </h3>
                        <p className="text-base font-medium">
                          {selectedUser.username}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Email
                        </h3>
                        <p className="text-base font-medium flex items-center gap-2">
                          {selectedUser.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          First Name
                        </h3>
                        <p className="text-base font-medium">
                          {selectedUser.firstname || "—"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Last Name
                        </h3>
                        <p className="text-base font-medium">
                          {selectedUser.lastname || "—"}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="roles">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-medium">
                            Role Management
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Add, remove, or reorder roles to change user
                            permissions
                          </p>
                        </div>
                        <Button
                          onClick={saveUserChanges}
                          disabled={saving}
                          className="ml-auto bg-primary"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium">
                              Current Roles
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {userRoles.length} assigned
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {userRoles.length > 0 ? (
                              userRoles.map((role, index) => (
                                <div
                                  key={role.id || index}
                                  className="p-3 rounded-md border flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="capitalize font-medium">
                                      {role.name}
                                    </span>

                                  </div>
                                  <div className="flex items-center">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => moveRoleUp(index)}
                                      disabled={index === 0}
                                      className="h-8 w-8"
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => moveRoleDown(index)}
                                      disabled={index === userRoles.length - 1}
                                      className="h-8 w-8"
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeRole(role)}
                                      className="h-8 w-8 text-red-500"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md">
                                <p className="text-muted-foreground">
                                  No roles assigned
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium">
                              Available Roles
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {remainingRoles.length} available
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {remainingRoles.length > 0 ? (
                              remainingRoles.map((role) => (
                                <div
                                  key={role.id}
                                  className="p-3 rounded-md border flex items-center justify-between hover:bg-muted/50 transition-colors"
                                >
                                  <span className="capitalize font-medium">
                                    {role.name}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => addRole(role)}
                                    className="h-8 w-8 text-green-500"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md">
                                <p className="text-muted-foreground">
                                  All roles assigned
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center p-8 h-[400px]">
              <div className="text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No User Selected</h3>
                <p className="text-muted-foreground max-w-md">
                  Select a user from the list to view and manage their account
                  details and permissions.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
