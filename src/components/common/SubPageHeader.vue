<template>
  <header class="sub-header">
    <router-link to="/dashboard" class="back">← 返回驾驶舱</router-link>
    <h1>{{ title }}</h1>
    <div class="sub" v-if="subtitle">{{ subtitle }}</div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;

.sub-header {
  padding: 24px 32px;
  border-bottom: 1px solid rgba(36, 112, 215, 0.3);
  background: linear-gradient(90deg, rgba(6,16,37,0.95), rgba(14,33,71,0.9));
  display: flex;
  align-items: center;
  gap: 24px;
  .back {
    color: $cyan-accent;
    font-size: 13px;
    padding: 4px 12px;
    border: 1px solid $border-glow;
    border-radius: 2px;
    &:hover { background: rgba(36,112,215,0.2); }
  }
  h1 {
    font-family: $font-display;
    font-size: 20px;
    letter-spacing: 3px;
    color: $text-primary;
    font-weight: 500;
  }
  .sub { color: $text-muted; font-size: 12px; }
}
</style>
