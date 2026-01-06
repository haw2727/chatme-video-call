import React from 'react';
import { Link } from 'react-router-dom';
import {
    Home,
    Users,
    Bell,
    Settings,
    MessageSquare,
    Calendar,
    Archive,
    Star
} from 'lucide-react';

// Icon mapping
const iconMap = {
    Home,
    Users,
    Bell,
    Settings,
    MessageSquare,
    Calendar,
    Archive,
    Star
};

const SidebarNavigation = ({ items, isActive, onItemClick }) => {
    return (
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <div className="py-2">
                <h3 className="px-4 text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-3">
                    Navigation
                </h3>

                {items.map((item) => {
                    const Icon = iconMap[item.icon] || Home;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={onItemClick}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative
                                ${active
                                    ? 'bg-primary text-primary-content shadow-lg'
                                    : 'hover:bg-base-300 text-base-content hover:shadow-md'
                                }
                            `}
                            title={item.description}
                        >
                            {/* Active Indicator */}
                            {active && (
                                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary-content rounded-r-full" />
                            )}

                            {/* Icon */}
                            <div className="relative">
                                <Icon className={`w-5 h-5 ${active ? 'text-primary-content' : 'text-base-content'}`} />

                                {/* Badge */}
                                {item.badge && (
                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-error text-error-content text-xs rounded-full flex items-center justify-center font-bold">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className={`font-medium truncate ${active ? 'text-primary-content' : 'text-base-content'}`}>
                                        {item.name}
                                    </span>
                                    {item.badge && (
                                        <span className="ml-2 px-2 py-1 text-xs bg-error text-error-content rounded-full font-medium">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs truncate transition-opacity ${active
                                    ? 'text-primary-content/80 opacity-100'
                                    : 'text-base-content/60 opacity-70 group-hover:opacity-100'
                                    }`}>
                                    {item.description}
                                </p>
                            </div>

                            {/* Hover Effect */}
                            {!active && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default SidebarNavigation;