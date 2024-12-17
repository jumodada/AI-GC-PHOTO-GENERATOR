<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script setup>
import ws from './utils/ws';
import config from './utils/config';
import kit from './utils/kit';


const cfg = window.pool.cfg;
kit.info("获取配置信息：", cfg);
config.setApiUrl(cfg.apiUrl);
config.setStreamUrl(cfg.streamUrl);

ws.startWS(cfg.token, cfg.room, cfg.wsUrl);
// kit.info("更新配置信息：", config);

</script>

<style>
body {
  font-family: Microsoft YaHei UI, Microsoft YaHei UI;
  height: 100vh;
  background-color: #000;
  /* background: linear-gradient(180deg, rgba(0, 0, 0, 0.61) 0%, #000000 100%); */
  overflow: hidden;
}
</style>