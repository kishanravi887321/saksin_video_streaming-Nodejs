import { useRef, useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ stream, muted = false, userName = '', isLocal = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      console.log('🎬 Setting stream to video element:', {
        streamId: stream.id,
        tracks: stream.getTracks().map(t => `${t.kind}: ${t.enabled ? 'enabled' : 'disabled'}`),
        userName
      });
      
      videoRef.current.srcObject = stream;
      
      // Force play
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [stream, userName]);

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
