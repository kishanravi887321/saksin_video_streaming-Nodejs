// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';

// WebRTC Configuration
export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

// Media Constraints
export const MEDIA_CONSTRAINTS = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
};

// Screen Share Constraints
export const SCREEN_CONSTRAINTS = {
  video: {
    cursor: 'always',
    displaySurface: 'monitor',
  },
  audio: false,
};

// Room Settings
export const MAX_USERS_PER_ROOM = 10;
export const RECONNECTION_ATTEMPTS = 3;
export const RECONNECTION_DELAY = 2000;
