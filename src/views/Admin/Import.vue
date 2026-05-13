<template>
  <div class="page">
    <SubPageHeader title="数据导入" subtitle="上传企业名单 Excel，浏览器内解析，所有图表自动刷新" />

    <div class="content">
      <!-- 当前数据集状态 -->
      <div class="status-card" v-if="ds.hasData && !result">
        <div class="status-line">
          <span class="dot ok" />
          <span>已加载数据集</span>
          <b class="src">{{ ds.data.source_name || '—' }}</b>
          <span class="meta">{{ ds.data.companies.length }} 家企业 · {{ ds.data.regions.length }} 个市州 · 更新时间 {{ filter.dimensions.updated_at }}</span>
          <span class="spacer" />
          <button class="ghost-btn" @click="onClear">清空数据</button>
        </div>
      </div>

      <!-- 上传区 -->
      <div class="upload-card">
        <div
          class="upload-area"
          :class="{ dragging, done: result, error: errorMsg }"
          @click="pickFile"
          @drop.prevent="onDrop"
          @dragover.prevent="dragging = true"
          @dragleave="dragging = false"
        >
          <template v-if="uploading">
            <div class="spinner" />
            <div class="upload-label">正在解析，请稍候…</div>
          </template>
          <template v-else-if="result">
            <div class="ico ok">✓</div>
            <div class="upload-label">导入成功，图表已刷新</div>
            <div class="sub">点击可重新上传</div>
          </template>
          <template v-else-if="errorMsg">
            <div class="ico err">✕</div>
            <div class="upload-label">{{ errorMsg }}</div>
            <div class="sub">点击重试</div>
          </template>
          <template v-else>
            <div class="ico up">↑</div>
            <div class="upload-label">点击或拖拽企业名单 Excel</div>
            <div class="sub">支持 .xlsx / .xls，最大 50 MB · 全程浏览器内解析</div>
          </template>
        </div>
        <input ref="fileInput" type="file" accept=".xlsx,.xls" style="display:none" @change="onFileChange" />
      </div>

      <!-- 导入结果 -->
      <div class="result-card" v-if="result">
        <div class="stat-row">
          <div class="stat">
            <div class="stat-value">{{ result.company_count }}</div>
            <div class="stat-label">企业</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ result.patent_total }}</div>
            <div class="stat-label">专利总量</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ result.region_count }}</div>
            <div class="stat-label">地市</div>
          </div>
          <div class="stat warn" v-if="result.zero_count">
            <div class="stat-value">{{ result.zero_count }}</div>
            <div class="stat-label">专利数为 0</div>
          </div>
        </div>
        <div class="warn-list" v-if="result.warnings?.length">
          <div class="warn-title">导入警告（以下行已跳过）</div>
          <div class="warn-item" v-for="w in result.warnings" :key="w">{{ w }}</div>
        </div>
        <div class="action-row">
          <router-link to="/dashboard" class="btn-primary">查看驾驶舱</router-link>
          <router-link to="/companies" class="btn-secondary">查看企业名单</router-link>
        </div>
      </div>

      <!-- 格式说明 -->
      <div class="format-card">
        <div class="format-title-row">
          <div class="format-title">Excel 列顺序要求</div>
          <button class="ghost-btn" @click="onDownloadTemplate">下载导入模板</button>
        </div>
        <table class="format-table">
          <thead>
            <tr><th>列</th><th>字段</th><th>示例</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr><td>A</td><td>序号（可为空）</td><td>1</td><td>用于人工核对，导入时忽略</td></tr>
            <tr><td>B</td><td>地市</td><td>宜昌 / 宜昌市</td><td>必须在湖北 17 市州内</td></tr>
            <tr><td>C</td><td>企业名称</td><td>湖北XX有限公司</td><td>不能为空</td></tr>
            <tr><td>D</td><td>认定批次</td><td>第五批专精特新…</td><td>自动归一为「第五批 / 省三批 / 2025复核」等</td></tr>
            <tr><td>E</td><td>专利数量</td><td>42</td><td>整数；为空或非数字按 0 处理</td></tr>
            <tr><td>F</td><td>产业领域</td><td>高端装备制造产业</td><td>未识别则归入「其他产业」</td></tr>
          </tbody>
        </table>
        <p class="hint">
          数据全程保存在你本机浏览器的 localStorage 中，不会上传到任何服务器。
          关闭浏览器后下次打开仍可继续使用。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SubPageHeader from '@/components/common/SubPageHeader.vue'
import { useDatasetStore } from '@/stores/dataset'
import { useFilterStore } from '@/stores/filter'
import { importExcelFile, downloadTemplate, type ImportSummary } from '@/data/importer'

const ds = useDatasetStore()
const filter = useFilterStore()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const dragging  = ref(false)
const result    = ref<ImportSummary | null>(null)
const errorMsg  = ref('')

function pickFile() {
  result.value = null
  errorMsg.value = ''
  fileInput.value?.click()
}

function onDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) doImport(file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) doImport(file)
}

