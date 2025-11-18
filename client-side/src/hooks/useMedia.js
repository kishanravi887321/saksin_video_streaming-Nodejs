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
        
        // Add screen tracks to existing peer connections  
        const screenTrack = stream.getVideoTracks()[0];
        if (screenTrack) {
          try {
            // Check if we already have a video sender
            const senders = pc.getSenders();
            console.log('📤 Existing senders:', senders.length);
            
            const sender = pc.addTrack(screenTrack, stream);
            console.log('✅ Added screen track, sender:', sender.track?.id);
          } catch (error) {
            console.error('❌ Error adding track:', error);
          }
        }
        
        // Renegotiate connection
        try {
          console.log('📤 Creating offer for:', socketId);
          const offer = await webrtcService.createOffer(socketId);
          if (offer) {
            console.log('📤 Sending renegotiation offer to:', socketId);
            console.log('📤 Offer SDP length:', offer.sdp?.length);
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
