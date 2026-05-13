<template>
  <div class="dashboard">
    <ScreenHeader :title="filter.currentCityName" :updated-at="filter.dimensions.updated_at" />
    <FilterBar />

    <!-- 未导入数据时显示空状态 -->
    <div v-if="!hasData" class="empty-state">
      <div class="empty-icon">📂</div>
      <div class="empty-title">尚未导入数据</div>
      <div class="empty-desc">请先上传企业名单 Excel，图表将自动生成</div>
      <router-link to="/admin/import" class="empty-btn">前往数据导入</router-link>
    </div>

    <main v-else class="dash-grid">
      <!-- Section 1: KPI -->
      <GlowPanel title="家底总览" :hint="`${filter.currentCityName}小巨人企业专利核心指标`" class="span-12">
        <div class="kpi-grid" v-if="overview?.kpis">
          <KpiCard v-for="k in overview.kpis" :key="k.key" :label="k.name" :value="k.value" :unit="k.unit"
            @click="$router.push('/companies')" />
        </div>
        <div v-else class="loading">加载中...</div>
      </GlowPanel>

      <!-- Section 2: 产业分布 -->
      <GlowPanel title="产业分布" hint="企业按产业领域分布" class="span-6">
        <div class="chart-wrap">
          <IndustryPie :items="industryData?.items || []" @click-industry="onIndustryClick" />
        </div>
        <div class="extra-stat" v-if="topIndustry">
          <span>最大产业：<b>{{ topIndustry.industry_name }}</b>
            · {{ topIndustry.company_count }} 家
            · 专利 {{ topIndustry.patent_count }} 件</span>
        </div>
      </GlowPanel>

      <!-- Section 3: 专利量分层分布 -->
      <GlowPanel title="专利量分布" hint="企业按专利数量区间分层" class="span-6">
        <div class="chart-wrap">
          <TrendLine :buckets="distData?.buckets || []" @click-bucket="onBucketClick" />
        </div>
        <div class="extra-stat" v-if="distData">
          <span>专利数为 0：<b class="warn">{{ distData.zero_count }} 家（{{ distData.zero_pct }}%）</b></span>
        </div>
      </GlowPanel>

      <!-- Section 4: 企业专利排行榜 -->
      <GlowPanel title="企业排行 · 专利量" hint="按专利量自动分档" class="span-12">
        <div class="rank-wrap">
          <div class="rank-tabs">
            <button v-for="t in tabs" :key="t.key" class="tab-btn" :class="{ active: activeTab === t.key }"
              @click="activeTab = t.key">
              <span class="tab-dot" :style="{ background: t.color }" />
              <span class="tab-label">{{ t.label }}</span>
              <span class="tab-count" v-if="rankCounts[t.key] !== undefined">({{ rankCounts[t.key] }})</span>
            </button>
            <div class="tab-spacer" />
            <button class="export-btn" @click="exportListExcel">导出 Excel</button>
          </div>
          <div class="rank-table">
            <table>
              <thead>
                <tr>
                  <th>排名</th>
                  <th>企业</th>
                  <th>市州</th>
                  <th>产业领域</th>
                  <th>批次</th>
                  <th>专利数</th>
                  <th>档位</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in rankList?.items || []" :key="c.company_id"
                  @click="$router.push(`/companies/${c.company_id}`)">
                  <td class="cell-rank">{{ c.rank }}</td>
                  <td class="cell-name">{{ c.name }}</td>
                  <td>{{ c.region_name }}</td>
                  <td>{{ c.industry_name }}</td>
                  <td>{{ c.batch }}</td>
                  <td class="cell-num">{{ c.patent_count }}</td>
                  <td>
                    <span class="tag" :data-tag="c.rank_tag">{{ tagLabel(c.rank_tag) }}</span>
                  </td>
                </tr>
                <tr v-if="!rankList?.items?.length">
                  <td colspan="7" class="empty">无符合条件的企业</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </GlowPanel>
    </main>

    <footer class="dash-footer">
      <div class="footer-note">{{ overview?.data_note }} · 数据更新：{{ overview?.updated_at }}</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFilterStore } from '@/stores/filter'
