import { create } from "zustand"
import { add, format } from "date-fns"
import axios from "../utils/axiosInstance"
import { Res } from "@/types/response"
export type LogAction = "created" | "updated" | "deleted" | "approved" | "assign" | "completed"

export interface SystemLog {
  id: number
  performed_by: string
  action: LogAction
  description: string
  entity_type: string
  entity_id: string
  created_at?: string // Adding this for timestamp display, though not in fillable
}

interface SystemLogsState {
  logs: SystemLog[]
  searchTerm: string
  filterAction: LogAction | null

  // Actions
  fetchLogs: () => void
  setSearchTerm: (term: string) => void
  setFilterAction: (action: LogAction | null) => void
  addLog: (log: Omit<SystemLog, "id" | "created_at">) => void
  exportLogs: () => void

  // Computed
  getFilteredLogs: () => SystemLog[]
}

// Mock logs data

export const useSystemLogsStore = create<SystemLogsState>((set, get) => ({
  logs: [],
  searchTerm: "",
  filterAction: null,
  fetchLogs: async () => {
    axios.get<Res<SystemLog[]>>("/activity-logs")
      .then((response) => {
        const logs = response.data.data
        set({ logs })
      })
  },
  setSearchTerm: (term) => set({ searchTerm: term }),

  setFilterAction: (action) => set({ filterAction: action }),

  addLog: (log) =>
    set((state) => ({
      logs: [
        {
          id: Date.now(),
          created_at: new Date().toISOString().replace('Z', '.000000Z'), // Format to match your timestamp format
          ...log,
        },
        ...state.logs,
      ],
    })),

  exportLogs: () => {
    const { logs } = get()
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Performed By,Action,Description,Entity Type,Entity ID,Created At\n" +
      logs
        .map(
          (log) =>
            `${log.id},"${log.performed_by}","${log.action}","${log.description}","${log.entity_type}","${log.entity_id}","${log.created_at || ""}"`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "system_logs.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  getFilteredLogs: () => {
    const { logs, searchTerm, filterAction } = get()

    return logs.filter((log) => {
      // Filter by search term
      if (
        searchTerm &&
        !log.performed_by.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.action.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.entity_id.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      // Filter by action
      if (filterAction && log.action !== filterAction) {
        return false
      }

      return true
    })
  },
}))
