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
import CallButton from '../components/CallButton';
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

function ChatPage() {
  const {id:targetUserId} = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const {authUser} = useAuthUser();

  const {data: tokenData} = useQuery({
    queryKey: ["streamToken", targetUserId], // include target in cache key
    queryFn: () => getStreamToken(targetUserId), // pass target id so backend can upsert it
    enabled: !!authUser && !!targetUserId, // only run when we have both
  })

  useEffect(() => {
    let clientInstance = null;
    let channelInstance = null;
    let cancelled = false;

    const initChat = async () => {
      if (!authUser) return;
      if (tokenData === undefined) return; // query still loading

      // support both { token: "..." } and plain "tokenString"
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
          token // ensure we pass a string token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currentChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });
        channelInstance = currentChannel;
        await currentChannel.watch();
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
    if(channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      
      channel.sendMessage({
         text: `I've started a video call. Join me here: ${callUrl}`,
      });
      
      toast.success("video call link sent successfully!");
    }
  }

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className='h-[93vh]'>
       <Chat client={chatClient} >
        <Channel channel={channel}>
          <div className='relative h-full'>
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
       </Chat>

    </div>
  )
}

export default ChatPage