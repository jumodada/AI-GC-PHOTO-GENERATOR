
export default {
  keydown: (keyName, callback) => {
    document.addEventListener('keydown', function(event) {
      const key = event.key; // 获取按下的键名
      console.log('按下了', key);

      // 检查特定按键
      if (key === keyName) {
        callback();
      }
    });
  }
};