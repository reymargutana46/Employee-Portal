"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, Star, AlertCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RequestCard } from "@/components/RequestCard"
import { NewRequestDialog } from "@/components/NewRequestDialog"
import { ViewRequestDialog } from "@/components/ViewRequestDialog"
import { RatingDialog } from "@/components/RatingDialog"
import { Card, CardContent } from "@/components/ui/card"
import { type ServiceRequest, type RequestStatus, requestTypes } from "@/types/serviceRequest"
import { useEmployeeStore } from "@/store/useEmployeeStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useSeerviceRequestStore } from "@/store/useServiceRequestStore"

const ServiceRequests = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [ratingFilter, setRatingFilter] = useState("") // "rated", "unrated", "hasRemarks"
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const [isViewRequestOpen, setIsViewRequestOpen] = useState(false)
  const [isRatingOpen, setIsRatingOpen] = useState(false)
  const { user, canDoAction } = useAuthStore()
  const { employees, fetchEmployee } = useEmployeeStore()
  const {
    serviceRequests,
    selectedRequest,

    fetchRequests,
    createRequest,
    updateRequest,
    updateStatus,
    deleteRequest,
    submitRating,
    setSelectedRequest,
  } = useSeerviceRequestStore()

  useEffect(() => {
    if (employees.length <= 0) fetchEmployee()
    if (serviceRequests.length <= 0) fetchRequests()
  }, [serviceRequests.length, employees.length, fetchEmployee, fetchRequests])

  // Filter requests based on search term, active tab (status), and priority
  const filteredRequests = serviceRequests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filtering (from tabs)
    const matchesStatus =
      activeTab === "all" ||
      (activeTab === "pending" && request.status === "Pending") ||
      (activeTab === "inProgress" && request.status === "In Progress") ||
      (activeTab === "completed" && request.status === "Completed") ||
      (activeTab === "forApproval" && request.status === "For Approval") ||
      (activeTab === "rejected" && request.status === "Disapproved")
    // Priority filtering (from dropdown)
    const matchesPriority = priorityFilter === "" || request.priority === priorityFilter

    // Rating filtering
    const matchesRating =
      ratingFilter === "" ||
      (ratingFilter === "rated" && request.rating !== undefined && request.rating > 0) ||
      (ratingFilter === "unrated" &&
        request.status === "Completed" &&
        (request.rating === undefined || request.rating === 0)) ||
      (ratingFilter === "hasRemarks" && request.remarks && request.remarks.trim() !== "")

    return matchesSearch && matchesStatus && matchesPriority && matchesRating
  })

  // Clear all filters
  const clearAllFilters = () => {
    setPriorityFilter("")
    setRatingFilter("")
    setActiveTab("all")
    setSearchTerm("")
  }

  // Handle creating a new request
  const handleCreateRequest = (
    newRequest: Omit<ServiceRequest, "id" | "dateSubmitted" | "requestor" | "requestorAvatar" | "status">,
  ) => {
    const request: Omit<ServiceRequest, "requestor" | "id"> = {
      status: "For Approval", // Always start with "For Approval"
      ...newRequest,
    }

    createRequest(request).then(() => {
      setIsViewRequestOpen(false)
      setIsNewRequestOpen(false)
    })
  }

  // Handle updating request status
  const handleUpdateStatus = (id: number, newStatus: RequestStatus) => {
    updateStatus(id, newStatus).then(() => {
      setIsViewRequestOpen(false)
    })
  }

  // Handle submitting rating and remarks
  const handleSubmitRating = (rating: number, remarks: string) => {
    if (!selectedRequest) return
    submitRating(selectedRequest.id, rating, remarks).then(() => {
      setIsRatingOpen(false)
      setIsViewRequestOpen(false)
    })
  }

  // View request details
  const handleViewRequest = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setIsViewRequestOpen(true)
  }

  // Open rating dialog
  const handleOpenRating = () => {
    setIsViewRequestOpen(false)
    setIsRatingOpen(true)
  }

  // Check if any filters are active
  const hasActiveFilters = priorityFilter !== "" || ratingFilter !== ""

  // Determine if user is principal or secretary
  const isPrivilegedUser = canDoAction(["principal", "secretary"])
  
  // Filter requests based on user role
  const userFilteredRequests = isPrivilegedUser 
    ? serviceRequests 
    : serviceRequests.filter(request => 
        request.requestor === user?.username || 
        request.requestToId === String(user?.employee_id)
      )

  // Calculate counts for each status - now for all users but filtered by role
  const counts = {
    all: userFilteredRequests.length,
    pending: userFilteredRequests.filter((r) => r.status === "Pending").length,
    inProgress: userFilteredRequests.filter((r) => r.status === "In Progress").length,
    completed: userFilteredRequests.filter((r) => r.status === "Completed").length,
    rejected: userFilteredRequests.filter((r) => r.status === "Disapproved").length,
    forApproval: userFilteredRequests.filter((r) => r.status === "For Approval").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Requests</h1>
          <p className="text-muted-foreground">Manage and track service requests</p>
        </div>
        <NewRequestDialog
          isOpen={isNewRequestOpen}
          onOpenChange={setIsNewRequestOpen}
          onSubmit={handleCreateRequest}
          employees={employees}
          requestTypes={requestTypes}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Priority Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Priority</span>
              {priorityFilter && <span className="ml-1 w-2 h-2 bg-primary rounded-full" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setPriorityFilter("Urgent")}>Urgent</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriorityFilter("High")}>High</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriorityFilter("Medium")}>Medium</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriorityFilter("Low")}>Low</DropdownMenuItem>
            {priorityFilter && (
              <DropdownMenuItem onClick={() => setPriorityFilter("")}>Clear Priority</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Rating Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Rating</span>
              {ratingFilter && <span className="ml-1 w-2 h-2 bg-primary rounded-full" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Rating</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setRatingFilter("rated")}>Has Rating</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRatingFilter("unrated")}>Needs Rating</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRatingFilter("hasRemarks")}>Has Remarks</DropdownMenuItem>
            {ratingFilter && <DropdownMenuItem onClick={() => setRatingFilter("")}>Clear Rating</DropdownMenuItem>
}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* More Filters Button (for future expansion) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Additional Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {requestTypes.map((type) => (
              <DropdownMenuItem key={type} onClick={() => setSearchTerm(type)}>
                Type: {type}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {hasActiveFilters && (
              <DropdownMenuItem onClick={clearAllFilters} className="text-primary font-medium">
                Clear All Filters
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Consolidated active filters section */}
      {hasActiveFilters && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {priorityFilter && (
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center">
              Priority: {priorityFilter}
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-1" onClick={() => setPriorityFilter("")}>
                ×
              </Button>
            </span>
          )}

          {ratingFilter && (
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center">
              {ratingFilter === "rated" ? "Has Rating" : ratingFilter === "unrated" ? "Needs Rating" : "Has Remarks"}
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-1" onClick={() => setRatingFilter("")}>
                ×
              </Button>
            </span>
          )}

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-7 text-xs ml-1" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>
      )}

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All Requests <span className="ml-1 text-xs">({counts.all})</span>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending <span className="ml-1 text-xs">({counts.pending})</span>
          </TabsTrigger>
          <TabsTrigger value="inProgress">
            In Progress <span className="ml-1 text-xs">({counts.inProgress})</span>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed <span className="ml-1 text-xs">({counts.completed})</span>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Disapproved <span className="ml-1 text-xs">({counts.rejected})</span>
          </TabsTrigger>
          <TabsTrigger value="forApproval">
            For Approval <span className="ml-1 text-xs">({counts.forApproval})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="text-center">
                  <h3 className="text-lg font-medium">No requests found</h3>
                  <p className="text-muted-foreground mt-1">Try adjusting your search or filters.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRequests.map((request) => (
                <RequestCard key={request.id} request={request} onViewRequest={handleViewRequest} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Request Dialog */}
      {selectedRequest && (
        <ViewRequestDialog
          isOpen={isViewRequestOpen}
          onOpenChange={setIsViewRequestOpen}
          request={selectedRequest}
          onUpdateStatus={handleUpdateStatus}
          onOpenRating={handleOpenRating}
        />
      )}

      {/* Rating Dialog */}
      {selectedRequest && (
        <RatingDialog isOpen={isRatingOpen} onOpenChange={setIsRatingOpen} onSubmit={handleSubmitRating} />
      )}
    </div>
  )
}

export default ServiceRequests