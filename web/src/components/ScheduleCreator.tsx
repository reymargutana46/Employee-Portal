import React, { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { useClassProgramStore } from "@/store/useClassProgramStore"
import type { ScheduleTimeSlot, ClassProgramFormData } from "@/types/classProgram"

export function ScheduleCreator() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { createClassProgram, isLoading } = useClassProgramStore()

  // Form state
  const [formData, setFormData] = useState<ClassProgramFormData>({
    grade_section: "",
    school_year: "2025 - 2026",
    adviser_teacher: "",
    male_learners: 0,
    female_learners: 0,
    schedule_data: [
      // Morning Session
      { time: "7:00 – 7:15", minutes: "15", mondayThursday: "Flag Raising", friday: "Flag Raising" },
      { time: "7:15 – 8:05", minutes: "50", mondayThursday: "", friday: "" },
      { time: "8:05 – 8:55", minutes: "50", mondayThursday: "", friday: "" },
      { time: "8:55 – 9:45", minutes: "50", mondayThursday: "", friday: "" },
      { time: "9:45 – 10:00", minutes: "15", mondayThursday: "Recess", friday: "Recess" },
      { time: "10:00 – 10:50", minutes: "50", mondayThursday: "", friday: "" },
      { time: "10:50 – 11:40", minutes: "50", mondayThursday: "", friday: "" },
      { time: "11:40 – 12:30", minutes: "50", mondayThursday: "", friday: "" },
      // Noon Break
      { time: "12:30 – 1:30", minutes: "60", mondayThursday: "NOON BREAK", friday: "NOON BREAK" },
      // Afternoon Session
      { time: "1:30 – 2:20", minutes: "50", mondayThursday: "", friday: "" },
      { time: "2:20 – 3:10", minutes: "50", mondayThursday: "", friday: "" },
      { time: "3:10 – 4:00", minutes: "50", mondayThursday: "", friday: "" },
      { time: "4:00 – 4:50", minutes: "50", mondayThursday: "", friday: "" },
      { time: "4:50 – 5:00", minutes: "10", mondayThursday: "FLAG LOWERING", friday: "FLAG LOWERING" },
    ],
  })

  // Auto-calculate total learners
  useEffect(() => {
    const total = formData.male_learners + formData.female_learners
    if (total !== formData.male_learners + formData.female_learners) {
      setFormData(prev => ({ ...prev, total_learners: total }))
    }
  }, [formData.male_learners, formData.female_learners])

  const handleInputChange = (field: keyof ClassProgramFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleScheduleChange = (index: number, field: keyof ScheduleTimeSlot, value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule_data: prev.schedule_data.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleSave = async () => {
    // Validation
    if (!formData.grade_section.trim()) {
      toast({ title: "Validation Error", description: "Grade & Section is required", variant: "destructive" })
      return
    }
    if (!formData.adviser_teacher.trim()) {
      toast({ title: "Validation Error", description: "Adviser/Teacher is required", variant: "destructive" })
      return
    }

    try {
      const result = await createClassProgram(formData)
      if (result) {
        toast({ title: "Success", description: "Class program created successfully!" })
        setOpen(false)
        // Reset form
        setFormData({
          grade_section: "",
          school_year: "2025 - 2026",
          adviser_teacher: "",
          male_learners: 0,
          female_learners: 0,
          schedule_data: formData.schedule_data.map(item => ({
            ...item,
            mondayThursday: item.mondayThursday.includes("BREAK") || item.mondayThursday.includes("FLAG") || item.mondayThursday.includes("Recess") ? item.mondayThursday : "",
            friday: item.friday.includes("BREAK") || item.friday.includes("FLAG") || item.friday.includes("Recess") ? item.friday : ""
          }))
        })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save class program", variant: "destructive" })
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
            <Input 
              placeholder="e.g. Grade 2 - Beloved" 
              value={formData.grade_section}
              onChange={(e) => handleInputChange('grade_section', e.target.value)}
            />
          </div>
          <div>
            <Label>School Year</Label>
            <Input 
              placeholder="2025 - 2026" 
              value={formData.school_year}
              onChange={(e) => handleInputChange('school_year', e.target.value)}
            />
          </div>
          <div>
            <Label>Adviser / Class Teacher</Label>
            <Input 
              placeholder="e.g. Susan D. Gapatan" 
              value={formData.adviser_teacher}
              onChange={(e) => handleInputChange('adviser_teacher', e.target.value)}
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
                  min="0"
                  value={formData.male_learners}
                  onChange={(e) => handleInputChange('male_learners', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="text-xs">Female</Label>
                <Input 
                  className="w-[80px] text-center" 
                  type="number"
                  min="0"
                  value={formData.female_learners}
                  onChange={(e) => handleInputChange('female_learners', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="text-xs">Total</Label>
                <Input 
                  className="w-[80px] text-center" 
                  value={formData.male_learners + formData.female_learners}
                  readOnly
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
              {/* Morning Session (header row) */}
              <tr className="bg-gray-50">
                <td colSpan={4} className="border px-2 py-1 font-semibold text-left">
                  MORNING SESSION
                </td>
              </tr>

              {/* Dynamic Schedule Rows */}
              {formData.schedule_data.map((slot, index) => {
                // Special handling for noon break
                if (slot.mondayThursday === "NOON BREAK" && slot.friday === "NOON BREAK") {
                  return (
                    <tr key={index} className="bg-gray-100">
                      <td className="border px-2 py-1">
                        <Input 
                          className="text-center" 
                          value={slot.time}
                          onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <Input 
                          className="text-center" 
                          value={slot.minutes}
                          onChange={(e) => handleScheduleChange(index, 'minutes', e.target.value)}
                        />
                      </td>
                      <td colSpan={2} className="border px-2 py-1">
                        <Input
                          className="text-center font-semibold"
                          value={slot.mondayThursday}
                          onChange={(e) => handleScheduleChange(index, 'mondayThursday', e.target.value)}
                        />
                      </td>
                    </tr>
                  )
                }
                
                // Special handling for other combined activities (Flag Raising, Recess, Flag Lowering)
                if ((slot.mondayThursday === "FLAG LOWERING" && slot.friday === "FLAG LOWERING") ||
                    (slot.mondayThursday === "Flag Raising" && slot.friday === "Flag Raising") ||
                    (slot.mondayThursday === "Recess" && slot.friday === "Recess")) {
                  return (
                    <tr key={index}>
                      <td className="border px-2 py-1">
                        <Input 
                          className="text-center" 
                          value={slot.time}
                          onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <Input 
                          className="text-center" 
                          value={slot.minutes}
                          onChange={(e) => handleScheduleChange(index, 'minutes', e.target.value)}
                        />
                      </td>
                      <td colSpan={2} className="border px-2 py-1">
                        <Input
                          className="text-center font-semibold"
                          value={slot.mondayThursday}
                          onChange={(e) => {
                            handleScheduleChange(index, 'mondayThursday', e.target.value)
                            handleScheduleChange(index, 'friday', e.target.value)
                          }}
                        />
                      </td>
                    </tr>
                  )
                }

                // Add afternoon session header dynamically
                if (index === 8) { // After noon break, before afternoon slots
                  return (
                    <React.Fragment key={index}>
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="border px-2 py-1 font-semibold text-left">
                          AFTERNOON SESSION
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">
                          <Input 
                            className="text-center" 
                            value={slot.time}
                            onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <Input 
                            className="text-center" 
                            value={slot.minutes}
                            onChange={(e) => handleScheduleChange(index, 'minutes', e.target.value)}
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <Input 
                            className="text-center" 
                            placeholder="Subject"
                            value={slot.mondayThursday}
                            onChange={(e) => handleScheduleChange(index, 'mondayThursday', e.target.value)}
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <Input 
                            className="text-center" 
                            placeholder="Subject"
                            value={slot.friday}
                            onChange={(e) => handleScheduleChange(index, 'friday', e.target.value)}
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  )
                }

                // Regular subject rows
                return (
                  <tr key={index}>
                    <td className="border px-2 py-1">
                      <Input 
                        className="text-center" 
                        value={slot.time}
                        onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <Input 
                        className="text-center" 
                        value={slot.minutes}
                        onChange={(e) => handleScheduleChange(index, 'minutes', e.target.value)}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <Input 
                        className="text-center" 
                        placeholder="Subject"
                        value={slot.mondayThursday}
                        onChange={(e) => handleScheduleChange(index, 'mondayThursday', e.target.value)}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <Input 
                        className="text-center" 
                        placeholder="Subject"
                        value={slot.friday}
                        onChange={(e) => handleScheduleChange(index, 'friday', e.target.value)}
                      />
                    </td>
                  </tr>
                )
              })}

              {/* Total Minutes Row */}
              <tr className="bg-gray-100">
                <td className="border px-2 py-1 font-medium text-right">
                  TOTAL MINUTES
                </td>
                <td className="border px-2 py-1 text-center">
                  <Input 
                    className="text-center" 
                    value={formData.schedule_data.reduce((total, slot) => {
                      const mins = parseInt(slot.minutes) || 0
                      return total + mins
                    }, 0)}
                    readOnly
                  />
                </td>
                <td colSpan={2} className="border px-2 py-1"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Schedule"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
