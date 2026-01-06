import React from 'react';
import { Link } from 'react-router-dom';
import {
    MessageSquare,
    Video,
    Phone,
    Plus,
    Zap,
    Send,
    Home
} from 'lucide-react';

// Icon mapping
const iconMap = {
    MessageSquare,
    Video,
    Phone,
    Plus,
    Zap,
    Send,
    Home
};

const SidebarQuickActions = ({ actions, onActionClick }) => {
    return (
        <div className="px-4 py-2 border-t border-base-300/50">
            <h3 className="px-4 text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-3">
                Quick Actions
            </h3>

            <div className="space-y-1">
                {actions.map((action, index) => {
                    const Icon = iconMap[action.icon] || Plus;

                    // If action has href (link type), render as Link
                    if (action.type === 'link' && action.href) {
                        return (
                            <Link
                                key={index}
                                to={action.href}
                                onClick={() => onActionClick?.(action.action)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-base-300 text-base-content group"
                            >
                                <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-content transition-colors">
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <span className="font-medium text-sm">{action.name}</span>
                                    <p className="text-xs text-base-content/60 group-hover:text-base-content/80">
                                        {action.description}
                                    </p>
                                </div>
                            </Link>
                        );
                    }

                    // Otherwise render as button (action type)
                    return (
                        <button
                            key={index}
                            onClick={() => {
                                onActionClick?.(action.action);
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-base-300 text-base-content w-full text-left group"
                        >
                            <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-content transition-colors">
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <span className="font-medium text-sm">{action.name}</span>
                                <p className="text-xs text-base-content/60 group-hover:text-base-content/80">
                                    {action.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Additional Quick Actions */}
            <div className="mt-4 pt-4 border-t border-base-300/30">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        className="btn btn-sm btn-ghost justify-start"
                        onClick={() => onActionClick?.('createGroup')}
                    >
                        <Plus className="w-4 h-4" />
                        Create
                    </button>
                    <Link
                        to="/"
                        className="btn btn-sm btn-ghost justify-start"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SidebarQuickActions;