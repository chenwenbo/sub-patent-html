/** ECharts 深蓝政务风主题 — 注册后所有图表统一配色 */
export const govBlueTheme = {
  color: ['#2470d7', '#00e5ff', '#f7c873', '#b39dff', '#4ade80', '#ff5b5b', '#ff9d5b', '#5be0ff'],
  backgroundColor: 'transparent',
  textStyle: { color: '#a7c0e8', fontFamily: 'PingFang SC, Source Han Sans CN, sans-serif' },
  title: {
    textStyle: { color: '#eaf2ff', fontSize: 14, fontWeight: 500 },
    subtextStyle: { color: '#6a87b5' },
  },
  axisPointer: {
    lineStyle: { color: '#2470d7' },
    crossStyle: { color: '#2470d7' },
  },
  legend: { textStyle: { color: '#a7c0e8' } },
  tooltip: {
    backgroundColor: 'rgba(10, 23, 51, 0.92)',
    borderColor: '#2470d7',
    borderWidth: 1,
    textStyle: { color: '#eaf2ff' },
    extraCssText: 'box-shadow: 0 0 16px rgba(36, 112, 215, 0.5);',
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: '#2470d7' } },
    axisTick: { lineStyle: { color: '#2470d7' } },
    axisLabel: { color: '#a7c0e8' },
    splitLine: { lineStyle: { color: 'rgba(36, 112, 215, 0.15)' } },
    splitArea: { areaStyle: { color: ['transparent'] } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: '#2470d7' } },
    axisTick: { lineStyle: { color: '#2470d7' } },
    axisLabel: { color: '#a7c0e8' },
    splitLine: { lineStyle: { color: 'rgba(36, 112, 215, 0.15)' } },
    splitArea: { areaStyle: { color: ['transparent'] } },
  },
  geo: {
    itemStyle: { areaColor: 'rgba(36, 112, 215, 0.12)', borderColor: '#2470d7' },
    emphasis: { itemStyle: { areaColor: '#f7c873' } },
  },
  visualMap: { textStyle: { color: '#a7c0e8' } },
}
