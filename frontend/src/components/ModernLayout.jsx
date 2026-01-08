import React, { useState } from 'react';
import { Menu, X, MessageSquare, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import ModalManager from './ModalManager';
import { ModalProvider } from '../contexts/ModalContext';
import useAuthUser from '../hooks/useAuthUser';

const ModernLayout = ({ children, showSidebar = true }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { authUser } = useAuthUser();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <ModalProvider>
            <div className="flex h-screen bg-base-100">
                {/* Sidebar */}
                {showSidebar && (
                    <Sidebar
                        isOpen={sidebarOpen}
                        onClose={closeSidebar}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Mobile Header */}
                    {showSidebar && (
                        <div className="lg:hidden flex items-center justify-between p-4 border-b border-base-300 bg-base-200/50 backdrop-blur-sm">
                            <button
                                onClick={toggleSidebar}
                                className="btn btn-ghost btn-sm"
                                aria-label="Toggle sidebar"
                            >
                                {sidebarOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </button>

                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-6 h-6 text-primary" />
                                <h1 className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    ChatMe
                                </h1>
                            </div>

                            {/* Admin Button - Mobile */}
                            {authUser?.isAdmin ? (
                                <Link to="/admin" className="btn btn-ghost btn-sm">
                                    <Shield className="w-5 h-5 text-warning" />
                                </Link>
                            ) : (
                                <div className="w-10" />
                            )}
                        </div>
                    )}

                    {/* Desktop Header - Only show if admin */}
                    {showSidebar && authUser?.isAdmin && (
                        <div className="hidden lg:flex items-center justify-end p-4 border-b border-base-300 bg-base-200/50 backdrop-blur-sm">
                            <Link
                                to="/admin"
                                className="btn btn-ghost btn-sm gap-2 hover:bg-warning/10"
                            >
                                <Shield className="w-5 h-5 text-warning" />
                                <span>Admin Dashboard</span>
                            </Link>
                        </div>
                    )}

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto bg-base-100 relative">
                        {children}
                    </main>
                </div>

                {/* Modal Manager - Renders modals in the main body area */}
                <ModalManager />
            </div>
        </ModalProvider>
    );
};

export default ModernLayout;