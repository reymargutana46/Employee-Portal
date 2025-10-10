import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, FileText, Printer } from "lucide-react"
import type { ClassSchedule } from "@/types/classSchedule"

interface ScheduleDetailViewProps {
  schedule: ClassSchedule
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScheduleDetailView({ schedule, open, onOpenChange }: ScheduleDetailViewProps) {
  const handleDownload = () => {
    // Create a CSV download with comprehensive schedule data
    const csvContent = [
      `Class Schedule - ${schedule.grade_section}`,
      `School Year: ${schedule.school_year}`,
      `Adviser/Class Teacher: ${schedule.adviser_teacher}`,
      `Total Learners: ${schedule.total_learners} (Male: ${schedule.male_learners}, Female: ${schedule.female_learners})`,
      `Status: ${schedule.status}`,
      `Created: ${new Date(schedule.created_at).toLocaleDateString()}`,
      schedule.approved_at ? `Approved: ${new Date(schedule.approved_at).toLocaleDateString()}` : '',
      schedule.approval_remarks ? `Remarks: ${schedule.approval_remarks}` : '',
      ``,
      `Time,Duration,Monday-Thursday,Friday`,
      ...schedule.schedule_data.map(row => 
        `"${row.time}","${row.mins}","${row.mondayThursday}","${row.friday}"`
      )
    ].filter(Boolean).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `schedule-${schedule.grade_section.replace(/\s+/g, '-')}-${schedule.school_year.replace(/\s+/g, '-')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    const printContent = document.getElementById('schedule-print-content')
    if (printContent) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Class Schedule - ${schedule.grade_section}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  color: #333;
                  line-height: 1.4;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-top: 20px; 
                }
                th, td { 
                  border: 1px solid #ddd; 
                  padding: 12px; 
                  text-align: left; 
                  vertical-align: top;
                }
                th { 
                  background-color: #f8f9fa; 
                  font-weight: bold;
                }
                .header { 
                  text-align: center; 
                  margin-bottom: 30px; 
                  border-bottom: 2px solid #ddd;
                  padding-bottom: 20px;
                }
                .info { 
                  margin-bottom: 20px; 
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
                }
                .info-item {
                  margin-bottom: 10px;
                }
                .info-item strong {
                  display: inline-block;
                  width: 140px;
                }
                .status-approved { color: #059669; font-weight: bold; }
                .status-pending { color: #d97706; font-weight: bold; }
                .status-rejected { color: #dc2626; font-weight: bold; }
                .remarks-box {
                  background-color: #f0f9ff;
                  border: 1px solid #0ea5e9;
                  padding: 12px;
                  border-radius: 4px;
                  margin: 15px 0;
                }
                @media print { 
                  button { display: none; }
                  body { margin: 0; }
                  .no-print { display: none; }
                }
                tr:nth-child(even) { background-color: #f8f9fa; }
                .time-col { width: 12%; }
                .duration-col { width: 12%; }
                .day-col { width: 38%; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
      }
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'status-approved'
      case 'REJECTED': return 'status-rejected'
      default: return 'status-pending'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Class Schedule Details
          </DialogTitle>
        </DialogHeader>

        <div id="schedule-print-content">
          <div className="header">
            <h2 className="text-2xl font-bold">{schedule.grade_section}</h2>
            <p className="text-lg text-gray-600 mt-2">School Year: {schedule.school_year}</p>
          </div>

          <div className="info">
            <div>
              <div className="info-item">
                <strong>Adviser/Class Teacher:</strong> {schedule.adviser_teacher}
              </div>
              <div className="info-item">
                <strong>Total Learners:</strong> {schedule.total_learners}
              </div>
              <div className="info-item">
                <strong>Status:</strong> <span className={getStatusClass(schedule.status)}>{schedule.status}</span>
              </div>
              <div className="info-item">
                <strong>Created by:</strong> {schedule.creator?.fullname || schedule.created_by}
              </div>
            </div>
            <div>
              <div className="info-item">
                <strong>Male Learners:</strong> {schedule.male_learners}
              </div>
              <div className="info-item">
                <strong>Female Learners:</strong> {schedule.female_learners}
              </div>
              <div className="info-item">
                <strong>Created:</strong> {new Date(schedule.created_at).toLocaleDateString()}
              </div>
              {schedule.approved_at && (
                <div className="info-item">
                  <strong>Approved:</strong> {new Date(schedule.approved_at).toLocaleDateString()}
                  {schedule.approved_by && ` by ${schedule.approved_by}`}
                </div>
              )}
            </div>
          </div>

          {schedule.approval_remarks && (
            <div className="remarks-box">
              <strong>Principal's Remarks:</strong> {schedule.approval_remarks}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left font-semibold time-col">Time</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold duration-col">Duration</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold day-col">Monday - Thursday</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold day-col">Friday</th>
                </tr>
              </thead>
              <tbody>
                {schedule.schedule_data.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-3 font-medium">{row.time}</td>
                    <td className="border border-gray-300 p-3">{row.mins}</td>
                    <td className="border border-gray-300 p-3">{row.mondayThursday}</td>
                    <td className="border border-gray-300 p-3">{row.friday}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-sm text-gray-600 border-t pt-4">
            <p><strong>Note:</strong> This schedule has been {schedule.status.toLowerCase()} and is official for the {schedule.school_year} academic year.</p>
            {schedule.status === 'APPROVED' && (
              <p className="mt-2"><em>All assigned teachers and staff have been notified of their assignments.</em></p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 print:hidden no-print">
          {schedule.status === 'APPROVED' && (
            <>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </>
          )}
          {schedule.status !== 'APPROVED' && (
            <p className="text-sm text-muted-foreground py-2">
              Download will be available after Principal approval
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}