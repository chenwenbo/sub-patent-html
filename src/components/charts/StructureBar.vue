<template>
  <BaseChart :option="option" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

// items: BatchItem[]  {batch, company_count, patent_count, by_industry:[{industry_name,company_count}]}
const props = defineProps<{ items: any[] }>()

const INDUSTRY_COLORS: Record<string, string> = {
  '高端装备制造产业': '#2470d7',
  '新材料产业':       '#00e5ff',
  '新一代信息技术产业':'#f7c873',
  '生物产业':         '#4ade80',
  '新能源产业':       '#b39dff',
  '节能环保产业':     '#fb923c',
  '其他产业':         '#94a3b8',
  '数字创意产业':     '#f472b6',
}

const option = computed(() => {
  const batches = (props.items || []).map(b => b.batch)

  // 收集所有产业
  const allIndustries = new Set<string>()
  for (const b of props.items || []) {
    for (const i of b.by_industry || []) allIndustries.add(i.industry_name)
  }
  const industries = Array.from(allIndustries)

  const series = industries.map(ind => ({
    name: ind,
    type: 'bar',
    stack: 'total',
    barMaxWidth: 28,
    data: (props.items || []).map(b => {
      const found = b.by_industry?.find((i: any) => i.industry_name === ind)
      return found?.company_count || 0
    }),
    itemStyle: {
      color: INDUSTRY_COLORS[ind] || '#64748b',
    },
    label: { show: false },
  }))

  return {
    grid: { top: 36, left: 40, right: 16, bottom: 48 },
    legend: {
      bottom: 0, type: 'scroll',
      textStyle: { color: '#a7c0e8', fontSize: 11 },
      itemWidth: 12, itemHeight: 8,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const batch = params[0]?.axisValue || ''
        const lines = params
          .filter(p => p.value > 0)
          .map(p => `<span style="color:${p.color}">■</span> ${p.seriesName}: ${p.value} 家`)
        const total = params.reduce((s: number, p: any) => s + (p.value || 0), 0)
        return `<b>${batch}</b><br/>${lines.join('<br/>')}<br/><b>合计: ${total} 家</b>`
      },
    },
    xAxis: {
      type: 'category',
      data: batches,
      axisLabel: { rotate: 20, interval: 0, fontSize: 11, color: '#a7c0e8' },
    },
    yAxis: {
      type: 'value',
      name: '企业数（家）',
      nameTextStyle: { color: '#a7c0e8', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(36,112,215,0.2)' } },
    },
    series,
  }
})
</script>
