<template>
  <div ref="el" class="shiyan-map" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  districts: Array<{
    name: string
    company_count: number
    patent_count: number
    patent_per_company: number
  }>
  companies: Array<{
    序号: number
    地市: string
    企业名称: string
    区县: string
    自主申请专利数: number
  }>
}>()

const el = ref<HTMLElement | null>(null)
const inst = shallowRef<echarts.ECharts | null>(null)
let registered = false

// 十堰市各区县的大致坐标位置（用于散点图）
const districtCoords: Record<string, [number, number]> = {
  '张湾区': [110.77, 32.65],
  '茅箭区': [110.82, 32.59],
  '郧阳区': [110.82, 32.84],
  '竹山县': [110.23, 32.22],
  '丹江口市': [111.51, 32.54],
}

function buildOption() {
  // 地图数据 - 按区县显示专利数
  const mapData = (props.districts || []).map(d => ({
    name: d.name,
    value: d.patent_count,
    company_count: d.company_count,
    patent_per_company: d.patent_per_company,
  }))

  // 散点数据 - 显示企业位置
  const scatterData = (props.districts || []).map(d => ({
    name: d.name,
    value: [
      districtCoords[d.name]?.[0] || 110.8,
      districtCoords[d.name]?.[1] || 32.6,
      d.patent_count,
    ],
    company_count: d.company_count,
    patent_count: d.patent_count,
    patent_per_company: d.patent_per_company,
  }))

  const max = Math.max(...mapData.map(d => d.value), 1)

  return {
    title: {
      text: '十堰市企业与专利分布',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#f7c873',
        fontSize: 16,
        fontWeight: 500,
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        if (!p.data) return p.name
        const d = p.data
        return `<div style="font-size:12px">
          <b style="color:#f7c873">${d.name || p.name}</b><br/>
          企业数：${d.company_count} 家<br/>
          专利总数：${d.patent_count || d.value} 件<br/>
          户均专利：${d.patent_per_company?.toFixed(2) || 0} 件
        </div>`
      },
    },
    visualMap: {
      type: 'continuous',
      min: 0,
      max,
      left: 12,
      bottom: 12,
      calculable: false,
      text: ['多', '少'],
      inRange: {
        color: ['#0e2147', '#1b4d99', '#2470d7', '#5be0ff', '#f7c873'],
      },
      textStyle: { color: '#a7c0e8', fontSize: 11 },
    },
    geo: {
      map: 'shiyan',
      roam: true,
      zoom: 1.15,
      label: {
        show: true,
        color: '#eaf2ff',
        fontSize: 10,
      },
      itemStyle: {
        areaColor: 'rgba(36, 112, 215, 0.18)',
        borderColor: '#5be0ff',
        borderWidth: 1,
        shadowColor: '#2470d7',
        shadowBlur: 16,
      },
      emphasis: {
        label: { color: '#0a1733', fontWeight: 700, fontSize: 12 },
        itemStyle: { areaColor: '#f7c873', borderColor: '#fff', borderWidth: 1.5 },
      },
    },
    series: [
      {
        type: 'map',
        map: 'shiyan',
        geoIndex: 0,
        data: mapData,
      },
      {
        type: 'scatter',
        coordinateSystem: 'geo',
        data: scatterData,
        symbolSize: (val: any) => {
          const size = Math.sqrt(val[2]) * 4 + 10
          return Math.min(size, 60)
        },
        label: {
          show: true,
          formatter: (p: any) => `${p.data.company_count}家`,
          position: 'inside',
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
        },
        itemStyle: {
          color: 'rgba(247, 200, 115, 0.8)',
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: 'rgba(247, 200, 115, 0.6)',
        },
        emphasis: {
          itemStyle: {
            color: '#f7c873',
            borderWidth: 3,
            shadowBlur: 20,
          },
        },
      },
    ],
  }
}

async function ensureMap() {
  if (registered) return
  const r = await fetch('/shiyan-geo.json')
  const geo = await r.json()
  echarts.registerMap('shiyan', geo)
  registered = true
}

async function init() {
  if (!el.value) return
  await ensureMap()
  inst.value = echarts.init(el.value, 'gov-blue')
  inst.value.setOption(buildOption(), true)
}

function resize() {
  inst.value?.resize()
}

onMounted(() => {
  init()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  inst.value?.dispose()
})

watch(
  () => [props.districts, props.companies],
  () => inst.value?.setOption(buildOption(), true),
  { deep: true }
)
</script>

<style scoped>
.shiyan-map {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>



