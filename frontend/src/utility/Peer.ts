class PeerService {
  // peer: RTCPeerConnection;
  peers: Map<string, RTCPeerConnection>;
  constructor() {
    this.peers = new Map();
  }

  createPeerConnection(remoteUserId: string) {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
        {
          urls: "turn:global.relay.metered.ca:80",
          username: "webrtc",
          credential: "webrtc",
        },
      ],
    });
    this.peers.set(remoteUserId, peer);
    return peer;
  }

  getPeer(remoteUserId: string) {
    return this.peers.get(remoteUserId);
  }

  removePeer(remoteUserId: string) {
    const peer = this.peers.get(remoteUserId);
    if (peer) {
      peer.getSenders().forEach((sender)=>{
        try{
          peer.removeTrack(sender);
        }catch(err){
          console.warn(`Failed to remove track from ${remoteUserId}:`, err);
        }
      })
     
       peer.onicecandidate = null;
    peer.ontrack = null;
    peer.onsignalingstatechange = null;
    peer.onconnectionstatechange = null;
     peer.close();
    this.peers.delete(remoteUserId);
    }
  }

  addTrack(peer: RTCPeerConnection, stream: MediaStream) {
    if (peer.signalingState === 'closed') {
    console.error('Cannot add track: Peer connection is closed');
    return;
  }
    stream.getTracks().forEach((track) => {
      const existingSender = peer.getSenders().find(sender => 
      sender.track === track
    );
    if(!existingSender){
      peer.addTrack(track, stream);
    }
    });
  }
  async getOffer(remoteUserId: string): Promise<RTCSessionDescriptionInit> {
    const peer = this.getPeer(remoteUserId);
    if (peer) {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
    throw new Error("Peer connection not initialized");
  }

  async getAnswer(remoteUserId: string): Promise<RTCSessionDescriptionInit> {
    const peer = this.getPeer(remoteUserId);
    if (peer) {
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(new RTCSessionDescription(answer));
      return answer;
    }
    throw new Error("Peer connection not initialized");
  }

  async SetRemoteDescription(
    remoteUserId: string,
    ans: RTCSessionDescriptionInit
  ): Promise<void> {
    console.log("it's called ");
    const peer = this.getPeer(remoteUserId);
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async addIceCandidate(remoteUserId: string, candidate: RTCIceCandidate) {
    const peer = this.getPeer(remoteUserId);
    if (peer) {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  getAllPeers() {
    return Array.from(this.peers.entries());
  }

  clearAll() {
  this.peers.forEach((peer, remoteUserId) => {
    peer.getSenders().forEach((sender)=>{
      try {
          peer.removeTrack(sender);
        } catch (err) {
          console.warn(`Failed to remove track from ${remoteUserId}:`, err);
        }
    });
     peer.close();
  });
  this.peers.clear();
}
}

export default new PeerService();
