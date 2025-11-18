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
      socketService.startScreenShare(roomId);

      // Handle screen share stop (user clicks browser's stop button)
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      setError(null);
      return stream;
    } catch (err) {
      console.error('Error starting screen share:', err);
      setError('Failed to start screen sharing');
      return null;
    }
  }, [roomId, setScreenStream, setIsScreenSharing]);

  // Stop screen share
  const stopScreenShare = useCallback(() => {
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
