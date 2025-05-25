import { create } from "zustand"
import axios from "@/utils/axiosInstance"
import { Res } from "@/types/response"

export interface Notification {
    id: string
    title: string
    message: string
    type: "info" | "success" | "warning" | "error"
    is_read: boolean
    created_at: Date
    actionUrl?: string
    deleted_at: Date
}

interface NotificationStore {
    notifications: Notification[]
    unreadCount: number
    fecthNotifications: () => Promise<void>
    addNotification: (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    deleteNotification: (id: string) => void
    clearAllNotifications: () => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    fecthNotifications: async () => {
        try {
            const response = await axios.get<Res<Notification[]>>("/notifications")
            const notifications = response.data.data
            console.log(notifications)
            const unreadCount = notifications.filter((n) => !n.is_read).length

            set({ notifications, unreadCount })
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
        }
    },
    addNotification: (notification) => {
        const newNotification: Notification = {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date(),
            is_read: false,
        }

        set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        }))
    },

    markAsRead: (id) => {
        axios.put('notifications/' + id + '/read').then(() => {
            set((state) => {
                const notifications = state.notifications.map((notification) =>
                    notification.id === id ? { ...notification, is_read: true } : notification,
                )
                const unreadCount = notifications.filter((n) => !n.is_read).length
                return { notifications, unreadCount }
            })
        })

    },

    markAllAsRead: async () => {
        axios.put('notifications/mark/all/read').then(() => {
            set((state) => ({
                notifications: state.notifications.map((notification) => ({
                    ...notification,
                    isRead: true,
                })),
                unreadCount: 0,
            }))
        })

    },

    deleteNotification: async (id) => {
        axios.delete('notifications/' + id).then(() => {
            set((state) => {
                const notifications = state.notifications.filter((n) => n.id !== id)
                const unreadCount = notifications.filter((n) => !n.is_read).length
                return { notifications, unreadCount }
            })
        })

    },

    clearAllNotifications: () => {
        axios.delete('notifications/clear/all').then(() => {
            set({ notifications: [], unreadCount: 0 })
        })

    },
}))
