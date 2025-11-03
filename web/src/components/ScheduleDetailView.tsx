import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, FileText, Printer } from "lucide-react"
import type { ClassSchedule } from "@/types/classSchedule"
import { useState } from "react"

interface ScheduleDetailViewProps {
  schedule: ClassSchedule
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScheduleDetailView({ schedule, open, onOpenChange }: ScheduleDetailViewProps) {
  const [printSize, setPrintSize] = useState<'a4' | 'short' | 'long'>('a4')

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

  const handlePrint = (size: 'a4' | 'short' | 'long' = 'a4') => {
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
                  margin: 0; 
                  padding: 0;
                  color: #333;
                  line-height: 1.1;
                }
                @media print {
                  @page {
                    size: A4;
                    margin: 10mm;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                  }
                }
                .print-container {
                  max-width: 210mm;
                  margin: 0 auto;
                  padding: 10mm;
                  box-sizing: border-box;
                }
                .size-a4 { min-height: 297mm; }
                .size-short { min-height: 148mm; }
                .size-long { min-height: 420mm; }
                .header-container {
                  display: flex;
                  align-items: center;
                  margin-bottom: 6px;
                }
                .logo {
                  max-width: 70px;
                  height: auto;
                  margin-right: 15px;
                }
                .header-text {
                  flex: 1;
                }
                .document-title {
                  font-size: 18px;
                  font-weight: bold;
                  margin: 0 0 4px 0;
                }
                .grade-section {
                  font-size: 16px;
                  font-weight: bold;
                  margin: 0 0 2px 0;
                }
                .school-year {
                  font-size: 13px;
                  margin: 0;
                }
                .divider {
                  border-bottom: 1px solid #ddd;
                  margin: 0 0 10px 0;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 0 0 10px 0;
                  font-size: 11px;
                }
                th, td { 
                  border: 1px solid #ddd; 
                  padding: 3px 5px; 
                  text-align: left; 
                  vertical-align: top;
                }
                th { 
                  background-color: #f8f9fa; 
                  font-weight: bold;
                }
                .info { 
                  margin: 0 0 10px 0; 
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 8px;
                  font-size: 11px;
                }
                .info-item {
                  margin-bottom: 3px;
                }
                .info-item strong {
                  display: inline-block;
                  width: 130px;
                  font-weight: bold;
                }
                .status-approved { color: #059669; font-weight: bold; }
                .status-pending { color: #d97706; font-weight: bold; }
                .status-rejected { color: #dc2626; font-weight: bold; }
                .remarks-box {
                  background-color: #f0f9ff;
                  border: 1px solid #0ea5e9;
                  padding: 5px 7px;
                  border-radius: 3px;
                  margin: 8px 0;
                  font-size: 11px;
                }
                @media print { 
                  button { display: none; }
                  body { margin: 0; }
                  .no-print { display: none; }
                }
                tr:nth-child(even) { background-color: #f8f9fa; }
                .time-col { width: 15%; }
                .duration-col { width: 15%; }
                .day-col { width: 35%; }
                .footer {
                  margin-top: 8px;
                  text-align: center;
                  font-size: 9px;
                  color: #666;
                }
                /* Time column alignment */
                .time-col {
                  font-family: 'Courier New', monospace;
                  white-space: nowrap;
                  font-size: 10px;
                }
                /* Ultra compact layout */
                .ultra-compact {
                  font-size: 0.93em;
                }
                .ultra-compact th, 
                .ultra-compact td {
                  padding: 2px 4px;
                }
                .ultra-compact .info {
                  gap: 6px;
                }
                .ultra-compact .info-item {
                  margin-bottom: 2px;
                }
                .ultra-compact .info-item strong {
                  width: 120px;
                }
              </style>
            </head>
            <body>
              <div class="print-container size-${size} ultra-compact">
                <div class="header-container">
                  <img src="/NCS-Logo.png" alt="School Logo" class="logo" onerror="this.style.display='none'">
                  <div class="header-text">
                    <div class="document-title">CLASS SCHEDULE</div>
                    <div class="grade-section">${schedule.grade_section}</div>
                    <div class="school-year">School Year: ${schedule.school_year}</div>
                  </div>
                </div>
                <div class="divider"></div>
                
                <div class="info">
                  <div>
                    <div class="info-item">
                      <strong>Adviser/Class Teacher:</strong> ${schedule.adviser_teacher}
                    </div>
                    <div class="info-item">
                      <strong>Total Learners:</strong> ${schedule.total_learners}
                    </div>
                    <div class="info-item">
                      <strong>Status:</strong> <span class="${getStatusClass(schedule.status)}">${schedule.status}</span>
                    </div>
                    <div class="info-item">
                      <strong>Created by:</strong> ${schedule.creator?.fullname || schedule.created_by}
                    </div>
                  </div>
                  <div>
                    <div class="info-item">
                      <strong>Male Learners:</strong> ${schedule.male_learners}
                    </div>
                    <div class="info-item">
                      <strong>Female Learners:</strong> ${schedule.female_learners}
                    </div>
                    <div class="info-item">
                      <strong>Created:</strong> ${new Date(schedule.created_at).toLocaleDateString()}
                    </div>
                    ${schedule.approved_at ? `
                    <div class="info-item">
                      <strong>Approved:</strong> ${new Date(schedule.approved_at).toLocaleDateString()}
                    </div>
                    ` : ''}
                  </div>
                </div>
                ${schedule.approval_remarks ? `
                <div class="remarks-box">
                  <strong>Principal's Remarks:</strong> ${schedule.approval_remarks}
                </div>
                ` : ''}
                <div class="overflow-x-auto">
                  <table>
                    <thead>
                      <tr class="bg-gray-50">
                        <th class="time-col">Time</th>
                        <th class="duration-col">Duration</th>
                        <th class="day-col">Monday - Thursday</th>
                        <th class="day-col">Friday</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${schedule.schedule_data.map((row, index) => `
                        <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                          <td class="time-col">${row.time}</td>
                          <td class="duration-col">${row.mins}</td>
                          <td class="day-col">${row.mondayThursday}</td>
                          <td class="day-col">${row.friday}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
                <div class="footer">
                  <p>Generated on ${new Date().toLocaleDateString()}</p>
                  <p>This document is official and has been ${schedule.status.toLowerCase()} by the administration.</p>
                </div>
              </div>
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
              <div className="flex items-center gap-2">
                <span className="text-sm">Size:</span>
                <select 
                  value={printSize} 
                  onChange={(e) => setPrintSize(e.target.value as any)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="short">Short (A4/2)</option>
                  <option value="a4">A4</option>
                  <option value="long">Long (A4×2)</option>
                </select>
              </div>
              <Button variant="outline" onClick={() => handlePrint(printSize)}>
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