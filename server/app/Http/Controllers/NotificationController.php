<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Auth;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $notifications = Notification::where('username_id', Auth::user()->username)
            ->orderBy('created_at', 'desc')
            ->get();
        return $this->ok($notifications);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $notification = Notification::find($id);
        if ($notification) {
            // Verify the notification belongs to the authenticated user
            if ($notification->username_id !== Auth::user()->username) {
                return $this->forbidden('You can only delete your own notifications');
            }
            
            $notification->delete();
            return $this->ok(['message' => 'Notification deleted successfully']);
        }
        return $this->notFound('Notification not found');
    }

    public function markAsRead(Request $request, string $id)
    {
        $notification = Notification::find($id);
        if ($notification) {
            // Verify the notification belongs to the authenticated user
            if ($notification->username_id !== Auth::user()->username) {
                return $this->forbidden('You can only mark your own notifications as read');
            }
            
            $notification->read_at = now();
            $notification->is_read = true;
            $notification->save();
            return $this->ok($notification);
        }
        return $this->notFound('Notification not found');
    }
    public function markAllAsRead()
    {
        $notifications = Notification::where('username_id', Auth::user()->username)
            ->whereNull('read_at')
            ->get();

        foreach ($notifications as $notification) {
            $notification->read_at = now();
            $notification->is_read = true;
            $notification->save();
        }

        return $this->ok($notifications);
    }
    public function unreadCount()
    {
        $count = Notification::where('username_id', Auth::user()->username)
            ->whereNull('read_at')
            ->count();

        return $this->ok(['unread_count' => $count]);
    }
    public function deleteAll()
    {
        $notifications = Notification::where('username_id', Auth::user()->username)->get();
        foreach ($notifications as $notification) {
            $notification->delete();
        }
        return $this->ok();
    }

    public function deleteAllReadNotifications()
    {
        $notifications = Notification::where('username_id', Auth::user()->username)
            ->whereNotNull('read_at')
            ->get();

        foreach ($notifications as $notification) {
            $notification->delete();
        }

        return $this->ok();
    }
    public function deleteAllUnreadNotifications()
    {
        $notifications = Notification::where('username_id', Auth::user()->username)
            ->whereNull('read_at')
            ->get();

        foreach ($notifications as $notification) {
            $notification->delete();
        }

        return $this->ok(['message' => 'All unread notifications deleted successfully']);
    }

    public function deleteNotificationById($id)
    {
        $notification = Notification::find($id);
        if ($notification) {
            $notification->delete();
            return $this->ok(['message' => 'Notification deleted successfully']);
        }
        return $this->badRequest('Notification not found', 404);
    }
    public function deleteAllNotificationsByUsername($username)
    {
        $notifications = Notification::where('username_id', $username)->get();
        foreach ($notifications as $notification) {
            $notification->delete();
        }
        return $this->ok();
    }
}
