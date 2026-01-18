import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { useMedia } from '../hooks/useMedia';
import { useRoomStore } from '../store/roomStore';
import VideoPlayer from '../components/VideoPlayer';
import Controls from '../components/Controls';
import ThemeToggle from '../components/ThemeToggle';
import webrtcService from '../services/webrtcService';
import socketService from '../services/socketService';
import './Room.css';

const Room = () => {
  const { roomId: urlRoomId } = useParams();
  const location = useLocation();
  const userName = location.state?.userName || 'Anonymous';

  console.log('🎬 Room component rendered:', { urlRoomId, userName });

  const { joinRoom, leaveRoom } = useRoom();
  const {
    startMedia,
    stopMedia,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
  } = useMedia();

  const {
    localStream,
    screenStream,
    remoteStreams,
    isVideoOn,
    isAudioOn,
    isScreenSharing,
    users,
  } = useRoomStore();

  useEffect(() => {
    const initRoom = async () => {
      try {
        console.log('🎯 Initializing room (screen share only mode)...');
        // Join room without starting camera/mic
        joinRoom(urlRoomId, { userName });
      } catch (error) {
        console.error('Error initializing room:', error);
      }
    };

    initRoom();

    // Cleanup on unmount - just clean up connections, don't navigate
    return () => {
      console.log('🧹 Cleaning up room...');
      webrtcService.cleanup();
      socketService.leaveRoom(urlRoomId);
      stopMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlRoomId, userName]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 Room state:', {
      users: users.length,
      remoteStreams: remoteStreams.size,
      isScreenSharing,
      screenStream: !!screenStream
    });
  }, [users, remoteStreams, isScreenSharing, screenStream]);

  const handleToggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave the room?')) {
      leaveRoom();
    }
  };

  return (
    <div className="room">
      <div className="room-header">
        <h2 className="room-title">Room: {urlRoomId}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="participant-count">
            {users.length + 1} Participant{users.length !== 0 ? 's' : ''}
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="video-grid">
        {/* Screen Share Only Mode - No local camera */}
        
        {/* Show message when no screens are being shared */}
        {remoteStreams.size === 0 && !isScreenSharing && (
          <div className="no-streams-message">
            <div className="message-content">
              <span className="message-icon">🖥️</span>
              <h3>No screens being shared</h3>
              <p>Click the screen share button below to start sharing your screen</p>
            </div>
          </div>
        )}

        {/* Remote screens being shared */}
        {Array.from(remoteStreams.entries()).map(([socketId, stream]) => {
          const user = users.find((u) => u.socketId === socketId);
          
          return (
            <div 
              key={socketId} 
              className="video-wrapper screen-share"
            >
              <VideoPlayer
                stream={stream}
                muted={false}
                userName={`${user?.userName || 'User'}'s Screen`}
                isLocal={false}
              />
            </div>
          );
        })}
      </div>

      <div className="controls-container">
        <Controls
          isScreenSharing={isScreenSharing}
          onToggleScreenShare={handleToggleScreenShare}
          onLeaveRoom={handleLeaveRoom}
        />
      </div>
    </div>
  );
};

export default Room;
