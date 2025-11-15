'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserId(user?.id || null);
      } catch (error) {
        // Silently fail if Supabase is not configured
        console.debug('Could not get user (Supabase may not be configured):', error);
      }
    };
    getUser();
  }, []);

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-8 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-50">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-600 text-sm">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full ml-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

