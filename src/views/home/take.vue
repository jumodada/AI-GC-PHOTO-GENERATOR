<template>
  <div>
    <TakePhotoStream />
  </div>
</template>

<script setup>

import TakePhotoStream from './components/TakePhotoStream.vue';
import useNetworkStatus from '../hooks/network';
import { ElNotification } from 'element-plus';

const { networkStatus } = useNetworkStatus();

if (networkStatus.value === 'offline') {
  // 网络离线时的操作
  ElNotification.error('网络异常，请检查');
}


</script>