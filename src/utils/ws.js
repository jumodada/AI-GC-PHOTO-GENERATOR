import WSClient from './client';
import config from './config';
import kit from './kit';
import receiver from './receiver';

export default {
  startWS(mTokenNew, roomNum, url) {
    let ws = WSClient.getInstance();
    let wsUrl = 'ws://47.104.92.121:8090/ws';
    if (url) wsUrl = url;
    ws.start(wsUrl,
      {
        disconnect: (v) => {
          kit.debug("ws disconnect", v);
        },
        connect: (v) => {
          kit.debug("ws connected", v);
        },
        fail: (v) => {
          kit.debug("ws fail", v);
        },
        notice: (data) => {
          kit.debug("find ws notice:", data);
        },
        ping: (data) => {
          ws.pong(1);
        },
        command: (data) => {
          receiver.dispatchCmd(data.cmd, data.content);
        },
        message: (data) => {
          receiver.dispatchEvent(data.content);
        },
      },
      "/ws/socket.io",
      {
        client_token: mTokenNew,
        client_id: roomNum + 'B',
        client_type: 'web',
      },
    );
  }
};