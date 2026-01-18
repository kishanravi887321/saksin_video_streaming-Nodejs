import { useRef, useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ stream, muted = false, userName = '', isLocal = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement && stream) {
      console.log('🎬 Setting stream to video element:', {
        streamId: stream.id,
        tracks: stream.getTracks().map(t => `${t.kind}: ${t.enabled ? 'enabled' : 'disabled'}, readyState: ${t.readyState}`),
        userName
      });
      
      videoElement.srcObject = stream;
      
      // Wait for metadata to load
      const handleLoadedMetadata = () => {
        console.log('📹 Video metadata loaded:', {
          width: videoElement.videoWidth,
          height: videoElement.videoHeight,
          duration: videoElement.duration
        });
        
        videoElement.play().catch(err => {
          console.error('Error playing video:', err);
          // Add click handler as fallback
          videoElement.onclick = () => {
            videoElement.play();
          };
        });
      };
      
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
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
