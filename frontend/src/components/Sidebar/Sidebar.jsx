import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useThemeStore } from '../../store/useThemeStore';
import useAuthUser from '../../hooks/useAuthUser';
import useLogout from '../../hooks/useLogout';
import { useNotifications } from '../../hooks/useNotifications';

import SidebarHeader from './SidebarHeader';
import SidebarSearch from './SidebarSearch';
import SidebarNavigation from './SidebarNavigation';
import SidebarQuickActions from './SidebarQuickActions';
import SidebarFooter from './SidebarFooter';

import { navigationItems, quickActions, availableThemes, sidebarActions } from '../../config/sidebarConfig';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { theme, setTheme } = useThemeStore();
    const { authUser } = useAuthUser();
    const { mutate: logoutMutation, isPending: isLoggingOut } = useLogout();
    const { totalNotifications } = useNotifications();

    const [searchQuery, setSearchQuery] = useState('');
    const [showThemeSelector, setShowThemeSelector] = useState(false);

    // Get popular themes from configuration
    const popularThemes = availableThemes
        .filter(theme => theme.popular)
        .map(theme => theme.name);

    // All themes for the selector
    const allThemes = availableThemes.map(theme => theme.name);

    // Update navigation items with notification badge
    const updatedNavigationItems = navigationItems.map(item => {
        if (item.href === '/notifications') {
            return { ...item, badge: totalNotifications > 0 ? totalNotifications : null };
        }
        return item;
    });

    // Helper function to check if route is active
    const isActive = (href) => {
        if (href === '/') return location.pathname === '/';
        return location.pathname.startsWith(href);
    };

    // Search handler
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim()) {
            sidebarActions.search(query, { type: 'all', status: 'all' });
        }
    };

    // Action handler for quick actions
    const handleAction = (actionType) => {
        if (sidebarActions[actionType]) {
            sidebarActions[actionType]();
        }
        onClose?.();
    };

    // Theme change handler
    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        setShowThemeSelector(false);
    };

    // Logout handler
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logoutMutation();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed top-0 left-0 h-full w-80 bg-base-200 border-r border-base-300 z-50
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:z-auto
                flex flex-col
            `}>

                {/* Header Section */}
                <SidebarHeader
                    user={authUser}
                />

                {/* Search Section */}
                <SidebarSearch
                    searchQuery={searchQuery}
                    onSearch={handleSearch}
                />

                {/* Navigation Section */}
                <SidebarNavigation
                    items={updatedNavigationItems}
                    isActive={isActive}
                    onItemClick={onClose}
                />

                {/* Quick Actions Section */}
                <SidebarQuickActions
                    actions={quickActions}
                    onActionClick={handleAction}
                />

                {/* Footer Section */}
                <SidebarFooter
                    theme={theme}
                    themes={allThemes}
                    popularThemes={popularThemes}
                    showThemeSelector={showThemeSelector}
                    onThemeToggle={() => setShowThemeSelector(!showThemeSelector)}
                    onThemeChange={handleThemeChange}
                    onLogout={handleLogout}
                    isLoggingOut={isLoggingOut}
                />
            </div>
        </>
    );
};

export default Sidebar;