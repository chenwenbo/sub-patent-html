<template>
  <div class="shiyan-view">
    <ScreenHeader title="十堰市企业专利分布" :updated-at="updatedAt" />

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">加载中...</div>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <div class="error-text">{{ error }}</div>
    </div>

    <main v-else class="shiyan-grid">
      <!-- 地图展示 -->
      <GlowPanel title="十堰市地图" hint="企业与专利分布可视化" class="span-12">
        <div class="map-container">
          <ShiyanMap :districts="districts" :companies="companies" />
        </div>
      </GlowPanel>

      <!-- 统计数据 -->
      <GlowPanel title="区县统计" hint="各区县企业与专利数据" class="span-12">
        <div class="stats-table">
          <table>
            <thead>
              <tr>
                <th>区县</th>
                <th>企业数</th>
                <th>专利总数</th>
                <th>户均专利</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in sortedDistricts" :key="d.name">
                <td class="cell-name">{{ d.name }}</td>
                <td class="cell-num">{{ d.company_count }}</td>
                <td class="cell-num">{{ d.patent_count }}</td>
                <td class="cell-num">{{ d.patent_per_company.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlowPanel>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ScreenHeader from '@/components/screen/ScreenHeader.vue'
import GlowPanel from '@/components/screen/GlowPanel.vue'
import ShiyanMap from '@/components/charts/ShiyanMap.vue'

interface District {
  name: string
  company_count: number
  patent_count: number
  patent_per_company: number
}

interface Company {
  序号: number
  地市: string
  企业名称: string
  区县: string
  自主申请专利数: number
}

const loading = ref(true)
const error = ref('')
const districts = ref<District[]>([])
const companies = ref<Company[]>([])
const updatedAt = ref('2024-05')

const sortedDistricts = computed(() => {
  return [...districts.value].sort((a, b) => b.patent_count - a.patent_count)
})

async function loadData() {
  try {
    loading.value = true
    const response = await fetch('/shiyan-data.json')
    if (!response.ok) throw new Error('数据加载失败')
    const data = await response.json()
    districts.value = data.districts || []
    companies.value = data.companies || []
  } catch (e: any) {
    error.value = e.message || '数据加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;

.shiyan-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.shiyan-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: $gap-md;
  padding: $gap-md 24px;

  > .span-12 { grid-column: span 12; }
}

.map-container {
  width: 100%;
  height: 500px;
}

.stats-table {
  max-height: 300px;
  overflow: auto;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;

    th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: rgba(14, 33, 71, 0.95);
      color: $cyan-accent;
      padding: 10px 12px;
      text-align: left;
      letter-spacing: 1px;
      border-bottom: 1px solid rgba(36, 112, 215, 0.4);
      font-weight: 500;
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(36, 112, 215, 0.12);
      color: $text-primary;
    }

    tr:hover td {
      background: rgba(36, 112, 215, 0.1);
    }

    .cell-name {
      color: $gold;
      font-weight: 500;
    }

    .cell-num {
      font-family: $font-mono;
      text-align: right;
    }
  }
}

.loading-state,
.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 32px;
}

.loading-spinner {
  color: $text-secondary;
  font-size: 14px;
}

.error-icon {
  font-size: 48px;
  opacity: 0.6;
}

.error-text {
  color: $red-warn;
  font-size: 14px;
}
</style>

