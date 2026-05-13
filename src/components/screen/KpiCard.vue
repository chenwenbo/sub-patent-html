<template>
  <div class="kpi-card" @click="$emit('click')">
    <div class="kpi-label">{{ label }}</div>
    <div class="kpi-value-row">
      <span class="kpi-value">{{ formatted }}</span>
      <span class="kpi-unit">{{ unit }}</span>
    </div>
    <div class="kpi-sub" v-if="sub">{{ sub }}</div>
    <div class="kpi-decoration" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: number | string
  unit?: string
  sub?: string
}>()

defineEmits<{ (e: 'click'): void }>()

const formatted = computed(() => {
  const v = props.value
  if (typeof v !== 'number') return v
  if (v >= 10000) return (v / 10000).toFixed(2) + '万'
  if (Number.isInteger(v)) return v.toLocaleString()
  return v.toFixed(2)
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;

.kpi-card {
  position: relative;
  padding: $gap-md $gap-md $gap-md ($gap-md + 4px);
  background:
    linear-gradient(135deg, rgba(36, 112, 215, 0.18) 0%, rgba(10, 23, 51, 0.3) 100%);
  border: 1px solid rgba(36, 112, 215, 0.5);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  min-height: 92px;

  &:hover {
    border-color: $gold;
    background: linear-gradient(135deg, rgba(247, 200, 115, 0.18) 0%, rgba(10, 23, 51, 0.3) 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(247, 200, 115, 0.2);
  }
}

.kpi-label {
  font-size: 13px;
  color: $text-secondary;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
}

.kpi-value {
  @include kpi-number;
  font-size: 32px;
  line-height: 1.1;
  letter-spacing: 1px;
}

.kpi-unit {
  margin-left: 6px;
  font-size: 13px;
  color: $text-cyan;
  font-weight: 500;
}

.kpi-sub {
  margin-top: 4px;
  font-size: 11px;
  color: $text-muted;
}

.kpi-decoration {
  position: absolute;
  left: 0; top: 12px; bottom: 12px;
  width: 2px;
  background: linear-gradient(180deg, transparent 0%, $gold 50%, transparent 100%);
  box-shadow: 0 0 6px $gold;
}
</style>
