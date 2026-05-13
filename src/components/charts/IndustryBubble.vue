<template>
  <BaseChart :option="option" @click="onClick" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { useFilterStore } from '@/stores/filter'

const filter = useFilterStore()
const props = defineProps<{ items: any[] }>()

const option = computed(() => {
  const data = (props.items || []).map((x: any) => ([
    x.company_count,
    x.patent_per_company,
    Math.max(x.company_count, 8),
    x.industry_name,
    x.industry_code,
    x.patent_count,
  ]))
  return {
    grid: { top: 28, left: 56, right: 20, bottom: 36 },
    tooltip: {
      formatter: (p: any) => `
        <div style="font-size:12px">
          <b style="color:#f7c873">${p.value[3]}</b><br/>
          企业数：${p.value[0]} 家<br/>
          户均专利量：${p.value[1]} 件<br/>
          专利总量：${p.value[5]} 件
        </div>`,
    },
    xAxis: {
      type: 'value',
      name: '企业数（家）',
      nameTextStyle: { color: '#a7c0e8', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(36,112,215,0.2)' } },
    },
    yAxis: {
      type: 'value',
      name: '户均专利量（件）',
      nameTextStyle: { color: '#a7c0e8', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(36,112,215,0.2)' } },
    },
    series: [{
      type: 'scatter',
      symbolSize: (d: any) => Math.max(d[2] * 1.6, 14),
      data,
      label: {
        show: true, position: 'top',
        formatter: (p: any) => p.value[3],
        color: '#a7c0e8', fontSize: 10,
      },
      itemStyle: {
        color: {
          type: 'radial', x: 0.5, y: 0.5, r: 0.6,
          colorStops: [{ offset: 0, color: '#f7c873' }, { offset: 1, color: 'rgba(36,112,215,0.6)' }],
        },
        borderColor: '#fff', borderWidth: 1, shadowColor: '#f7c873', shadowBlur: 8,
      },
    }],
  }
})

function onClick(p: any) {
  filter.state.industry_code = p.value[4]
}
</script>
