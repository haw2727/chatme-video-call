import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Navigate, useNavigate } from 'react-router-dom';
import useAuthUser from '../hooks/useAuthUser';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken, getCallDetails } from '../lib/api';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  SpeakerLayout,
  CallControls,
  StreamTheme,
  useCallStateHooks,
  CallingState,
  ParticipantView,
} from '@stream-io/video-react-sdk';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import toast from 'react-hot-toast';
import PageLoader from '../components/PageLoader';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Users,
  Settings,
  ArrowLeft,
  Monitor
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

function CallPage() {
  const { id: callId } = useParams();
  const [searchParams] = useSearchParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callType, setCallType] = useState('video');
  const [friendIds, setFriendIds] = useState([]);
  const [callData, setCallData] = useState(null);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Get call details from backend
  const { data: callDetailsData } = useQuery({
    queryKey: ["callDetails", callId],
    queryFn: () => getCallDetails(callId),
    enabled: !!callId && !!authUser,
  });

  useEffect(() => {
    // Get call parameters from URL
    const type = searchParams.get('type') || 'video';
    const friends = searchParams.get('friends') || '';
    const initiated = searchParams.get('initiated') === 'true';
    const accepted = searchParams.get('accepted') === 'true';

    setCallType(type);

    // Handle different call scenarios
    if (callDetailsData?.success && callDetailsData.callData) {
      const callInfo = callDetailsData.callData;
      setCallData(callInfo);

      // Extract participant IDs
      const participantIds = callInfo.participants?.map(p => p.id) || [];
      if (callInfo.caller?.id) {
        participantIds.push(callInfo.caller.id);
      }
      setFriendIds(participantIds.filter(id => id !== authUser?._id));
    } else if (friends) {
      // Fallback to URL params (legacy)
      setFriendIds(friends.split(','));
    }
  }, [searchParams, callDetailsData, authUser]);

  useEffect(() => {
    let videoClientInstance = null;
    let callInstance = null;
    let cancelled = false;

    const initCall = async () => {
      if (!authUser) return;
      if (tokenData === undefined) return;
      if (!tokenData || !callId) {
        setIsConnecting(false);
        if (!tokenData) toast.error("Unable to get Stream token for call");
        return;
      }

      try {
        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        }

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData,
        })

        videoClientInstance = videoClient;

        const callInstanceLocal = videoClient.call("default", callId);
        callInstance = callInstanceLocal;

        // Join call with initial settings based on call type
        await callInstanceLocal.join({
          create: true,
          data: {
            members: [
              { user_id: authUser._id },
              ...friendIds.map(id => ({ user_id: id }))
            ],
            settings_override: {
              audio: {
                default_device: 'speaker',
              },
              video: {
                enabled: callType === 'video',
              }
            }
          }
        });

        // Set initial camera/mic state based on call type
        if (callType === 'voice') {
          await callInstanceLocal.camera.disable();
        }

        if (cancelled) return;

        setClient(videoClient);
        setCall(callInstanceLocal);

        // Show success message
        toast.success(`${callType === 'video' ? 'Video' : 'Voice'} call started!`);

      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
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
  }, [tokenData, authUser, callId, callType, friendIds]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className='h-full bg-gray-900 relative'>
      {client && call ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <CallContent callType={callType} friendIds={friendIds} />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className='flex items-center justify-center h-full text-white'>
          <div className="text-center">
            <div className="loading loading-spinner loading-lg mb-4"></div>
            <p>Could not initialize call. Please refresh or try again later.</p>
            <Link to="/call-selection" className="btn btn-primary mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Call Selection
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

const CallContent = ({ callType, friendIds }) => {
  const { useCallCallingState, useParticipants, useLocalParticipant } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const navigate = useNavigate();

  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
      toast.success("Call ended");
    }
  }, [callingState, navigate]);

  // Call duration timer
  useEffect(() => {
    if (callingState === CallingState.JOINED && !callStartTime) {
      setCallStartTime(Date.now());
    }
  }, [callingState, callStartTime]);

  useEffect(() => {
    let interval;
    if (callStartTime && callingState === CallingState.JOINED) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStartTime, callingState]);

  // Format call duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = async () => {
    if (localParticipant?.videoStream) {
      if (isVideoEnabled) {
        await localParticipant.videoStream.disable();
      } else {
        await localParticipant.videoStream.enable();
      }
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = async () => {
    if (localParticipant?.audioStream) {
      if (isAudioEnabled) {
        await localParticipant.audioStream.disable();
      } else {
        await localParticipant.audioStream.enable();
      }
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        setIsScreenSharing(false);
        toast.success("Screen sharing stopped");
      } else {
        // Start screen sharing
        setIsScreenSharing(true);
        toast.success("Screen sharing started");
      }
    } catch (error) {
      toast.error("Could not toggle screen sharing");
    }
  };

  const endCall = () => {
    navigate("/");
  };

  if (callingState === CallingState.JOINING) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Joining Call...</h2>
          <p className="text-gray-300">
            {callType === 'video' ? 'Video' : 'Voice'} call with {friendIds.length} friend(s)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Call Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {callType === 'video' ? (
              <Video className="w-5 h-5 text-green-400" />
            ) : (
              <Phone className="w-5 h-5 text-blue-400" />
            )}
            <span className="font-semibold">
              {callType === 'video' ? 'Video Call' : 'Voice Call'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <Users className="w-4 h-4" />
            {participants.length} participant(s)
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-300">
            {callStartTime ? formatDuration(callDuration) : new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Video/Voice Content */}
      <div className="flex-1 relative">
        {callType === 'video' ? (
          <StreamTheme className="h-full">
            <SpeakerLayout />
          </StreamTheme>
        ) : (
          // Voice call UI
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {participants.map((participant) => (
                  <div key={participant.sessionId} className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3 ring-4 ring-white/20">
                      <img
                        src={participant.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random&color=fff`}
                        alt={participant.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-lg">{participant.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {participant.audioEnabled ? (
                        <Mic className="w-4 h-4 text-green-400" />
                      ) : (
                        <MicOff className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-sm text-gray-300">
                        {participant.audioEnabled ? 'Speaking' : 'Muted'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-gray-300">
                <h2 className="text-2xl font-bold mb-2">Voice Call Active</h2>
                <p>You're in a voice call with {participants.length - 1} other(s)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="p-6 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`btn btn-circle btn-lg ${isAudioEnabled
              ? 'btn-ghost hover:btn-error'
              : 'btn-error'
              }`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </button>

          {/* Video Toggle (only for video calls) */}
          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`btn btn-circle btn-lg ${isVideoEnabled
                ? 'btn-ghost hover:btn-error'
                : 'btn-error'
                }`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </button>
          )}

          {/* Screen Share (only for video calls) */}
          {callType === 'video' && (
            <button
              onClick={toggleScreenShare}
              className={`btn btn-circle btn-lg ${isScreenSharing
                ? 'btn-primary'
                : 'btn-ghost hover:btn-primary'
                }`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              <Monitor className="w-6 h-6" />
            </button>
          )}

          {/* Settings */}
          <button
            className="btn btn-circle btn-lg btn-ghost hover:btn-info"
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="btn btn-circle btn-lg btn-error hover:btn-error-focus"
            title="End call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

        {/* Call Info */}
        <div className="text-center mt-4 text-sm text-gray-400">
          Call duration: {formatDuration(callDuration)}
          <span className="ml-2">•</span>
          <span className="ml-2">{participants.length} participants</span>
        </div>
      </div>
    </div>
  );
};

export default CallPage