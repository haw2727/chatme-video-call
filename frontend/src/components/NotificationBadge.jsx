import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationBadge = ({ className = "" }) => {
    const { totalNotifications, hasNewNotifications } = useNotifications();

    return (
        <div className={`relative ${className}`}>
            <Bell className="w-5 h-5" />
            {hasNewNotifications && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-error text-error-content rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                    {totalNotifications > 9 ? '9+' : totalNotifications}
                </div>
            )}
        </div>
    );
};

export default NotificationBadge;