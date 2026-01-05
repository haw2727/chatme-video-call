import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import useAuthUser from '../hooks/useAuthUser';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken } from '../lib/api';

import {
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  Window,
  Chat,
} from 'stream-chat-react';
import { StreamChat } from 'stream-chat';
import ChatLoader from '../components/ChatLoader';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Search,
  Paperclip,
  Smile,
  Send,
  Users,
  Settings,
  Info,
  Image,
  Mic,
  Plus,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

function ChatPage() {
  const { id: targetUserId } = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken", targetUserId],
    queryFn: () => getStreamToken(targetUserId),
    enabled: !!authUser && !!targetUserId,
  })

  useEffect(() => {
    let clientInstance = null;
    let channelInstance = null;
    let cancelled = false;

    const initChat = async () => {
      if (!authUser) return;
      if (tokenData === undefined) return;

      const token = tokenData?.token ?? tokenData;
      if (!token) {
        setLoading(false);
        toast.error("Unable to get Stream token");
        return;
      }

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        clientInstance = client;

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currentChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });
        channelInstance = currentChannel;
        await currentChannel.watch();

        // Get target user info from channel members
        const members = Object.values(currentChannel.state.members);
        const target = members.find(member => member.user.id !== authUser._id);
        if (target) {
          setTargetUser(target.user);
        }

        if (cancelled) return;
        setChatClient(client);
        setChannel(currentChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Error initializing chat");
      } finally {
        setLoading(false);
      }
    };
    initChat();

    return () => {
      cancelled = true;
      (async () => {
        try {
          if (channelInstance?.stopWatching) await channelInstance.stopWatching();
          if (clientInstance?.disconnectUser) await clientInstance.disconnectUser();
        } catch (err) {
          console.warn('Error during Stream cleanup', err);
        } finally {
          setChatClient(null);
          setChannel(null);
        }
      })();
    };
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `📹 Video call started. Join here: ${callUrl}`,
      });
      toast.success("Video call link sent!");
      window.location.href = callUrl;
    }
  }

  const handleVoiceCall = () => {
    if (channel) {
      channel.sendMessage({
        text: `📞 Voice call started`,
      });
      toast.success("Voice call started!");
    }
  }

  const handleSendMessage = () => {
    if (message.trim() && channel) {
      channel.sendMessage({ text: message.trim() });
      setMessage('');
      setShowEmojiPicker(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  const emojis = [
    '😀', '😂', '😍', '🤔', '👍', '❤️', '🎉', '🔥',
    '😊', '😎', '🤗', '😘', '🙄', '😴', '🤯', '🥳',
    '👋', '🙏', '💪', '✨', '🌟', '⚡', '🎯', '🚀'
  ];

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className='h-full flex flex-col bg-base-100'>
      {/* Modern Chat Header */}
      <div className='flex items-center justify-between p-4 bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg border-b border-base-300'>
        <div className='flex items-center gap-3'>
          <Link to="/" className='btn btn-ghost btn-sm btn-circle hover:bg-white/20'>
            <ArrowLeft className='w-5 h-5' />
          </Link>

          <div className='flex items-center gap-3'>
            <div className='avatar online'>
              <div className='w-12 h-12 rounded-full ring ring-white/30 ring-offset-2 ring-offset-transparent'>
                <img
                  src={targetUser?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser?.name || 'User')}&background=random&color=fff`}
                  alt={targetUser?.name || 'User'}
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <h3 className='font-bold text-lg'>{targetUser?.name || 'Chat Partner'}</h3>
              <p className='text-sm opacity-90 flex items-center gap-1'>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Online now
              </p>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-1'>
          <button
            onClick={handleVoiceCall}
            className='btn btn-ghost btn-sm btn-circle hover:bg-white/20'
            title="Voice Call"
          >
            <Phone className='w-5 h-5' />
          </button>

          <button
            onClick={handleVideoCall}
            className='btn btn-ghost btn-sm btn-circle hover:bg-white/20'
            title="Video Call"
          >
            <Video className='w-5 h-5' />
          </button>

          <button className='btn btn-ghost btn-sm btn-circle hover:bg-white/20'>
            <Search className='w-5 h-5' />
          </button>

          <div className="dropdown dropdown-end">
            <button tabIndex={0} className='btn btn-ghost btn-sm btn-circle hover:bg-white/20'>
              <MoreVertical className='w-5 h-5' />
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-xl w-56 text-base-content border border-base-300">
              <li><a className="flex items-center gap-3 p-3 hover:bg-base-200 rounded-lg"><Info className='w-4 h-4' />Chat Info</a></li>
              <li><a className="flex items-center gap-3 p-3 hover:bg-base-200 rounded-lg"><Users className='w-4 h-4' />Create Group</a></li>
              <li><a className="flex items-center gap-3 p-3 hover:bg-base-200 rounded-lg"><Settings className='w-4 h-4' />Chat Settings</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className='flex-1 relative bg-gradient-to-b from-base-50 to-base-100'>
        <Chat client={chatClient}>
          <Channel channel={channel}>
            <Window>
              <div className='modern-chat-messages h-full'>
                <MessageList />
              </div>
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>

      {/* Modern Message Input */}
      <div className='p-4 bg-base-100 border-t border-base-300'>
        <div className='max-w-4xl mx-auto'>
          {/* Attachment Options */}
          {showAttachments && (
            <div className='mb-4 p-4 bg-base-200 rounded-xl border border-base-300'>
              <div className='flex items-center gap-4'>
                <button className='flex flex-col items-center gap-2 p-3 hover:bg-base-300 rounded-lg transition-colors'>
                  <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center'>
                    <Image className='w-6 h-6 text-white' />
                  </div>
                  <span className='text-xs font-medium'>Photo</span>
                </button>

                <button className='flex flex-col items-center gap-2 p-3 hover:bg-base-300 rounded-lg transition-colors'>
                  <div className='w-12 h-12 bg-green-500 rounded-full flex items-center justify-center'>
                    <Paperclip className='w-6 h-6 text-white' />
                  </div>
                  <span className='text-xs font-medium'>File</span>
                </button>

                <button className='flex flex-col items-center gap-2 p-3 hover:bg-base-300 rounded-lg transition-colors'>
                  <div className='w-12 h-12 bg-red-500 rounded-full flex items-center justify-center'>
                    <Mic className='w-6 h-6 text-white' />
                  </div>
                  <span className='text-xs font-medium'>Voice</span>
                </button>
              </div>
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mb-4 p-4 bg-base-200 rounded-xl border border-base-300">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Choose an emoji</h4>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    className="btn btn-ghost btn-sm text-xl hover:bg-primary hover:text-primary-content aspect-square"
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

          {/* Input Area */}
          <div className='flex items-end gap-3'>
            <button
              onClick={() => {
                setShowAttachments(!showAttachments);
                setShowEmojiPicker(false);
              }}
              className={`btn btn-circle ${showAttachments ? 'btn-primary' : 'btn-ghost'}`}
            >
              <Plus className='w-5 h-5' />
            </button>

            <div className='flex-1 relative'>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="textarea textarea-bordered w-full resize-none min-h-[52px] max-h-32 pr-12 text-base leading-relaxed"
                rows={1}
                onKeyPress={handleKeyPress}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'hsl(var(--bc) / 0.2) transparent'
                }}
              />

              <button
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowAttachments(false);
                }}
                className={`absolute right-3 bottom-3 btn btn-ghost btn-sm btn-circle ${showEmojiPicker ? 'text-primary' : ''}`}
              >
                <Smile className='w-5 h-5' />
              </button>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className={`btn btn-circle transition-all duration-200 ${message.trim()
                  ? 'btn-primary shadow-lg hover:shadow-xl'
                  : 'btn-disabled'
                }`}
            >
              <Send className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage