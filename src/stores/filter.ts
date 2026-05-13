import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import { useDatasetStore } from './dataset'

export interface FilterState {
  region_code: string | null
  industry_code: string | null
  batch: string | null
}

export const useFilterStore = defineStore('filter', () => {
  const ds = useDatasetStore()

  const state = reactive<FilterState>({
    region_code: null,
    industry_code: null,
    batch: null,
  })

  // dimensions 直接从导入的数据集投影 —— 不再走 /meta API。
  const dimensions = computed(() => ({
    regions: ds.data.regions,
    industries: ds.data.industries,
    batches: ds.data.batches,
    province_name: '湖北省',
    updated_at: ds.data.updated_at
      ? new Date(ds.data.updated_at).toLocaleString('zh-CN', { hour12: false })
      : '',
  }))

  // 保留同名异步空函数，向后兼容旧代码里的 `await filter.loadDimensions()`。
  async function loadDimensions() { /* no-op */ }

  const reset = () => {
    state.region_code = null
    state.industry_code = null
    state.batch = null
  }

  const scope = computed(() => ({
    region_code: state.region_code,
    industry_code: state.industry_code,
    batch: state.batch,
  }))

  const currentCityName = computed(() => {
    if (state.region_code) {
      return dimensions.value.regions.find(x => x.region_code === state.region_code)?.region_name
        || state.region_code
    }
    return dimensions.value.province_name
  })

  const scopeLabel = computed(() => {
    const parts: string[] = []
    if (state.region_code) {
      const r = dimensions.value.regions.find(x => x.region_code === state.region_code)
      parts.push(r?.region_name || state.region_code)
    }
    if (state.industry_code) {
      const i = dimensions.value.industries.find(x => x.industry_code === state.industry_code)
      parts.push(i?.industry_name || state.industry_code)
    }
    if (state.batch) parts.push(state.batch)
    return parts.length ? parts.join(' · ') : '全省汇总'
  })

  return { state, dimensions, loadDimensions, reset, scope, scopeLabel, currentCityName }
})
