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

    this.emitter.on("welcome", ({ senderId, payload: id }) => {
      this.id = id;
    });

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
    };

    return this;
  }

  on(name, func) {
    this.emitter.on(name, func.bind(this));
    return this;
  }

  createPeer(targetId) {
    if (this.peers.get(targetId)) {
      return this.peers.get(targetId);
    }
    const peer = new Peer(targetId, this);
    this.peers.set(targetId, peer);
    return peer;
  }

  deletePeer(targetId) {
    this.emitter.off(`${targetId}-answer`);
    this.emitter.off(`${targetId}-candidate`);
    this.peers.delete(targetId);
    return this;
  }

  getPeer(targetId) {
    return this.peers.get(targetId);
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
