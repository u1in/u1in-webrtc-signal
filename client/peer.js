import mitt from "mitt";

export default class Peer {
  constructor(targetId, signal) {
    this.targetId = targetId;
    this.peer = null;
    this.channel = null;
    this.emitter = mitt();
    this.signal = signal;
    this.tasks = [];
    this.offer = null;
    this.answer = null;

    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    this.peer.onicecandidate = ({ candidate }) => {
      if (candidate) {
        this.signal.sendCandidate(targetId, candidate);
      }
    };

    this.peer.onconnectionstatechange = () => {
      console.log(this.peer.connectionState);
      if (
        ["closed", "disconnected", "failed"].includes(this.peer.connectionState)
      ) {
        this.peer.close();
        this.signal.deletePeer(targetId);
      }
      if (["connected"].includes(this.peer.connectionState)) {
        debugger;
        this.emitter.emit(`${targetId}-connected`);
        this.do();
      }
    };

    this.signal.emitter.on(
      `${targetId}-answer`,
      async ({ senderId, payload: answer }) => {
        debugger;
        await this.peer.setRemoteDescription(answer);
      }
    );

    this.signal.emitter.on(
      `${targetId}-candidate`,
      async ({ senderId, payload: candidate }) => {
        debugger;
        await this.peer.addIceCandidate(candidate);
      }
    );
  }

  addTask(func) {
    this.tasks.push(func);
    return this;
  }

  async do() {
    for (let i = 0; i < this.tasks.length; i++) {
      await this.tasks[i]();
    }
    this.tasks = [];
  }

  rename(targetId) {
    return this.addTask(() => {
      this.targetId = targetId;
    });
  }

  waitForConnected() {
    return this.addTask(() => {
      return new Promise((resolve) => {
        this.emitter.on(`${this.targetId}-connected`, () => {
          debugger;
          resolve();
        });
      });
    });
  }

  createChannel() {
    return this.addTask(() => {
      if (this.channel) {
        return this.channel;
      }
      this.channel = this.peer.createDataChannel(this.targetId, {
        ordered: true, // 保证数据顺序
        maxRetransmits: 3, // 最大重传次数
      });

      this.channel.onopen = () => {};
    });
  }

  getChannel() {
    return this.channel;
  }

  recieveChannelData(func) {
    return this.addTask(() => {
      this.channel.onmessage = (event) => {
        debugger;
        func(event.data);
      };
    });
  }

  sendChannelData(data) {
    debugger;
    return this.addTask(() => {
      this.channel.send(data);
    });
  }

  closeChannel(_channelId) {
    return this.addTask(() => {
      this.emitter.off(`${channelId}-message`);
      this.channel.close();
      this.channel = null;
    });
  }

  handlePeer(func) {
    return this.addTask(() => {
      func(this.peer);
    });
  }

  peerOnTrack(func) {
    return this.addTask(() => {
      this.peer.ontrack = func;
    });
  }

  createOffer() {
    return this.addTask(async () => {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      this.offer = offer;
    });
  }

  saveOffer(offer) {
    return this.addTask(async () => {
      await this.peer.setRemoteDescription(offer);
    });
  }

  createAnswer() {
    return this.addTask(async () => {
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      this.answer = answer;
    });
  }

  sendOffer() {
    return this.addTask(() => {
      if (!this.offer) {
        throw new Error("no offer, you should call createOffer() first");
      }
      this.signal.sendOffer(this.targetId, this.offer);
    });
  }

  sendAnswer() {
    return this.addTask(() => {
      if (!this.answer) {
        throw new Error("no answer, you should call createAnswer() first");
      }
      this.signal.sendAnswer(this.targetId, this.answer);
    });
  }
}
