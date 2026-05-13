<template>
  <div ref="el" class="base-chart" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  option: any
  height?: string
}>()

const emit = defineEmits<{ (e: 'click', params: any): void }>()

const el = ref<HTMLElement | null>(null)
const inst = shallowRef<echarts.ECharts | null>(null)

function init() {
  if (!el.value) return
  inst.value = echarts.init(el.value, 'gov-blue')
  inst.value.setOption(props.option || {}, true)
  inst.value.on('click', p => emit('click', p))
}

function resize() { inst.value?.resize() }

onMounted(() => {
  init()
  window.addEventListener('resize', resize)
})
onUnmounted(() => {
  window.removeEventListener('resize', resize)
  inst.value?.dispose()
})

watch(() => props.option, val => {
  inst.value?.setOption(val || {}, true)
}, { deep: true })
</script>

<style scoped>
.base-chart { width: 100%; height: 100%; min-height: 220px; }
</style>
