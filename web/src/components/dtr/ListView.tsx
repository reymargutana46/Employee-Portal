"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock, Calendar, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DTRActions from "@/components/DTRAction"
import { DTRList } from "@/types/dtr"



interface ListViewProps {
  records: DTRList[]
  isAdmin: boolean
  isSecretary: boolean
  onRefresh: () => void
}

const DTRListView = ({ records, isAdmin, isSecretary, onRefresh }: ListViewProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState<string>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [activeTab, setActiveTab] = useState("all")

  // Sort records
  const sortedRecords = [...records].sort((a, b) => {
    if (sortField === "date") {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    }

    if (sortField === "employee") {
      return sortDirection === "asc" ? a.employee.localeCompare(b.employee) : b.employee.localeCompare(a.employee)
    }

    if (sortField === "status") {
      return sortDirection === "asc" ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status)
    }

    return 0
  })

  // Filter by tab
  const tabFilteredRecords = sortedRecords.filter((record) => {
    if (activeTab === "all") return true
    if (activeTab === "present") return record.status === "Present"
    // if (activeTab === "leave") return record.status === "Leave"
    // if (activeTab === "absent") return record.status === "Absent"
    // if (activeTab === "late") return record.status === "Late"

    return true
  })

  const totalPages = Math.ceil(tabFilteredRecords.length / itemsPerPage)
  const paginatedRecords = tabFilteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMM dd, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Get status badge
  const getStatusBadge = (status: string, type?: string) => {
    if (status === "Present") {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" /> Present
        </Badge>
      )
    } else if (status === "Absent") {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="mr-1 h-3 w-3" /> Absent
        </Badge>
      )
    } else if (status === "Late") {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          <Clock className="mr-1 h-3 w-3" /> Late
        </Badge>
      )
    } else if (status === "Leave" && type) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          <Calendar className="mr-1 h-3 w-3" /> {type}
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
        {status}
      </Badge>
    )
  }

  // Calculate undertime
  const calculateUndertime = (
    amArrival: string,
    amDeparture: string,
    pmArrival: string,
    pmDeparture: string,
    requiredHours = 8,
  ): { hours: number; minutes: number } => {
    const to24HrMinutes = (time: string): number => {
      if (!time || time === "-") return 0

      const [timeStr, modifier] = time.trim().split(" ")
      // eslint-disable-next-line prefer-const
      let [hours, minutes] = timeStr.split(":").map(Number)

      if (modifier === "PM" && hours !== 12) hours += 12
      if (modifier === "AM" && hours === 12) hours = 0

      return hours * 60 + minutes
    }

    // Handle missing times
    if (
      !amArrival ||
      !amDeparture ||
      !pmArrival ||
      !pmDeparture ||
      amArrival === "-" ||
      amDeparture === "-" ||
      pmArrival === "-" ||
      pmDeparture === "-"
    ) {
      return { hours: 0, minutes: 0 }
    }

    // Convert times to minutes
    const amArrivalMinutes = to24HrMinutes(amArrival)
    const amDepartureMinutes = to24HrMinutes(amDeparture)
    const pmArrivalMinutes = to24HrMinutes(pmArrival)
    const pmDepartureMinutes = to24HrMinutes(pmDeparture)

    // Calculate worked minutes in the morning and afternoon
    const morningMinutes = amDepartureMinutes - amArrivalMinutes
    const afternoonMinutes = pmDepartureMinutes - pmArrivalMinutes

    // Ensure no negative minutes
    const totalMinutes = Math.max(0, morningMinutes) + Math.max(0, afternoonMinutes)

    // Expected minutes based on required hours
    const expectedMinutes = requiredHours * 60

    // Calculate undertime in minutes
    const undertimeMinutes = Math.max(0, expectedMinutes - totalMinutes)

    // Return undertime in hours and minutes
    return {
      hours: Math.floor(undertimeMinutes / 60),
      minutes: undertimeMinutes % 60,
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex space-x-2 mb-2 sm:mb-0">
          <Button variant={activeTab === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("all")}>
            All
          </Button>
          <Button
            variant={activeTab === "present" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("present")}
          >
            Present
          </Button>
          {/* <Button
            variant={activeTab === "leave" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("leave")}
          >
            Leave
          </Button> */}
          <Button
            variant={activeTab === "absent" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("absent")}
          >
            Absent
          </Button>
          <Button variant={activeTab === "late" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("late")}>
            Late
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortField} onValueChange={(value) => handleSort(value)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                {isAdmin && <SelectItem value="employee">Employee</SelectItem>}
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            >
              <ArrowUpDown className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
            </Button>
          </div>
          <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {paginatedRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No records found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedRecords.map((record, index) => {
            const { hours, minutes } = calculateUndertime(
              record.am_arrival,
              record.am_departure,
              record.pm_arrival,
              record.pm_departure,
            )

            return (
              <Card key={index} className={`overflow-hidden ${record.status === "Leave" ? "bg-orange-50" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                      <h3 className="font-medium">{formatDate(record.date)}</h3>
                      {isAdmin && <p className="text-sm text-muted-foreground">{record.employee}</p>}
                    </div>
                    {getStatusBadge(record.status, record.type)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">AM Time</p>
                      <p className="text-sm">
                        {record.am_arrival !== "-" ? (
                          <>
                            {record.am_arrival} - {record.am_departure}
                          </>
                        ) : (
                          "-"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">PM Time</p>
                      <p className="text-sm">
                        {record.pm_arrival !== "-" ? (
                          <>
                            {record.pm_arrival} - {record.pm_departure}
                          </>
                        ) : (
                          "-"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Undertime</p>
                      <p className="text-sm">
                        {hours}:{minutes < 10 ? `0${minutes}` : minutes}
                      </p>
                    </div>

                    {(isSecretary || isAdmin) && <DTRActions record={record} onUpdate={onRefresh} />}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={i}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-9"
                >
                  {pageNum}
                </Button>
              )
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="mx-1">...</span>}
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} className="w-9">
                  {totalPages}
                </Button>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default DTRListView