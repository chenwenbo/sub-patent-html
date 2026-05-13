// 湖北 17 市州、产业、批次 — 与 backend/app/services/importer.py 中的字典对齐。

export interface RegionDict { region_code: string; region_name: string; sort: number }
export interface IndustryDict { industry_code: string; industry_name: string; sort: number }

export const REGION_DICT: Record<string, [string, string]> = {
  宜昌: ['420500', '宜昌市'], 宜昌市: ['420500', '宜昌市'],
  襄阳: ['420600', '襄阳市'], 襄阳市: ['420600', '襄阳市'],
  荆州: ['421000', '荆州市'], 荆州市: ['421000', '荆州市'],
  黄石: ['420200', '黄石市'], 黄石市: ['420200', '黄石市'],
  随州: ['421300', '随州市'], 随州市: ['421300', '随州市'],
  仙桃: ['429004', '仙桃市'], 仙桃市: ['429004', '仙桃市'],
  鄂州: ['420700', '鄂州市'], 鄂州市: ['420700', '鄂州市'],
  孝感: ['420900', '孝感市'], 孝感市: ['420900', '孝感市'],
  黄冈: ['421100', '黄冈市'], 黄冈市: ['421100', '黄冈市'],
  咸宁: ['421200', '咸宁市'], 咸宁市: ['421200', '咸宁市'],
  荆门: ['420800', '荆门市'], 荆门市: ['420800', '荆门市'],
  十堰: ['420300', '十堰市'], 十堰市: ['420300', '十堰市'],
  恩施: ['422800', '恩施州'], 恩施州: ['422800', '恩施州'],
  潜江: ['429005', '潜江市'], 潜江市: ['429005', '潜江市'],
  天门: ['429006', '天门市'], 天门市: ['429006', '天门市'],
}

export const REGION_SORT: Record<string, number> = {
  '420500': 1, '420600': 2, '421000': 3, '420900': 4,
  '421100': 5, '420200': 6, '420800': 7, '421200': 8,
  '420300': 9, '421300': 10, '420700': 11, '429004': 12,
  '422800': 13, '429005': 14, '429006': 15,
}

export const INDUSTRY_DICT: Record<string, [string, string]> = {
  '高端装备制造产业': ['IND001', '高端装备制造产业'],
  '新材料产业': ['IND002', '新材料产业'],
  '新一代信息技术产业': ['IND003', '新一代信息技术产业'],
  '生物产业': ['IND004', '生物产业'],
  '新能源产业': ['IND005', '新能源产业'],
  '节能环保产业': ['IND006', '节能环保产业'],
  '其他产业': ['IND007', '其他产业'],
  '数字创意产业': ['IND008', '数字创意产业'],
}

export const INDUSTRY_SORT: Record<string, number> = {
  IND001: 1, IND002: 2, IND003: 3, IND004: 4,
  IND005: 5, IND006: 6, IND007: 7, IND008: 8,
}

export const BATCH_ORDER = [
  '第二批', '第三批', '第四批', '第五批', '第六批', '第七批',
  '省三批', '省四批', '2025复核',
]

export function normalizeBatch(raw: string): string {
  const s = String(raw || '').trim()
  if (s.includes('第二批')) return '第二批'
  if (s.includes('第三批') && !s.includes('省')) return '第三批'
  if (s.includes('第四批') && !s.includes('省')) return '第四批'
  if (s.includes('第五批')) return '第五批'
  if (s.includes('第六批')) return '第六批'
  if (s.includes('第七批')) return '第七批'
  if (s.includes('省') && s.includes('三批')) return '省三批'
  if (s.includes('省') && s.includes('四批')) return '省四批'
  if (s.includes('2025') && s.includes('复核')) return '2025复核'
  return s
}
