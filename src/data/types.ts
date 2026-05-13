// 前端唯一数据模型 —— 与后端 mock/companies.json 完全对齐。
// 整个应用只围绕这一种实体计算，无 patents.json。

export interface Company {
  company_id: string
  name: string
  region_code: string
  region_name: string
  industry_code: string
  industry_name: string
  batch: string
  patent_count: number
}

export interface RegionMeta { region_code: string; region_name: string; sort: number }
export interface IndustryMeta { industry_code: string; industry_name: string; sort: number }

export interface Dataset {
  companies: Company[]
  regions: RegionMeta[]
  industries: IndustryMeta[]
  batches: string[]
  updated_at: string  // ISO 字符串，导入时填入
  source_name?: string  // 原始文件名
}

export interface FilterScope {
  region_code?: string | null
  industry_code?: string | null
  batch?: string | null
}

export type RankType = 'zero' | 'low' | 'mid_low' | 'mid' | 'mid_high' | 'high'

export const EMPTY_DATASET: Dataset = {
  companies: [], regions: [], industries: [], batches: [], updated_at: '',
}
