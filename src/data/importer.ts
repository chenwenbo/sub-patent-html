// 浏览器端 Excel 解析 —— 与 backend/app/services/importer.py 列顺序一致：
//   A 序号 | B 地市 | C 企业名称 | D 批次 | E 专利数 | F 产业领域 | （其余列忽略）

import * as XLSX from 'xlsx'
import type { Company, Dataset } from './types'
import {
  REGION_DICT, REGION_SORT, INDUSTRY_DICT, INDUSTRY_SORT, BATCH_ORDER, normalizeBatch,
} from './dictionaries'

export interface ImportSummary {
  company_count: number
  patent_total: number
  region_count: number
  zero_count: number
  warnings: string[]
}

export interface ImportResult {
  dataset: Dataset
  summary: ImportSummary
}

function toStr(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function toInt(v: unknown): number {
  if (v === null || v === undefined || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

export async function importExcelFile(file: File): Promise<ImportResult> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) throw new Error('Excel 第一个工作表为空')

  // header: 1 → 用二维数组，自己处理表头（兼容用户表头变体）
  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false })
  if (rows.length < 2) throw new Error('Excel 至少要有 1 行表头 + 1 行数据')

  const companies: Company[] = []
  const seenRegions = new Map<string, { region_code: string; region_name: string; sort: number }>()
  const seenIndustries = new Map<string, { industry_code: string; industry_name: string; sort: number }>()
  const seenBatches = new Set<string>()
  const warnings: string[] = []
  let cid = 1

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue
    // 跳过完全空白行
    if (row.every(v => v === null || v === undefined || String(v).trim() === '')) continue

    // 列顺序：[序号, 地市, 企业名称, 批次, 专利数, 产业]
    const [, cityRaw, nameRaw, batchRaw, patentRaw, domainRaw] = row
    const city = toStr(cityRaw)
    const name = toStr(nameRaw)
    const batchTxt = toStr(batchRaw)
    const domain = toStr(domainRaw)

    if (!city || !name) continue

    const region = REGION_DICT[city]
    if (!region) {
      warnings.push(`第 ${i + 1} 行未识别地市：${JSON.stringify(city)}，跳过「${name}」`)
      continue
    }
    const [region_code, region_name] = region
    const industry = INDUSTRY_DICT[domain] ?? ['IND007', '其他产业']
    const [industry_code, industry_name] = industry

    companies.push({
      company_id: `C${String(cid).padStart(5, '0')}`,
      name,
      region_code, region_name,
      industry_code, industry_name,
      batch: normalizeBatch(batchTxt),
      patent_count: toInt(patentRaw),
    })
    seenRegions.set(region_code, { region_code, region_name, sort: REGION_SORT[region_code] ?? 99 })
    seenIndustries.set(industry_code, { industry_code, industry_name, sort: INDUSTRY_SORT[industry_code] ?? 99 })
    seenBatches.add(normalizeBatch(batchTxt))
    cid++
  }

  if (companies.length === 0) {
    throw new Error('未解析到任何有效企业行，请检查列顺序：地市 / 企业名称 / 批次 / 专利数 / 产业')
  }

  const regions = [...seenRegions.values()].sort((a, b) => a.sort - b.sort)
  const industries = [...seenIndustries.values()].sort((a, b) => a.sort - b.sort)
  // 批次：按 BATCH_ORDER 先固定排，剩余按字典序追加
  const batches: string[] = []
  for (const b of BATCH_ORDER) if (seenBatches.has(b)) batches.push(b)
  ;[...seenBatches].filter(b => !BATCH_ORDER.includes(b)).sort().forEach(b => batches.push(b))

  const dataset: Dataset = {
    companies, regions, industries, batches,
    updated_at: new Date().toISOString(),
    source_name: file.name,
  }

  const summary: ImportSummary = {
    company_count: companies.length,
    patent_total: companies.reduce((s, c) => s + c.patent_count, 0),
    region_count: regions.length,
    zero_count: companies.filter(c => c.patent_count === 0).length,
    warnings,
  }

  return { dataset, summary }
}

// 提供一个"下载导入模板"的辅助函数（导入页用）
export function downloadTemplate() {
  const headers = ['序号', '地市', '企业名称', '认定批次', '专利数量', '产业领域']
  const sample: (string | number)[][] = [
    headers,
    [1, '宜昌市', '示例企业（请删除）有限公司', '第五批', 12, '高端装备制造产业'],
    [2, '武汉市', '示例企业 B 股份公司', '第六批', 3, '新材料产业'],
  ]
  const ws = XLSX.utils.aoa_to_sheet(sample)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '企业名单')
  XLSX.writeFile(wb, '企业名单导入模板.xlsx')
}
