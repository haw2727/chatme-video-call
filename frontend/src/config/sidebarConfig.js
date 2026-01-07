// Sidebar Navigation Configuration
export const navigationItems = [
    {
        name: 'Home',
        href: '/',
        icon: 'Home',
        description: 'Dashboard and friends',
        badge: null,
        exact: true
    },
    {
        name: 'Friends',
        href: '/',
        icon: 'Heart',
        description: 'Your friends list',
        badge: null, // This will be dynamically updated
        exact: true,
        isCounter: true // Special flag to indicate this is just a counter
    },
    {
        name: 'Chats',
        href: '/chats',
        icon: 'MessageSquare',
        description: 'Direct messages and conversations',
        badge: null, // This will be dynamically updated
        exact: false
    },
    {
        name: 'Groups',
        href: '/groups',
        icon: 'Users',
        description: 'Group chats and communities',
        badge: null, // This will be dynamically updated
        exact: false
    },
    {
        name: 'Notifications',
        href: '/notifications',
        icon: 'Bell',
        description: 'Friend requests and alerts',
        badge: null, // This will be dynamically updated
        exact: false
    },
    {
        name: 'Settings',
        href: '/settings',
        icon: 'Settings',
        description: 'Account and app settings',
        badge: null,
        exact: false
    }
];

// Quick Actions Configuration
export const quickActions = [
    {
        name: 'New Chat',
        icon: 'MessageSquare',
        description: 'Start a conversation',
        action: 'newChat',
        type: 'action'
    },
    {
        name: 'Home',
        icon: 'Home',
        description: 'Back to home',
        href: '/',
        type: 'link'
    }
];

// Available Themes
export const availableThemes = [
    // Light themes
    { name: 'light', category: 'light', popular: true },
    { name: 'cupcake', category: 'light', popular: true },
    { name: 'bumblebee', category: 'light', popular: false },
    { name: 'emerald', category: 'light', popular: true },
    { name: 'corporate', category: 'light', popular: false },
    { name: 'retro', category: 'light', popular: false },
    { name: 'valentine', category: 'light', popular: false },
    { name: 'garden', category: 'light', popular: false },
    { name: 'aqua', category: 'light', popular: false },
    { name: 'lofi', category: 'light', popular: false },
    { name: 'pastel', category: 'light', popular: false },
    { name: 'fantasy', category: 'light', popular: false },
    { name: 'wireframe', category: 'light', popular: false },
    { name: 'cmyk', category: 'light', popular: false },
    { name: 'autumn', category: 'light', popular: false },
    { name: 'business', category: 'light', popular: false },
    { name: 'acid', category: 'light', popular: false },
    { name: 'lemonade', category: 'light', popular: false },
    { name: 'winter', category: 'light', popular: false },

    // Dark themes
    { name: 'dark', category: 'dark', popular: true },
    { name: 'synthwave', category: 'dark', popular: true },
    { name: 'halloween', category: 'dark', popular: false },
    { name: 'forest', category: 'dark', popular: true },
    { name: 'black', category: 'dark', popular: false },
    { name: 'luxury', category: 'dark', popular: false },
    { name: 'dracula', category: 'dark', popular: true },
    { name: 'night', category: 'dark', popular: false },
    { name: 'coffee', category: 'dark', popular: true },
    { name: 'cyberpunk', category: 'dark', popular: false }
];

// Search Filter Options
export const searchFilters = {
    type: [
        { value: 'all', label: 'All', icon: 'Search' },
        { value: 'friends', label: 'Friends', icon: 'Users' },
        { value: 'groups', label: 'Groups', icon: 'Users' },
        { value: 'chats', label: 'Chats', icon: 'MessageSquare' }
    ],
    status: [
        { value: 'all', label: 'All', icon: 'Circle' },
        { value: 'online', label: 'Online', icon: 'Circle' },
        { value: 'offline', label: 'Offline', icon: 'Circle' }
    ]
};

// Sidebar Action Handlers
export const sidebarActions = {
    newChat: (openNewChatModal) => {
        console.log('Opening new chat modal...');
        if (openNewChatModal) {
            openNewChatModal();
        }
    },

    createGroup: (openCreateGroupModal) => {
        console.log('Opening create group modal...');
        if (openCreateGroupModal) {
            openCreateGroupModal();
        }
    },

    search: (query, filters) => {
        console.log('Searching:', { query, filters });
        // TODO: Implement search functionality
    }
};