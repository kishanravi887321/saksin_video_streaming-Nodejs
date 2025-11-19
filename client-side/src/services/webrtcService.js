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
      // Optimize for video quality and bandwidth
      sdpSemantics: 'unified-plan',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    });

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log('📥 Received track from:', socketId, 'Track kind:', event.track.kind);
      console.log('📥 Stream ID:', event.streams[0]?.id);
      if (onTrackCallback) {
        // Pass the stream to the callback
        // The stream will contain all tracks (video, audio, screen)
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
        // Try to restart ICE before closing
        console.log('Attempting ICE restart for:', socketId);
        peerConnection.restartIce();
      } else if (peerConnection.connectionState === 'closed') {
        console.log('Connection closed with:', socketId);
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
    try {
      const peerConnection = this.peerConnections.get(socketId);
      if (peerConnection) {
        peerConnection.close();
        this.peerConnections.delete(socketId);
      }
    } catch (error) {
      console.error('Error closing peer connection:', socketId, error);
    }
  }

  // Close all peer connections
  closeAllConnections() {
    try {
      this.peerConnections.forEach((pc, socketId) => {
        try {
          pc.close();
        } catch (error) {
          console.error('Error closing peer connection:', socketId, error);
        }
      });
      this.peerConnections.clear();
    } catch (error) {
      console.error('Error closing all connections:', error);
    }
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
    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (error) {
            console.error('Error stopping track:', error);
          }
        });
        this.localStream = null;
      }
    } catch (error) {
      console.error('Error stopping local stream:', error);
    }
  }

  // Stop screen stream
  stopScreenStream() {
    try {
      if (this.screenStream) {
        this.screenStream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (error) {
            console.error('Error stopping screen track:', error);
          }
        });
        this.screenStream = null;
      }
    } catch (error) {
      console.error('Error stopping screen stream:', error);
    }
  }

  // Cleanup
  cleanup() {
    try {
      this.closeAllConnections();
      this.stopLocalStream();
      this.stopScreenStream();
    } catch (error) {
      console.error('Error during WebRTC cleanup:', error);
    }
  }
}

export default new WebRTCService();
