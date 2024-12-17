import { ref, onMounted, onUnmounted } from 'vue';

/**
 * 监听网络状态变化的 hook
 * @returns {Object} 包含网络状态和监听相关方法的对象
 */
function useNetworkStatus() {
  // 网络状态，初始为未知
  const networkStatus = ref('unknown');

  // 网络状态变化的处理函数
  const handleNetworkChange = () => {
    networkStatus.value = navigator.onLine ? 'online' : 'offline';
  };

  // 组件挂载时添加网络状态变化的监听
  onMounted(() => {
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
  });

  // 组件卸载时移除监听
  onUnmounted(() => {
    window.removeEventListener('online', handleNetworkChange);
    window.removeEventListener('offline', handleNetworkChange);
  });

  // 返回网络状态和相关方法
  return {
    networkStatus
  };
}

export default useNetworkStatus;