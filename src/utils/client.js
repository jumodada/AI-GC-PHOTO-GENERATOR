import io from "socket.io-client";
import kit from "./kit";

export default class WSClient {

  constructor() {
    this.socket = null;
    this.name = 'wsclient';
  }

  static getInstance() {
    if (!WSClient._instance) {
      WSClient._instance = new WSClient();
    }
    return WSClient._instance;
  }

  start(
    url = "",
    event = {
      disconnect: null,
      connect: null,
      fail: null,
      command: null,
      message: null,
      ping: null,
    },
    path = "",
    auth = {},
    query = "",
  ) {
    if (!url) {
      kit.error("socket 地址不存在，请确认");
      return false;
    }
    if (this.socket) {
      kit.warn("socket存在，将强制销毁");
      this.socket.close();
      this.socket = null;
    }

    this.socket = io(url, {
      transports: ["websocket"],
      // query: query,
      path: path,
      auth: auth,
    });
    if (!this.socket) {
      kit.error("socket 异常，请确认");
      return false;
    }
    kit.log("create io", url);

    // 连接成功
    this.socket.on("connect", (socket) => {
      kit.log("ws连接成功", socket);
      if (event.connect) event.connect("connect");
    });

    // 连接失败
    this.socket.on("disconnect", (socket) => {
      kit.log("ws连接失败", socket);
      //把接收的数据显示到界面
      if (event.disconnect) event.disconnect("disconnect");
    });

    this.socket.on("error", (socket) => {
      kit.log("ws连接错误", socket);
      if (event.fail) event.fail(socket);
    });

    this.socket.on("message", (data) => {
      kit.log("receive message data", data);
      if (event.message) event.message(data);
    });

    this.socket.on("command", (data) => {
      kit.log("ws receive command data", data);
      if (event.command) event.command(data);
    });
    // 心跳
    this.socket.on("ping", (data) => {
      if (event.ping) event.ping(data);
    });
    return this;
  }

  sendCmd(data, toUid = "") {
    if (data) {
      // 文本不为空发送
      let dataCmd = { content: data };
      if (toUid) {
        dataCmd["to_uid"] = toUid;
      }
      this.socket.emit("command", dataCmd);
    }
  }
  sendMsg(msg, toUid = "A") {
    if (msg) {
      // 文本不为空发送
      let dataCmd = { content: msg };
      if (toUid) {
        dataCmd["to_uid"] = toUid;
      }
      kit.log("send message", dataCmd);
      return this.socket.emit("message", dataCmd);
    }
  }
  sendMsgObj(cmd, data) {
    return this.sendMsg({ cmd, data });
  }
  pong(val = 1) {
    this.socket.emit("pong", val);
  }
  close() {
    this.socket.close();
  }
}
