import kit from "@/utils/kit";
import receiver from '@/utils/receiver';
import keyboard from '@/utils/keyboard';
// import oss from '@/api/oss';
// import sender from '@/utils/sender';


export const useEvents = (_this) => {
  // 键盘事件
  const registerKeyboard = (eventsMap, stateRef, keyName = 'Enter') => {
    keyboard.keydown(keyName, () => {
      if (eventsMap.has(stateRef.value)) {
        let func = eventsMap.get(stateRef.value);
        func(stateRef);
      }
    });
  };

  // 外部事件（ws或底层事件）
  const registerWsEvent = (events = {}, checkNextPhoto = null) => {
    let loginedActionLock = false; //锁-登录后首次动作
    // 用户鉴权后事件
    const afterAuth = (data) => {
      kit.debug('-----------------after auth', data);
      if (loginedActionLock) {
        kit.log('已登录，不再触发登录动作');
        return;
      }
      loginedActionLock = true;
      if (checkNextPhoto) {
        kit.debug('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~checkNextPhoto');
        checkNextPhoto();
      }
    };

    const afterLogout = () => {
      loginedActionLock = false;
    };

    const registerEvent = (events = {}) => {
      for (let k in events) {
        receiver.registerEventFunc(k, events[k]);
      }
      receiver.initListener();
    };

    receiver.registerEventFunc('auth', afterAuth);
    receiver.registerEventFunc('logout', afterLogout);

    registerEvent(events);
  };

  onUnmounted(() => {
    receiver.removeListener();
  });

  return {
    registerKeyboard,
    registerWsEvent
  };

};
