// 唯一数据源：Excel 导入后整份数据集存在内存 + localStorage。
// 所有页面通过 useDatasetStore() 拿原始 rows，再用 @/data/queries 进行聚合。

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Dataset } from '@/data/types'
import { EMPTY_DATASET } from '@/data/types'

const LS_KEY = 'sub-patent-html:dataset:v1'

function load(): Dataset {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { ...EMPTY_DATASET }
    const parsed = JSON.parse(raw) as Dataset
    // 简单结构校验
    if (!parsed.companies || !Array.isArray(parsed.companies)) return { ...EMPTY_DATASET }
    return parsed
  } catch {
    return { ...EMPTY_DATASET }
  }
}

function persist(d: Dataset) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(d))
  } catch (e) {
    // localStorage 配额超限：忽略，仅保留内存数据
    console.warn('[dataset] localStorage 写入失败：', e)
  }
}

export const useDatasetStore = defineStore('dataset', () => {
  const data = ref<Dataset>(load())

  const hasData = computed(() => data.value.companies.length > 0)

  function setDataset(d: Dataset) {
    data.value = d
    persist(d)
  }

  function clear() {
    data.value = { ...EMPTY_DATASET }
    localStorage.removeItem(LS_KEY)
  }

  return { data, hasData, setDataset, clear }
})
