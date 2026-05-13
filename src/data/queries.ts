// 后端 services/metrics.py + services/lists.py 的前端等价实现。
// 所有公式与 backend 完全对齐（见 indicators.yml），保证切换后端 / 前端结果一致。

import type { Company, FilterScope, RankType } from './types'

// ----- 通用 -----

function safeDiv(a: number, b: number, ndigits = 1): number {
  if (!b) return 0
  const p = 10 ** ndigits
  return Math.round((a / b) * p) / p
}

export function applyScope(rows: Company[], scope: FilterScope): Company[] {
  return rows.filter(r => {
    if (scope.region_code && r.region_code !== scope.region_code) return false
    if (scope.industry_code && r.industry_code !== scope.industry_code) return false
    if (scope.batch && r.batch !== scope.batch) return false
    return true
  })
}

// ----- KPI 总览 -----

export interface KpiItem { key: string; name: string; value: number; unit: string }

export function overviewKpis(all: Company[], scope: FilterScope): KpiItem[] {
  const c = applyScope(all, scope)
  const n = c.length
  const total = c.reduce((s, r) => s + (r.patent_count || 0), 0)
  const industryCount = new Set(c.map(r => r.industry_code)).size
  return [
    { key: 'company_count',  name: '小巨人企业数', value: n,                    unit: '家' },
    { key: 'patent_total',   name: '专利总量',     value: total,                unit: '件' },
    { key: 'per_company',    name: '户均专利量',   value: safeDiv(total, n, 1), unit: '件' },
    { key: 'industry_count', name: '覆盖产业数',   value: industryCount,        unit: '个' },
  ]
}

// ----- 分布桶 -----

const BUCKETS: { key: RankType; label: string; lo: number; hi: number }[] = [
  { key: 'zero',     label: '0件',    lo: 0,  hi: 0 },
  { key: 'low',      label: '1-5件',  lo: 1,  hi: 5 },
  { key: 'mid_low',  label: '6-10件', lo: 6,  hi: 10 },
  { key: 'mid',      label: '11-20件',lo: 11, hi: 20 },
  { key: 'mid_high', label: '21-50件',lo: 21, hi: 50 },
  { key: 'high',     label: '51件以上',lo: 51,hi: 99999 },
]

export interface DistributionResult {
  buckets: { label: string; company_count: number; pct: number }[]
  zero_count: number
  zero_pct: number
}

export function distributionMetrics(all: Company[], scope: FilterScope): DistributionResult {
  const c = applyScope(all, scope)
  const n = c.length
  const buckets = BUCKETS.map(b => {
    const cnt = c.filter(r => r.patent_count >= b.lo && r.patent_count <= b.hi).length
    return { label: b.label, company_count: cnt, pct: safeDiv(cnt * 100, n, 1) }
  })
  const zeroCount = c.filter(r => r.patent_count === 0).length
  return { buckets, zero_count: zeroCount, zero_pct: safeDiv(zeroCount * 100, n, 1) }
}

// ----- 区域 / 产业聚合 -----

export interface RegionAggItem {
  region_code: string; region_name: string
  company_count: number; patent_count: number; patent_per_company: number
}
export interface IndustryAggItem {
  industry_code: string; industry_name: string
  company_count: number; patent_count: number; patent_per_company: number
}

export function regionMetrics(all: Company[], scope: FilterScope): RegionAggItem[] {
  // 区域聚合时不应用 region 过滤（否则只剩 1 行），但仍受 industry/batch 约束
  const c = applyScope(all, { ...scope, region_code: null })
  const groups = new Map<string, Company[]>()
  c.forEach(r => {
    const list = groups.get(r.region_code) ?? []
    list.push(r); groups.set(r.region_code, list)
  })
  const out: RegionAggItem[] = []
  groups.forEach((rows, code) => {
    const total = rows.reduce((s, r) => s + r.patent_count, 0)
    out.push({
      region_code: code,
      region_name: rows[0].region_name,
      company_count: rows.length,
      patent_count: total,
      patent_per_company: safeDiv(total, rows.length, 1),
    })
  })
  return out.sort((a, b) => b.patent_count - a.patent_count)
}

export function industryMetrics(all: Company[], scope: FilterScope): IndustryAggItem[] {
  const c = applyScope(all, { ...scope, industry_code: null })
  const groups = new Map<string, Company[]>()
  c.forEach(r => {
    const list = groups.get(r.industry_code) ?? []
    list.push(r); groups.set(r.industry_code, list)
  })
  const out: IndustryAggItem[] = []
  groups.forEach((rows, code) => {
    const total = rows.reduce((s, r) => s + r.patent_count, 0)
    out.push({
      industry_code: code,
      industry_name: rows[0].industry_name,
      company_count: rows.length,
      patent_count: total,
      patent_per_company: safeDiv(total, rows.length, 1),
    })
  })
  return out.sort((a, b) => b.patent_count - a.patent_count)
}

// ----- 企业排行（分档） -----

export interface CompanyListItem {
  company_id: string; name: string
  region_name: string; industry_name: string; batch: string
  patent_count: number; rank: number; rank_tag: RankType
}
export interface CompanyListResult { total: number; items: CompanyListItem[] }

function bucketKey(p: number): RankType {
  for (const b of BUCKETS) if (p >= b.lo && p <= b.hi) return b.key
  return 'high'
}

export function companyList(
  all: Company[],
  scope: FilterScope,
  rankType: RankType | null,
  page = 1,
  pageSize = 50,
): CompanyListResult {
  let rows = applyScope(all, scope)
    .map(r => ({ ...r, rank_tag: bucketKey(r.patent_count) }))
    .sort((a, b) => b.patent_count - a.patent_count)
  if (rankType) rows = rows.filter(r => r.rank_tag === rankType)
  const total = rows.length
  const sliced = rows.slice((page - 1) * pageSize, page * pageSize)
  const items: CompanyListItem[] = sliced.map((r, i) => ({
    company_id: r.company_id,
    name: r.name,
    region_name: r.region_name,
    industry_name: r.industry_name,
    batch: r.batch,
    patent_count: r.patent_count,
    rank: (page - 1) * pageSize + i + 1,
    rank_tag: r.rank_tag,
  }))
  return { total, items }
}

// 各档位的计数（用于 Tabs 上的 (N) 角标）
export function rankCounts(all: Company[], scope: FilterScope): Record<string, number> {
  const rows = applyScope(all, scope)
  const counts: Record<string, number> = { all: rows.length }
  for (const b of BUCKETS) counts[b.key] = 0
  for (const r of rows) counts[bucketKey(r.patent_count)]++
  return counts
}

// 单企业详情：基本资料 + 同省排名
export function companyDetail(all: Company[], companyId: string) {
  const all_sorted = [...all].sort((a, b) => b.patent_count - a.patent_count)
  const idx = all_sorted.findIndex(r => r.company_id === companyId)
  if (idx < 0) return null
  const c = all_sorted[idx]
  return {
    company: c,
    metrics: {
      patent_count: c.patent_count,
      rank_in_province: idx + 1,
      total_companies: all_sorted.length,
      rank_tag: bucketKey(c.patent_count),
    },
  }
}

// 占位说明（页脚）
export const DATA_NOTE = '统计口径：截至导入数据日期；数据来源：本地 Excel 导入'