import { useDatasetStore } from '@/stores/dataset'
import {
  overviewKpis, industryMetrics, distributionMetrics,
  companyList, rankCounts as calcRankCounts, DATA_NOTE,
} from '@/data/queries'
import { exportCompanyList } from '@/data/exporter'
import ScreenHeader from '@/components/screen/ScreenHeader.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import GlowPanel from '@/components/screen/GlowPanel.vue'
import KpiCard from '@/components/screen/KpiCard.vue'
import IndustryPie from '@/components/charts/IndustryPie.vue'
import TrendLine from '@/components/charts/TrendLine.vue'

const filter = useFilterStore()
const router = useRouter()
const ds = useDatasetStore()

const hasData = computed(() => ds.hasData)

// 所有图表数据都是 computed —— 数据集 / 筛选条件变化自动重算
const overview = computed(() => ({
  kpis: overviewKpis(ds.data.companies, filter.scope),
  updated_at: filter.dimensions.updated_at,
  data_note: DATA_NOTE,
}))
const industryData = computed(() => ({ items: industryMetrics(ds.data.companies, filter.scope) }))
const distData = computed(() => distributionMetrics(ds.data.companies, filter.scope))

const topIndustry = computed(() =>
  industryData.value.items.reduce<any>(
    (top, cur) => (!top || cur.company_count > top.company_count ? cur : top), null,
  ),
)

type TabKey = 'all' | 'zero' | 'low' | 'mid_low' | 'mid' | 'mid_high' | 'high'
const tabs: { key: TabKey; label: string; color: string }[] = [
  { key: 'all',      label: '全部',     color: '#a7c0e8' },
  { key: 'zero',     label: '0 件',     color: '#ff5b5b' },
  { key: 'low',      label: '1-5 件',   color: '#fb923c' },
  { key: 'mid_low',  label: '6-10 件',  color: '#f7c873' },
  { key: 'mid',      label: '11-20 件', color: '#4ade80' },
  { key: 'mid_high', label: '21-50 件', color: '#00e5ff' },
  { key: 'high',     label: '51 件以上',color: '#b39dff' },
]
const activeTab = ref<TabKey>('all')

const rankCounts = computed(() => calcRankCounts(ds.data.companies, filter.scope))
const rankList = computed(() => companyList(
  ds.data.companies, filter.scope,
  activeTab.value === 'all' ? null : activeTab.value,
  1, 20,
))

function onIndustryClick(industry_code: string) {
  filter.state.industry_code = industry_code
  router.push('/companies')
}

function onBucketClick(rank_type: string) {
  router.push(`/companies?rank_type=${rank_type}`)
}

function tagLabel(t: string) {
  return ({ zero: '0件', low: '1-5件', mid_low: '6-10件', mid: '11-20件', mid_high: '21-50件', high: '51件+' } as Record<string, string>)[t] || t
}

function exportListExcel() {
  exportCompanyList(ds.data.companies, filter.scope, activeTab.value === 'all' ? null : activeTab.value)
}
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;

.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.dash-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: $gap-md;
  padding: $gap-md 24px;

  > .span-6  { grid-column: span 6; }
  > .span-12 { grid-column: span 12; }
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $gap-md;
  @media (max-width: 1440px) { grid-template-columns: repeat(2, 1fr); }
}

.chart-wrap {
  width: 100%;
  height: 240px;
}

.extra-stat {
  margin-top: $gap-sm;
  display: flex;
  gap: $gap-lg;
  flex-wrap: wrap;
  color: $text-secondary;
  font-size: 12px;
  letter-spacing: 1px;
  b { color: $gold; font-family: $font-mono; padding: 0 4px; }
  b.warn { color: $red-warn; }
}

.rank-wrap { display: flex; flex-direction: column; gap: $gap-sm; }

.rank-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: $gap-sm;
  border-bottom: 1px solid rgba(36, 112, 215, 0.2);
}

.tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px;
  background: rgba(36, 112, 215, 0.1);
  border: 1px solid rgba(36, 112, 215, 0.4);
  color: $text-secondary;
  font-size: 13px;
  cursor: pointer;
  border-radius: 2px;
  font-family: inherit;
  &.active {
    background: rgba(247, 200, 115, 0.2);
    border-color: $gold;
    color: $gold;
  }
  .tab-dot { width: 8px; height: 8px; border-radius: 50%; }
  .tab-count { font-family: $font-mono; opacity: 0.8; }
}

.tab-spacer { flex: 1; }

.export-btn {
  padding: 5px 14px;
  background: linear-gradient(180deg, rgba(0,229,255,0.15) 0%, rgba(0,122,153,0.05) 100%);
  border: 1px solid $cyan-accent;
  color: $cyan-accent;
  font-size: 12px;
  cursor: pointer;
  border-radius: 2px;
  &:hover { background: rgba(0,229,255,0.3); }
}

.rank-table {
  max-height: 280px;
  overflow: auto;
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    th {
      position: sticky; top: 0; z-index: 1;
      background: rgba(14, 33, 71, 0.95);
      color: $cyan-accent;
      padding: 8px 10px;
      text-align: left;
      letter-spacing: 1px;
      border-bottom: 1px solid rgba(36, 112, 215, 0.4);
      font-weight: 500;
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid rgba(36, 112, 215, 0.12);
      color: $text-primary;
    }
    tr:hover td { background: rgba(36, 112, 215, 0.1); cursor: pointer; }
    .cell-rank { color: $text-secondary; font-family: $font-mono; width: 40px; }
    .cell-name { color: $gold; }
    .cell-num  { font-family: $font-mono; text-align: right; }
    .empty { text-align: center; color: $text-muted; padding: 24px; }
  }
}

.tag {
  display: inline-block;
  padding: 1px 8px;
  font-size: 11px;
  border-radius: 2px;
  &[data-tag="zero"]     { color: #ff5b5b; border: 1px solid #ff5b5b; background: rgba(255,91,91,0.12); }
  &[data-tag="low"]      { color: #fb923c; border: 1px solid #fb923c; background: rgba(251,146,60,0.12); }
  &[data-tag="mid_low"]  { color: #f7c873; border: 1px solid #f7c873; background: rgba(247,200,115,0.12); }
  &[data-tag="mid"]      { color: #4ade80; border: 1px solid #4ade80; background: rgba(74,222,128,0.12); }
  &[data-tag="mid_high"] { color: #00e5ff; border: 1px solid #00e5ff; background: rgba(0,229,255,0.10); }
  &[data-tag="high"]     { color: #b39dff; border: 1px solid #b39dff; background: rgba(179,157,255,0.12); }
}

.dash-footer {
  padding: 10px 24px;
  background: linear-gradient(90deg, rgba(6,16,37,0.95) 0%, rgba(14,33,71,0.9) 50%, rgba(6,16,37,0.95) 100%);
  border-top: 1px solid $border-glow;
}

.footer-note {
  color: $text-muted;
  font-size: 11px;
  text-align: right;
}

.loading { color: $text-muted; padding: 24px; text-align: center; }

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 32px;

  .empty-icon {
    font-size: 48px;
    opacity: 0.6;
    filter: grayscale(0.4);
  }
  .empty-title {
    font-family: $font-display;
    font-size: 22px;
    color: $text-primary;
    letter-spacing: 3px;
  }
  .empty-desc {
    font-size: 13px;
    color: $text-muted;
    letter-spacing: 1px;
  }
  .empty-btn {
    margin-top: 8px;
    padding: 10px 32px;
    background: linear-gradient(180deg, rgba(247,200,115,0.25) 0%, rgba(212,160,74,0.08) 100%);
    border: 1px solid $gold;
    color: $gold;
    font-size: 14px;
    letter-spacing: 2px;
    border-radius: 2px;
    text-decoration: none;
    transition: background 0.2s;
    &:hover { background: rgba(247,200,115,0.35); }
  }
}
</style>
