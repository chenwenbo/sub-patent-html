<template>
  <div class="page" v-if="data">
    <SubPageHeader
      :title="data.company.name"
      :subtitle="`${data.company.region_name} · ${data.company.industry_name} · ${data.company.batch}`"
    />
    <div class="back-row">
      <router-link to="/companies" class="back">← 返回企业名单</router-link>
    </div>

    <div class="kpi-row">
      <div class="kpi">
        <span class="lbl">专利总量</span>
        <span class="val">{{ data.metrics.patent_count }}</span>
      </div>
      <div class="kpi">
        <span class="lbl">全省排名</span>
        <span class="val">
          {{ data.metrics.rank_in_province }} <small>/ {{ data.metrics.total_companies }}</small>
        </span>
      </div>
      <div class="kpi">
        <span class="lbl">分档</span>
        <span class="val tag" :data-tag="data.metrics.rank_tag">{{ tagLabel(data.metrics.rank_tag) }}</span>
      </div>
      <div class="kpi">
        <span class="lbl">企业编号</span>
        <span class="val small">{{ data.company.company_id }}</span>
      </div>
    </div>

    <div class="info-card">
      <h3>企业基本信息</h3>
      <div class="info-grid">
        <div><span>企业名称</span><b>{{ data.company.name }}</b></div>
        <div><span>所属市州</span><b>{{ data.company.region_name }} ({{ data.company.region_code }})</b></div>
        <div><span>主导产业</span><b>{{ data.company.industry_name }}</b></div>
        <div><span>认定批次</span><b>{{ data.company.batch }}</b></div>
        <div><span>专利数</span><b class="gold">{{ data.company.patent_count }} 件</b></div>
      </div>
      <p class="hint">
        说明：本离线版仅基于导入 Excel 的「企业 - 专利总数」级数据展示，
        不包含逐条专利明细（专利号 / 申请日 / 法律状态等）。
      </p>
    </div>
  </div>

  <div class="page" v-else>
    <SubPageHeader title="企业详情" subtitle="未找到企业" />
    <div class="empty-msg">
      <p>未找到企业 <code>{{ route.params.id }}</code>，可能是因为还未导入数据。</p>
      <router-link class="link" to="/admin/import">前往导入</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDatasetStore } from '@/stores/dataset'
import { companyDetail } from '@/data/queries'
import SubPageHeader from '@/components/common/SubPageHeader.vue'

const route = useRoute()
const ds = useDatasetStore()
const data = computed(() => companyDetail(ds.data.companies, route.params.id as string))

function tagLabel(t: string) {
  return ({
    zero: '0件', low: '1-5件', mid_low: '6-10件', mid: '11-20件', mid_high: '21-50件', high: '51件+',
  } as Record<string, string>)[t] || t
}
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;
.page { min-height: 100vh; padding-bottom: 40px; position: relative; z-index: 1; }

.back-row { padding: 12px 32px 0; }
.back {
  display: inline-block;
  padding: 4px 12px;
  font-size: 12px;
  color: $text-secondary;
  border: 1px solid rgba(36,112,215,0.4);
  border-radius: 2px;
  text-decoration: none;
  &:hover { color: $gold; border-color: $gold; }
}

.kpi-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16px; padding: 16px 32px;
  .kpi {
    padding: 16px;
    background: linear-gradient(135deg, rgba(36,112,215,0.18), rgba(10,23,51,0.3));
    border: 1px solid rgba(36,112,215,0.5);
    border-radius: 2px;
    display: flex; flex-direction: column; gap: 6px;
    .lbl { color: $text-secondary; font-size: 12px; }
    .val { @include kpi-number; font-size: 22px;
      small { font-size: 14px; color: $text-secondary; -webkit-text-fill-color: $text-secondary; }
    }
    .val.small { font-family: $font-mono; font-size: 14px; background: none; -webkit-text-fill-color: $text-primary; }
    .val.tag {
      display: inline-block; padding: 2px 10px; font-size: 14px; border-radius: 2px;
      background: none; -webkit-text-fill-color: inherit;
      &[data-tag="zero"]     { color:#ff5b5b; border:1px solid #ff5b5b; background:rgba(255,91,91,0.12); }
      &[data-tag="low"]      { color:#fb923c; border:1px solid #fb923c; background:rgba(251,146,60,0.12); }
      &[data-tag="mid_low"]  { color:#f7c873; border:1px solid #f7c873; background:rgba(247,200,115,0.12); }
      &[data-tag="mid"]      { color:#4ade80; border:1px solid #4ade80; background:rgba(74,222,128,0.12); }
      &[data-tag="mid_high"] { color:#00e5ff; border:1px solid #00e5ff; background:rgba(0,229,255,0.10); }
      &[data-tag="high"]     { color:#b39dff; border:1px solid #b39dff; background:rgba(179,157,255,0.12); }
    }
  }
}

.info-card {
  margin: 16px 32px;
  padding: 24px;
  background: linear-gradient(180deg, rgba(14,33,71,0.85), rgba(10,23,51,0.7));
  border: 1px solid rgba(36,112,215,0.5);
  h3 { color: $gold; font-size: 14px; letter-spacing: 2px; margin-bottom: 16px; }
  .info-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px 32px;
    > div { display: flex; gap: 12px; font-size: 13px; }
    span { color: $text-secondary; min-width: 84px; }
    b { color: $text-primary; font-weight: 400; }
    b.gold { color: $gold; font-family: $font-mono; }
  }
  .hint {
    margin-top: 18px;
    padding: 10px 14px;
    background: rgba(36,112,215,0.08);
    border-left: 3px solid $cyan-accent;
    color: $text-muted;
    font-size: 12px;
    line-height: 1.7;
  }
}

.empty-msg {
  padding: 80px 32px;
  text-align: center;
  color: $text-muted;
  p { margin-bottom: 18px; font-size: 14px; }
  code { color: $gold; font-family: $font-mono; padding: 2px 8px; background: rgba(247,200,115,0.1); }
  .link {
    display: inline-block; padding: 8px 24px;
    border: 1px solid $gold; color: $gold;
    background: rgba(247,200,115,0.12);
    text-decoration: none; border-radius: 2px;
    &:hover { background: rgba(247,200,115,0.25); }
  }
}
</style>
