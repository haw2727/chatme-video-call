import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export const useSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFilters, setSearchFilters] = useState({
        type: 'all',
        status: 'all'
    });
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const toggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const open = useCallback(() => {
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleSearch = useCallback((query, filters = searchFilters) => {
        setSearchQuery(query);
        setSearchFilters(filters);

        // TODO: Implement actual search logic
        console.log('Searching:', { query, filters });
    }, [searchFilters]);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setSearchFilters({ type: 'all', status: 'all' });
    }, []);

    return {
        isOpen,
        searchQuery,
        searchFilters,
        toggle,
        open,
        close,
        handleSearch,
        clearSearch
    };
};