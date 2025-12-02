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
  UserPlus,
  UserMinus,
  AlertCircle,
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
import UserWithAvatar from "@/components/ui/user-with-avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
  
  // New states for account creation
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [createAccountData, setCreateAccountData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    selectedRoles: [] as number[]
  });
  const [creatingAccount, setCreatingAccount] = useState(false);

  // Check if current user can manage roles
  const canManage = canManageRoles();

  // Fetch users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        // Run both fetch operations in parallel to improve performance
        await Promise.all([
          fetchsetup(),
          fetchUser()
        ]);
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
    } else if (users.length > 0 && selectedUser) {
      // If we have a selected user, make sure it's still in our user list
      // This handles cases where the selected user might have been deleted
      const currentUser = users.find(u => u.employee_id === selectedUser.employee_id);
      if (!currentUser) {
        // If the selected user is no longer in the list, select the first user
        handleSelectUser(users[0]);
      } else if (currentUser.username !== selectedUser.username || currentUser.has_account !== selectedUser.has_account) {
        // If the user's account status has changed, update the selection
        handleSelectUser(currentUser);
      }
    } else if (users.length === 0) {
      // If no users are available, clear the selection
      setSelectedUser(null);
    }
  }, [users, selectedUser]);

  // Filter users based on search query
  const filteredUsers = users?.filter(
    (user) =>
      user.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (user: UserType) => {
    console.log('Selecting user:', user);
    setSelectedUser(user);
    setUserRoles(user.roles || []);
    setRemainingRoles(
      roles.filter(
        (role) => !user.roles?.some((userRole) => userRole.name === role.name)
      )
    );
    setActiveTab(user.has_account ? "details" : "details"); // Always start with details tab
  };

  const addRole = (role: Role) => {
    if (!selectedUser || !selectedUser.has_account) return;

    if (!userRoles.some((r) => r.name === role.name)) {
      const updatedUserRoles = [...userRoles, role];
      setUserRoles(updatedUserRoles);
      setRemainingRoles(remainingRoles.filter((r) => r.name !== role.name));
    }
  };

  const removeRole = (role: Role) => {
    if (!selectedUser || !selectedUser.has_account) return;

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
    if (!selectedUser || !selectedUser.username) return;

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

  const createUserAccount = async () => {
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    
    if (createAccountData.password !== createAccountData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (createAccountData.selectedRoles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    setCreatingAccount(true);
    try {
      await axios.post('/accounts', {
        employee_id: selectedUser.employee_id,
        username: createAccountData.username,
        password: createAccountData.password,
        role_ids: createAccountData.selectedRoles
      });

      // Reset form
      setCreateAccountData({
        username: '',
        password: '',
        confirmPassword: '',
        selectedRoles: []
      });
      
      // Refresh user list
      await fetchUser();
      
      toast.success("User account created successfully");
      setShowCreateAccount(false);
    } catch (error: any) {
      console.error("Failed to create account:", error);
      toast.error(error.response?.data?.message || "Failed to create user account");
    } finally {
      setCreatingAccount(false);
    }
  };

  const deleteUserAccount = async () => {
    if (!selectedUser || !selectedUser.username) {
      toast.error("No user selected for deletion");
      return;
    }

    if (!confirm(`Are you sure you want to delete the account for ${selectedUser.fullname}? This will remove their login access but keep their employee record.`)) {
      return;
    }

    try {
      console.log('Deleting account for user:', selectedUser.username);
      const response = await axios.delete(`/accounts/${selectedUser.username}`);
      console.log('Delete response:', response);
      await fetchUser();
      
      // After successful deletion, select the first available user or clear selection
      if (users.length > 1) {
        // Find the first user that's not the one we just deleted
        const remainingUsers = users.filter(u => u.username !== selectedUser.username);
        if (remainingUsers.length > 0) {
          handleSelectUser(remainingUsers[0]);
        } else {
          setSelectedUser(null);
        }
      } else {
        setSelectedUser(null);
      }
      
      setUserRoles([]);
      setRemainingRoles(roles);
      toast.success("User account deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.message || "Failed to delete user account: " + (error.message || "Unknown error"));
    }
  };

  const deactivateUserAccount = async () => {
    if (!selectedUser || !selectedUser.username) {
      toast.error("No user selected for deactivation");
      return;
    }

    if (!confirm(`Are you sure you want to deactivate the account for ${selectedUser.fullname}? They will not be able to log in, but their data will be preserved.`)) {
      return;
    }

    try {
      console.log('Deactivating account for user:', selectedUser.username);
      const response = await axios.post(`/accounts/${selectedUser.username}/deactivate`);
      console.log('Deactivate response:', response);
      await fetchUser();
      
      // Update selected user to reflect deactivation
      const updatedUser = users.find(u => u.username === selectedUser.username);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
      
      toast.success("User account deactivated successfully");
    } catch (error: any) {
      console.error("Failed to deactivate account:", error);
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.message || "Failed to deactivate user account: " + (error.message || "Unknown error"));
    }
  };

  const reactivateUserAccount = async () => {
    if (!selectedUser || !selectedUser.username) {
      toast.error("No user selected for reactivation");
      return;
    }

    if (!confirm(`Are you sure you want to reactivate the account for ${selectedUser.fullname}? They will be able to log in again.`)) {
      return;
    }

    try {
      console.log('Reactivating account for user:', selectedUser.username);
      const response = await axios.post(`/accounts/${selectedUser.username}/reactivate`);
      console.log('Reactivate response:', response);
      await fetchUser();
      
      // Update selected user to reflect reactivation
      const updatedUser = users.find(u => u.username === selectedUser.username);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
      
      toast.success("User account reactivated successfully");
    } catch (error: any) {
      console.error("Failed to reactivate account:", error);
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.message || "Failed to reactivate user account: " + (error.message || "Unknown error"));
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
            View and manage user accounts and permissions for all employees
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading account details...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar - User list */}
          <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Employees</CardTitle>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
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
                    {filteredUsers.map((employee) => {
                      return (
                        <button
                          key={employee.employee_id || employee.username || Math.random()}
                          className={`w-full text-left p-3 rounded-md flex items-center gap-3 transition-colors ${
                            selectedUser?.employee_id === employee.employee_id || selectedUser?.username === employee.username
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => handleSelectUser(employee)}
                        >
                          <UserWithAvatar 
                            user={{
                              firstname: employee.firstname,
                              lastname: employee.lastname,
                              profile_picture: employee.profile_picture
                            }}
                            size="sm"
                            showFullName={false}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {employee.firstname} {employee.lastname}
                              </p>
                              <div className="flex items-center gap-1">
                                {employee.has_account === false && (
                                  <AlertCircle className="h-3 w-3 text-orange-500" />
                                )}
                                {employee.is_deactivated && (
                                  <UserMinus className="h-3 w-3 text-red-500" />
                                )}
                                <ChevronRight
                                  className={`h-4 w-4 ${
                                    selectedUser?.employee_id === employee.employee_id || selectedUser?.username === employee.username
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground truncate">
                                {employee.has_account !== false && employee.username ? `@${employee.username}` : 'No account'}
                              </p>
                              {employee.has_account !== false && employee.username ? (
                                employee.is_deactivated ? (
                                  <Badge variant="destructive" className="text-xs">Deactivated</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">Active</Badge>
                                )
                              ) : (
                                <Badge variant="outline" className="text-xs">No Account</Badge>
                              )}
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
                      No employees found
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
                  <UserWithAvatar 
                    user={{
                      firstname: selectedUser.firstname,
                      lastname: selectedUser.lastname,
                      profile_picture: selectedUser.profile_picture
                    }}
                    size="lg"
                    showFullName={false}
                    layout="vertical"
                    className="items-start"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      {selectedUser.firstname} {selectedUser.lastname}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {selectedUser.has_account !== false && selectedUser.username ? (
                        <>
                          @{selectedUser.username}
                          {selectedUser.is_deactivated ? (
                            <Badge variant="destructive">Deactivated Account</Badge>
                          ) : (
                            <Badge variant="secondary">Active Account</Badge>
                          )}
                        </>
                      ) : (
                        <>
                          <span>No user account</span>
                          <Badge variant="outline">Employee Only</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex gap-2">
                      {(selectedUser.has_account === false || !selectedUser.username) && (
                        <Dialog open={showCreateAccount} onOpenChange={setShowCreateAccount}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="flex items-center gap-2">
                              <UserPlus className="h-4 w-4" />
                              Create Account
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create User Account</DialogTitle>
                              <DialogDescription>
                                Create a user account for {selectedUser.fullname} to allow system access.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="username">Username</Label>
                                <Input
                                  id="username"
                                  value={createAccountData.username}
                                  onChange={(e) => setCreateAccountData(prev => ({
                                    ...prev,
                                    username: e.target.value
                                  }))}
                                  placeholder="Enter username"
                                />
                              </div>
                              <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                  id="password"
                                  type="password"
                                  value={createAccountData.password}
                                  onChange={(e) => setCreateAccountData(prev => ({
                                    ...prev,
                                    password: e.target.value
                                  }))}
                                  placeholder="Enter password"
                                />
                              </div>
                              <div>
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                  id="confirmPassword"
                                  type="password"
                                  value={createAccountData.confirmPassword}
                                  onChange={(e) => setCreateAccountData(prev => ({
                                    ...prev,
                                    confirmPassword: e.target.value
                                  }))}
                                  placeholder="Confirm password"
                                />
                              </div>
                              <div>
                                <Label>Roles</Label>
                                <div className="space-y-2 mt-2">
                                  {roles.map((role) => (
                                    <div key={role.id} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`role-${role.id}`}
                                        checked={createAccountData.selectedRoles.includes(role.id!)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setCreateAccountData(prev => ({
                                              ...prev,
                                              selectedRoles: [...prev.selectedRoles, role.id!]
                                            }));
                                          } else {
                                            setCreateAccountData(prev => ({
                                              ...prev,
                                              selectedRoles: prev.selectedRoles.filter(id => id !== role.id)
                                            }));
                                          }
                                        }}
                                        className="rounded"
                                      />
                                      <Label htmlFor={`role-${role.id}`} className="capitalize">
                                        {role.name}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setShowCreateAccount(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={createUserAccount}
                                disabled={creatingAccount}
                              >
                                {creatingAccount ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                  </>
                                ) : (
                                  'Create Account'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      {selectedUser.has_account !== false && selectedUser.username && (
                        <div className="flex gap-2">
                          {selectedUser.is_deactivated ? (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={reactivateUserAccount}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                              <UserPlus className="h-4 w-4" />
                              Reactivate Account
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={deactivateUserAccount}
                              className="flex items-center gap-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                            >
                              <UserMinus className="h-4 w-4" />
                              Deactivate Account
                            </Button>
                          )}
                          {selectedUser.can_be_deleted && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={deleteUserAccount}
                              className="flex items-center gap-2"
                            >
                              <X className="h-4 w-4" />
                              Delete Account
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
                      Employee Details
                    </TabsTrigger>
                    {selectedUser.has_account !== false && selectedUser.username && (
                      <TabsTrigger
                        value="roles"
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Role Management
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Full Name
                        </h3>
                        <p className="text-base font-medium">
                          {selectedUser.fullname}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Email
                        </h3>
                        <p className="text-base font-medium">
                          {selectedUser.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Building & Section
                        </h3>
                        <p className="text-base font-medium">
                          {selectedUser.department || "—"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Position
                        </h3>
                        <p className="text-base font-medium">
                          {selectedUser.position || "—"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Contact Number
                        </h3>
                        <p className="text-base font-medium">
                          {selectedUser.contactno || "—"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Username
                        </h3>
                        <p className="text-base font-medium">
                          {selectedUser.username || "No account"}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {selectedUser.has_account !== false && selectedUser.username && (
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
                  )}
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
      )}
    </div>
  );
}
