import { create } from "zustand"
import type { FacultyWorkload, Room, StaffWorkload, Workload } from "@/types/workload"
import axios from "@/utils/axiosInstance"
import type { Res, WorkloadResponse } from "@/types/response"

interface WorkloadState {
  facultyWorkloads: Workload[]
  staffWorkloads: Workload[]
  unassignedWorkloads: Workload[]
  rooms: Room[]
  isLoading: boolean
  error: string | null

  // Fetch data
  fetchWorkloads: () => Promise<void>
  fetchRooms: () => Promise<void>

  // Create a new unassigned workload
  createWorkload: (workload: Partial<Workload>) => Promise<Workload | null>

  // Assign workloads
  assignFacultyWorkload: (workloadId: string, details: Partial<Workload>) => Promise<Workload | null>
  assignStaffWorkload: (workloadId: string, details: Partial<Workload>) => Promise<Workload | null>

  // Update and delete
  updateWorkload: (id: string, workload: Partial<Workload>) => Promise<void>
  updateStaffWorkload: (id: string, workload: Partial<StaffWorkload>) => Promise<void>
  updateFacultyWorkload: (id: string, workload: Partial<FacultyWorkload>) => Promise<void>
  deleteWorkload: (id: string) => Promise<void>

  // Helper methods
  getWorkloadById: (id: string) => Workload | undefined
  clearErrors: () => void
}

