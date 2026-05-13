<template>
  <div class="app screen-bg">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 数据从 Pinia + localStorage 自动恢复，不需要任何启动期网络请求。
</script>

<style lang="scss" scoped>
.app {
  width: 100vw;
  height: 100vh;
  overflow: auto;
  position: relative;
}
</style>
