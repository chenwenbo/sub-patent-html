<template>
  <div class="page">
    <SubPageHeader title="企业名单" :subtitle="`当前视角：${filter.scopeLabel} · 共 ${total} 家`" />
    <FilterBar />

    <div class="toolbar">
      <button v-for="t in tabs" :key="t.key" class="tab" :class="{ active: lt === t.key }"
        @click="lt = t.key">
        <span class="dot" :style="{ background: t.color }" />
        {{ t.label }}
        <span class="cnt" v-if="counts[t.key] !== undefined">({{ counts[t.key] }})</span>
      </button>
      <div class="spacer" />
      <button class="export" @click="exportCompanyList(ds.data.companies, filter.scope, lt)">导出名单</button>
      <button class="export" style="margin-left:8px" @click="exportCompanyMaster(ds.data.companies, filter.scope)">导出主表</button>
    </div>

    <div class="list-area">
      <table v-if="ds.hasData">
        <thead>
          <tr>
            <th style="width:48px">排名</th>
            <th>企业名称</th>
            <th>市州</th>
            <th>主导产业</th>
            <th>批次</th>
            <th style="width:72px; text-align:right">专利数</th>
            <th style="width:88px">档位</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in items" :key="c.company_id" @click="$router.push(`/companies/${c.company_id}`)">
            <td class="rank">{{ c.rank }}</td>
            <td class="name">{{ c.name }}</td>
            <td>{{ c.region_name }}</td>
            <td>{{ c.industry_name }}</td>
            <td>{{ c.batch }}</td>
            <td class="num">{{ c.patent_count }}</td>
            <td><span class="tag" :data-tag="c.rank_tag">{{ tagLabel(c.rank_tag) }}</span></td>
          </tr>
          <tr v-if="!items.length">
            <td colspan="7" class="empty">无符合条件的企业</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!ds.hasData" class="no-data-tip">
        <div>尚未导入数据 — </div>
        <router-link class="link" to="/admin/import">前往导入页上传企业名单 Excel</router-link>
      </div>
      <div class="pager" v-if="ds.hasData">
        <button :disabled="page <= 1" @click="page--">上一页</button>
        <span>第 {{ page }} 页 / 共 {{ Math.max(1, Math.ceil(total / pageSize)) }} 页</span>
        <button :disabled="page * pageSize >= total" @click="page++">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFilterStore } from '@/stores/filter'
import { useDatasetStore } from '@/stores/dataset'
import { companyList, rankCounts as calcRankCounts } from '@/data/queries'
import { exportCompanyList, exportCompanyMaster } from '@/data/exporter'
import SubPageHeader from '@/components/common/SubPageHeader.vue'
import FilterBar from '@/components/common/FilterBar.vue'

const route  = useRoute()
const filter = useFilterStore()
const ds = useDatasetStore()

type TabKey = 'zero' | 'low' | 'mid_low' | 'mid' | 'mid_high' | 'high'
const tabs: { key: TabKey; label: string; color: string }[] = [
  { key: 'zero',     label: '0 件',      color: '#ff5b5b' },
  { key: 'low',      label: '1-5 件',    color: '#fb923c' },
  { key: 'mid_low',  label: '6-10 件',   color: '#f7c873' },
  { key: 'mid',      label: '11-20 件',  color: '#4ade80' },
  { key: 'mid_high', label: '21-50 件',  color: '#00e5ff' },
  { key: 'high',     label: '51 件以上', color: '#b39dff' },
]

const lt   = ref<TabKey | null>(null)
const page = ref(1)
const pageSize = 50

const result = computed(() => companyList(ds.data.companies, filter.scope, lt.value, page.value, pageSize))
const items  = computed(() => result.value.items)
const total  = computed(() => result.value.total)
const counts = computed(() => calcRankCounts(ds.data.companies, filter.scope))

function tagLabel(t: string) {
  return ({
    zero: '0件', low: '1-5件', mid_low: '6-10件',
    mid: '11-20件', mid_high: '21-50件', high: '51件+',
  } as Record<string, string>)[t] || t
}

