import { create } from 'zustand';

export const useRoomStore = create((set, get) => ({
  // Room state
  roomId: null,
  isInRoom: false,
  users: [],
  
  // Local user state
  localStream: null,
  screenStream: null,
  isVideoOn: false,
  isAudioOn: false,
  isScreenSharing: false,
  
  // Remote streams
  remoteStreams: new Map(),
  
  // Socket state
  socketId: null,
  
  // Actions
  setRoomId: (roomId) => set({ roomId }),
  
  setIsInRoom: (isInRoom) => set({ isInRoom }),
  
  setUsers: (users) => set({ users }),
  
  addUser: (user) => set((state) => ({
    users: [...state.users, user],
  })),
  
  removeUser: (socketId) => set((state) => ({
    users: state.users.filter((u) => u.socketId !== socketId),
  })),
  
  updateUser: (socketId, updates) => set((state) => ({
    users: state.users.map((u) =>
      u.socketId === socketId ? { ...u, ...updates } : u
    ),
  })),
  
  setLocalStream: (stream) => set({ localStream: stream }),
  
  setScreenStream: (stream) => set({ screenStream: stream }),
  
  setIsVideoOn: (isVideoOn) => set({ isVideoOn }),
  
  setIsAudioOn: (isAudioOn) => set({ isAudioOn }),
  
  setIsScreenSharing: (isScreenSharing) => set({ isScreenSharing }),
  
  addRemoteStream: (socketId, stream) => set((state) => {
    const newStreams = new Map(state.remoteStreams);
    newStreams.set(socketId, stream);
    return { remoteStreams: newStreams };
  }),
  
  removeRemoteStream: (socketId) => set((state) => {
    const newStreams = new Map(state.remoteStreams);
    newStreams.delete(socketId);
    return { remoteStreams: newStreams };
  }),
  
  setSocketId: (socketId) => set({ socketId }),
  
  // Reset store
  reset: () => set({
    roomId: null,
    isInRoom: false,
    users: [],
    localStream: null,
    screenStream: null,
    isVideoOn: false,
    isAudioOn: false,
    isScreenSharing: false,
    remoteStreams: new Map(),
    socketId: null,
  }),
}));
