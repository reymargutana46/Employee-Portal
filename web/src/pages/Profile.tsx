"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Save, Loader2, User, Briefcase, KeyRound, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEmployeeStore } from "@/store/useEmployeeStore"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function Profile() {
  const { fetchMe, employee, isLoading, departments, fetchsetup, updateEmployee, updateProfile, updatePassword } =
    useEmployeeStore()
  const { toast } = useToast()

  // Local loading states
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    fetchMe()
    fetchsetup()
  }, [fetchMe, fetchsetup])

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    extensionName: "",
    biod: "",
    contactNumber: "",
    telephoneNumber: "",
    email: "",
    department: "",
    position: "",
    workhours_id: "",
    workHoursAm: "",
    workHoursPm: "",
    username: "",
  })

  // Password fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Track if form has been modified
  const [isFormModified, setIsFormModified] = useState(false)
  const [isPasswordModified, setIsPasswordModified] = useState(false)

  // Add state for confirmation dialogs after the existing state declarations:
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)

  // Load employee data when available
  useEffect(() => {
    if (employee && !isLoading) {
      setFormData({
        firstName: employee.fname || "",
        lastName: employee.lname || "",
        middleName: employee.mname || "",
        extensionName: employee.extname || "",
        workhours_id: employee.workhours_id || "",
        biod: employee.biod || "",
        contactNumber: employee.contactno || "",
        telephoneNumber: employee.telno || "",
        email: employee.email || "",
        department: employee.department || "",
        position: employee.position || "",
        workHoursAm: employee.workhours_am || "",
        workHoursPm: employee.workhours_pm || "",
        username: employee.username || "",
      })
      // Reset modification state after loading data
      setIsFormModified(false)
    }
  }, [employee, isLoading])

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
    setIsFormModified(true)
  }

  // Handle select changes
  const handleSelectChange = (value, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setIsFormModified(true)
  }

  // Handle password changes
  const handlePasswordChange = (e) => {
    const { id, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [id]: value,
    }))
    setIsPasswordModified(true)
  }

  // Handle form submission
  const handleSaveChanges = async () => {
    if (!employee) return

    setIsSaving(true)
    try {
      // Map form data back to the employee structure
      const updatedEmployeeData = {
        id: employee.id,
        fname: formData.firstName,
        lname: formData.lastName,
        mname: formData.middleName,
        extname: formData.extensionName,
        contactno: formData.contactNumber,
        telno: formData.telephoneNumber,
        email: formData.email,
        department: formData.department,
        position: formData.position,
        workhours_id: formData.workhours_id,
        workhours_am: formData.workHoursAm,
        workhours_pm: formData.workHoursPm,
        username: formData.username,
      }

      // Call the store function to update profile
      await updateProfile(employee.id, updatedEmployeeData)

      // Show success message
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved.",
        variant: "default",
      })

      // Reset form modified state
      setIsFormModified(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: error.response?.data?.message || "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle password update
  const handleUpdatePassword = async () => {
    if (!employee) return

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation password must match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    // Check for password strength
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword)
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword)
    const hasNumbers = /\d/.test(passwordData.newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      toast({
        title: "Password too weak",
        description: "Password must contain uppercase, lowercase, numbers, and special characters.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)
    try {
      // Call the store function to update password
      await updatePassword({
        userId: employee.id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      // Show success message
      toast({
        title: "Password updated successfully",
        description: "Your password has been changed. Please use your new password for future logins.",
        variant: "default",
      })

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setIsPasswordModified(false)
    } catch (error) {
      console.error("Error updating password:", error)

      // Handle specific error cases
      let errorMessage = "There was a problem updating your password. Please try again."

      if (error.response?.status === 401) {
        errorMessage = "Current password is incorrect. Please try again."
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Invalid password format."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      toast({
        title: "Password update failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <Separator />
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
          <p className="text-muted-foreground">View and manage your personal information and account settings</p>

          {!isLoading && employee && (
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline" className="text-sm font-medium">
                Employee ID: {employee.biod}
              </Badge>
              {employee.department && (
                <Badge variant="secondary" className="text-sm font-medium">
                  {employee.department}
                </Badge>
              )}
            </div>
          )}
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal Information</span>
              <span className="sm:hidden">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="work" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Work Information</span>
              <span className="sm:hidden">Work</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              <span className="hidden sm:inline">Account Settings</span>
              <span className="sm:hidden">Account</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Enter your last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="middleName">Middle Name</Label>
                        <Input
                          id="middleName"
                          placeholder="Enter your middle name"
                          value={formData.middleName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="extensionName">Extension Name</Label>
                        <Input
                          id="extensionName"
                          placeholder="Jr., Sr., III, etc."
                          value={formData.extensionName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="biod">Bio ID</Label>
                      <Input
                        id="biod"
                        placeholder="Employee ID"
                        value={formData.biod}
                        onChange={handleInputChange}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground mt-1">Your employee ID cannot be changed</p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contactNumber">Contact Number</Label>
                        <Input
                          id="contactNumber"
                          placeholder="Enter your contact number"
                          value={formData.contactNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telephoneNumber">Telephone Number</Label>
                        <Input
                          id="telephoneNumber"
                          placeholder="Enter your telephone number"
                          value={formData.telephoneNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (employee) {
                      setFormData({
                        firstName: employee.fname || "",
                        lastName: employee.lname || "",
                        middleName: employee.mname || "",
                        extensionName: employee.extname || "",
                        biod: employee.biod || "",
                        contactNumber: employee.contactno || "",
                        telephoneNumber: employee.telno || "",
                        email: employee.email || "",
                        department: employee.department || "",
                        position: employee.position || "",
                        workHoursAm: employee.workhours_am || "",
                        workHoursPm: employee.workhours_pm || "",
                        username: employee.username || "",
                        workhours_id: employee.workhours_id || "",
                      })
                      setIsFormModified(false)
                    }
                  }}
                  disabled={!isFormModified || isLoading || isSaving}
                >
                  Reset
                </Button>
                <AlertDialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full sm:w-auto" disabled={!isFormModified || isLoading || isSaving}>
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : isFormModified ? (
                        <Save className="mr-2 h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      {isSaving ? "Saving..." : isFormModified ? "Save Changes" : "Saved"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to save these changes to your profile? This will update your information
                        in the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setShowSaveConfirmation(false)
                          handleSaveChanges()
                        }}
                      >
                        Save Changes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="work" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Work Information</CardTitle>
                <CardDescription>Manage your work-related details and department information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => handleSelectChange(value, "department")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments && departments.length > 0 ? (
                              departments.map((department) => (
                                <SelectItem key={department.id} value={department.name}>
                                  {department.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-departments">No departments available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          placeholder="Enter your position"
                          value={formData.position}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="workHoursAm">Work Hours (AM)</Label>
                        <Input
                          id="workHoursAm"
                          placeholder="e.g., 9:00 AM - 12:00 PM"
                          value={formData.workHoursAm}
                          onChange={handleInputChange}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Specify your morning work hours</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="workHoursPm">Work Hours (PM)</Label>
                        <Input
                          id="workHoursPm"
                          placeholder="e.g., 1:00 PM - 5:00 PM"
                          value={formData.workHoursPm}
                          onChange={handleInputChange}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Specify your afternoon work hours</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (employee) {
                      setFormData({
                        ...formData,
                        department: employee.department || "",
                        position: employee.position || "",
                        workHoursAm: employee.workhours_am || "",
                        workHoursPm: employee.workhours_pm || "",
                      })
                      setIsFormModified(false)
                    }
                  }}
                  disabled={!isFormModified || isLoading || isSaving}
                >
                  Reset
                </Button>
                <AlertDialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full sm:w-auto" disabled={!isFormModified || isLoading || isSaving}>
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : isFormModified ? (
                        <Save className="mr-2 h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      {isSaving ? "Saving..." : isFormModified ? "Save Changes" : "Saved"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to save these changes to your profile? This will update your information
                        in the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setShowSaveConfirmation(false)
                          handleSaveChanges()
                        }}
                      >
                        Save Changes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account credentials and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleInputChange}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Change Password</h3>

                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                          Make sure your new password is at least 8 characters long and includes a mix of letters,
                          numbers, and symbols.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="Enter your current password"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Enter your new password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your new password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                        />
                        {passwordData.newPassword &&
                          passwordData.confirmPassword &&
                          passwordData.newPassword !== passwordData.confirmPassword && (
                            <p className="text-sm text-destructive mt-1">Passwords do not match</p>
                          )}
                        {passwordData.newPassword && passwordData.newPassword.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium">Password strength:</p>
                            <div className="space-y-1">
                              <div
                                className={`text-xs ${passwordData.newPassword.length >= 8 ? "text-green-600" : "text-red-600"}`}
                              >
                                ✓ At least 8 characters
                              </div>
                              <div
                                className={`text-xs ${/[A-Z]/.test(passwordData.newPassword) ? "text-green-600" : "text-red-600"}`}
                              >
                                ✓ Contains uppercase letter
                              </div>
                              <div
                                className={`text-xs ${/[a-z]/.test(passwordData.newPassword) ? "text-green-600" : "text-red-600"}`}
                              >
                                ✓ Contains lowercase letter
                              </div>
                              <div
                                className={`text-xs ${/\d/.test(passwordData.newPassword) ? "text-green-600" : "text-red-600"}`}
                              >
                                ✓ Contains number
                              </div>
                              <div
                                className={`text-xs ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? "text-green-600" : "text-red-600"}`}
                              >
                                ✓ Contains special character
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-between">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    })
                    setIsPasswordModified(false)
                  }}
                  disabled={isLoading || isChangingPassword || !isPasswordModified}
                >
                  Reset
                </Button>
                <AlertDialog open={showPasswordConfirmation} onOpenChange={setShowPasswordConfirmation}>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full sm:w-auto"
                      disabled={
                        !isPasswordModified ||
                        isLoading ||
                        isChangingPassword ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        passwordData.newPassword !== passwordData.confirmPassword ||
                        passwordData.newPassword.length < 8
                      }
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Password Change</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to change your password? You will need to use the new password for future
                        logins.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setShowPasswordConfirmation(false)
                          handleUpdatePassword()
                        }}
                      >
                        Update Password
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
