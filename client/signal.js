import mitt from "mitt";
import Peer from "./peer";

class Signal {
  constructor(options) {
    if (!options.wsUrl) {
      throw "wsUrl is not supported";
    }

    this.id = null;
    this.peers = new Map();
    this.emitter = mitt();
    this.ws = new WebSocket(options.wsUrl);

    this.ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const { type, senderId, payload } = data;

      // 只广播welcome和offer，其他都是定向emit
      if (["welcome", "offer"].includes(type)) {
        this.emitter.emit(type, {
          senderId,
          payload,
        });
      }
      this.emitter.emit(`${senderId}-${type}`, {
        senderId,
        payload,
      });

      this.emitter.on("welcome", ({ senderId, payload: id }) => {
        this.id = id;
      });
    };

    return this;
  }

  on(name, func) {
    this.emitter.on(name, func.bind(this));
    return this;
  }

  getId() {
    return this.id;
  }

  createPeer(targetId, handlePeer) {
    if (this.peers.get(targetId)) {
      return handlePeer(this.peers.get(targetId));
    }
    let currentPeer = new RTCPeerConnection({
      iceServers: [{ urls: stunUrl }],
    });

    currentPeer = handlePeer(currentPeer) || currentPeer;

    this.peers.set(targetId, currentPeer);

    currentPeer.onicecandidate = ({ candidate }) => {
      if (candidate) {
        this.sendCandidate(targetId, candidate);
      }
    };

    currentPeer.onconnectionstatechange = () => {
      if (
        ["closed", "disconnected", "failed"].includes(
          currentPeer.connectionState
        )
      ) {
        currentPeer.close();
        this.emitter.off(`${targetId}-answer`);
        this.emitter.off(`${targetId}-candidate`);
        this.peers.delete(targetId);
      }
    };

    this.emitter.on(
      `${targetId}-answer`,
      async ({ senderId, payload: answer }) => {
        await currentPeer.setRemoteDescription(answer);
      }
    );

    this.emitter.on(
      `${targetId}-candidate`,
      async ({ senderId, payload: candidate }) => {
        await currentPeer.addIceCandidate(candidate);
      }
    );

    return new Peer(targetId, currentPeer, this);
  }

  sendOffer(targetId, offer) {
    this.ws.send(
      JSON.stringify({
        type: "offer",
        targetId,
        payload: offer,
      })
    );
    return this;
  }

  sendAnswer(target, answer) {
    this.ws.send(
      JSON.stringify({
        type: "answer",
        targetId: target,
        payload: answer,
      })
    );
    return this;
  }

  sendCandidate(target, candidate) {
    this.ws.send(
      JSON.stringify({
        type: "candidate",
        targetId: target,
        payload: candidate,
      })
    );
    return this;
  }
}

export { Peer };

export default Signal;