async function doImport(file: File) {
  uploading.value = true
  result.value    = null
  errorMsg.value  = ''
  try {
    const { dataset, summary } = await importExcelFile(file)
    ds.setDataset(dataset)
    filter.reset()
    result.value = summary
  } catch (e: any) {
    errorMsg.value = e?.message || '解析失败，请检查 Excel 文件'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function onClear() {
  if (!confirm('确认清空当前数据集？此操作不可撤销。')) return
  ds.clear()
  result.value = null
}

function onDownloadTemplate() {
  downloadTemplate()
}
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;

.page { min-height: 100vh; position: relative; z-index: 1; }
.content { padding: 24px 32px; max-width: 920px; display: flex; flex-direction: column; gap: 16px; }

.status-card {
  padding: 12px 18px;
  background: linear-gradient(180deg, rgba(74,222,128,0.08), rgba(10,23,51,0.4));
  border: 1px solid rgba(74,222,128,0.4);
  border-radius: 2px;
}
.status-line {
  display: flex; align-items: center; gap: 10px; font-size: 13px; color: $text-secondary; flex-wrap: wrap;
  .dot { width: 8px; height: 8px; border-radius: 50%; &.ok { background: #4ade80; box-shadow: 0 0 6px #4ade80; } }
  .src { color: $gold; font-family: $font-mono; font-weight: 500; }
  .meta { color: $text-muted; font-size: 12px; }
  .spacer { flex: 1; }
}

.ghost-btn {
  padding: 5px 14px;
  font-size: 12px;
  background: transparent;
  border: 1px solid rgba(36,112,215,0.5);
  color: $text-secondary;
  cursor: pointer;
  border-radius: 2px;
  &:hover { color: $gold; border-color: $gold; }
}

.upload-card, .result-card, .format-card {
  padding: 24px;
  background: linear-gradient(180deg, rgba(14,33,71,0.85), rgba(10,23,51,0.7));
  border: 1px solid rgba(36,112,215,0.5);
  border-radius: 2px;
}

.upload-area {
  padding: 48px 32px;
  border: 2px dashed rgba(36,112,215,0.5);
  border-radius: 2px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  color: $text-secondary;
  &:hover, &.dragging { border-color: $gold; background: rgba(247,200,115,0.05); }
  &.done  { border-color: #4ade80; background: rgba(74,222,128,0.05); }
  &.error { border-color: #ff5b5b; background: rgba(255,91,91,0.05); }
}

.ico {
  width: 52px; height: 52px;
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 700;
  &.up  { background: rgba(0,229,255,0.15); border: 1px solid $cyan-accent; color: $cyan-accent; }
  &.ok  { background: rgba(74,222,128,0.15); border: 1px solid #4ade80; color: #4ade80; }
  &.err { background: rgba(255,91,91,0.15); border: 1px solid #ff5b5b; color: #ff5b5b; }
}

.upload-label { font-size: 15px; letter-spacing: 1px; }
.sub { font-size: 12px; color: $text-muted; margin-top: 6px; }

.spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(0,229,255,0.2);
  border-top-color: $cyan-accent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 14px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.stat-row { display: flex; gap: 32px; flex-wrap: wrap; margin-bottom: 16px; }
.stat {
  text-align: center;
  .stat-value { font-family: $font-mono; font-size: 28px; color: $gold; line-height: 1.2; }
  .stat-label { font-size: 12px; color: $text-muted; margin-top: 4px; letter-spacing: 1px; }
  &.warn .stat-value { color: #fb923c; }
}

.warn-list {
  margin-bottom: 16px;
  padding: 10px 14px;
  background: rgba(251,146,60,0.08);
  border-left: 3px solid #fb923c;
  max-height: 220px; overflow: auto;
}
.warn-title { font-size: 12px; color: #fb923c; margin-bottom: 6px; }
.warn-item  { font-size: 12px; color: $text-muted; line-height: 1.8; }

.action-row { display: flex; gap: 12px; margin-top: 4px; flex-wrap: wrap; }
.btn-primary {
  padding: 8px 24px;
  background: linear-gradient(180deg, $gold, $gold-deep);
  color: $bg-primary;
  border: 1px solid $gold;
  font-weight: 600; cursor: pointer; border-radius: 2px;
  font-size: 13px; letter-spacing: 1px;
  text-decoration: none; display: inline-block;
}
.btn-secondary {
  padding: 8px 24px;
  background: rgba(0,229,255,0.12);
  color: $cyan-accent;
  border: 1px solid $cyan-accent;
  cursor: pointer; border-radius: 2px;
  font-size: 13px; letter-spacing: 1px;
  text-decoration: none; display: inline-block;
}

.format-title-row {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
}
.format-title { color: $gold; font-size: 13px; letter-spacing: 1px; }
.format-table {
  width: 100%; border-collapse: collapse; font-size: 12px;
  th {
    background: rgba(36,112,215,0.15); color: $cyan-accent;
    padding: 8px 12px; text-align: left;
    border-bottom: 1px solid rgba(36,112,215,0.3); font-weight: 500;
  }
  td {
    padding: 7px 12px; border-bottom: 1px solid rgba(36,112,215,0.1);
    color: $text-secondary;
  }
  tr:last-child td { border-bottom: none; }
  td:first-child { font-family: $font-mono; color: $gold; width: 40px; }
}
.hint {
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(36,112,215,0.08);
  border-left: 3px solid $cyan-accent;
  color: $text-muted;
  font-size: 12px;
  line-height: 1.7;
}
</style>
