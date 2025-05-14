/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/context/AuthContext"
import { CreateWorkloadDialog } from "@/components/CreateWorkloadDialog"
import { AssignWorkloadDialog } from "@/components/AssignWorkloadDialog"
import type { FacultyWorkload, Workload } from "@/types/workload"
import { useEffect, useState } from "react"
import { useWorkloadStore } from "@/store/useWorkloadstore"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Plus, UserPlus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditWorkloadDialog } from "@/components/EditWorkloadDialog"
import { DeleteWorkloadDialog } from "@/components/DeleteWorkload"
import { EditFacultyDetailsDialog } from "@/components/EditFacultyDialog"
import { EditStaffDetailsDialog } from "@/components/EditStaffDialog"


const WorkloadPage = () => {
  const { userRoles } = useAuth()
  const {
    facultyWorkloads,
    staffWorkloads,
    unassignedWorkloads,
    fetchWorkloads,
    fetchRooms,
    assignFacultyWorkload,
    assignStaffWorkload,
    createWorkload,
    updateWorkload,
    updateStaffWorkload,
    updateFacultyWorkload,
    deleteWorkload,
    isLoading,
    error,
  } = useWorkloadStore()
  const [activeTab, setActiveTab] = useState<"FACULTY" | "STAFF" | "UNASSIGNED">("UNASSIGNED")
  const [selectedWorkload, setSelectedWorkload] = useState<Workload | null>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const isPrincipal = userRoles.some((role) => role.name === "principal")

  useEffect(() => {
    fetchRooms()
    fetchWorkloads()
  }, [fetchWorkloads, fetchRooms])

  const handleCreateWorkload = async (data: Partial<Workload>) => {
    await createWorkload(data)
  }

  const handleAssignWorkload = async (workloadId: string, data: Partial<Workload>) => {
    if (data.type === "STAFF") {
      await assignStaffWorkload(workloadId, data)
    } else {
      await assignFacultyWorkload(workloadId, data)
    }
    setIsAssignDialogOpen(false)
  }

  const handleUpdateWorkload = async (id: string, data: Partial<Workload>) => {
    await updateWorkload(id, data)
  }

  const handleFacultyUpdate = async (id: string, data: Partial<FacultyWorkload>) => {
    console.log(data)
    await updateFacultyWorkload(id, data)
  }

  const handleStaffUpdate = async (id: string, data: Partial<Workload>) => {
    await updateStaffWorkload(id, data)
  }

  const handleDeleteWorkload = async (id: string) => {
    await deleteWorkload(id)
  }

  const openAssignDialog = (workload: Workload) => {
    setSelectedWorkload(workload)
    setIsAssignDialogOpen(true)
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (e) {
      return dateString
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (e) {
      return dateString
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "h:mm a")
    } catch (e) {
      return dateString
    }
  }

  const getWorkloadStatusBadge = (workload: Workload) => {
    const now = new Date()
    const fromDate = new Date(workload.from)
    const toDate = new Date(workload.to)

    if (now < fromDate) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Upcoming
        </Badge>
      )
    } else if (now > toDate) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          Completed
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          Active
        </Badge>
      )
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workload Management</h1>
          <p className="text-muted-foreground mt-1">Create, assign, and track faculty and staff workloads</p>
        </div>
        {isPrincipal && (
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All Workloads</DropdownMenuItem>
                <DropdownMenuItem>Active Workloads</DropdownMenuItem>
                <DropdownMenuItem>Upcoming Workloads</DropdownMenuItem>
                <DropdownMenuItem>Completed Workloads</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <CreateWorkloadDialog onSubmit={handleCreateWorkload} />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Faculty Workloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{facultyWorkloads.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total faculty workloads</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Staff Workloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{staffWorkloads.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total staff workloads</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Unassigned Workloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{unassignedWorkloads.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending assignment</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Active Workloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {
                facultyWorkloads.concat(staffWorkloads).filter((w) => {
                  const now = new Date()
                  return new Date(w.from) <= now && new Date(w.to) >= now
                }).length
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">Currently active workloads</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="UNASSIGNED" onValueChange={(value) => setActiveTab(value as any)} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="UNASSIGNED">Unassigned</TabsTrigger>
          <TabsTrigger value="FACULTY">Faculty</TabsTrigger>
          <TabsTrigger value="STAFF">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="UNASSIGNED">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Unassigned Workloads</CardTitle>
              <Badge variant="outline" className="ml-2">
                {unassignedWorkloads.length} Workloads
              </Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unassignedWorkloads.length > 0 ? (
                        unassignedWorkloads.map((workload) => (
                          <TableRow key={workload.id}>
                            <TableCell className="font-medium">{workload.title}</TableCell>
                            <TableCell>
                              <Badge variant={workload.type === "FACULTY" ? "default" : "secondary"}>
                                {workload.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatDate(workload.from)} - {formatDate(workload.to)}
                              </div>
                            </TableCell>
                            <TableCell>{getWorkloadStatusBadge(workload)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => openAssignDialog(workload)}
                                >
                                  <UserPlus className="h-3.5 w-3.5" />
                                  Assign
                                </Button>
                                <EditWorkloadDialog workload={workload} onSubmit={handleUpdateWorkload} />
                                <DeleteWorkloadDialog
                                  workloadId={workload.id}
                                  workloadTitle={workload.title}
                                  workloadType={workload.type}
                                  workloadDate={workload.from}
                                  onDelete={handleDeleteWorkload}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <p>No unassigned workloads available</p>
                              {isPrincipal && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 gap-1"
                                  onClick={() => document.getElementById("create-workload-trigger")?.click()}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  Create Workload
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="FACULTY">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Faculty Workload Distribution</CardTitle>
              <Badge variant="outline" className="ml-2">
                {facultyWorkloads.length} Workloads
              </Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {facultyWorkloads.length > 0 ? (
                        facultyWorkloads.map((workload, index) => (
                          <TableRow key={workload.faculty_w_l?.id || index}>
                            <TableCell className="font-medium">{workload.title}</TableCell>
                            <TableCell>{workload.faculty_w_l?.subject}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-4 w-4" />
                                </div>
                                <span>John Doe</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center text-sm">
                                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                  {formatDate(workload.from)} - {formatDate(workload.to)}
                                </div>
                                <Badge variant="outline" className="mt-1">
                                  Quarter {workload.faculty_w_l?.quarter}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatTime(workload.faculty_w_l?.sched_from)} -{" "}
                                {formatTime(workload.faculty_w_l?.sched_to)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                {workload.faculty_w_l?.room?.name || "No Room"}
                              </div>
                            </TableCell>
                            <TableCell>{getWorkloadStatusBadge(workload)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                                <EditWorkloadDialog workload={workload} onSubmit={handleUpdateWorkload} />
                                <EditFacultyDetailsDialog workload={workload} onSubmit={handleFacultyUpdate} />
                                <DeleteWorkloadDialog
                                  workloadId={workload.id}
                                  workloadTitle={workload.title}
                                  workloadType={workload.type}
                                  workloadDate={workload.from}
                                  onDelete={handleDeleteWorkload}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-6">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <p>No faculty workloads available</p>
                              {isPrincipal && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 gap-1"
                                  onClick={() => document.getElementById("create-workload-trigger")?.click()}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  Create Workload
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="STAFF">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Staff Workload Distribution</CardTitle>
              <Badge variant="outline" className="ml-2">
                {staffWorkloads.length} Workloads
              </Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Workload Title</TableHead>
                        <TableHead>Task Title</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffWorkloads.length > 0 ? (
                        staffWorkloads.map((workload, index) => (
                          <TableRow key={workload.staff_w_l?.id || index}>
                            <TableCell className="font-medium">{workload.title}</TableCell>
                            <TableCell>{workload.staff_w_l?.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-4 w-4" />
                                </div>
                                <span>Jane Smith</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{workload.staff_w_l?.description}</TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatDate(workload.from)} - {formatDate(workload.to)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatTime(workload.staff_w_l?.sched_from)} -{" "}
                                {formatTime(workload.staff_w_l?.sched_to)}
                              </div>
                            </TableCell>
                            <TableCell>{getWorkloadStatusBadge(workload)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                                <EditWorkloadDialog workload={workload} onSubmit={handleUpdateWorkload} />
                                <EditStaffDetailsDialog workload={workload} onSubmit={handleStaffUpdate} />
                                <DeleteWorkloadDialog
                                  workloadId={workload.id}
                                  workloadTitle={workload.title}
                                  workloadType={workload.type}
                                  workloadDate={workload.from}
                                  onDelete={handleDeleteWorkload}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-6">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <p>No staff workloads available</p>
                              {isPrincipal && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 gap-1"
                                  onClick={() => document.getElementById("create-workload-trigger")?.click()}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  Create Workload
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedWorkload && (
        <AssignWorkloadDialog
          workload={selectedWorkload}
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          onSubmit={handleAssignWorkload}
        />
      )}
    </div>
  )
}

export default WorkloadPage
