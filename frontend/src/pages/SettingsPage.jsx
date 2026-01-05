import React, { useState } from 'react';
import {
    User,
    Mail,
    Lock,
    Bell,
    Palette,
    Shield,
    Trash2,
    Save,
    Camera,
    MapPin,
    FileText
} from 'lucide-react';
import useAuthUser from '../hooks/useAuthUser';
import { useThemeStore } from '../store/useThemeStore';
import { showToast } from '../components/Toast';
import useLogout from '../hooks/useLogout';

const SettingsPage = () => {
    const { authUser } = useAuthUser();
    const { theme, setTheme } = useThemeStore();
    const { mutate: logoutMutation } = useLogout();

    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({
        fullName: authUser?.fullName || '',
        email: authUser?.email || '',
        bio: authUser?.bio || '',
        location: authUser?.location || ''
    });

    const [notifications, setNotifications] = useState({
        friendRequests: true,
        messages: true,
        videoCalls: true,
        voiceCalls: true
    });

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'appearance', name: 'Appearance', icon: Palette },
        { id: 'privacy', name: 'Privacy', icon: Shield },
        { id: 'account', name: 'Account', icon: Lock }
    ];

    const themes = [
        'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
        'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
        'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
        'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade',
        'night', 'coffee', 'winter'
    ];

    const handleProfileSave = () => {
        // TODO: Implement profile update API
        showToast.success('Profile updated successfully!');
    };

    const handleNotificationChange = (key, value) => {
        setNotifications(prev => ({ ...prev, [key]: value }));
        showToast.success('Notification settings updated');
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            if (window.confirm('This will permanently delete all your data. Are you absolutely sure?')) {
                showToast.error('Account deletion feature coming soon');
            }
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="avatar">
                                <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                    <img src={authUser?.profilePic} alt={authUser?.fullName} />
                                </div>
                            </div>
                            <button className="btn btn-outline btn-sm">
                                <Camera className="w-4 h-4 mr-2" />
                                Change Photo
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Full Name</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={profileData.fullName}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Email</span>
                                </label>
                                <input
                                    type="email"
                                    className="input input-bordered"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>

                            <div className="form-control md:col-span-2">
                                <label className="label">
                                    <span className="label-text font-medium">Bio</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered h-24"
                                    placeholder="Tell us about yourself..."
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                />
                            </div>

                            <div className="form-control md:col-span-2">
                                <label className="label">
                                    <span className="label-text font-medium">Location</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    placeholder="City, Country"
                                    value={profileData.location}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                                />
                            </div>
                        </div>

                        <button onClick={handleProfileSave} className="btn btn-primary">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </button>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>

                        {Object.entries(notifications).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                                <div>
                                    <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                                    <p className="text-sm opacity-70">
                                        {key === 'friendRequests' && 'Get notified when someone sends you a friend request'}
                                        {key === 'messages' && 'Get notified when you receive new messages'}
                                        {key === 'videoCalls' && 'Get notified when someone calls you for video chat'}
                                        {key === 'voiceCalls' && 'Get notified when someone calls you for voice chat'}
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={value}
                                    onChange={(e) => handleNotificationChange(key, e.target.checked)}
                                />
                            </div>
                        ))}
                    </div>
                );

            case 'appearance':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold mb-4">Theme Selection</h3>
                        <p className="text-sm opacity-70 mb-4">Choose your preferred theme</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {themes.map((themeName) => (
                                <button
                                    key={themeName}
                                    onClick={() => {
                                        setTheme(themeName);
                                        showToast.success(`Theme changed to ${themeName}`);
                                    }}
                                    className={`
                    btn btn-outline capitalize
                    ${theme === themeName ? 'btn-active' : ''}
                  `}
                                >
                                    {themeName}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'privacy':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                                <div>
                                    <h4 className="font-medium">Profile Visibility</h4>
                                    <p className="text-sm opacity-70">Who can see your profile information</p>
                                </div>
                                <select className="select select-bordered select-sm">
                                    <option>Everyone</option>
                                    <option>Friends Only</option>
                                    <option>Private</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                                <div>
                                    <h4 className="font-medium">Online Status</h4>
                                    <p className="text-sm opacity-70">Show when you're online</p>
                                </div>
                                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                                <div>
                                    <h4 className="font-medium">Read Receipts</h4>
                                    <p className="text-sm opacity-70">Show when you've read messages</p>
                                </div>
                                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                            </div>
                        </div>
                    </div>
                );

            case 'account':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold mb-4">Account Management</h3>

                        <div className="space-y-4">
                            <button className="btn btn-outline w-full justify-start">
                                <Lock className="w-4 h-4 mr-2" />
                                Change Password
                            </button>

                            <button className="btn btn-outline w-full justify-start">
                                <Mail className="w-4 h-4 mr-2" />
                                Change Email
                            </button>

                            <button className="btn btn-outline w-full justify-start">
                                <FileText className="w-4 h-4 mr-2" />
                                Download My Data
                            </button>

                            <div className="divider"></div>

                            <div className="bg-error/10 p-4 rounded-lg">
                                <h4 className="font-medium text-error mb-2">Danger Zone</h4>
                                <p className="text-sm opacity-70 mb-4">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="btn btn-error btn-outline"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-base-100 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-base-content/70">Manage your account and preferences</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="lg:w-64">
                        <div className="bg-base-200 rounded-lg p-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
                      ${activeTab === tab.id
                                                ? 'bg-primary text-primary-content'
                                                : 'hover:bg-base-300'
                                            }
                    `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{tab.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="bg-base-200 rounded-lg p-6">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;