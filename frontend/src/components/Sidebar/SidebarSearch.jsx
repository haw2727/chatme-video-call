import React, { useState } from 'react';
import { Search, X, Filter, Users, MessageSquare, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const SidebarSearch = ({ searchQuery, onSearch }) => {
    const [localQuery, setLocalQuery] = useState(searchQuery || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        type: 'all', // all, friends, groups, chats
        status: 'all' // all, online, offline
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(localQuery, filters);
    };

    const handleClear = () => {
        setLocalQuery('');
        onSearch('', filters);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onSearch(localQuery, newFilters);
    };

    return (
        <div className="p-4 border-b border-base-300/50">
            {/* Quick Navigation Tabs */}
            <div className="flex gap-2 mb-3">
                <Link
                    to="/"
                    className="flex-1 btn btn-sm btn-ghost justify-center gap-1 hover:bg-primary/10"
                >
                    <Home className="w-4 h-4" />
                    <span className="text-xs">Home</span>
                </Link>
                <Link
                    to="/groups"
                    className="flex-1 btn btn-sm btn-ghost justify-center gap-1 hover:bg-primary/10"
                >
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Groups</span>
                </Link>
                <Link
                    to="/chats"
                    className="flex-1 btn btn-sm btn-ghost justify-center gap-1 hover:bg-primary/10"
                >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">Chats</span>
                </Link>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
                <input
                    type="text"
                    placeholder="Search chats, friends, groups..."
                    className="input input-bordered w-full pl-10 pr-20 input-sm"
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                />

                {/* Clear Button */}
                {localQuery && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1 hover:bg-base-300 rounded"
                    >
                        <X className="w-3 h-3 text-base-content/60" />
                    </button>
                )}

                {/* Filter Button */}
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-base-300 ${showFilters ? 'bg-primary text-primary-content' : 'text-base-content/60'
                        }`}
                >
                    <Filter className="w-3 h-3" />
                </button>
            </form>

            {/* Search Filters */}
            {showFilters && (
                <div className="mt-3 p-3 bg-base-100 rounded-lg border border-base-300">
                    <div className="space-y-3">
                        {/* Type Filter */}
                        <div>
                            <label className="text-xs font-medium text-base-content/70 mb-1 block">
                                Search In:
                            </label>
                            <div className="flex gap-1">
                                {[
                                    { value: 'all', label: 'All' },
                                    { value: 'friends', label: 'Friends' },
                                    { value: 'groups', label: 'Groups' },
                                    { value: 'chats', label: 'Chats' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleFilterChange('type', option.value)}
                                        className={`btn btn-xs ${filters.type === option.value
                                            ? 'btn-primary'
                                            : 'btn-ghost'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="text-xs font-medium text-base-content/70 mb-1 block">
                                Status:
                            </label>
                            <div className="flex gap-1">
                                {[
                                    { value: 'all', label: 'All' },
                                    { value: 'online', label: 'Online' },
                                    { value: 'offline', label: 'Offline' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleFilterChange('status', option.value)}
                                        className={`btn btn-xs ${filters.status === option.value
                                            ? 'btn-primary'
                                            : 'btn-ghost'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Results Summary */}
            {localQuery && (
                <div className="mt-2 text-xs text-base-content/60">
                    Searching for "{localQuery}" in {filters.type} ({filters.status})
                </div>
            )}
        </div>
    );
};

export default SidebarSearch;