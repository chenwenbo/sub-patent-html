<template>
  <div class="filter-bar">
    <div class="filter-label">
      <span class="ico" />切换地市
    </div>

    <select class="filter-select filter-select--primary" v-model="filter.state.region_code">
      <option :value="null">全省汇总</option>
      <option v-for="r in filter.dimensions.regions" :key="r.region_code" :value="r.region_code">
        {{ r.region_name }}
      </option>
    </select>

    <div class="filter-divider" />

    <select class="filter-select" v-model="filter.state.industry_code">
      <option :value="null">全部产业</option>
      <option v-for="i in filter.dimensions.industries" :key="i.industry_code" :value="i.industry_code">
        {{ i.industry_name }}
      </option>
    </select>

    <select class="filter-select" v-model="filter.state.batch">
      <option :value="null">全部批次</option>
      <option v-for="b in filter.dimensions.batches" :key="b" :value="b">{{ b }}</option>
    </select>

    <button class="filter-btn reset" @click="filter.reset">重置</button>

    <div class="scope-tag">当前视角：{{ filter.scopeLabel }}</div>

    <div class="nav-actions">
      <router-link class="nav-link" to="/companies">企业名单</router-link>
      <router-link class="nav-link" to="/admin/import">数据导入</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFilterStore } from '@/stores/filter'
const filter = useFilterStore()
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 32px;
  background: linear-gradient(90deg, rgba(14, 33, 71, 0.7) 0%, rgba(10, 23, 51, 0.5) 100%);
  border-bottom: 1px solid rgba(36, 112, 215, 0.3);
  flex-wrap: wrap;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: $cyan-accent;
  font-size: 13px;
  letter-spacing: 1px;
  .ico {
    display: inline-block;
    width: 8px; height: 8px;
    background: $cyan-accent;
    border-radius: 50%;
    box-shadow: 0 0 6px $cyan-accent;
  }
}

.filter-select--primary {
  border-color: $gold-deep !important;
  min-width: 150px;
  color: $gold;
  font-weight: 500;
  &:hover { border-color: $gold !important; }
  option { color: $text-primary; font-weight: normal; }
}

.filter-divider {
  width: 1px;
  height: 20px;
  background: rgba(36, 112, 215, 0.4);
  margin: 0 4px;
}

.filter-select {
  appearance: none;
  background:
    linear-gradient(180deg, rgba(36, 112, 215, 0.15) 0%, rgba(10, 23, 51, 0.5) 100%)
    no-repeat right 8px center / 8px;
  border: 1px solid rgba(36, 112, 215, 0.5);
  color: $text-primary;
  padding: 5px 28px 5px 12px;
  font-size: 13px;
  font-family: inherit;
  border-radius: 2px;
  min-width: 120px;
  cursor: pointer;
  background-image:
    linear-gradient(45deg, transparent 50%, $cyan-accent 50%),
    linear-gradient(135deg, $cyan-accent 50%, transparent 50%);
  background-position:
    calc(100% - 14px) calc(50% - 1px),
    calc(100% - 8px) calc(50% - 1px);
  background-size: 6px 6px;
  background-repeat: no-repeat;

  &:hover { border-color: $gold; }
  &:focus { outline: none; border-color: $gold; box-shadow: 0 0 8px rgba(247, 200, 115, 0.4); }

  option { background: $bg-secondary; color: $text-primary; }
}

.filter-btn {
  padding: 5px 14px;
  background: linear-gradient(180deg, rgba(247, 200, 115, 0.18) 0%, rgba(212, 160, 74, 0.05) 100%);
  border: 1px solid $gold-deep;
  color: $gold;
  font-size: 13px;
  cursor: pointer;
  border-radius: 2px;
  letter-spacing: 1px;
  &:hover { background: rgba(247, 200, 115, 0.3); }
}

.scope-tag {
  margin-left: auto;
  padding: 4px 12px;
  background: rgba(36, 112, 215, 0.15);
  border-left: 2px solid $cyan-accent;
  color: $text-secondary;
  font-size: 12px;
  letter-spacing: 1px;
}

.nav-actions {
  display: flex;
  gap: 4px;
  margin-left: 12px;
}

.nav-link {
  padding: 4px 12px;
  font-size: 12px;
  color: $text-secondary;
  border: 1px solid rgba(36, 112, 215, 0.4);
  transition: all 0.2s;
  letter-spacing: 1px;
  border-radius: 2px;
  &:hover, &.router-link-active {
    color: $gold;
    border-color: $gold;
    background: rgba(247, 200, 115, 0.1);
  }
}
</style>
