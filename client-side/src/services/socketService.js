import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('❌ Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join room
  joinRoom(roomId, userInfo) {
    if (!this.socket) return;
    this.socket.emit('join-room', { roomId, userInfo });
  }

  // Leave room
  leaveRoom(roomId) {
    if (!this.socket) return;
    this.socket.emit('leave-room', { roomId });
  }

  // WebRTC signaling
  sendOffer(roomId, targetSocketId, offer) {
    if (!this.socket) return;
    this.socket.emit('offer', { roomId, targetSocketId, offer });
  }

  sendAnswer(roomId, targetSocketId, answer) {
    if (!this.socket) return;
    this.socket.emit('answer', { roomId, targetSocketId, answer });
  }

  sendIceCandidate(roomId, targetSocketId, candidate) {
    if (!this.socket) return;
    this.socket.emit('ice-candidate', { roomId, targetSocketId, candidate });
  }

  // Stream controls
  toggleCamera(roomId, hasCamera) {
    if (!this.socket) return;
    this.socket.emit('toggle-camera', { roomId, hasCamera });
  }

  toggleMic(roomId, hasMic) {
    if (!this.socket) return;
    this.socket.emit('toggle-mic', { roomId, hasMic });
  }

  startScreenShare(roomId) {
    if (!this.socket) return;
    this.socket.emit('start-screen-share', { roomId });
  }

  stopScreenShare(roomId) {
    if (!this.socket) return;
    this.socket.emit('stop-screen-share', { roomId });
  }

  // Event listeners
  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  getSocketId() {
    return this.socket?.id;
  }

  isConnected() {
    return this.connected;
  }
}

export default new SocketService();
