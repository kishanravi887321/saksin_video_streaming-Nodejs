import { useRef, useEffect, useState } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ stream, muted = false, userName = '', isLocal = false }) => {
  const videoRef = useRef(null);
  const [needsInteraction, setNeedsInteraction] = useState(false);

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
        
        // Try to play
        const playPromise = videoElement.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅ Video playing successfully');
              setNeedsInteraction(false);
            })
            .catch(err => {
              console.error('❌ Autoplay blocked:', err.name);
              if (err.name === 'NotAllowedError') {
                console.log('👆 User interaction needed to play video');
                setNeedsInteraction(true);
              }
            });
        }
      };
      
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [stream, userName]);

  const handleVideoClick = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.play()
        .then(() => {
          console.log('✅ Video playing after user interaction');
          setNeedsInteraction(false);
        })
        .catch(err => console.error('Error playing video:', err));
    }
  };

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`video ${isLocal ? 'local-video' : 'remote-video'}`}
        onClick={handleVideoClick}
      />
      {needsInteraction && !isLocal && (
        <div className="play-overlay" onClick={handleVideoClick}>
          <div className="play-button">
            <span className="play-icon">▶</span>
            <span className="play-text">Click to play</span>
          </div>
        </div>
      )}
      {userName && (
        <div className="video-label">
          {userName} {isLocal && '(You)'}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
