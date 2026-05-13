<template>
  <BaseChart :option="option" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

// items: RegionItem[]  {region_name, patent_per_company, patent_count, company_count}
const props = defineProps<{ items: any[] }>()

const option = computed(() => {
  const sorted = [...(props.items || [])].sort((a, b) => a.patent_per_company - b.patent_per_company)
  const names = sorted.map(x => x.region_name)
  const vals  = sorted.map(x => x.patent_per_company)
  const max   = Math.max(...vals, 1)

  return {
    grid: { top: 10, left: 80, right: 36, bottom: 20 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const item = sorted[params[0].dataIndex]
        return `<b>${item.region_name}</b><br/>户均专利: ${item.patent_per_company} 件<br/>专利总量: ${item.patent_count} 件<br/>企业数: ${item.company_count} 家`
      },
    },
    xAxis: { type: 'value', name: '户均（件）', nameTextStyle: { color: '#a7c0e8', fontSize: 10 } },
    yAxis: { type: 'category', data: names, axisLabel: { fontSize: 11, color: '#a7c0e8' } },
    series: [{
      type: 'bar', data: vals, barMaxWidth: 14,
      label: { show: true, position: 'right', color: '#f7c873', fontSize: 11 },
      itemStyle: {
        color: (p: any) => {
          const ratio = vals[p.dataIndex] / max
          return {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: ratio > 0.7 ? '#f7c873' : '#2470d7' },
              { offset: 1, color: ratio > 0.7 ? '#d4a04a' : '#00e5ff' },
            ],
          }
        },
      },
    }],
  }
})
</script>
