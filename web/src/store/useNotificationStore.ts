import { create } from "zustand"
import axios from "@/utils/axiosInstance"
import { Res } from "@/types/response"

export interface Notification {
    id: number
    title: string
    message: string
    type: "info" | "success" | "warning" | "error"
    is_read: boolean
    created_at: Date
    url?: string
    actionUrl?: string
    deleted_at: Date
}

interface NotificationStore {
    notifications: Notification[]
    unreadCount: number
    fetchNotifications: () => Promise<void>
    addNotification: (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => void
    markAsRead: (id: number) => void
    markAllAsRead: () => void
    markNotificationsByUrlAsRead: (url: string) => void
    deleteNotification: (id: number) => void
    clearAllNotifications: () => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    fetchNotifications: async () => {
        try {
            const response = await axios.get<Res<Notification[]>>("/notifications")
            const notifications = response.data.data || []
            const unreadCount = notifications.filter((n) => !n.is_read).length

            set({ notifications, unreadCount })
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
        }
    },
    addNotification: (notification) => {
        const newNotification: Notification = {
            ...notification,
            id: Math.floor(Math.random() * 1000000),
            created_at: new Date(),
            is_read: false,
        }

        set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        }))
    },

    markAsRead: (id) => {
        axios.put('/notifications/' + id + '/read')
            .then(() => {
                set((state) => {
                    const notifications = state.notifications.map((notification) =>
                        notification.id === id ? { ...notification, is_read: true } : notification,
                    )
                    const unreadCount = notifications.filter((n) => !n.is_read).length
                    return { notifications, unreadCount }
                })
            })
            .catch((error) => {
                console.error('Failed to mark notification as read:', error)
            })
    },

    markAllAsRead: async () => {
        axios.put('/notifications/mark/all/read')
            .then(() => {
                set((state) => ({
                    notifications: state.notifications.map((notification) => ({
                        ...notification,
                        is_read: true,
                    })),
                    unreadCount: 0,
                }))
            })
            .catch((error) => {
                console.error('Failed to mark all notifications as read:', error)
            })
    },

    deleteNotification: async (id) => {
        axios.delete('/notifications/' + id)
            .then(() => {
                set((state) => {
                    const notifications = state.notifications.filter((n) => n.id !== id)
                    const unreadCount = notifications.filter((n) => !n.is_read).length
                    return { notifications, unreadCount }
                })
            })
            .catch((error) => {
                console.error('Failed to delete notification:', error)
            })
    },

    clearAllNotifications: () => {
        axios.delete('/notifications/clear/all')
            .then(() => {
                set({ notifications: [], unreadCount: 0 })
            })
            .catch((error) => {
                console.error('Failed to clear all notifications:', error)
            })
    },

    markNotificationsByUrlAsRead: (url: string) => {
        // Find unread notifications with matching URL
        const { notifications } = get()
        const notificationsToMark = notifications.filter(n => !n.is_read && n.url === url)
        
        // Mark each notification as read
        notificationsToMark.forEach(notification => {
            axios.put('/notifications/' + notification.id + '/read')
                .then(() => {
                    // Update local state
                    set((state) => {
                        const updatedNotifications = state.notifications.map((n) =>
                            n.id === notification.id ? { ...n, is_read: true } : n
                        )
                        const unreadCount = updatedNotifications.filter((n) => !n.is_read).length
                        return { notifications: updatedNotifications, unreadCount }
                    })
                })
                .catch((error) => {
                    console.error('Failed to mark notification as read:', error)
                })
        })
    },
}))
