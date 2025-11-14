import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Loader2, CheckCircle, XCircle, Eye, BriefcaseBusiness } from "lucide-react"
import axios from "@/utils/axiosInstance"

interface WorkloadHdr {
  id: number
  title: string
  from: string
  to: string
  type: string
  status: string
  created_by: string
  assignee_id: number | null
  approval_remarks: string | null
  approved_by: string | null
  approved_at: string | null
  rejected_by: string | null
  rejected_at: string | null
  created_at: string
  updated_at: string
  employee?: {
    id: number
    fname: string
    lname: string
  }
  user?: {
    username: string
    employee?: {
      fname: string
      lname: string
    }
  }
  faculty_w_l?: {
    id: number
    description: string
    sched_from: string
    sched_to: string
    title: string
    room?: {
      name: string
    }
  }
  staff_w_l?: {
    id: number
    description: string
    sched_from: string
    sched_to: string
    title: string
  }
}

interface WorkloadStats {
  all: number
  pending: number
  approved: number
  disapproved: number
}

export function WorkloadApproval() {
  const { toast } = useToast()
  const [workloads, setWorkloads] = useState<WorkloadHdr[]>([])
  const [stats, setStats] = useState<WorkloadStats>({ all: 0, pending: 0, approved: 0, disapproved: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approvalRemarks, setApprovalRemarks] = useState<Record<number, string>>({})
  const [isApproving, setIsApproving] = useState<Record<number, boolean>>({})
  const [isRejecting, setIsRejecting] = useState<Record<number, boolean>>({})
  const [selectedWorkload, setSelectedWorkload] = useState<WorkloadHdr | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const fetchWorkloads = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await axios.get('/workload')
      
      // Filter workloads created by GradeLeader users
      const allWorkloads = [
        ...(response.data.data.facultyWorkload || []),
        ...(response.data.data.staffWorkload || []),
        ...(response.data.data.unassignedWorkload || [])
      ]
      
      setWorkloads(allWorkloads)
      
      // Calculate stats
      const newStats = {
        all: allWorkloads.length,
        pending: allWorkloads.filter(w => w.status === 'PENDING').length,
        approved: allWorkloads.filter(w => w.status === 'APPROVED').length,
        disapproved: allWorkloads.filter(w => w.status === 'REJECTED').length,
      }
      setStats(newStats)
      
    } catch (err) {
      console.error('Error fetching workloads:', err)
      setError('Failed to load workloads')
      toast({
        title: "Error",
        description: "Failed to load workloads",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkloads()
  }, [])

  const handleApprove = async (workloadId: number) => {
    setIsApproving(prev => ({ ...prev, [workloadId]: true }))
    try {
      const remarks = approvalRemarks[workloadId] || ''
      await axios.post(`/workload/${workloadId}/approve`, { remarks })
      
      toast({
        title: "Success",
        description: "Workload approved successfully",
      })
      
      // Clear remarks for this workload
      setApprovalRemarks(prev => {
        const newRemarks = { ...prev }
        delete newRemarks[workloadId]
        return newRemarks
      })
      
      // Refresh workloads
      await fetchWorkloads()
      
    } catch (error) {
      console.error('Error approving workload:', error)
      toast({
        title: "Error",
        description: "Failed to approve workload",
        variant: "destructive",
      })
    } finally {
      setIsApproving(prev => ({ ...prev, [workloadId]: false }))
    }
  }

  const handleReject = async (workloadId: number) => {
    setIsRejecting(prev => ({ ...prev, [workloadId]: true }))
    try {
      const remarks = approvalRemarks[workloadId] || ''
      await axios.post(`/workload/${workloadId}/reject`, { remarks })
      
      toast({
        title: "Success",
        description: "Workload disapproved successfully",
      })
      
      // Clear remarks for this workload
      setApprovalRemarks(prev => {
        const newRemarks = { ...prev }
        delete newRemarks[workloadId]
        return newRemarks
      })
      
      // Refresh workloads
      await fetchWorkloads()
      
    } catch (error) {
      console.error('Error rejecting workload:', error)
      toast({
        title: "Error",
        description: "Failed to disapprove workload",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(prev => ({ ...prev, [workloadId]: false }))
    }
  }

  const handleViewWorkload = (workload: WorkloadHdr) => {
    setSelectedWorkload(workload)
    setIsViewDialogOpen(true)
  }

  const handleRemarksChange = (workloadId: number, value: string) => {
    setApprovalRemarks(prev => ({
      ...prev,
      [workloadId]: value
    }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      case 'APPROVED':
        return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="outline" className="text-red-600 border-red-600">Disapproved</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filterWorkloads = (status: string) => {
    if (status === 'all') return workloads
    if (status === 'disapproved') return workloads.filter(w => w.status === 'REJECTED')
    return workloads.filter(w => w.status === status.toUpperCase())
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              Error loading workloads: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workload Approval</h1>
        <p className="text-muted-foreground">
          Review and approve pending workloads from Grade Leaders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Workloads</CardTitle>
            <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.all}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <BriefcaseBusiness className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disapproved</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.disapproved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Workload List with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({stats.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="disapproved">Disapproved ({stats.disapproved})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filterWorkloads(activeTab).length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No {activeTab === 'all' ? '' : activeTab} workloads found
                </div>
              </CardContent>
            </Card>
          ) : (
            filterWorkloads(activeTab).map((workload) => (
              <Card key={workload.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{workload.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Type: {workload.type}</span>
                        <span>From: {formatDate(workload.from)}</span>
                        <span>To: {formatDate(workload.to)}</span>
                        <span>Created by: {workload.user?.employee?.fname} {workload.user?.employee?.lname}</span>
                      </div>
                      {workload.employee && (
                        <div className="text-sm text-muted-foreground">
                          Assigned to: {workload.employee.fname} {workload.employee.lname}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(workload.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewWorkload(workload)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {workload.status === 'PENDING' && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`remarks-${workload.id}`}>
                        Approval Remarks (Optional)
                      </Label>
                      <Textarea
                        id={`remarks-${workload.id}`}
                        placeholder="Enter remarks for approval/rejection..."
                        value={approvalRemarks[workload.id] || ''}
                        onChange={(e) => handleRemarksChange(workload.id, e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleApprove(workload.id)}
                        disabled={isApproving[workload.id]}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isApproving[workload.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(workload.id)}
                        disabled={isRejecting[workload.id]}
                      >
                        {isRejecting[workload.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Disapprove
                      </Button>
                    </div>
                  </CardContent>
                )}

                {(workload.status === 'APPROVED' || workload.status === 'REJECTED') && workload.approval_remarks && (
                  <CardContent>
                    <div className="text-sm">
                      <strong>Remarks:</strong> {workload.approval_remarks}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {workload.status === 'APPROVED' ? 'Approved' : 'Rejected'} by {workload.approved_by || workload.rejected_by} on{' '}
                      {formatDate(workload.approved_at || workload.rejected_at || '')}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* View Workload Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Workload Details</DialogTitle>
          </DialogHeader>
          {selectedWorkload && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <div className="font-medium">{selectedWorkload.title}</div>
                </div>
                <div>
                  <Label>Type</Label>
                  <div className="font-medium">{selectedWorkload.type}</div>
                </div>
                <div>
                  <Label>From Date</Label>
                  <div className="font-medium">{formatDate(selectedWorkload.from)}</div>
                </div>
                <div>
                  <Label>To Date</Label>
                  <div className="font-medium">{formatDate(selectedWorkload.to)}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedWorkload.status)}</div>
                </div>
                <div>
                  <Label>Created By</Label>
                  <div className="font-medium">
                    {selectedWorkload.user?.employee?.fname} {selectedWorkload.user?.employee?.lname}
                  </div>
                </div>
              </div>

              {selectedWorkload.employee && (
                <div>
                  <Label>Assigned To</Label>
                  <div className="font-medium">
                    {selectedWorkload.employee.fname} {selectedWorkload.employee.lname}
                  </div>
                </div>
              )}

              {selectedWorkload.faculty_w_l && (
                <div className="space-y-2">
                  <Label>Faculty Workload Details</Label>
                  <div className="bg-muted p-3 rounded-md space-y-1">
                    <div><strong>Title:</strong> {selectedWorkload.faculty_w_l.title}</div>
                    <div><strong>Description:</strong> {selectedWorkload.faculty_w_l.description}</div>
                    <div><strong>Schedule:</strong> {formatDate(selectedWorkload.faculty_w_l.sched_from)} - {formatDate(selectedWorkload.faculty_w_l.sched_to)}</div>
                    {selectedWorkload.faculty_w_l.room && (
                      <div><strong>Room:</strong> {selectedWorkload.faculty_w_l.room.name}</div>
                    )}
                  </div>
                </div>
              )}

              {selectedWorkload.staff_w_l && (
                <div className="space-y-2">
                  <Label>Staff Workload Details</Label>
                  <div className="bg-muted p-3 rounded-md space-y-1">
                    <div><strong>Title:</strong> {selectedWorkload.staff_w_l.title}</div>
                    <div><strong>Description:</strong> {selectedWorkload.staff_w_l.description}</div>
                    <div><strong>Schedule:</strong> {formatDate(selectedWorkload.staff_w_l.sched_from)} - {formatDate(selectedWorkload.staff_w_l.sched_to)}</div>
                  </div>
                </div>
              )}

              {selectedWorkload.approval_remarks && (
                <div>
                  <Label>Approval Remarks</Label>
                  <div className="bg-muted p-3 rounded-md">{selectedWorkload.approval_remarks}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
