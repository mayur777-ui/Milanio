class PeerService {
  peers: Map<string, RTCPeerConnection>;
  private iceCandidateQueues: Map<string, RTCIceCandidateInit[]>;

  constructor() {
    this.peers = new Map();
    this.iceCandidateQueues = new Map();
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
      peer.getSenders().forEach((sender) => {
        try {
          peer.removeTrack(sender);
        } catch (err) {
          console.warn(`Failed to remove track from ${remoteUserId}:`, err);
        }
      });

      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.onsignalingstatechange = null;
      peer.onconnectionstatechange = null;
      peer.close();
      this.peers.delete(remoteUserId);
      this.iceCandidateQueues.delete(remoteUserId);
    }
  }

  addTrack(peer: RTCPeerConnection, stream: MediaStream) {
    if (peer.signalingState === "closed") {
      console.error("Cannot add track: Peer connection is closed");
      return;
    }
    stream.getTracks().forEach((track) => {
      const existingSender = peer
        .getSenders()
        .find((sender) => sender.track === track);
      if (!existingSender) {
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

  // 🛡️ RFC 8829: Set remote session description AND drain any queued candidates
  async SetRemoteDescription(
    remoteUserId: string,
    desc: RTCSessionDescriptionInit
  ): Promise<void> {
    const peer = this.getPeer(remoteUserId);
    if (!peer) {
      console.warn(`Cannot set remote description: peer ${remoteUserId} not found`);
      return;
    }

    await peer.setRemoteDescription(new RTCSessionDescription(desc));

    //Drain all buffered ICE candidates that arrived before remoteDescription was set
    const queued = this.iceCandidateQueues.get(remoteUserId) || [];
    if (queued.length > 0) {
      while (queued.length > 0) {
        const candidate = queued.shift()!;
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn(`Failed to apply queued ICE candidate for ${remoteUserId}:`, err);
        }
      }
    }
    this.iceCandidateQueues.delete(remoteUserId);
  }

  //RFC 8829: Buffer candidate if remoteDescription is not yet set; apply immediately if ready
  async addIceCandidate(remoteUserId: string, candidate: RTCIceCandidateInit) {
    if (!candidate) return;
    const peer = this.getPeer(remoteUserId);

    if (!peer || !peer.remoteDescription) {
      const queue = this.iceCandidateQueues.get(remoteUserId) || [];
      queue.push(candidate);
      this.iceCandidateQueues.set(remoteUserId, queue);
      return;
    }

    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn(`Failed to add ICE candidate for ${remoteUserId}:`, err);
    }
  }

  getAllPeers() {
    return Array.from(this.peers.entries());
  }

  clearAll() {
    this.peers.forEach((peer, remoteUserId) => {
      peer.getSenders().forEach((sender) => {
        try {
          peer.removeTrack(sender);
        } catch (err) {
          console.warn(`Failed to remove track from ${remoteUserId}:`, err);
        }
      });
      peer.close();
    });
    this.peers.clear();
    this.iceCandidateQueues.clear();
  }
}

export default new PeerService();
