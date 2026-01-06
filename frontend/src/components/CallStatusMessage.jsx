import React from 'react';
import { Phone, Video, UserPlus, UserMinus, PhoneOff } from 'lucide-react';

const CallStatusMessage = ({ message }) => {
    // Safety check
    if (!message || !message.text) {
        return null;
    }

    const text = message.text;

    // Determine message type and icon
    let icon = null;
    let bgColor = 'bg-base-200';
    let textColor = 'text-base-content';

    if (text.includes('started a group voice call')) {
        icon = <Phone className="w-4 h-4 text-green-600" />;
        bgColor = 'bg-green-50 border-green-200';
        textColor = 'text-green-800';
    } else if (text.includes('started a group video call')) {
        icon = <Video className="w-4 h-4 text-blue-600" />;
        bgColor = 'bg-blue-50 border-blue-200';
        textColor = 'text-blue-800';
    } else if (text.includes('joined the') && text.includes('call')) {
        icon = <UserPlus className="w-4 h-4 text-success" />;
        bgColor = 'bg-success/10 border-success/20';
        textColor = 'text-success';
    } else if (text.includes('declined the') && text.includes('call')) {
        icon = <UserMinus className="w-4 h-4 text-error" />;
        bgColor = 'bg-error/10 border-error/20';
        textColor = 'text-error';
    } else if (text.includes('ended the call')) {
        icon = <PhoneOff className="w-4 h-4 text-warning" />;
        bgColor = 'bg-warning/10 border-warning/20';
        textColor = 'text-warning';
    }

    return (
        <div className={`flex items-center justify-center gap-2 p-2 rounded-lg border ${bgColor} ${textColor} text-sm font-medium my-1`}>
            {icon}
            <span>{text}</span>
        </div>
    );
};

export default CallStatusMessage;