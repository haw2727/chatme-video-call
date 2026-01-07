import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';

export interface AppError {
    message: string;
    code?: string;
    status?: number;
    field?: string;
}

export class ErrorHandler {
    static handle(error: unknown, context?: string): AppError {
        // Don't log 401 errors as they're expected when user is not logged in
        if (error instanceof AxiosError && error.response?.status === 401) {
            // Handle silently for auth-related contexts
            if (context === 'login' || context === 'signup' || context === 'auth') {
                console.error(`Error in ${context}:`, error);
            }
            // Don't log for other contexts (like data fetching when not authenticated)
        } else {
            console.error(`Error in ${context || 'unknown context'}:`, error);
        }

        if (error instanceof AxiosError) {
            const status = error.response?.status;
            const message = error.response?.data?.message || error.message;

            switch (status) {
                case 400:
                    return { message: message || 'Invalid request', status, code: 'BAD_REQUEST' };
                case 401:
                    return { message: 'Please log in to continue', status, code: 'UNAUTHORIZED' };
                case 403:
                    return { message: 'You don\'t have permission to do this', status, code: 'FORBIDDEN' };
                case 404:
                    return { message: 'Resource not found', status, code: 'NOT_FOUND' };
                case 429:
                    return { message: 'Too many requests. Please try again later', status, code: 'RATE_LIMITED' };
                case 500:
                    return { message: 'Server error. Please try again', status, code: 'SERVER_ERROR' };
                default:
                    return { message: message || 'Something went wrong', status, code: 'UNKNOWN' };
            }
        }

        if (error instanceof Error) {
            return { message: error.message, code: 'CLIENT_ERROR' };
        }

        return { message: 'An unexpected error occurred', code: 'UNKNOWN' };
    }

    static showToast(error: unknown, context?: string): void {
        const appError = this.handle(error, context);
        toast.error(appError.message);
    }

    static isNetworkError(error: unknown): boolean {
        return error instanceof AxiosError && !error.response;
    }

    static isAuthError(error: unknown): boolean {
        return error instanceof AxiosError &&
            (error.response?.status === 401 || error.response?.status === 403);
    }
}

// Form validation utilities
export const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
};

export const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value?.trim()) return `${fieldName} is required`;
    return null;
};

export const validateFullName = (fullName: string): string | null => {
    if (!fullName?.trim()) return 'Full name is required';
    if (fullName.trim().length < 2) return 'Full name must be at least 2 characters';
    return null;
};

export const validateFirstName = (firstName: string): string | null => {
    if (!firstName?.trim()) return 'First name is required';
    if (firstName.trim().length < 2) return 'First name must be at least 2 characters';
    return null;
};

export const validateLastName = (lastName: string): string | null => {
    if (!lastName?.trim()) return 'Last name is required';
    if (lastName.trim().length < 2) return 'Last name must be at least 2 characters';
    return null;
};