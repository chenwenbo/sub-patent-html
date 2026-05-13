<template>
  <div ref="el" class="hubei-map" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue'
import * as echarts from 'echarts'
import { useFilterStore } from '@/stores/filter'

const filter = useFilterStore()

const props = defineProps<{ items: any[] }>()

const el = ref<HTMLElement | null>(null)
const inst = shallowRef<echarts.ECharts | null>(null)
let registered = false

async function ensureMap() {
  if (registered) return
  const r = await fetch('/hubei-geo.json')
  const geo = await r.json()
  echarts.registerMap('hubei', geo)
  registered = true
}

function buildOption() {
  const data = (props.items || []).map(it => ({
    name: it.region_name,
    value: it.valid_invention,
    code: it.region_code,
    company_count: it.company_count,
    per: it.valid_invention_per_company,
  }))
  const max = Math.max(...data.map(d => d.value as number), 1)
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        if (!p.data) return p.name
        return `<div style="font-size:12px">
          <b style="color:#f7c873">${p.name}</b><br/>
          企业数：${p.data.company_count} 家<br/>
          有效发明：${p.data.value} 件<br/>
          户均有效发明：${p.data.per} 件
        </div>`
      },
    },
    visualMap: {
      type: 'continuous', min: 0, max,
      left: 12, bottom: 12, calculable: false,
      text: ['多', '少'],
      inRange: { color: ['#0e2147', '#1b4d99', '#2470d7', '#5be0ff', '#f7c873'] },
      textStyle: { color: '#a7c0e8', fontSize: 11 },
    },
    geo: {
      map: 'hubei',
      roam: false,
      label: { show: true, color: '#eaf2ff', fontSize: 10 },
      itemStyle: {
        areaColor: 'rgba(36, 112, 215, 0.18)',
        borderColor: '#5be0ff',
        borderWidth: 1,
        shadowColor: '#2470d7', shadowBlur: 16,
      },
      emphasis: {
        label: { color: '#0a1733', fontWeight: 700, fontSize: 12 },
        itemStyle: { areaColor: '#f7c873', borderColor: '#fff', borderWidth: 1.5 },
      },
      zoom: 1.15,
    },
    series: [{
      type: 'map',
      map: 'hubei',
      geoIndex: 0,
      data,
    }],
  }
}

async function init() {
  if (!el.value) return
  await ensureMap()
  inst.value = echarts.init(el.value, 'gov-blue')
  inst.value.setOption(buildOption(), true)
  inst.value.on('click', (p: any) => {
    if (p.data?.code) filter.state.region_code = p.data.code
  })
}

function resize() { inst.value?.resize() }
onMounted(() => { init(); window.addEventListener('resize', resize) })
onUnmounted(() => { window.removeEventListener('resize', resize); inst.value?.dispose() })

watch(() => props.items, () => inst.value?.setOption(buildOption(), true), { deep: true })
</script>

<style scoped>
.hubei-map { width: 100%; height: 100%; min-height: 280px; }
</style>