watch(() => filter.scope, () => { page.value = 1 }, { deep: true })
watch(lt, () => { page.value = 1 })

const VALID_KEYS = new Set(['zero','low','mid_low','mid','mid_high','high'])

onMounted(() => {
  const rt = route.query.rank_type as string
  if (rt && VALID_KEYS.has(rt)) lt.value = rt as TabKey
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;

.page { min-height: 100vh; display: flex; flex-direction: column; position: relative; z-index: 1; }

.toolbar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 12px 32px;
  border-bottom: 1px solid rgba(36,112,215,0.2);

  .tab {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    background: rgba(36,112,215,0.1);
    border: 1px solid rgba(36,112,215,0.4);
    color: $text-secondary;
    font-size: 13px; cursor: pointer; border-radius: 2px;
    font-family: inherit;
    .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .cnt { font-family: $font-mono; opacity: 0.8; }
    &.active { background: rgba(247,200,115,0.2); border-color: $gold; color: $gold; }
  }
  .spacer { flex: 1; }
  .export {
    padding: 6px 16px;
    background: rgba(0,229,255,0.15);
    border: 1px solid $cyan-accent;
    color: $cyan-accent;
    font-size: 12px; cursor: pointer; border-radius: 2px;
    &:hover { background: rgba(0,229,255,0.3); }
  }
}

.list-area {
  flex: 1; padding: 16px 32px;
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    background: rgba(14,33,71,0.4);
    th {
      padding: 10px 14px;
      background: rgba(14,33,71,0.95);
      color: $cyan-accent;
      text-align: left;
      letter-spacing: 1px;
      border-bottom: 1px solid rgba(36,112,215,0.4);
      font-weight: 500;
      position: sticky; top: 0; z-index: 1;
    }
    td { padding: 10px 14px; border-bottom: 1px solid rgba(36,112,215,0.12); color: $text-primary; }
    tr:hover td { background: rgba(36,112,215,0.1); cursor: pointer; }
    .rank { color: $text-muted; font-family: $font-mono; }
    .name { color: $gold; }
    .num  { font-family: $font-mono; text-align: right; }
    .empty { text-align: center; color: $text-muted; padding: 32px; }
  }
}

.tag {
  display: inline-block;
  padding: 1px 8px; font-size: 11px; border-radius: 2px;
  &[data-tag="zero"]     { color:#ff5b5b; border:1px solid #ff5b5b; background:rgba(255,91,91,0.12); }
  &[data-tag="low"]      { color:#fb923c; border:1px solid #fb923c; background:rgba(251,146,60,0.12); }
  &[data-tag="mid_low"]  { color:#f7c873; border:1px solid #f7c873; background:rgba(247,200,115,0.12); }
  &[data-tag="mid"]      { color:#4ade80; border:1px solid #4ade80; background:rgba(74,222,128,0.12); }
  &[data-tag="mid_high"] { color:#00e5ff; border:1px solid #00e5ff; background:rgba(0,229,255,0.10); }
  &[data-tag="high"]     { color:#b39dff; border:1px solid #b39dff; background:rgba(179,157,255,0.12); }
}

.no-data-tip {
  text-align: center;
  padding: 60px 24px;
  color: $text-muted;
  font-size: 13px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  .link {
    padding: 8px 24px;
    border: 1px solid $gold;
    background: rgba(247,200,115,0.12);
    color: $gold;
    text-decoration: none;
    border-radius: 2px;
    letter-spacing: 1px;
    &:hover { background: rgba(247,200,115,0.25); }
  }
}
.pager {
  display: flex; justify-content: center; gap: 16px; padding: 16px;
  align-items: center;
  button {
    padding: 6px 18px;
    background: rgba(36,112,215,0.15);
    border: 1px solid $border-glow;
    color: $text-primary; cursor: pointer; border-radius: 2px;
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }
  span { color: $text-muted; font-size: 12px; }
}
</style>
