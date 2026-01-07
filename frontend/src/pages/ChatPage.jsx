import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import useAuthUser from '../hooks/useAuthUser';
import { useStreamChat } from '../contexts/StreamChatContext';
import { initiateCall } from '../lib/api';
import { showToast } from '../components/Toast';

import {
  Channel,
  MessageList,
  MessageInput,
  Thread,
  Window,
  Chat,
} from 'stream-chat-react';
import ChatLoader from '../components/ChatLoader';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Search,
  Users,
  Settings,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function ChatPage() {
  const { id: targetUserId } = useParams();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState(null);

  const { authUser } = useAuthUser();
  const { chatClient, isConnected, isConnecting } = useStreamChat();

  useEffect(() => {
    let channelInstance = null;
    let cancelled = false;

    const initChat = async () => {
      if (!authUser || !chatClient || !isConnected || !targetUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currentChannel = chatClient.channel("messaging", channelId, {
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
        setChannel(currentChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Error initializing chat");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (chatClient && isConnected) {
      initChat();
    } else {
      setLoading(true);
    }

    return () => {
      cancelled = true;
      if (channelInstance?.stopWatching) {
        channelInstance.stopWatching().catch(console.error);
      }
    };
  }, [chatClient, isConnected, authUser, targetUserId]);

  const handleVideoCall = async () => {
    try {
      console.log('Initiating video call to:', targetUserId);
      const response = await initiateCall([targetUserId], 'video');

      if (response.success) {
        showToast.success('Video call invitation sent!');
        // Navigate to call page as the caller
        window.location.href = `/call/${response.callId}?type=video&initiated=true&friends=${targetUserId}`;
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      showToast.error('Failed to start video call');
    }
  }

  const handleVoiceCall = async () => {
    try {
      console.log('Initiating voice call to:', targetUserId);
      const response = await initiateCall([targetUserId], 'voice');

      if (response.success) {
        showToast.success('Voice call invitation sent!');
        // Navigate to call page as the caller
        window.location.href = `/call/${response.callId}?type=voice&initiated=true&friends=${targetUserId}`;
      }
    } catch (error) {
      console.error('Error starting voice call:', error);
      showToast.error('Failed to start voice call');
    }
  }

  if (loading || isConnecting || !chatClient || !channel) {
    return <ChatLoader />;
  }

  if (!isConnected) {
    return (
      <div className="h-full flex items-center justify-center bg-base-100">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-base-content/70">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col bg-base-100'>
      {/* Modern Chat Header */}
      <div className='flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg border-b border-base-300'>
        <div className='flex items-center gap-2 sm:gap-3 min-w-0 flex-1'>
          <Link to="/" className='btn btn-ghost btn-sm btn-circle hover:bg-white/20 flex-shrink-0'>
            <ArrowLeft className='w-4 h-4 sm:w-5 sm:h-5' />
          </Link>

          <div className='flex items-center gap-2 sm:gap-3 min-w-0 flex-1'>
            <div className='avatar online flex-shrink-0'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full ring ring-white/30 ring-offset-2 ring-offset-transparent'>
                <img
                  src={targetUser?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser?.name || 'User')}&background=random&color=fff`}
                  alt={targetUser?.name || 'User'}
                  className="object-cover"
                />
              </div>
            </div>

            <div className='min-w-0 flex-1'>
              <h3 className='font-bold text-base sm:text-lg truncate'>{targetUser?.name || 'Chat Partner'}</h3>
              <div className='text-xs sm:text-sm opacity-90 flex items-center gap-1'>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className='hidden sm:inline'>Online now</span>
                <span className='sm:hidden'>Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-1 flex-shrink-0'>
          <button
            onClick={handleVoiceCall}
            className='btn btn-ghost btn-sm btn-circle hover:bg-white/20'
            title="Voice Call"
          >
            <Phone className='w-4 h-4 sm:w-5 sm:h-5' />
          </button>

          <button
            onClick={handleVideoCall}
            className='btn btn-ghost btn-sm btn-circle hover:bg-white/20'
            title="Video Call"
          >
            <Video className='w-4 h-4 sm:w-5 sm:h-5' />
          </button>

          <button className='btn btn-ghost btn-sm btn-circle hover:bg-white/20 hidden sm:flex'>
            <Search className='w-5 h-5' />
          </button>

          <div className="dropdown dropdown-end">
            <button tabIndex={0} className='btn btn-ghost btn-sm btn-circle hover:bg-white/20'>
              <MoreVertical className='w-4 h-4 sm:w-5 sm:h-5' />
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-xl w-48 sm:w-56 text-base-content border border-base-300">
              <li><a className="flex items-center gap-3 p-2 sm:p-3 hover:bg-base-200 rounded-lg text-sm"><Info className='w-4 h-4' />Chat Info</a></li>
              <li><a className="flex items-center gap-3 p-2 sm:p-3 hover:bg-base-200 rounded-lg text-sm"><Users className='w-4 h-4' />Create Group</a></li>
              <li><a className="flex items-center gap-3 p-2 sm:p-3 hover:bg-base-200 rounded-lg text-sm"><Settings className='w-4 h-4' />Chat Settings</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Chat Messages Area - Using Stream's built-in UI */}
      <div className='flex-1 relative bg-gradient-to-b from-base-50 to-base-100'>
        <Chat client={chatClient}>
          <Channel
            channel={channel}
            acceptedFiles={['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'application/x-rar-compressed']}
            maxNumberOfFiles={5}
            multipleUploads={true}
          >
            <Window>
              <div className='modern-chat-messages h-full'>
                <MessageList />
              </div>
              <MessageInput
                focus
                uploadButton={true}
                fileUploadConfig={{
                  multiple: true,
                  maxNumberOfFiles: 5,
                  maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
                }}
              />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  )
}

export default ChatPage