import kit from './kit';
import store from './store';
import tool from './tool';

export default {
  eventFuncMap: {},
  initListener() {
    window.addEventListener('onmessageWS', (res) => {
      kit.debug("receiver Listener find--->", res);
      const data = res.detail.data;
      const cmd = data.cmd || '';
      if (!cmd) return;
      const func = this.eventFuncMap[cmd] || null;
      if (!func) return;
      func(data.data);
    });
  },
  registerEventFunc(cmd, evenFunc) {
    this.eventFuncMap[cmd] = evenFunc;
  },
  removeListener() {
    kit.debug("receiver removeListener--->");
    window.removeEventListener('onmessageWS', (res) => { kit.debug(res); });
  },
  cmdArr() {
    return ['auth', 'logout'];
  },
  dispatchCmd(cmd, data) {
    switch (cmd) {
      case 'token':
        this.handlePackage('auth', data);
        break;
      case 'logout':
      default:
        this.handlePackage(cmd, data);
        break;
    }
  },
  // 通过onmessageWS广播时间到上层
  dispatchEvent(event) {
    if (!event.cmd) {
      return false;
    }
    if (this.cmdArr().indexOf(event.cmd) > -1) {
      return this.handlePackage(event.cmd, event.data || '');
    }
    window.dispatchEvent(new CustomEvent('onmessageWS', {
      detail: {
        data: event
      }
    }));
    return true;
  },
  handlePackage(cmd, data) {
    console.log(cmd, '>>> B >>>', data);
    switch (cmd) {
      case 'auth':
        // tool.cookie.set("TOKEN", data, {
        //   expires: 24 * 60 * 60
        // });
        store.set("TOKEN", data);
        break;
      case 'logout':
        // tool.cookie.remove("TOKEN");
        store.remove('TOKEN');
        break;
    }
    window.dispatchEvent(new CustomEvent('onmessageWS', {
      detail: {
        data: { cmd, data }
      }
    }));
    return true;
  }

}

