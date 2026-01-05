// Core user types
export interface User {
    _id: string;
    fullName: string;
    email: string;
    bio: string;
    profilePic: string;
    location: string;
    isOnline: boolean;
    lastSeen: string;
    friends: string[];
    createdAt: string;
    updatedAt: string;
}

export interface AuthUser extends User {
    token?: string;
}

// Friend request types
export interface FriendRequest {
    _id: string;
    from: User;
    to: User;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

// API response types
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    token?: string;
    user?: User;
}

export interface FriendRequestsResponse {
    incomingRequests: FriendRequest[];
    acceptedRequests: FriendRequest[];
}

// Form types
export interface LoginForm {
    email: string;
    password: string;
}

export interface SignupForm extends LoginForm {
    fullName: string;
    bio?: string;
    location?: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'coffee' | 'cupcake' | 'bumblebee' | 'emerald' | 'corporate' | 'synthwave' | 'retro' | 'cyberpunk' | 'valentine' | 'halloween' | 'garden' | 'forest' | 'aqua' | 'lofi' | 'pastel' | 'fantasy' | 'wireframe' | 'black' | 'luxury' | 'dracula' | 'cmyk' | 'autumn' | 'business' | 'acid' | 'lemonade' | 'night' | 'winter';

// Chat types
export interface ChatMessage {
    id: string;
    text: string;
    user: {
        id: string;
        name: string;
        image?: string;
    };
    created_at: string;
    updated_at: string;
}

// Group chat types
export interface GroupChat {
    id: string;
    name: string;
    description?: string;
    avatar?: string;
    members: User[];
    admins: string[];
    createdBy: string;
    createdAt: string;
    lastMessage?: ChatMessage;
}