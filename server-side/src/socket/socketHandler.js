import roomManager from '../services/roomManager.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Join room
    socket.on('join-room', ({ roomId, userInfo }) => {
      try {
        // Leave any previous room
        const previousRoom = roomManager.getUserRoom(socket.id);
        if (previousRoom) {
          socket.leave(previousRoom);
          const remainingUsers = roomManager.removeUser(previousRoom, socket.id);
          socket.to(previousRoom).emit('user-left', {
            socketId: socket.id,
            users: remainingUsers,
          });
        }

        // Join new room
        socket.join(roomId);
        const users = roomManager.addUser(roomId, socket.id, userInfo || {});

        // Send room info to the joining user
        socket.emit('room-joined', {
          roomId,
          socketId: socket.id,
          users: users.filter(u => u.socketId !== socket.id), // Exclude self
        });

        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
          user: users.find(u => u.socketId === socket.id),
          users,
        });

        console.log(`👤 User ${socket.id} joined room: ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // WebRTC Signaling - Send offer
    socket.on('offer', ({ roomId, targetSocketId, offer }) => {
      try {
        if (roomManager.isUserInRoom(roomId, socket.id)) {
          socket.to(targetSocketId).emit('offer', {
            offer,
            fromSocketId: socket.id,
          });
          console.log(`📤 Offer sent from ${socket.id} to ${targetSocketId}`);
        }
      } catch (error) {
        console.error('Error sending offer:', error);
      }
    });

    // WebRTC Signaling - Send answer
    socket.on('answer', ({ roomId, targetSocketId, answer }) => {
      try {
        if (roomManager.isUserInRoom(roomId, socket.id)) {
          socket.to(targetSocketId).emit('answer', {
            answer,
            fromSocketId: socket.id,
          });
          console.log(`📤 Answer sent from ${socket.id} to ${targetSocketId}`);
        }
      } catch (error) {
        console.error('Error sending answer:', error);
      }
    });

    // WebRTC Signaling - ICE candidate
    socket.on('ice-candidate', ({ roomId, targetSocketId, candidate }) => {
      try {
        if (roomManager.isUserInRoom(roomId, socket.id)) {
          socket.to(targetSocketId).emit('ice-candidate', {
            candidate,
            fromSocketId: socket.id,
          });
        }
      } catch (error) {
        console.error('Error sending ICE candidate:', error);
      }
    });

    // Toggle camera
    socket.on('toggle-camera', ({ roomId, hasCamera }) => {
      try {
        const user = roomManager.updateUserState(roomId, socket.id, { hasCamera });
        if (user) {
          socket.to(roomId).emit('user-camera-toggled', {
            socketId: socket.id,
            hasCamera,
          });
          console.log(`📹 User ${socket.id} camera: ${hasCamera}`);
        }
      } catch (error) {
        console.error('Error toggling camera:', error);
      }
    });

    // Toggle microphone
    socket.on('toggle-mic', ({ roomId, hasMic }) => {
      try {
        const user = roomManager.updateUserState(roomId, socket.id, { hasMic });
        if (user) {
          socket.to(roomId).emit('user-mic-toggled', {
            socketId: socket.id,
            hasMic,
          });
          console.log(`🎤 User ${socket.id} mic: ${hasMic}`);
        }
      } catch (error) {
        console.error('Error toggling mic:', error);
      }
    });

    // Start screen share
    socket.on('start-screen-share', ({ roomId }) => {
      try {
        const user = roomManager.updateUserState(roomId, socket.id, { hasScreen: true });
        if (user) {
          socket.to(roomId).emit('user-screen-share-started', {
            socketId: socket.id,
            userName: user.userName,
          });
          console.log(`🖥️ User ${socket.id} started screen sharing`);
        }
      } catch (error) {
        console.error('Error starting screen share:', error);
      }
    });

    // Stop screen share
    socket.on('stop-screen-share', ({ roomId }) => {
      try {
        const user = roomManager.updateUserState(roomId, socket.id, { hasScreen: false });
        if (user) {
          socket.to(roomId).emit('user-screen-share-stopped', {
            socketId: socket.id,
          });
          console.log(`🖥️ User ${socket.id} stopped screen sharing`);
        }
      } catch (error) {
        console.error('Error stopping screen share:', error);
      }
    });

    // Leave room
    socket.on('leave-room', ({ roomId }) => {
      try {
        handleUserLeave(socket, roomId);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      try {
        const roomId = roomManager.getUserRoom(socket.id);
        if (roomId) {
          handleUserLeave(socket, roomId);
        }
        console.log(`❌ User disconnected: ${socket.id}`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // Helper function to handle user leaving
    function handleUserLeave(socket, roomId) {
      socket.leave(roomId);
      const users = roomManager.removeUser(roomId, socket.id);
      
      if (users) {
        socket.to(roomId).emit('user-left', {
          socketId: socket.id,
          users,
        });
      }
      
      console.log(`👋 User ${socket.id} left room: ${roomId}`);
    }
  });
};
