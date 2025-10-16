import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useClassScheduleStore } from "@/store/useClassScheduleStore"
import type { ScheduleRow } from "@/types/classSchedule"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Grade and section options
const GRADE_SECTION_OPTIONS = [
  "KINDER - GENEROUS AM",
  "KINDER - GENEROUS PM",
  "KINDER - GOOD AM",
  "KINDER - GOOD PM",
  "KINDER - GREAT AM",
  "KINDER - GREAT PM",
  "KINDER - SPED-KINDERGARTEN (DHH) SPED",
  "GRADE 1 - ADMIRABLE",
  "GRADE 1 - ADORABLE",
  "GRADE 1 - AFFECTIONATE",
  "GRADE 1 - ALERT",
  "GRADE 1 - AMAZING",
  "GRADE 1 - SPED (GRADED) SPED",
  "GRADE 2 - BELOVED",
  "GRADE 2 - BENEFICENT",
  "GRADE 2 - BENEVOLENT",
  "GRADE 2 - BLESSED",
  "GRADE 2 - BLESSFUL",
  "GRADE 2 - BLOSSOM",
  "GRADE 2 - SPED-GRADE 2 (DHH) SPED",
  "GRADE 3 - CALM",
  "GRADE 3 - CANDOR",
  "GRADE 3 - CHARITABLE",
  "GRADE 3 - CHEERFUL",
  "GRADE 3 - CLEVER",
  "GRADE 3 - CURIOUS",
  "GRADE 4 - DAINTY",
  "GRADE 4 - DEDICATED",
  "GRADE 4 - DEMURE",
  "GRADE 4 - DEVOTED",
  "GRADE 4 - DYNAMIC",
  "GRADE 4 - SPED (GRADED) SPED",
  "GRADE 5 - EFFECTIVE",
  "GRADE 5 - EFFICIENT",
  "GRADE 5 - ENDURANCE",
  "GRADE 5 - ENERGETIC",
  "GRADE 5 - EVERLASTING",
  "GRADE 6 - FAIR",
  "GRADE 6 - FAITHFUL",
  "GRADE 6 - FLEXIBLE",
  "GRADE 6 - FORBEARANCE",
  "GRADE 6 - FORTITUDE",
  "GRADE 6 - FRIENDLY",
  "NON-GRADED - GRACIOUS SPED",
  "NON-GRADED - GRATEFUL SPED"
]

