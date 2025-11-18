import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim() && userName.trim()) {
      navigate(`/room/${roomId}`, { state: { userName } });
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    setRoomId(newRoomId);
  };

  return (
    <div className="home">
      <div className="home-container">
        <h1 className="home-title">🎥 Video Call & Screen Share</h1>
        <p className="home-subtitle">Connect with anyone, anywhere</p>

        <form onSubmit={handleJoinRoom} className="home-form">
          <div className="form-group">
            <label htmlFor="userName">Your Name</label>
            <input
              type="text"
              id="userName"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="roomId">Room ID</label>
            <div className="room-input-group">
              <input
                type="text"
                id="roomId"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={handleCreateRoom}
                className="create-room-btn"
              >
                Create New
              </button>
            </div>
          </div>

          <button type="submit" className="join-btn">
            Join Room
          </button>
        </form>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">📹</span>
            <span>HD Video Call</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🖥️</span>
            <span>Screen Sharing</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎤</span>
            <span>Crystal Clear Audio</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
