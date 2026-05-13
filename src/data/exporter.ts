// 浏览器端 Excel 导出 —— 对齐后端 /export/excel 的 sheet_key 语义：
//   overview / regions / industries / rank_{type} / rank_all / company_master

import * as XLSX from 'xlsx'
import type { Company, FilterScope, RankType } from './types'
import {
  overviewKpis, regionMetrics, industryMetrics, distributionMetrics,
  companyList, applyScope,
} from './queries'

const RANK_LABEL: Record<string, string> = {
  zero: '0 件', low: '1-5 件', mid_low: '6-10 件',
  mid: '11-20 件', mid_high: '21-50 件', high: '51 件以上',
}

function scopeFilename(scope: FilterScope, prefix: string): string {
  const tags = [prefix]
  if (scope.region_code) tags.push(scope.region_code)
  if (scope.industry_code) tags.push(scope.industry_code)
  if (scope.batch) tags.push(scope.batch)
  const ts = new Date().toISOString().slice(0, 10)
  return `${tags.join('_')}_${ts}.xlsx`
}

function saveBook(wb: XLSX.WorkBook, name: string) {
  XLSX.writeFile(wb, name)
}

export function exportOverview(all: Company[], scope: FilterScope) {
  const wb = XLSX.utils.book_new()
  const kpis = overviewKpis(all, scope)
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    kpis.map(k => ({ 指标: k.name, 数值: k.value, 单位: k.unit })),
  ), '总览 KPI')

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    regionMetrics(all, scope).map(r => ({
      市州编码: r.region_code, 市州: r.region_name,
      企业数: r.company_count, 专利总量: r.patent_count, 户均专利: r.patent_per_company,
    })),
  ), '市州聚合')

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    industryMetrics(all, scope).map(r => ({
      产业编码: r.industry_code, 产业: r.industry_name,
      企业数: r.company_count, 专利总量: r.patent_count, 户均专利: r.patent_per_company,
    })),
  ), '产业聚合')

  const dist = distributionMetrics(all, scope)
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    dist.buckets.map(b => ({ 档位: b.label, 企业数: b.company_count, 占比: `${b.pct}%` })),
  ), '专利量分布')

  saveBook(wb, scopeFilename(scope, '驾驶舱总览'))
}

export function exportCompanyList(all: Company[], scope: FilterScope, rankType: RankType | null) {
  const { items } = companyList(all, scope, rankType, 1, 99999)
  const wb = XLSX.utils.book_new()
  const rows = items.map(c => ({
    排名: c.rank, 企业名称: c.name, 市州: c.region_name,
    产业领域: c.industry_name, 批次: c.batch,
    专利数: c.patent_count, 档位: RANK_LABEL[c.rank_tag] || c.rank_tag,
  }))
  const sheetName = rankType ? `名单_${RANK_LABEL[rankType]}` : '企业名单_全部'
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sheetName)
  saveBook(wb, scopeFilename(scope, rankType ? `企业名单_${rankType}` : '企业名单_全部'))
}

// 企业主表：所有原始字段，供客户做二次分析
export function exportCompanyMaster(all: Company[], scope: FilterScope) {
  const rows = applyScope(all, scope).map((c, i) => ({
    序号: i + 1,
    企业编号: c.company_id, 企业名称: c.name,
    市州编码: c.region_code, 市州: c.region_name,
    产业编码: c.industry_code, 产业: c.industry_name,
    批次: c.batch, 专利数: c.patent_count,
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), '企业主表')
  saveBook(wb, scopeFilename(scope, '企业主表'))
}

// 通用入口：兼容旧 Dashboard 中 `exportExcel(`rank_${tab}`, scope)` 调法
export function exportByKey(all: Company[], scope: FilterScope, sheetKey: string) {
  if (sheetKey === 'overview') return exportOverview(all, scope)
  if (sheetKey === 'company_master') return exportCompanyMaster(all, scope)
  if (sheetKey === 'rank_all') return exportCompanyList(all, scope, null)
  if (sheetKey.startsWith('rank_')) {
    const rt = sheetKey.slice('rank_'.length) as RankType
    return exportCompanyList(all, scope, rt)
  }
  // 默认导出总览
  return exportOverview(all, scope)
}
