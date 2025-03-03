# u1in-webrtc-signal

一个集成了**基于 Node 信令服务器**和**基于mitt的配套JS脚本**的 Webrtc 信令服务工具

## 1. 安装

```bash
npm i
```

## 2. 构建

```bash
npm run build
```

## 3. 运行

将 output 文件夹复制到服务器上执行

```bash
npm i --production

node server.js
```

## 4. 测试

本项目具有一个小demo可以进行测试，在项目目录中执行

```bash
npm i

npm run build

npm run start #启动信令服务器

npm run demo #启动demo
````

## 5. 待实现

- [ ] node集成，使其不需要 npm i
- [ ] 开发datachannel的API
- [ ] 开源完备
