import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Navigate, useNavigate } from 'react-router-dom';
import useAuthUser from '../hooks/useAuthUser';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken } from '../lib/api';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  SpeakerLayout,
  CallControls,
  StreamTheme,
  useCallStateHooks,
  CallingState,
} from '@stream-io/video-react-sdk';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import toast from 'react-hot-toast';
import PageLoader from '../components/PageLoader';
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

function CallPage() {
  const {id: callId} = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const {authUser, isLoading} = useAuthUser();

  const {data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    let videoClientInstance = null;
    let callInstance = null;
    let cancelled = false;

    const  initCall = async () => {
      if (!authUser) return;
      if (tokenData === undefined) return; // waiting for query
      if (!tokenData || !callId) {
        setIsConnecting(false);
        if (!tokenData) toast.error("Unable to get Stream token for call");
        return;
      }

      try{
         const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
         }
         const videoClient = new StreamVideoClient({
           apiKey: STREAM_API_KEY,
           user,
           token: tokenData, // <-- token string
         })

         videoClientInstance = videoClient;

         const callInstanceLocal = videoClient.call("default", callId);
         callInstance = callInstanceLocal;

         await callInstanceLocal.join({create:true})

         if (cancelled) return;

         setClient(videoClient)
         setCall(callInstanceLocal)
      }catch(error){
         console.error("Error joining call:", error)
         toast.error("could not join the call. Please try again.");
      } finally{
        setIsConnecting(false);
      }
    };
    initCall();

    return () => {
      cancelled = true;
      (async () => {
        try {
          if (callInstance?.leave) await callInstance.leave();
          if (videoClientInstance?.disconnect) await videoClientInstance.disconnect();
        } catch (err) {
          console.warn('Error during call cleanup', err);
        } finally {
          setClient(null);
          setCall(null);
        }
      })();
    };
  }, [tokenData, authUser,callId]);

  if(isLoading||isConnecting) return <PageLoader />;
  return (
    <div className='flex items-center justify-center h-full'>
       <div className='relative'>
         {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
         ) : (
          <div className='flex items-center justify-center h-full'>
             <p>could not initialize call. Please refresh or try again later.</p>
          </div>
         )
          
         }
       </div>
    </div>
  )
}

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  // Use a navigate hook
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};
export default CallPage