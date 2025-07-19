# 🚨 STUDENT NOTE: This file is OPTIONAL troubleshooting reference
# 
# Your app should work fine without these fixes!
# Only use these if you encounter specific problems during testing.
# 
# Delete this file if you want to keep things simple.

---

# Quick Fixes for Common Issues

## If Socket Connection Fails
```typescript
// In getSocket.ts - add connection timeout
const socket = io('http://localhost:8000', {
  timeout: 10000, // 10 seconds
  // ...existing options
});
```

## If WebRTC Doesn't Start After Reload
```typescript
// In page.tsx - add retry mechanism
const shouldStart = localStorage.getItem('webrtc:start');
if (shouldStart === 'true') {
  localStorage.removeItem('webrtc:start');
  
  // Retry if socket not ready
  const startWebRTC = () => {
    if (socket?.connected) {
      socket.emit('webrtc:start', { roomId, ownUserId: mainUserId });
    } else {
      setTimeout(startWebRTC, 500);
    }
  };
  startWebRTC();
}
```

## If ICE Candidates Fail
```typescript
// In handleStartCalling - add ICE candidate buffering
const iceCandidateBuffer = [];
peer.onicecandidate = (e) => {
  if (e.candidate) {
    // Buffer candidates if not connected
    if (socket?.connected) {
      socket.emit('icecandidate-check', {
        to: RemotesocketId,
        candidate: e.candidate,
        requesterId: ownUserId,
      });
    } else {
      iceCandidateBuffer.push(e.candidate);
    }
  }
};
```

## If Audio Doesn't Work
```typescript
// Check browser console for these errors:
// - "getUserMedia failed" → Permission issue
// - "ICE connection failed" → Network/firewall issue
// - "setRemoteDescription failed" → WebRTC handshake issue
```
