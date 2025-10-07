
import { useNotificationStore } from "@/store/useNotificationStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCheck, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } =
    useNotificationStore()
  const navigate = useNavigate()

  const handleNotificationClick = (notification: any) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    // Navigate to the notification URL if it exists
    if (notification.url) {
      navigate(notification.url)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case "success":
        return "default"
      case "warning":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <Button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          variant="outline"
          className="flex items-center gap-2"
        >
          <CheckCheck className="h-4 w-4" />
          Mark All as Read
        </Button>
        <Button
          onClick={clearAllNotifications}
          disabled={notifications.length === 0}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear All
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground text-center">
              You're all caught up! New notifications will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md cursor-pointer ${
                !notification.is_read ? "border-l-4 border-l-primary bg-muted/30" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        {!notification.is_read && <div className="h-2 w-2 bg-primary rounded-full" />}
                      </div>
                      <CardDescription className="text-sm">{notification.message}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant={getNotificationBadgeVariant(notification.type)}>{notification.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(notification.created_at, { addSuffix: true })}
                  </span>
                  <div className="flex items-center gap-2">
                    {!notification.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="h-8 px-2 text-xs"
                      >
                        Mark as read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
