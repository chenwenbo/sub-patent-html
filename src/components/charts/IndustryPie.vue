<template>
  <BaseChart :option="option" @click="onClick" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const emit = defineEmits<{ (e: 'click-industry', industry_code: string): void }>()

// items: IndustryItem[] { industry_name, company_count, patent_count, patent_per_company }
const props = defineProps<{ items: any[] }>()

const INDUSTRY_COLORS: Record<string, string> = {
  '高端装备制造产业':   '#2470d7',
  '新材料产业':         '#00e5ff',
  '新一代信息技术产业': '#f7c873',
  '生物产业':           '#4ade80',
  '新能源产业':         '#b39dff',
  '节能环保产业':       '#fb923c',
  '其他产业':           '#94a3b8',
  '数字创意产业':       '#f472b6',
}

function onClick(p: any) {
  const code = p.data?.industry_code
  if (code) emit('click-industry', code)
}

const option = computed(() => {
  const data = (props.items || [])
    .filter(i => i.company_count > 0)
    .map(i => ({
      name: i.industry_name,
      value: i.company_count,
      industry_code: i.industry_code,
      patent_count: i.patent_count,
      patent_per: i.patent_per_company,
      itemStyle: { color: INDUSTRY_COLORS[i.industry_name] || '#64748b' },
    }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const d = p.data
        return [
          `<b>${p.name}</b>`,
          `企业数：${d.value} 家（${p.percent}%）`,
          `专利总量：${d.patent_count} 件`,
          `户均专利：${d.patent_per} 件`,
        ].join('<br/>')
      },
    },
    legend: {
      orient: 'vertical',
      right: 8,
      top: 'center',
      textStyle: { color: '#a7c0e8', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
      formatter: (name: string) => {
        const item = data.find(d => d.name === name)
        return item ? `${name}  ${item.value}` : name
      },
    },
    series: [{
      type: 'pie',
      radius: ['42%', '70%'],
      center: ['36%', '50%'],
      avoidLabelOverlap: true,
      label: {
        show: true,
        position: 'outside',
        fontSize: 11,
        color: '#a7c0e8',
        formatter: '{b}\n{d}%',
        overflow: 'truncate',
      },
      labelLine: {
        length: 8,
        length2: 12,
        lineStyle: { color: 'rgba(167,192,232,0.5)' },
      },
      emphasis: {
        label: { fontSize: 13, fontWeight: 'bold', color: '#f7c873' },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' },
      },
      data,
    }],
  }
})
</script>
