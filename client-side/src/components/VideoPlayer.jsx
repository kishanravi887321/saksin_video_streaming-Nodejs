import { useRef, useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ stream, muted = false, userName = '', isLocal = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`video ${isLocal ? 'local-video' : 'remote-video'}`}
      />
      {userName && (
        <div className="video-label">
          {userName} {isLocal && '(You)'}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
