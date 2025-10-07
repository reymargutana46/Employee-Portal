import { create } from "zustand"
import type { ClassSchedule, CreateClassScheduleRequest, ApproveScheduleRequest } from "@/types/classSchedule"
import axios from "@/utils/axiosInstance"
import type { Res } from "@/types/response"

interface ClassScheduleState {
  schedules: ClassSchedule[]
  myCreatedSchedules: ClassSchedule[]
  isLoading: boolean
  error: string | null

  // Fetch data
  fetchSchedules: () => Promise<void>
  fetchMyCreatedSchedules: () => Promise<void>

  // Create and update
  createSchedule: (schedule: CreateClassScheduleRequest) => Promise<ClassSchedule | null>
  updateSchedule: (id: number, schedule: CreateClassScheduleRequest) => Promise<ClassSchedule | null>

  // Approval actions
  approveSchedule: (id: number, request: ApproveScheduleRequest) => Promise<ClassSchedule | null>
  rejectSchedule: (id: number, request: ApproveScheduleRequest) => Promise<ClassSchedule | null>

  // Delete
  deleteSchedule: (id: number) => Promise<void>

  // Helper methods
  getScheduleById: (id: number) => ClassSchedule | undefined
  clearErrors: () => void
}

export const useClassScheduleStore = create<ClassScheduleState>((set, get) => ({
  schedules: [],
  myCreatedSchedules: [],
  isLoading: false,
  error: null,

  fetchSchedules: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get<Res<ClassSchedule[]>>("/class-schedules")
      set({
        schedules: response.data.data || [],
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch schedules",
        isLoading: false,
      })
    }
  },

  fetchMyCreatedSchedules: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get<Res<ClassSchedule[]>>("/class-schedules/my-created")
      set({
        myCreatedSchedules: response.data.data || [],
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch my created schedules",
        isLoading: false,
      })
    }
  },

  createSchedule: async (schedule: CreateClassScheduleRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post<Res<ClassSchedule>>("/class-schedules", schedule)
      const newSchedule = response.data.data

      // Add to both arrays
      set((state) => ({
        schedules: [...state.schedules, newSchedule],
        myCreatedSchedules: [...state.myCreatedSchedules, newSchedule],
        isLoading: false,
      }))

      return newSchedule
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create schedule",
        isLoading: false,
      })
      return null
    }
  },

  updateSchedule: async (id: number, schedule: CreateClassScheduleRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.put<Res<ClassSchedule>>(`/class-schedules/${id}`, schedule)
      const updatedSchedule = response.data.data

      // Update in both arrays
      set((state) => ({
        schedules: state.schedules.map((s) => (s.id === id ? updatedSchedule : s)),
        myCreatedSchedules: state.myCreatedSchedules.map((s) => (s.id === id ? updatedSchedule : s)),
        isLoading: false,
      }))

      return updatedSchedule
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update schedule",
        isLoading: false,
      })
      return null
    }
  },

  approveSchedule: async (id: number, request: ApproveScheduleRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post<Res<ClassSchedule>>(`/class-schedules/${id}/approve`, request)
      const approvedSchedule = response.data.data

      // Update in schedules array
      set((state) => ({
        schedules: state.schedules.map((s) => (s.id === id ? approvedSchedule : s)),
        isLoading: false,
      }))

      return approvedSchedule
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to approve schedule",
        isLoading: false,
      })
      return null
    }
  },

  rejectSchedule: async (id: number, request: ApproveScheduleRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post<Res<ClassSchedule>>(`/class-schedules/${id}/reject`, request)
      const rejectedSchedule = response.data.data

      // Update in schedules array
      set((state) => ({
        schedules: state.schedules.map((s) => (s.id === id ? rejectedSchedule : s)),
        isLoading: false,
      }))

      return rejectedSchedule
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to reject schedule",
        isLoading: false,
      })
      return null
    }
  },

  deleteSchedule: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      await axios.delete<Res<void>>(`/class-schedules/${id}`)

      // Remove from both arrays
      set((state) => ({
        schedules: state.schedules.filter((s) => s.id !== id),
        myCreatedSchedules: state.myCreatedSchedules.filter((s) => s.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete schedule",
        isLoading: false,
      })
    }
  },

  // Helper method to find a schedule by ID
  getScheduleById: (id: number) => {
    const { schedules } = get()
    return schedules.find((s) => s.id === id)
  },

  clearErrors: () => {
    set({ error: null })
  },
}))