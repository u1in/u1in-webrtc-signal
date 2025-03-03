import Randomstring from "randomstring";
import mitt from "mitt";

export default class Peer {
  constructor(targetId, peer, signal) {
    this.targetId = targetId;
    this.peer = peer;
    this.channels = new Map();
    this.emitter = mitt();
    this.signal = signal;
    this.tasks = [];
    this.offer = null;
    this.answer = null;
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

  createChannel(channelId = Randomstring.generate(6)) {
    return this.addTask(() => {
      const channel = this.peer.createDataChannel(channelId, {
        ordered: true, // 保证数据顺序
        maxRetransmits: 3, // 最大重传次数
      });
      this.channels.set(channelId, channel);

      channel.onopen = () => {
        channel.send("Hello!");
      };

      channel.onmessage = (event) => {
        this.emitter.emit(`${channelId}-message`, event.data);
      };
    });
  }

  handleChannelMsg(func, _channelId) {
    return this.addTask(() => {
      const channelIds = Array.from(this.channels.keys());
      const lastChannelId = channelIds[channelIds.length - 1];
      const channelId = _channelId || lastChannelId;
      this.emitter.on(`${channelId}-message`, func);
    });
  }

  sendChannelData(data, _channelId) {
    return this.addTask(() => {
      const channelIds = Array.from(this.channels.keys());
      const lastChannelId = channelIds[channelIds.length - 1];
      const channelId = _channelId || lastChannelId;
      this.channels.get(channelId).send(data);
    });
  }

  closeChannel(_channelId) {
    return this.addTask(() => {
      const channelIds = Array.from(this.channels.keys());
      const lastChannelId = channelIds[channelIds.length - 1];
      const channelId = _channelId || lastChannelId;
      this.emitter.off(`${channelId}`);
      this.channels.get(channelId).close();
      this.channels.delete(channelId);
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
