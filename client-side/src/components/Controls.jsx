import './Controls.css';

const Controls = ({
  isScreenSharing,
  onToggleScreenShare,
  onLeaveRoom,
}) => {
  return (
    <div className="controls">
      <button
        className={`control-btn screen-share-btn ${isScreenSharing ? 'active' : ''}`}
        onClick={onToggleScreenShare}
        title={isScreenSharing ? 'Stop screen share' : 'Start screen share'}
      >
        <span className="btn-icon">{isScreenSharing ? '🖥️✓' : '🖥️'}</span>
        <span className="btn-text">{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
      </button>

      <button
        className="control-btn leave-btn"
        onClick={onLeaveRoom}
        title="Leave room"
      >
        <span className="btn-icon">📞❌</span>
        <span className="btn-text">Leave Room</span>
      </button>
    </div>
  );
};

export default Controls;
