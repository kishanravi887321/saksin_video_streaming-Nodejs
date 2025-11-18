import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { useMedia } from '../hooks/useMedia';
import { useRoomStore } from '../store/roomStore';
import VideoPlayer from '../components/VideoPlayer';
import Controls from '../components/Controls';
import './Room.css';

const Room = () => {
  const { roomId: urlRoomId } = useParams();
  const location = useLocation();
  const userName = location.state?.userName || 'Anonymous';

  console.log('🎬 Room component rendered:', { urlRoomId, userName });

  const { joinRoom, leaveRoom } = useRoom();
  const {
    startMedia,
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
        // Start media first
        await startMedia();
        
        // Then join room
        joinRoom(urlRoomId, { userName });
      } catch (error) {
        console.error('Error initializing room:', error);
      }
    };

    initRoom();

    // Cleanup on unmount
    return () => {
      leaveRoom();
    };
  }, [urlRoomId, userName, startMedia, joinRoom, leaveRoom]);

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
        <div className="participant-count">
          {users.length + 1} Participant{users.length !== 0 ? 's' : ''}
        </div>
      </div>

      <div className="video-grid">
        {/* Local video - show as small when screen sharing */}
        {localStream && (
          <div className={`video-wrapper ${isScreenSharing ? 'small-video' : ''}`}>
            <VideoPlayer
              stream={localStream}
              muted={true}
              userName={userName}
              isLocal={true}
            />
          </div>
        )}

        {/* Don't show your own screen share to yourself */}
        {/* Screen share is only visible to other users */}

        {/* Remote videos */}
        {Array.from(remoteStreams.entries()).map(([socketId, stream]) => {
          const user = users.find((u) => u.socketId === socketId);
          const isScreenShare = user?.hasScreen;
          
          return (
            <div 
              key={socketId} 
              className={`video-wrapper ${isScreenShare ? 'screen-share' : ''}`}
            >
              <VideoPlayer
                stream={stream}
                muted={false}
                userName={isScreenShare ? `${user?.userName || 'User'}'s Screen` : (user?.userName || 'User')}
                isLocal={false}
              />
            </div>
          );
        })}
      </div>

      <div className="controls-container">
        <Controls
          isVideoOn={isVideoOn}
          isAudioOn={isAudioOn}
          isScreenSharing={isScreenSharing}
          onToggleVideo={toggleVideo}
          onToggleAudio={toggleAudio}
          onToggleScreenShare={handleToggleScreenShare}
          onLeaveRoom={handleLeaveRoom}
        />
      </div>
    </div>
  );
};

export default Room;
