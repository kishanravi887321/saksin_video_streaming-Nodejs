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
      // Start media first
      await startMedia();
      
      // Then join room
      joinRoom(urlRoomId, { userName });
    };

    initRoom();

    // Cleanup on unmount
    return () => {
      leaveRoom();
    };
  }, [urlRoomId]);

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
        {/* Local video */}
        {localStream && (
          <div className="video-wrapper">
            <VideoPlayer
              stream={localStream}
              muted={true}
              userName={userName}
              isLocal={true}
            />
          </div>
        )}

        {/* Local screen share */}
        {screenStream && (
          <div className="video-wrapper screen-share">
            <VideoPlayer
              stream={screenStream}
              muted={true}
              userName={`${userName}'s Screen`}
              isLocal={true}
            />
          </div>
        )}

        {/* Remote videos */}
        {Array.from(remoteStreams.entries()).map(([socketId, stream]) => {
          const user = users.find((u) => u.socketId === socketId);
          return (
            <div key={socketId} className="video-wrapper">
              <VideoPlayer
                stream={stream}
                muted={false}
                userName={user?.userName || 'User'}
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
