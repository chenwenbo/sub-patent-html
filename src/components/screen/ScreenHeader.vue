<template>
  <header class="screen-header">
    <div class="left">
      <div class="logo-emblem" />
      <div class="title-block">
        <div class="province">{{ title }}</div>
        <div class="subtitle">专精特新"小巨人"企业 · 专利分析驾驶舱</div>
      </div>
    </div>
    <div class="center">
      <div class="banner-line" />
      <div class="phase">企业分布 · 专利结构 · 区域产业全景分析</div>
      <div class="banner-line" />
    </div>
    <div class="right">
      <div class="time-block">
        <div class="date">{{ now.date }}</div>
        <div class="time">{{ now.time }} · {{ now.week }}</div>
      </div>
      <div class="update-tag">数据更新：{{ updatedAt }}</div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{ title: string; updatedAt: string }>()

const now = ref({ date: '', time: '', week: '' })

function tick() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  now.value = {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    week: weeks[d.getDay()],
  }
}

let timer: any
onMounted(() => { tick(); timer = setInterval(tick, 1000) })
onUnmounted(() => clearInterval(timer))
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;

.screen-header {
  position: relative;
  height: 72px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background:
    linear-gradient(90deg, rgba(6,16,37,0.95) 0%, rgba(14,33,71,0.9) 50%, rgba(6,16,37,0.95) 100%);
  border-bottom: 1px solid $border-glow;
  box-shadow: 0 2px 24px rgba(36, 112, 215, 0.3);
  z-index: 10;

  &::before, &::after {
    content: '';
    position: absolute;
    bottom: -3px;
    width: 30%;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, $gold 50%, transparent 100%);
  }
  &::before { left: 0; }
  &::after { right: 0; }
}

.left { display: flex; align-items: center; gap: 16px; }

.logo-emblem {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background:
    radial-gradient(circle, $gold 0%, $gold-deep 60%, $gov-blue 100%);
  box-shadow: 0 0 20px rgba(247, 200, 115, 0.6);
  position: relative;
  &::before {
    content: '鄂';
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $bg-primary;
    font-weight: 800;
    font-size: 20px;
    font-family: $font-display;
  }
}

.title-block {
  .province {
    font-family: $font-display;
    font-size: 24px;
    letter-spacing: 4px;
    color: $text-primary;
    line-height: 1.2;
  }
  .subtitle {
    font-size: 12px;
    color: $text-muted;
    letter-spacing: 1px;
    margin-top: 2px;
  }
}

.center {
  display: flex;
  align-items: center;
  gap: 12px;
  .banner-line {
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, $cyan-accent 50%, transparent 100%);
  }
  .phase {
    font-size: 14px;
    color: $cyan-accent;
    letter-spacing: 2px;
    text-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
  }
}

.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  .time-block {
    display: flex;
    gap: 12px;
    align-items: baseline;
    .date {
      font-family: $font-mono;
      font-size: 16px;
      color: $gold;
    }
    .time {
      font-family: $font-mono;
      font-size: 13px;
      color: $text-secondary;
    }
  }
  .update-tag {
    font-size: 11px;
    color: $text-muted;
    padding: 1px 6px;
    border: 1px solid rgba(36, 112, 215, 0.5);
    border-radius: 2px;
  }
}
</style>
