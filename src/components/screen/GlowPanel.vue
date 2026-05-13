<template>
  <div class="glow-panel">
    <div class="corner top-left" />
    <div class="corner top-right" />
    <div class="corner bottom-left" />
    <div class="corner bottom-right" />
    <div class="title-bar" v-if="title">
      <span class="title-text">{{ title }}</span>
      <span v-if="hint" class="title-hint">{{ hint }}</span>
      <slot name="extra" />
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string; hint?: string }>()
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;

.glow-panel {
  position: relative;
  border: 1px solid $border-glow;
  background:
    linear-gradient(180deg, rgba(14, 33, 71, 0.85) 0%, rgba(10, 23, 51, 0.7) 100%);
  box-shadow: $shadow-inner, $shadow-outer;
  padding: $gap-md;
  border-radius: 2px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid $cyan-accent;
  pointer-events: none;
  &.top-left { top: -1px; left: -1px; border-right: none; border-bottom: none; }
  &.top-right { top: -1px; right: -1px; border-left: none; border-bottom: none; }
  &.bottom-left { bottom: -1px; left: -1px; border-right: none; border-top: none; }
  &.bottom-right { bottom: -1px; right: -1px; border-left: none; border-top: none; }
}

.title-bar {
  display: flex;
  align-items: center;
  margin-bottom: $gap-md;
  padding-bottom: $gap-sm;
  border-bottom: 1px solid rgba(36, 112, 215, 0.25);

  .title-text {
    font-family: $font-display;
    font-size: 16px;
    color: $text-primary;
    letter-spacing: 2px;
    position: relative;
    padding-left: 12px;
    &::before {
      content: '';
      position: absolute;
      left: 0; top: 2px;
      width: 3px; height: 16px;
      background: linear-gradient(180deg, $gold 0%, $gold-deep 100%);
      box-shadow: 0 0 8px $gold;
    }
  }
  .title-hint {
    margin-left: $gap-md;
    color: $text-muted;
    font-size: 12px;
  }
}

.content {
  flex: 1;
  position: relative;
  min-height: 0;
}
</style>
