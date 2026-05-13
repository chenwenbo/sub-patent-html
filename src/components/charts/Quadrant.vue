<template>
  <BaseChart :option="option" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps<{ items: any[] }>()  // company-list items with valid_invention + invention_apply_3y

const option = computed(() => {
  const data = (props.items || []).map((c: any) => {
    let color = '#00e5ff'
    if (c.list_tags?.includes('leader')) color = '#f7c873'
    else if (c.list_tags?.includes('growing')) color = '#4ade80'
    else if (c.list_tags?.includes('weak')) color = '#ff5b5b'
    return { value: [c.valid_invention, c.invention_apply_3y, c.name], itemStyle: { color } }
  })
  return {
    grid: { top: 24, left: 56, right: 24, bottom: 36 },
    tooltip: {
      formatter: (p: any) => `<div><b>${p.value[2]}</b><br/>有效发明: ${p.value[0]}<br/>近三年发明申请: ${p.value[1]}</div>`,
    },
    xAxis: { type: 'value', name: '有效发明', splitLine: { show: true } },
    yAxis: { type: 'value', name: '近三年发明申请', splitLine: { show: true } },
    series: [{
      type: 'scatter',
      symbolSize: 10,
      data,
      markLine: {
        silent: true,
        lineStyle: { color: 'rgba(247, 200, 115, 0.4)', type: 'dashed' },
        data: [
          { name: '领航', xAxis: 10 },
          { name: '活跃', yAxis: 5 },
        ],
        label: { color: '#f7c873' },
      },
    }],
  }
})
</script>
