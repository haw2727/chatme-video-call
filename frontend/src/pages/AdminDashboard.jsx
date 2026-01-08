import React, { useState, useEffect } from 'react';
import { Users, Trash2, Shield, UserCheck, UserX, Loader2 } from 'lucide-react';
import { getAllUsers, deleteUserById } from '../lib/api';
import { showToast } from '../components/Toast';
import useAuthUser from '../hooks/useAuthUser';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, onlineUsers: 0, adminUsers: 0 });
    const [loading, setLoading] = useState(true);
    const [deletingUserId, setDeletingUserId] = useState(null);
    const { authUser } = useAuthUser();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is admin
        if (!authUser?.isAdmin) {
            showToast.error('Access denied. Admin only.');
            navigate('/');
            return;
        }

        fetchUsers();
    }, [authUser, navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data.users);
            setStats(data.stats);
        } catch (error) {
            showToast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userEmail) => {
        if (!window.confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
            return;
        }

        try {
            setDeletingUserId(userId);
            await deleteUserById(userId);
            showToast.success('User deleted successfully');
            fetchUsers(); // Refresh the list
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setDeletingUserId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-8 h-8 text-primary" />
                        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
                    </div>
                    <p className="text-base-content/70">Manage users and view statistics</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
                    <div className="bg-base-100 rounded-lg p-4 sm:p-6 shadow-lg border border-base-300">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-base-content/70">Total Users</p>
                                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-base-100 rounded-lg p-4 sm:p-6 shadow-lg border border-base-300">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-success/10 rounded-lg">
                                <UserCheck className="w-6 h-6 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-base-content/70">Online Users</p>
                                <p className="text-2xl font-bold">{stats.onlineUsers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-base-100 rounded-lg p-4 sm:p-6 shadow-lg border border-base-300">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-warning/10 rounded-lg">
                                <Shield className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                                <p className="text-sm text-base-content/70">Admin Users</p>
                                <p className="text-2xl font-bold">{stats.adminUsers}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-base-100 rounded-lg shadow-lg border border-base-300 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-base-300">
                        <h2 className="text-xl font-semibold">All Users</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th className="hidden sm:table-cell">Email</th>
                                    <th className="hidden md:table-cell">Location</th>
                                    <th>Status</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} className="hover">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar">
                                                    <div className="w-10 h-10 rounded-full">
                                                        <img src={user.profilePic} alt={user.fullName} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{user.fullName}</div>
                                                    <div className="text-sm text-base-content/70 sm:hidden">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell">{user.email}</td>
                                        <td className="hidden md:table-cell">{user.location || 'N/A'}</td>
                                        <td>
                                            {user.isOnline ? (
                                                <span className="badge badge-success gap-1">
                                                    <UserCheck className="w-3 h-3" />
                                                    Online
                                                </span>
                                            ) : (
                                                <span className="badge badge-ghost gap-1">
                                                    <UserX className="w-3 h-3" />
                                                    Offline
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {user.isAdmin ? (
                                                <span className="badge badge-warning gap-1">
                                                    <Shield className="w-3 h-3" />
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="badge badge-ghost">User</span>
                                            )}
                                        </td>
                                        <td>
                                            {user._id !== authUser._id && (
                                                <button
                                                    className="btn btn-error btn-sm gap-1"
                                                    onClick={() => handleDeleteUser(user._id, user.email)}
                                                    disabled={deletingUserId === user._id}
                                                >
                                                    {deletingUserId === user._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Trash2 className="w-4 h-4" />
                                                            <span className="hidden sm:inline">Delete</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
