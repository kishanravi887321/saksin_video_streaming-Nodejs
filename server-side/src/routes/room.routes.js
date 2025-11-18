import express from 'express';
import roomManager from '../services/roomManager.js';

const router = express.Router();

// Get room info
router.get('/:roomId', (req, res) => {
  try {
    console.log("Fetching info for room:", req.params.roomId);
    const { roomId } = req.params;
    const roomInfo = roomManager.getRoomInfo(roomId);
    
    if (roomInfo) {
      res.json({
        success: true,
        data: roomInfo,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Check if room exists
router.get('/:roomId/exists', (req, res) => {
  try {
    const { roomId } = req.params;
    const exists = roomManager.getRoomInfo(roomId) !== null;
    
    res.json({
      success: true,
      exists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
