# u1in-webrtc-signal

一个集成了**基于 Node 信令服务器**和**配套客户端 js 库**的 Webrtc 信令服务工具

## 0. 结构

```bash
├── README.md
├── client  #客户端代码
│ ├── index.js
│ ├── peer.js
│ └── signal.js
├── output # 总打包产物
│ ├── config.json
│ ├── pacakge.json
│ ├── dist
│ └── server.js
├── package.json
├── server #服务端代码
│ ├── index.js
│ ├── signal.js
│ └── static.js
└── webpack #打包配置
├── webpack.client.js
└── webpack.server.js
```

## 1. 安装

```bash
npm i
```

## 2. 构建

```bash
npm run build
```

build 会执行两个 npm 脚本，分别是

```bash
npm run bc

npm run bs
```

分别构建客户端和服务端代码，并最终集成到 output 文件夹下

## 3. 运行

将 output 文件夹复制到服务器上执行

```bash
npm i --production

node server.js
```

## 4. 客户端使用方式

### 4.1 引入

客户端工具代码已被集成到服务端中，所以方问服务端指定地址即可引入 js

```html
<html lang="en">
  <script src="http://127.0.0.1:3123/signal.min.js"></script>
  <script>
    const signal = new Signal({
      // default.json配置的ws.port
      wsUrl: "ws://127.0.0.1:3124",
    });

    // 初始化代码，用于注册唯一id
    signal.on("welcome", ({ senderId, payload: id }) => {
      // id回调
    });

    // 注册offer事件全局监听，处理外来接入请求
    signal.on("offer", ({ senderId, payload: offer }) => {
      signal
        .createPeer(senderId, (peer) => {
          // 对peer 进行一些处理
          // 比如addTrack或者是建立dataChannel
          return peer;
        })
        .saveOffer(offer)
        .createAnswer()
        .answer()
        .do();
    });

    // 主动发起请求
    const sendOffer = (targetId) => {
      signal
        .createPeer(targetId, (peer) => {
          // 对peer 进行一些处理
          // 比如addTrack或者是建立dataChannel
          return peer;
        })
        .createOffer()
        .offer()
        .do();
    };
  </script>
</html>
```

## 5. 待实现

[ ] server.js集成，不需要npm i
