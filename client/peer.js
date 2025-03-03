export default class Peer {
  constructor(targetId, peer, signal) {
    this.targetId = targetId;
    this.peer = peer;
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
