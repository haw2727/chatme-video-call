import React from 'react';
import { MessageSimple } from 'stream-chat-react';
import CallInviteMessage from './CallInviteMessage';
import CallStatusMessage from './CallStatusMessage';

const CustomMessageRenderer = ({ message, onJoinCall, onRejectCall, currentUserId, ...props }) => {
    // Safety check - ensure message exists and has required properties
    if (!message || typeof message !== 'object') {
        console.warn('CustomMessageRenderer: message is invalid or undefined');
        return null;
    }

    // Debug logging
    console.log('CustomMessageRenderer received message:', {
        id: message.id,
        text: message.text,
        attachments: message.attachments,
        hasAttachments: !!message.attachments,
        attachmentCount: message.attachments?.length || 0
    });

    // Ensure message has required Stream Chat properties
    if (!message.id || !message.user) {
        console.warn('CustomMessageRenderer: message missing required properties (id or user)');
        return <MessageSimple message={message} {...props} />;
    }

    try {
        // Check if this is a call invitation message
        const hasCallInvite = message.attachments?.some(
            attachment => {
                console.log('Checking attachment:', attachment);
                return attachment && attachment.type === 'group_call_invite';
            }
        );

        console.log('Has call invite:', hasCallInvite);

        // Check if this is a call status message (join/decline/end notifications)
        const isCallStatusMessage = message.text && (
            message.text.includes('joined the') ||
            message.text.includes('declined the') ||
            message.text.includes('ended the call') ||
            (message.text.includes('started a group') && message.text.includes('call'))
        );

        console.log('Is call status message:', isCallStatusMessage);

        if (hasCallInvite) {
            console.log('Rendering CallInviteMessage');
            return (
                <div className="str-chat__message-simple">
                    {/* Regular message content */}
                    <div className="str-chat__message-text">
                        <div className="str-chat__message-text-inner">
                            {message.text}
                        </div>
                    </div>

                    {/* Custom call invitation component */}
                    <CallInviteMessage
                        message={message}
                        onJoinCall={onJoinCall}
                        onRejectCall={onRejectCall}
                        currentUserId={currentUserId}
                    />
                </div>
            );
        }

        if (isCallStatusMessage) {
            console.log('Rendering CallStatusMessage');
            return <CallStatusMessage message={message} />;
        }

        // For regular messages, use the default renderer
        console.log('Rendering default MessageSimple');
        return <MessageSimple message={message} {...props} />;
    } catch (error) {
        console.error('CustomMessageRenderer error:', error);
        // Fallback to default renderer on any error
        return <MessageSimple message={message} {...props} />;
    }
};

export default CustomMessageRenderer;