import React, { useState, useRef, useEffect } from 'react';
import {
    Send,
    Smile,
    Paperclip,
    MoreVertical,
    Phone,
    Video,
    Search,
    ArrowLeft
} from 'lucide-react';

const ModernChatInterface = ({
    messages = [],
    onSendMessage,
    currentUser,
    chatPartner,
    onVideoCall,
    onVoiceCall,
    isTyping = false
}) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const isMessageFromCurrentUser = (msg) => {
        return msg.user?.id === currentUser?.id;
    };

    return (
        <div className="flex flex-col h-full bg-base-100">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
                <div className="flex items-center gap-3">
                    <button className="btn btn-ghost btn-sm lg:hidden">
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="avatar">
                        <div className="w-10 h-10 rounded-full">
                            <img
                                src={chatPartner?.profilePic || '/default-avatar.png'}
                                alt={chatPartner?.fullName}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold">{chatPartner?.fullName}</h3>
                        <p className="text-xs text-base-content/60">
                            {isTyping ? 'typing...' : 'online'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="btn btn-ghost btn-sm" onClick={onVoiceCall}>
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={onVideoCall}>
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="btn btn-ghost btn-sm">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="btn btn-ghost btn-sm">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => {
                    const isOwn = isMessageFromCurrentUser(msg);
                    const showAvatar = index === 0 ||
                        messages[index - 1]?.user?.id !== msg.user?.id;

                    return (
                        <div
                            key={msg.id || index}
                            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {/* Avatar */}
                            <div className={`avatar ${showAvatar ? 'visible' : 'invisible'}`}>
                                <div className="w-8 h-8 rounded-full">
                                    <img
                                        src={msg.user?.image || '/default-avatar.png'}
                                        alt={msg.user?.name}
                                    />
                                </div>
                            </div>

                            {/* Message Bubble */}
                            <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                                <div
                                    className={`px-4 py-2 rounded-2xl ${isOwn
                                            ? 'bg-primary text-primary-content rounded-br-md'
                                            : 'bg-base-200 text-base-content rounded-bl-md'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap break-words">
                                        {msg.text}
                                    </p>
                                </div>

                                <span className="text-xs text-base-content/50 mt-1 px-2">
                                    {formatTime(msg.created_at)}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex gap-3">
                        <div className="avatar">
                            <div className="w-8 h-8 rounded-full">
                                <img
                                    src={chatPartner?.profilePic || '/default-avatar.png'}
                                    alt={chatPartner?.fullName}
                                />
                            </div>
                        </div>
                        <div className="bg-base-200 px-4 py-2 rounded-2xl rounded-bl-md">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-base-300 bg-base-200">
                <form onSubmit={handleSend} className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="textarea textarea-bordered w-full resize-none min-h-[44px] max-h-32 pr-20"
                            rows={1}
                        />

                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                            <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <Smile className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                            >
                                <Paperclip className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="btn btn-primary btn-circle"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>

                {/* Emoji Picker Placeholder */}
                {showEmojiPicker && (
                    <div className="absolute bottom-20 right-4 bg-base-100 border border-base-300 rounded-lg p-4 shadow-lg">
                        <div className="grid grid-cols-8 gap-2">
                            {['😀', '😂', '😍', '🤔', '👍', '❤️', '🎉', '🔥'].map((emoji) => (
                                <button
                                    key={emoji}
                                    className="btn btn-ghost btn-sm text-lg"
                                    onClick={() => {
                                        setMessage(prev => prev + emoji);
                                        setShowEmojiPicker(false);
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModernChatInterface;