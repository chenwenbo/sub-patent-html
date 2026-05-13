<template>
  <BaseChart :option="option" @click="onClick" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

// buckets: [{label, company_count, pct}]
const props = defineProps<{ buckets: any[] }>()
const emit = defineEmits<{ (e: 'click-bucket', rank_type: string): void }>()

const LABEL_TO_KEY: Record<string, string> = {
  '0件': 'zero', '1-5件': 'low', '6-10件': 'mid_low',
  '11-20件': 'mid', '21-50件': 'mid_high', '51件以上': 'high',
}

function onClick(p: any) {
  const key = LABEL_TO_KEY[p.name]
  if (key) emit('click-bucket', key)
}

const option = computed(() => {
  const labels = (props.buckets || []).map(b => b.label)
  const counts = (props.buckets || []).map(b => b.company_count)
  const pcts   = (props.buckets || []).map(b => b.pct)
  const max = Math.max(...counts, 1)

  return {
    grid: { top: 28, left: 48, right: 24, bottom: 36 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const p = params[0]
        return `<b>${p.axisValue}</b><br/>企业数: ${p.value} 家（占 ${pcts[p.dataIndex]}%）`
      },
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { color: '#a7c0e8', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: '企业数（家）',
      nameTextStyle: { color: '#a7c0e8', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(36,112,215,0.2)' } },
    },
    series: [{
      type: 'bar',
      data: counts,
      barMaxWidth: 40,
      label: {
        show: true,
        position: 'top',
        color: '#f7c873',
        fontSize: 11,
        formatter: (p: any) => `${pcts[p.dataIndex]}%`,
      },
      itemStyle: {
        color: (p: any) => {
          const ratio = counts[p.dataIndex] / max
          return {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: ratio > 0.6 ? '#f7c873' : '#2470d7' },
              { offset: 1, color: ratio > 0.6 ? '#d4a04a' : '#0e4ba8' },
            ],
          }
        },
        borderRadius: [2, 2, 0, 0],
      },
    }],
  }
})
</script>
