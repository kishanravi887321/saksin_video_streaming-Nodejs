import './Controls.css';

const Controls = ({
  isVideoOn,
  isAudioOn,
  isScreenSharing,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onLeaveRoom,
}) => {
  return (
    <div className="controls">
      <button
        className={`control-btn ${isVideoOn ? 'active' : 'inactive'}`}
        onClick={onToggleVideo}
        title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoOn ? '📹' : '📹❌'}
      </button>

      <button
        className={`control-btn ${isAudioOn ? 'active' : 'inactive'}`}
        onClick={onToggleAudio}
        title={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isAudioOn ? '🎤' : '🎤❌'}
      </button>

      <button
        className={`control-btn ${isScreenSharing ? 'active' : ''}`}
        onClick={onToggleScreenShare}
        title={isScreenSharing ? 'Stop screen share' : 'Start screen share'}
      >
        {isScreenSharing ? '🖥️✓' : '🖥️'}
      </button>

      <button
        className="control-btn leave-btn"
        onClick={onLeaveRoom}
        title="Leave room"
      >
        📞❌
      </button>
    </div>
  );
};

export default Controls;
