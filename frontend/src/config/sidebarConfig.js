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
        name: 'Groups',
        href: '/groups',
        icon: 'Users',
        description: 'Group chats and communities',
        badge: null,
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
        name: 'Video Call',
        icon: 'Video',
        description: 'Start video chat',
        action: 'videoCall',
        type: 'action'
    },
    {
        name: 'Voice Call',
        icon: 'Phone',
        description: 'Start voice chat',
        action: 'voiceCall',
        type: 'action'
    },
    {
        name: 'Add Friends',
        icon: 'UserPlus',
        description: 'Find new people',
        href: '/notifications',
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
    newChat: () => {
        console.log('Starting new chat...');
        // TODO: Implement new chat functionality
    },

    videoCall: () => {
        console.log('Starting video call...');
        // TODO: Implement video call functionality
    },

    voiceCall: () => {
        console.log('Starting voice call...');
        // TODO: Implement voice call functionality
    },

    search: (query, filters) => {
        console.log('Searching:', { query, filters });
        // TODO: Implement search functionality
    }
};