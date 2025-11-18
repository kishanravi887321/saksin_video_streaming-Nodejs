// Room management service
class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  // Create or get a room
  getRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        roomId,
        users: new Map(),
        createdAt: new Date(),
      });
    }
    return this.rooms.get(roomId);
  }

  // Add user to room
  addUser(roomId, socketId, userInfo) {
    const room = this.getRoom(roomId);
    room.users.set(socketId, {
      socketId,
      userId: userInfo.userId || socketId,
      userName: userInfo.userName || 'Anonymous',
      hasCamera: false,
      hasMic: false,
      hasScreen: false,
      joinedAt: new Date(),
    });
    return this.getRoomUsers(roomId);
  }

  // Remove user from room
  removeUser(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.users.delete(socketId);
      // Clean up empty rooms
      if (room.users.size === 0) {
        this.rooms.delete(roomId);
        return null;
      }
      return this.getRoomUsers(roomId);
    }
    return null;
  }

  // Update user stream state
  updateUserState(roomId, socketId, state) {
    const room = this.rooms.get(roomId);
    if (room && room.users.has(socketId)) {
      const user = room.users.get(socketId);
      Object.assign(user, state);
      return user;
    }
    return null;
  }

  // Get all users in a room
  getRoomUsers(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      return Array.from(room.users.values());
    }
    return [];
  }

  // Get user's current room
  getUserRoom(socketId) {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.users.has(socketId)) {
        return roomId;
      }
    }
    return null;
  }

  // Get room info
  getRoomInfo(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      return {
        roomId: room.roomId,
        userCount: room.users.size,
        users: this.getRoomUsers(roomId),
        createdAt: room.createdAt,
      };
    }
    return null;
  }

  // Check if user is in room
  isUserInRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    return room ? room.users.has(socketId) : false;
  }
}

export default new RoomManager();