export const useWorkloadStore = create<WorkloadState>((set, get) => ({
  facultyWorkloads: [],
  staffWorkloads: [],
  unassignedWorkloads: [],
  rooms: [],
  isLoading: false,
  error: null,

  fetchWorkloads: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get<Res<WorkloadResponse>>("/workload")
      set({
        facultyWorkloads: response.data.data.facultyWorkload || [],
        staffWorkloads: response.data.data.staffWorkload || [],
        unassignedWorkloads: response.data.data.unassignedWorkload || [],
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch workloads",
        isLoading: false,
      })
    }
  },

  fetchRooms: async () => {
    try {
      const response = await axios.get<Res<Room[]>>("/set-up/rooms")
      set({
        rooms: response.data.data || [],
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch rooms",
      })
    }
  },

  createWorkload: async (workload: Partial<Workload>) => {
    set({ isLoading: true, error: null })
    try {
      // Create a new workload (unassigned)
      const response = await axios.post<Res<Workload>>("/workload", workload)
      const newWorkload = response.data.data

      // Add to unassigned workloads
      set((state) => ({
        unassignedWorkloads: [...state.unassignedWorkloads, newWorkload],
        isLoading: false,
      }))

      return newWorkload
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create workload",
        isLoading: false,
      })
      return null
    }
  },

  assignFacultyWorkload: async (workloadId: string, details: Partial<Workload>) => {
    set({ isLoading: true, error: null })
    try {
      // Get the base workload
      const baseWorkload = get().getWorkloadById(workloadId)
      if (!baseWorkload) {
        throw new Error("Workload not found")
      }

      // Assign faculty workload with details
      const response = await axios.post<Res<Workload>>("/workload/faculty/assign", {
        workload_id: workloadId,
        ...details,
      })

      const assignedWorkload = response.data.data

      // Update state: remove from unassigned, add to faculty
      set((state) => ({
        unassignedWorkloads: state.unassignedWorkloads.filter((w) => w.id !== workloadId),
        facultyWorkloads: [...state.facultyWorkloads, assignedWorkload],
        isLoading: false,
      }))

      return assignedWorkload
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to assign faculty workload",
        isLoading: false,
      })
      return null
    }
  },

  assignStaffWorkload: async (workloadId: string, details: Partial<Workload>) => {
    set({ isLoading: true, error: null })
    try {
      // Get the base workload
      const baseWorkload = get().getWorkloadById(workloadId)
      if (!baseWorkload) {
        throw new Error("Workload not found")
      }

      // Assign staff workload with details
      const response = await axios.post<Res<Workload>>("/workload/staff/assign", {
        workload_id: workloadId,
        ...details,
      })

      const assignedWorkload = response.data.data

      // Update state: remove from unassigned, add to staff
      set((state) => ({
        unassignedWorkloads: state.unassignedWorkloads.filter((w) => w.id !== workloadId),
        staffWorkloads: [...state.staffWorkloads, assignedWorkload],
        isLoading: false,
      }))

      return assignedWorkload
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to assign staff workload",
        isLoading: false,
      })
      return null
    }
  },

  updateWorkload: async (id: string, updatedWorkload: Partial<Workload>) => {
    set({ isLoading: true, error: null })
    try {
      // Update workload on the server
      const response = await axios.put<Res<Workload>>(`/workload/${id}`, updatedWorkload)
      const updated = response.data.data

      // Update in the appropriate array
      set((state) => {
        // Check if it's in unassigned workloads
        if (state.unassignedWorkloads.some((w) => w.id === id)) {
          return {
            unassignedWorkloads: state.unassignedWorkloads.map((w) => (w.id === id ? { ...w, ...updated } : w)),
            isLoading: false,
          }
        }

        // Check if it's in faculty workloads
        if (state.facultyWorkloads.some((w) => w.id === id)) {
          return {
            facultyWorkloads: state.facultyWorkloads.map((w) => (w.id === id ? { ...w, ...updated } : w)),
            isLoading: false,
          }
        }

        // Check if it's in staff workloads
        if (state.staffWorkloads.some((w) => w.id === id)) {
          return {
            staffWorkloads: state.staffWorkloads.map((w) => (w.id === id ? { ...w, ...updated } : w)),
            isLoading: false,
          }
        }

        return { isLoading: false }
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update workload",
        isLoading: false,
      })
    }
  },
  updateStaffWorkload: async (id: string, updatedWorkload: Partial<StaffWorkload>) => {
    try {
      const response = await axios.put<Res<StaffWorkload>>(`/workload/${id}/staff`, updatedWorkload)
      const updated = response.data.data
      // Update in the appropriate array
      set((state) => ({
        staffWorkloads: state.staffWorkloads.map((w) =>
          w.staff_w_l?.id === id ? { ...w, staff_w_l: { ...w.staff_w_l, ...updated } } : w
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update staff workload",
      })
    }
  },
  updateFacultyWorkload: async (id: string, updatedWorkload: Partial<FacultyWorkload>) => {
    set({ isLoading: true, error: null })
    try {
      // Update workload on the server
      const response = await axios.put<Res<FacultyWorkload>>(`/workload/${id}/faculty`, updatedWorkload)
      const updated = response.data.data

      // Update in the appropriate array
      set((state) => ({
        staffWorkloads: state.staffWorkloads.map((w) =>
          w.faculty_w_l?.id === id ? { ...w, faculty_w_l: { ...w.faculty_w_l, ...updated } } : w
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update workload",
        isLoading: false,
      })
    }
  },

  deleteWorkload: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      // Delete workload on the server
      await axios.delete<Res<void>>(`/workload/${id}`)

      // Remove from all arrays
      set((state) => ({
        unassignedWorkloads: state.unassignedWorkloads.filter((w) => w.id !== id),
        facultyWorkloads: state.facultyWorkloads.filter((w) => w.id !== id),
        staffWorkloads: state.staffWorkloads.filter((w) => w.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete workload",
        isLoading: false,
      })
    }
  },

  // Helper method to find a workload by ID across all arrays
  getWorkloadById: (id: string) => {
    const { unassignedWorkloads, facultyWorkloads, staffWorkloads } = get()

    return (
      unassignedWorkloads.find((w) => w.id === id) ||
      facultyWorkloads.find((w) => w.id === id) ||
      staffWorkloads.find((w) => w.id === id)
    )
  },

  clearErrors: () => {
    set({ error: null })
  },
}))
