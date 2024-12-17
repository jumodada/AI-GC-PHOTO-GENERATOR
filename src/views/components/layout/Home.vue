<template>
  <div class="app-home">
    <!-- <keep-alive>
      <router-view />
    </keep-alive> -->
  </div>
</template>

<script setup>


import { useRoute } from 'vue-router';

const route = useRoute();
const queryParams = route.query;

// let menuIndex = ref(queryParams.id || 0);

console.log("queryParams=", queryParams);
</script>


<style lang="scss" scoped>
.app-home {
  .page-layout {
    display: flex;
    justify-content: space-between;

    .right-bar {}
  }
}
</style>