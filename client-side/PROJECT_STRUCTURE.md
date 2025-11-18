# 🏗️ Project Structure - Modular React Video Call App

## 📁 Folder Organization

```
client-side/src/
│
├── 📱 components/          # Reusable UI Components
│   ├── VideoPlayer.jsx     # Video display component
│   ├── VideoPlayer.css
│   ├── Controls.jsx         # Call control buttons
│   └── Controls.css
│
├── 📄 pages/               # Page-level Components
│   ├── Home.jsx            # Landing/Join room page
│   ├── Home.css
│   ├── Room.jsx            # Main video call interface
│   └── Room.css
│
├── 🔧 services/            # External Services & APIs
│   ├── socketService.js    # Socket.io client wrapper
│   └── webrtcService.js    # WebRTC peer connection manager
│
├── 🪝 hooks/               # Custom React Hooks
│   ├── useMedia.js         # Media device controls
│   └── useRoom.js          # Room management logic
│
├── 🗄️ store/               # State Management (Zustand)
│   └── roomStore.js        # Global app state
│
├── ⚙️ config/              # Configuration
│   └── constants.js        # API URLs, WebRTC config
│
├── 🛠️ utils/               # Utility Functions
│   └── (future helpers)
│
├── App.jsx                 # Main app & routing
├── App.css                 # Global styles
└── main.jsx                # Entry point
```

## 🎯 Module Responsibilities

### Components (`/components`)
**Purpose:** Presentational, reusable UI elements
- Self-contained
- Accept props
- No direct state management
- Can be used across multiple pages

**Example:**
```jsx
<VideoPlayer stream={localStream} muted userName="John" />
<Controls onToggleVideo={...} isVideoOn={true} />
```

### Pages (`/pages`)
**Purpose:** Full page views with business logic
- Compose multiple components
- Use hooks for logic
- Handle routing
- Connected to store

**Pages:**
- `Home.jsx` - Room join interface
- `Room.jsx` - Video call interface

### Services (`/services`)
**Purpose:** External API integrations & complex logic
- Socket.io communication
- WebRTC peer management
- Singleton pattern
- No React dependencies

**Services:**
- `socketService.js` - Server communication
- `webrtcService.js` - P2P connections

### Hooks (`/hooks`)
**Purpose:** Reusable stateful logic
- Encapsulate complex functionality
- Return state and handlers
- Can use other hooks
- React-specific

**Hooks:**
- `useMedia()` - Camera/mic/screen control
- `useRoom()` - Room join/leave, user management

### Store (`/store`)
**Purpose:** Global state management
- Uses Zustand
- Single source of truth
- Actions and state in one place
- No boilerplate

**State:**
- Room info
- User list
- Streams (local/remote)
- UI state (video/audio on/off)

### Config (`/config`)
**Purpose:** Configuration constants
- API endpoints
- WebRTC settings
- Feature flags
- Environment variables

## 🔄 Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Custom Hook (useMedia/useRoom)
    ↓
Service (socketService/webrtcService)
    ↓
Server (Socket.io)
    ↓
WebRTC Peer Connection
    ↓
Store Update (Zustand)
    ↓
Component Re-render
```

## 🧩 Adding New Features

### Example: Adding Chat Feature

1. **Create Component**
   ```
   src/components/ChatPanel.jsx
   src/components/ChatPanel.css
   ```

2. **Add Store State**
   ```javascript
   // src/store/roomStore.js
   messages: [],
   addMessage: (msg) => set((state) => ({
     messages: [...state.messages, msg]
   }))
   ```

3. **Create Hook**
   ```javascript
   // src/hooks/useChat.js
   export const useChat = () => {
     const { addMessage } = useRoomStore();
     
     const sendMessage = (text) => {
       socketService.sendChatMessage(text);
     };
     
     return { sendMessage };
   };
   ```

4. **Update Service**
   ```javascript
   // src/services/socketService.js
   sendChatMessage(roomId, message) {
     this.socket.emit('chat-message', { roomId, message });
   }
   ```

5. **Integrate in Page**
   ```jsx
   // src/pages/Room.jsx
   import ChatPanel from '../components/ChatPanel';
   
   <ChatPanel />
   ```

## 🎨 Styling Strategy

- **Component-level CSS** - Each component has its own CSS file
- **CSS Modules** - Can be added for scoped styles
- **BEM naming** - Optional for larger projects
- **Responsive** - Mobile-first approach

## 🧪 Testing Strategy (Future)

```
src/
├── components/__tests__/
├── hooks/__tests__/
├── services/__tests__/
└── pages/__tests__/
```

## 📦 Dependencies

**Core:**
- `react` - UI library
- `react-router-dom` - Routing
- `socket.io-client` - Real-time communication
- `zustand` - State management

**Why Zustand?**
- Minimal boilerplate
- No context providers
- Great TypeScript support
- Easy to learn

## 🚀 Scalability

### Current Structure Supports:
- ✅ Multiple pages/features
- ✅ Code splitting
- ✅ Team collaboration
- ✅ Testing
- ✅ TypeScript migration

### Future Enhancements:
- Add `src/constants/` for magic strings
- Add `src/types/` for TypeScript
- Add `src/api/` for REST API calls
- Add `src/contexts/` if needed
- Add `src/layouts/` for shared layouts

## 💡 Best Practices

1. **Keep components small** - Single responsibility
2. **Extract logic to hooks** - Reusability
3. **Services are stateless** - Pure business logic
4. **Store is single source** - No prop drilling
5. **Config is centralized** - Easy updates

## 🔍 Code Organization Rules

- **Components** - Export default
- **Hooks** - Named exports
- **Services** - Singleton default export
- **Utils** - Named exports
- **Store** - Named exports

This structure ensures the app is:
- 📖 **Readable** - Clear file organization
- 🔧 **Maintainable** - Easy to find and update code
- 🧪 **Testable** - Isolated, pure functions
- 📈 **Scalable** - Can grow without refactoring
- 👥 **Team-friendly** - Clear conventions
