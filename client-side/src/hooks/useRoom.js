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
    if (roomId) {
      socketService.leaveRoom(roomId);
      webrtcService.cleanup();
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

      // Create peer connections for existing users
      users.forEach((user) => {
        const pc = webrtcService.createPeerConnection(
          user.socketId,
          handleRemoteTrack,
          handleIceCandidate
        );
        webrtcService.addLocalTracks(user.socketId);

        // Create and send offer
        webrtcService.createOffer(user.socketId).then((offer) => {
          if (offer) {
            socketService.sendOffer(roomId, user.socketId, offer);
          }
        });
      });
    };

    // New user joined
    const handleUserJoined = ({ user, users }) => {
      console.log('User joined:', user);
      addUser(user);
      setUsers(users);
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
        pc = webrtcService.createPeerConnection(
          fromSocketId,
          handleRemoteTrack,
          handleIceCandidate
        );
        webrtcService.addLocalTracks(fromSocketId);
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
