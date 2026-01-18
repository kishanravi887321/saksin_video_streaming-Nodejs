import { useState, useCallback } from 'react';
import { MEDIA_CONSTRAINTS, SCREEN_CONSTRAINTS } from '../config/constants';
import { useRoomStore } from '../store/roomStore';
import webrtcService from '../services/webrtcService';
import socketService from '../services/socketService';

export const useMedia = () => {
  const [error, setError] = useState(null);
  const {
    setLocalStream,
    setScreenStream,
    setIsVideoOn,
    setIsAudioOn,
    setIsScreenSharing,
    roomId,
  } = useRoomStore();

  // Start camera and microphone
  const startMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      setLocalStream(stream);
      webrtcService.setLocalStream(stream);
      setIsVideoOn(true);
      setIsAudioOn(true);
      setError(null);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Failed to access camera/microphone');
      return null;
    }
  }, [setLocalStream, setIsVideoOn, setIsAudioOn]);

  // Stop media
  const stopMedia = useCallback(() => {
    webrtcService.stopLocalStream();
    setLocalStream(null);
    setIsVideoOn(false);
    setIsAudioOn(false);
  }, [setLocalStream, setIsVideoOn, setIsAudioOn]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    const stream = webrtcService.getLocalStream();
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
      socketService.toggleCamera(roomId, videoTrack.enabled);
    }
  }, [roomId, setIsVideoOn]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    const stream = webrtcService.getLocalStream();
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioOn(audioTrack.enabled);
      socketService.toggleMic(roomId, audioTrack.enabled);
    }
  }, [roomId, setIsAudioOn]);

  // Start screen share
  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia(SCREEN_CONSTRAINTS);
      setScreenStream(stream);
      webrtcService.setScreenStream(stream);
      setIsScreenSharing(true);
      
      console.log('🖥️ Starting screen share with stream ID:', stream.id);
      console.log('🖥️ Screen tracks:', stream.getTracks().map(t => `${t.kind}: ${t.id}`));
      
      // Send screen share tracks to all peers
      const peerConnections = webrtcService.peerConnections;
      console.log('🖥️ Number of peer connections:', peerConnections.size);
      
      for (const [socketId, pc] of peerConnections) {
        console.log('📤 Processing peer:', socketId);
        console.log('📤 Connection state:', pc.connectionState);
        
        // Only proceed if connection is established or connecting
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          console.log('⚠️ Skipping peer with failed/closed connection:', socketId);
          continue;
        }
        
        // Wait for connection to be established if it's still connecting
        if (pc.connectionState === 'new' || pc.connectionState === 'connecting') {
          console.log('⏳ Waiting for connection to establish:', socketId);
          await new Promise((resolve) => {
            const checkConnection = () => {
              if (pc.connectionState === 'connected') {
                resolve();
              } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                console.log('❌ Connection failed while waiting:', socketId);
                resolve();
              } else {
                setTimeout(checkConnection, 100);
              }
            };
            checkConnection();
          });
        }
        
        // Check again after waiting
        if (pc.connectionState !== 'connected') {
          console.log('⚠️ Connection not ready, skipping:', socketId);
          continue;
        }
        
        // Add screen tracks to existing peer connections  
        const screenTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        
        if (screenTrack) {
          try {
            pc.addTrack(screenTrack, stream);
            console.log('✅ Added screen video track');
          } catch (error) {
            console.error('❌ Error adding screen video track:', error);
            continue;
          }
        }
        
        if (audioTrack) {
          try {
            pc.addTrack(audioTrack, stream);
            console.log('✅ Added screen audio track');
          } catch (error) {
            console.error('❌ Error adding screen audio track:', error);
          }
        }
        
        // Renegotiate connection
        try {
          console.log('📤 Creating offer for:', socketId);
          const offer = await webrtcService.createOffer(socketId);
          if (offer) {
            console.log('📤 Sending renegotiation offer to:', socketId);
            socketService.sendOffer(roomId, socketId, offer);
          }
        } catch (error) {
          console.error('❌ Error renegotiating with peer:', socketId, error);
        }
      }
      
      // Notify server
      console.log('📤 Notifying server of screen share start');
      socketService.startScreenShare(roomId);

      // Handle screen share stop (user clicks browser's stop button)
      stream.getVideoTracks()[0].onended = () => {
        console.log('🛑 Screen share ended by user');
        stopScreenShare();
      };

      setError(null);
      return stream;
    } catch (err) {
      console.error('❌ Error starting screen share:', err);
      setError('Failed to start screen sharing');
      return null;
    }
  }, [roomId, setScreenStream, setIsScreenSharing]);

  // Stop screen share
  const stopScreenShare = useCallback(async () => {
    const screenStream = webrtcService.getScreenStream();
    if (!screenStream) return;
    
    // Remove screen tracks from all peer connections
    const peerConnections = webrtcService.peerConnections;
    for (const [socketId, pc] of peerConnections) {
      const senders = pc.getSenders();
      senders.forEach((sender) => {
        if (sender.track && screenStream.getTracks().includes(sender.track)) {
          pc.removeTrack(sender);
        }
      });
      
      // Renegotiate connection
      const offer = await webrtcService.createOffer(socketId);
      if (offer) {
        socketService.sendOffer(roomId, socketId, offer);
      }
    }
    
    webrtcService.stopScreenStream();
    setScreenStream(null);
    setIsScreenSharing(false);
    socketService.stopScreenShare(roomId);
  }, [roomId, setScreenStream, setIsScreenSharing]);

  return {
    startMedia,
    stopMedia,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    error,
  };
};
