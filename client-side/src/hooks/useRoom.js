import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import webrtcService from '../services/webrtcService';
import { useRoomStore } from '../store/roomStore';

export const useRoom = () => {
  const navigate = useNavigate();
  const {
    roomId,
    users,
    setRoomId,
    setIsInRoom,
    setUsers,
    addUser,
    removeUser,
    updateUser,
    addRemoteStream,
    removeRemoteStream,
    setSocketId,
    reset,
  } = useRoomStore();

  // Join room
  const joinRoom = useCallback(
    (roomId, userInfo) => {
      socketService.connect();
      socketService.joinRoom(roomId, userInfo);
      setRoomId(roomId);
      setSocketId(socketService.getSocketId());
    },
    [setRoomId, setSocketId]
  );

  // Leave room
  const leaveRoom = useCallback(() => {
    try {
      if (roomId) {
        socketService.leaveRoom(roomId);
      }
      webrtcService.cleanup();
      reset();
      navigate('/');
    } catch (error) {
      console.error('Error leaving room:', error);
      // Still reset and navigate even if there's an error
      reset();
      navigate('/');
    }
  }, [roomId, reset, navigate]);

  // Handle socket events
  useEffect(() => {
    if (!roomId) return;

    // Room joined successfully
    const handleRoomJoined = ({ socketId, users }) => {
      console.log('Room joined:', socketId);
      setIsInRoom(true);
      setUsers(users);
      setSocketId(socketId);

      // Create peer connections for existing users (screen share only mode)
      users.forEach((user) => {
        const pc = webrtcService.createPeerConnection(
          user.socketId,
          handleRemoteTrack,
          handleIceCandidate
        );
        
        // Add screen tracks if available
        const screenStream = webrtcService.getScreenStream();
        if (screenStream) {
          webrtcService.addScreenTracks(user.socketId);
        }

        // Always create and send offer to establish connection
        // (even without initial tracks, for future screen sharing)
        webrtcService.createOffer(user.socketId).then((offer) => {
          if (offer) {
            socketService.sendOffer(roomId, user.socketId, offer);
          }
        });
      });
    };

    // New user joined - they will send us an offer
    const handleUserJoined = ({ user, users }) => {
      console.log('User joined:', user);
      addUser(user);
      setUsers(users);
      // Note: The new user will send us an offer, we'll handle it in handleOffer
    };

    // User left
    const handleUserLeft = ({ socketId, users }) => {
      console.log('User left:', socketId);
      removeUser(socketId);
      removeRemoteStream(socketId);
      webrtcService.closePeerConnection(socketId);
      setUsers(users);
    };

    // Received offer
    const handleOffer = async ({ offer, fromSocketId }) => {
      console.log('Received offer from:', fromSocketId);
      
      // Get or create peer connection
      let pc = webrtcService.peerConnections.get(fromSocketId);
      
      if (!pc) {
        console.log('Creating new peer connection for:', fromSocketId);
        pc = webrtcService.createPeerConnection(
          fromSocketId,
          handleRemoteTrack,
          handleIceCandidate
        );
        
        // Add screen tracks if we're currently sharing
        const screenStream = webrtcService.getScreenStream();
        if (screenStream) {
          console.log('Adding our screen tracks to new connection');
          webrtcService.addScreenTracks(fromSocketId);
        }
      } else {
        console.log('Renegotiating with existing peer:', fromSocketId);
        // For renegotiation, the remote peer is adding/removing tracks
        // We don't need to add our tracks again here
      }

      const answer = await webrtcService.createAnswer(fromSocketId, offer);
      if (answer) {
        socketService.sendAnswer(roomId, fromSocketId, answer);
      }
    };

    // Received answer
    const handleAnswer = ({ answer, fromSocketId }) => {
      console.log('Received answer from:', fromSocketId);
      webrtcService.handleAnswer(fromSocketId, answer);
    };

    // Received ICE candidate
    const handleIceCandidateReceived = ({ candidate, fromSocketId }) => {
      webrtcService.addIceCandidate(fromSocketId, candidate);
    };

    // User toggled camera
    const handleUserCameraToggled = ({ socketId, hasCamera }) => {
      updateUser(socketId, { hasCamera });
    };

    // User toggled mic
    const handleUserMicToggled = ({ socketId, hasMic }) => {
      updateUser(socketId, { hasMic });
    };

    // User started screen share
    const handleUserScreenShareStarted = async ({ socketId, userName }) => {
      console.log('🖥️ User started screen share:', socketId, userName);
      updateUser(socketId, { hasScreen: true });
      
      // The screen tracks will come through renegotiation
      // Just wait for the new offer with screen tracks
      console.log('🖥️ Waiting for screen share tracks from:', socketId);
    };

    // User stopped screen share
    const handleUserScreenShareStopped = ({ socketId }) => {
      console.log('User stopped screen share:', socketId);
      updateUser(socketId, { hasScreen: false });
    };

    // Remote track handler
    const handleRemoteTrack = (socketId, stream) => {
      console.log('🎬 Remote track received from:', socketId);
      console.log('🎬 Stream ID:', stream.id);
      console.log('🎬 Stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.id}`));
      addRemoteStream(socketId, stream);
    };

    // ICE candidate handler
    const handleIceCandidate = (socketId, candidate) => {
      socketService.sendIceCandidate(roomId, socketId, candidate);
    };

    // Register socket event listeners
    socketService.on('room-joined', handleRoomJoined);
    socketService.on('user-joined', handleUserJoined);
    socketService.on('user-left', handleUserLeft);
    socketService.on('offer', handleOffer);
    socketService.on('answer', handleAnswer);
    socketService.on('ice-candidate', handleIceCandidateReceived);
    socketService.on('user-camera-toggled', handleUserCameraToggled);
    socketService.on('user-mic-toggled', handleUserMicToggled);
    socketService.on('user-screen-share-started', handleUserScreenShareStarted);
    socketService.on('user-screen-share-stopped', handleUserScreenShareStopped);

    // Cleanup
    return () => {
      socketService.off('room-joined', handleRoomJoined);
      socketService.off('user-joined', handleUserJoined);
      socketService.off('user-left', handleUserLeft);
      socketService.off('offer', handleOffer);
      socketService.off('answer', handleAnswer);
      socketService.off('ice-candidate', handleIceCandidateReceived);
      socketService.off('user-camera-toggled', handleUserCameraToggled);
      socketService.off('user-mic-toggled', handleUserMicToggled);
      socketService.off('user-screen-share-started', handleUserScreenShareStarted);
      socketService.off('user-screen-share-stopped', handleUserScreenShareStopped);
    };
  }, [
    roomId,
    addUser,
    removeUser,
    updateUser,
    addRemoteStream,
    removeRemoteStream,
    setIsInRoom,
    setUsers,
    setSocketId,
  ]);

  return {
    roomId,
    users,
    joinRoom,
    leaveRoom,
  };
};
