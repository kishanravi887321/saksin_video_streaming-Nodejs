# 🚀 Quick Start Guide

## Start the Application in 3 Steps

### Step 1: Start Backend Server
```bash
cd server-side
npm run dev
```
✅ Server running on `http://localhost:5002`

### Step 2: Start Frontend (New Terminal)
```bash
cd client-side
npm run dev
```
✅ Client running on `http://localhost:3000`

### Step 3: Open Browser
- Go to `http://localhost:3000`
- Enter your name
- Click "Create New" for room ID
- Click "Join Room"
- Share room ID with friends!

---

## Testing Locally (Multiple Users)

### Option 1: Multiple Browser Windows
1. Open `http://localhost:3000` in Chrome
2. Open `http://localhost:3000` in Firefox (or Chrome Incognito)
3. Use the same room ID
4. Both users can see each other!

### Option 2: Multiple Tabs (Same Browser)
1. Join room in first tab
2. Open new tab → `http://localhost:3000`
3. Join same room ID
4. Video will work between tabs

---

## Common Issues & Solutions

### ❌ Port Already in Use
```bash
# Kill process on port 5002
netstat -ano | findstr :5002
taskkill /PID <PID> /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### ❌ Camera/Mic Not Working
- Check browser permissions
- Allow camera/mic access when prompted
- Try different browser (Chrome recommended)

### ❌ Can't Connect to Other User
- Both users must be on same network OR
- Use TURN server for different networks
- Check firewall settings

### ❌ Redis Connection Error
- Redis is optional for basic functionality
- Comment out Redis code if not needed
- Or set up free Upstash account

---

## Environment Setup

### Backend `.env` (root folder):
```env
PORT=5002
CLIENT_URL=http://localhost:3000

# Optional - Redis
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
```

### Frontend `.env` (client-side folder):
```env
VITE_API_URL=http://localhost:5002
VITE_SOCKET_URL=http://localhost:5002
```

---

## Feature Testing Checklist

- [ ] Join room
- [ ] See your video
- [ ] Toggle camera on/off
- [ ] Toggle mic on/off
- [ ] Share screen
- [ ] Join with second user
- [ ] See remote video
- [ ] Leave room

---

## Browser Compatibility

✅ **Best Experience:**
- Chrome (Desktop/Mobile)
- Edge
- Brave

⚠️ **Limited Support:**
- Firefox (some features)
- Safari (iOS 11+)

❌ **Not Supported:**
- Internet Explorer
- Opera Mini

---

## Project Structure Quick Reference

```
SaksinVideosharing/
├── server-side/          # Backend (Node.js + Socket.io)
│   ├── src/
│   │   ├── socket/       # WebRTC signaling
│   │   ├── services/     # Room management
│   │   ├── routes/       # API endpoints
│   │   └── db/           # Redis (optional)
│   └── package.json
│
├── client-side/          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Home, Room
│   │   ├── services/     # Socket, WebRTC
│   │   ├── hooks/        # useMedia, useRoom
│   │   └── store/        # Zustand state
│   └── package.json
│
└── .env                  # Environment variables
```

---

## Development Tips

### Hot Reload:
- Both servers have hot reload
- Save file → Auto refresh
- No manual restart needed

### Debugging:
- Open browser DevTools (F12)
- Check Console for logs
- Network tab for Socket.io
- Application → Storage for data

### Adding Features:
1. Create component in `/components`
2. Add state to store if needed
3. Create custom hook for logic
4. Integrate in page

---

## Performance Tips

### For Better Video Quality:
```javascript
// In config/constants.js
video: {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  frameRate: { ideal: 60 },
}
```

### For Lower Bandwidth:
```javascript
video: {
  width: { ideal: 640 },
  height: { ideal: 480 },
  frameRate: { ideal: 15 },
}
```

---

## Security Reminders

⚠️ **Before Production:**
- [ ] Add user authentication
- [ ] Implement room passwords
- [ ] Use HTTPS
- [ ] Enable CORS properly
- [ ] Add rate limiting
- [ ] Validate all inputs
- [ ] Set up TURN server

---

## Need Help?

📚 **Documentation:**
- `README.md` - Full project guide
- `PROJECT_STRUCTURE.md` - Frontend architecture
- `IMPLEMENTATION.md` - Build details

🐛 **Issues:**
- Check browser console
- Verify both servers running
- Test camera/mic permissions
- Try different browser

💡 **Tips:**
- Start simple - test with 2 users first
- Use Chrome DevTools extensively
- Read WebRTC/Socket.io docs
- Check network connectivity

---

**You're all set! Start building amazing video features! 🎉**
