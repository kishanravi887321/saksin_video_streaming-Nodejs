import { ICE_SERVERS } from '../config/constants';

class WebRTCService {
  constructor() {
    this.peerConnections = new Map();
    this.localStream = null;
    this.screenStream = null;
  }

  // Create peer connection
  createPeerConnection(socketId, onTrackCallback, onIceCandidateCallback) {
    if (this.peerConnections.has(socketId)) {
      return this.peerConnections.get(socketId);
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    });

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log('📥 Received track from:', socketId);
      if (onTrackCallback) {
        onTrackCallback(socketId, event.streams[0]);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && onIceCandidateCallback) {
        onIceCandidateCallback(socketId, event.candidate);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Peer ${socketId} state:`, peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'failed') {
        console.error('Connection failed with:', socketId);
        this.closePeerConnection(socketId);
      }
    };

    this.peerConnections.set(socketId, peerConnection);
    return peerConnection;
  }

  // Add local tracks to peer connection
  addLocalTracks(socketId) {
    const peerConnection = this.peerConnections.get(socketId);
    if (!peerConnection || !this.localStream) return;

    this.localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, this.localStream);
    });
  }

  // Add screen share tracks to peer connection
  addScreenTracks(socketId) {
    const peerConnection = this.peerConnections.get(socketId);
    if (!peerConnection || !this.screenStream) return;

    this.screenStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, this.screenStream);
    });
  }

  // Create and send offer
  async createOffer(socketId) {
    const peerConnection = this.peerConnections.get(socketId);
    if (!peerConnection) return null;

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      return null;
    }
  }

  // Create and send answer
  async createAnswer(socketId, offer) {
    const peerConnection = this.peerConnections.get(socketId);
    if (!peerConnection) return null;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      return null;
    }
  }

  // Handle received answer
  async handleAnswer(socketId, answer) {
    const peerConnection = this.peerConnections.get(socketId);
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  // Add ICE candidate
  async addIceCandidate(socketId, candidate) {
    const peerConnection = this.peerConnections.get(socketId);
    if (!peerConnection) return;

    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  // Close specific peer connection
  closePeerConnection(socketId) {
    const peerConnection = this.peerConnections.get(socketId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(socketId);
    }
  }

  // Close all peer connections
  closeAllConnections() {
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
  }

  // Set local stream
  setLocalStream(stream) {
    this.localStream = stream;
  }

  // Get local stream
  getLocalStream() {
    return this.localStream;
  }

  // Set screen stream
  setScreenStream(stream) {
    this.screenStream = stream;
  }

  // Get screen stream
  getScreenStream() {
    return this.screenStream;
  }

  // Stop local stream
  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  // Stop screen stream
  stopScreenStream() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }
  }

  // Cleanup
  cleanup() {
    this.closeAllConnections();
    this.stopLocalStream();
    this.stopScreenStream();
  }
}

export default new WebRTCService();
