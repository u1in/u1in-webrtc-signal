import mitt from "mitt";

export default class Peer {
  constructor(targetId, peer, signal) {
    this.targetId = targetId;
    this.peer = peer;
    this.channel = null;
    this.emitter = mitt();
    this.signal = signal;
    this.tasks = [];
    this.offer = null;
    this.answer = null;
    this.dataQueue = [];
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

  createChannel() {
    return this.addTask(() => {
      if (this.channel) {
        return this.channel;
      }
      this.channel = this.peer.createDataChannel(this.targetId, {
        ordered: true, // 保证数据顺序
        maxRetransmits: 3, // 最大重传次数
      });

      this.channel.onopen = () => {
        debugger;
        this.dataQueue.map((data) => {
          this.channel.send(data);
        });
        this.dataQueue = [];
      };
    });
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
      debugger;
      if (this.channel.readyState === "open") {
        this.channel.send(data);
      } else {
        this.dataQueue.push(data);
      }
    });
  }

  closeChannel(_channelId) {
    return this.addTask(() => {
      this.emitter.off(`${channelId}-message`);
      this.channel.close();
      this.channel = null;
    });
  }

  prehandle(func) {
    return this.addTask(() => {
      func(this.peer);
    });
  }

  ontrack(func) {
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