export function ScheduleCreator() {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { createSchedule, fetchMyCreatedSchedules } = useClassScheduleStore()

  // Form state
  const [formData, setFormData] = useState({
    gradeSection: "",
    schoolYear: "2025 - 2026",
    adviserTeacher: "",
    maleLearners: "",
    femaleLearners: "",
    totalLearners: "",
  })

  // Schedule table state - simplified structure
  const [scheduleRows, setScheduleRows] = useState([
    // Morning session
    { time: "7:00 – 7:15", mins: "15", mondayThursday: "Flag Ceremony", friday: "Flag Ceremony" },
    { time: "7:15 – 8:05", mins: "50", mondayThursday: "", friday: "" },
    { time: "8:05 – 8:55", mins: "50", mondayThursday: "", friday: "" },
    { time: "8:55 – 9:15", mins: "20", mondayThursday: "Recess", friday: "Recess" },
    { time: "9:15 – 10:05", mins: "50", mondayThursday: "", friday: "" },
    { time: "10:05 – 10:55", mins: "50", mondayThursday: "", friday: "" },
    { time: "10:55 – 11:45", mins: "50", mondayThursday: "", friday: "" },
    { time: "11:45 – 12:35", mins: "50", mondayThursday: "", friday: "" },
    // Lunch break row (special handling)
    { time: "12:35 – 1:35", mins: "60", mondayThursday: "LUNCH BREAK", friday: "LUNCH BREAK" },
    // Afternoon session
    { time: "1:35 – 2:25", mins: "50", mondayThursday: "", friday: "" },
    { time: "2:25 – 3:15", mins: "50", mondayThursday: "", friday: "" },
    { time: "3:15 – 4:05", mins: "50", mondayThursday: "", friday: "" },
    // Flag lowering
    { time: "4:05 – 4:25", mins: "20", mondayThursday: "FLAG LOWERING", friday: "FLAG LOWERING" },
  ])

  const handleInputChange = (field: string, value: string | number) => {
    // Update the specific field first
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [field]: value
      }
      
      // Auto-calculate total learners when male or female learners change
      if (field === 'maleLearners' || field === 'femaleLearners') {
        // Calculate total
        const male = updatedData.maleLearners === "" ? 0 : parseInt(updatedData.maleLearners) || 0
        const female = updatedData.femaleLearners === "" ? 0 : parseInt(updatedData.femaleLearners) || 0
        const total = male + female
        
        // Update the total
        return {
          ...updatedData,
          totalLearners: total.toString()
        }
      }
      
      return updatedData
    })
  }

  const handleScheduleChange = (index: number, field: string, value: string) => {
    setScheduleRows(prev => 
      prev.map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    )
  }

  const handleSave = async () => {
    // Validate required fields
    if (!formData.gradeSection.trim()) {
      toast({
        title: "Validation Error",
        description: "Grade & Section is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.adviserTeacher.trim()) {
      toast({
        title: "Validation Error", 
        description: "Adviser / Class Teacher is required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        grade_section: formData.gradeSection,
        school_year: formData.schoolYear,
        adviser_teacher: formData.adviserTeacher,
        male_learners: formData.maleLearners ? parseInt(formData.maleLearners) : 0,
        female_learners: formData.femaleLearners ? parseInt(formData.femaleLearners) : 0,
        total_learners: formData.totalLearners ? parseInt(formData.totalLearners) : 0,
        schedule_data: scheduleRows,
      }

      const result = await createSchedule(payload)
      
      if (result) {
        toast({
          title: "Success",
          description: "Class schedule created successfully and sent to Principal for approval",
          variant: "default",
        })

        // Reset form and close dialog
        setFormData({
          gradeSection: "",
          schoolYear: "2025 - 2026",
          adviserTeacher: "",
          maleLearners: "",
          femaleLearners: "",
          totalLearners: "",
        })
        setOpen(false)
        
        // Refresh the created schedules list
        await fetchMyCreatedSchedules()
      } else {
        toast({
          title: "Error",
          description: "Failed to create schedule",
          variant: "destructive",
        })
      }
      
    } catch (error: any) {
      console.error('Error creating schedule:', error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create schedule",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          + Create Schedule
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold">
            CLASS PROGRAM
          </DialogTitle>
        </DialogHeader>

        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
          <div>
            <Label>Grade & Section</Label>
            <Select 
              value={formData.gradeSection} 
              onValueChange={(value) => handleInputChange('gradeSection', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Grade & Section" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_SECTION_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>School Year</Label>
            <Input 
              placeholder="2025 - 2026" 
              value={formData.schoolYear}
              onChange={(e) => handleInputChange('schoolYear', e.target.value)}
            />
          </div>
          <div>
            <Label>Adviser / Class Teacher</Label>
            <Input 
              placeholder="e.g. Susan D. Gapatan" 
              value={formData.adviserTeacher}
              onChange={(e) => handleInputChange('adviserTeacher', e.target.value)}
            />
          </div>

          {/* Learners with labels */}
          <div>
            <Label>No. of Learners</Label>
            <div className="flex gap-4 mt-1">
              <div>
                <Label className="text-xs">Male</Label>
                <Input 
                  className="w-[80px] text-center" 
                  type="number"
                  value={formData.maleLearners}
                  onChange={(e) => handleInputChange('maleLearners', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs">Female</Label>
                <Input 
                  className="w-[80px] text-center" 
                  type="number"
                  value={formData.femaleLearners}
                  onChange={(e) => handleInputChange('femaleLearners', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs">Total</Label>
                <Input 
                  className="w-[80px] text-center" 
                  type="number"
                  value={formData.totalLearners}
                  readOnly
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full border-collapse text-sm text-center table-fixed">
            <colgroup>
              <col className="w-[110px]" /> {/* Time */}
              <col className="w-[60px]" />  {/* Mins */}
              <col className="w-[220px]" /> {/* Mon–Thu */}
              <col className="w-[220px]" /> {/* Friday */}
            </colgroup>

            <thead>
              <tr className="bg-gray-100">
                <th rowSpan={2} className="border px-2 py-1">Time</th>
                <th rowSpan={2} className="border px-2 py-1">Mins</th>
                <th colSpan={2} className="border px-2 py-1">Learning Areas</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border px-2 py-1">Monday–Thursday</th>
                <th className="border px-2 py-1">Friday</th>
              </tr>
            </thead>

            <tbody>
              {/* Morning Session (largo row) */}
              <tr className="bg-gray-50">
                <td colSpan={4} className="border px-2 py-1 font-semibold text-left">
                  MORNING SESSION
                </td>
              </tr>

              {/* Dynamic Schedule Rows */}
              {scheduleRows.slice(0, 8).map((row, index) => (
                <tr key={index}>
                  <td className="border px-2 py-1">
                    <Input 
                      className="text-center" 
                      value={row.time}
                      onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <Input 
                      className="text-center" 
                      value={row.mins}
                      onChange={(e) => handleScheduleChange(index, 'mins', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <Input 
                      className="text-center" 
                      value={row.mondayThursday}
                      onChange={(e) => handleScheduleChange(index, 'mondayThursday', e.target.value)}
                      placeholder="Subject"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <Input 
                      className="text-center" 
                      value={row.friday}
                      onChange={(e) => handleScheduleChange(index, 'friday', e.target.value)}
                      placeholder="Subject"
                    />
                  </td>
                </tr>
              ))}

              {/* Noon Break Row */}
              <tr className="bg-gray-100">
                <td className="border px-2 py-1">
                  <Input 
                    className="text-center" 
                    value={scheduleRows[8]?.time || "12:35 – 1:35"}
                    onChange={(e) => handleScheduleChange(8, 'time', e.target.value)}
                  />
                </td>
                <td className="border px-2 py-1">
                  <Input 
                    className="text-center" 
                    value={scheduleRows[8]?.mins || "60"}
                    onChange={(e) => handleScheduleChange(8, 'mins', e.target.value)}
                  />
                </td>
                <td colSpan={2} className="border px-2 py-1">
                  <Input
                    className="text-center font-semibold"
                    value={scheduleRows[8]?.mondayThursday || "LUNCH BREAK"}
                    onChange={(e) => handleScheduleChange(8, 'mondayThursday', e.target.value)}
                  />
                </td>
              </tr>

              {/* Afternoon Session (largo row) */}
              <tr className="bg-gray-50">
                <td colSpan={4} className="border px-2 py-1 font-semibold text-left">
                  AFTERNOON SESSION
                </td>
              </tr>

              {/* Afternoon Schedule Rows */}
              {scheduleRows.slice(9, 12).map((row, index) => (
                <tr key={index + 9}>
                  <td className="border px-2 py-1">
                    <Input 
                      className="text-center" 
                      value={row.time}
                      onChange={(e) => handleScheduleChange(index + 9, 'time', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <Input 
                      className="text-center" 
                      value={row.mins}
                      onChange={(e) => handleScheduleChange(index + 9, 'mins', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <Input 
                      className="text-center" 
                      value={row.mondayThursday}
                      onChange={(e) => handleScheduleChange(index + 9, 'mondayThursday', e.target.value)}
                      placeholder="Subject"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <Input 
                      className="text-center" 
                      value={row.friday}
                      onChange={(e) => handleScheduleChange(index + 9, 'friday', e.target.value)}
                      placeholder="Subject"
                    />
                  </td>
                </tr>
              ))}

              {/* Flag Lowering */}
              <tr>
                <td className="border px-2 py-1">
                  <Input 
                    className="text-center" 
                    value={scheduleRows[12]?.time || "4:05 – 4:25"}
                    onChange={(e) => handleScheduleChange(12, 'time', e.target.value)}
                  />
                </td>
                <td className="border px-2 py-1">
                  <Input 
                    className="text-center" 
                    value={scheduleRows[12]?.mins || "20"}
                    onChange={(e) => handleScheduleChange(12, 'mins', e.target.value)}
                  />
                </td>
                <td colSpan={2} className="border px-2 py-1">
                  <Input
                    className="text-center font-semibold"
                    value={scheduleRows[12]?.mondayThursday || "FLAG LOWERING"}
                    onChange={(e) => handleScheduleChange(12, 'mondayThursday', e.target.value)}
                  />
                </td>
              </tr>

              {/* Total Minutes */}
              <tr className="bg-gray-100">
                <td className="border px-2 py-1 font-medium text-right">
                  TOTAL MINUTES
                </td>
                <td className="border px-2 py-1 text-center">
                  <Input className="text-center" placeholder="—" />
                </td>
                <td colSpan={2} className="border px-2 py-1"></td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Schedule"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}