import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import './Home.css';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = (e) => {
    e.preventDefault();
    console.log('🚀 Join button clicked:', { roomId, userName });
    if (roomId.trim() && userName.trim()) {
      console.log('✅ Navigating to room:', `/room/${roomId}`);
      navigate(`/room/${roomId}`, { state: { userName } });
    } else {
      console.log('❌ Missing roomId or userName');
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    setRoomId(newRoomId);
  };

  return (
    <div className="home">
      <ThemeToggle />
      <div className="home-left">
        <div className="hero-content">
          <div className="logo-badge">
            <span className="logo-icon">🖥️</span>
          </div>
          <h1 className="hero-title">
            Professional Screen <br />
            <span className="highlight">Sharing Platform</span>
          </h1>
          <p className="hero-description">
            Enterprise-grade screen sharing solution.
            Share your screen and collaborate with your team from anywhere in the world.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🖥️</span>
              </div>
              <div className="feature-content">
                <h3>HD Screen Sharing</h3>
                <p>Crystal clear 1080p @ 60fps screen streaming</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🔊</span>
              </div>
              <div className="feature-content">
                <h3>System Audio</h3>
                <p>Share screen with system audio included</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">👥</span>
              </div>
              <div className="feature-content">
                <h3>Multi-User Support</h3>
                <p>Multiple participants can share screens</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🔒</span>
              </div>
              <div className="feature-content">
                <h3>Secure & Private</h3>
                <p>End-to-end encrypted connections</p>
              </div>
            </div>
          </div>

          <div className="stats">
            <div className="stat-item">
              <div className="stat-number">60fps</div>
              <div className="stat-label">Frame Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1080p</div>
              <div className="stat-label">Quality</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">&lt; 50ms</div>
              <div className="stat-label">Latency</div>
            </div>
          </div>
        </div>
      </div>

      <div className="home-right">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">Get Started</h2>
            <p className="form-subtitle">Enter your details to join or create a room</p>
          </div>

          <form onSubmit={handleJoinRoom} className="home-form">
            <div className="form-group">
              <label htmlFor="userName">Your Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="userName"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="roomId">Room ID</label>
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  type="text"
                  id="roomId"
                  placeholder="Enter room ID or create new"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateRoom}
              className="create-room-btn"
            >
              <span>✨</span> Generate Room ID
            </button>

            <button type="submit" className="join-btn">
              <span>🚀</span> Join Room
            </button>
          </form>

          <div className="form-footer">
            <p>By joining, you agree to our terms of service</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
