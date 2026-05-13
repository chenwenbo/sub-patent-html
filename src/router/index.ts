import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

// 用 hash 路由：dist 双击 index.html 或丢到任何子目录的静态服务器都不会 404。
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: () => import('@/views/Dashboard/index.vue'), meta: { title: '专利分析驾驶舱' } },
  { path: '/shiyan', component: () => import('@/views/Shiyan/index.vue'), meta: { title: '十堰市地图' } },
  { path: '/companies', component: () => import('@/views/Companies/List.vue'), meta: { title: '企业名单' } },
  { path: '/companies/:id', component: () => import('@/views/Companies/Detail.vue'), meta: { title: '企业详情' } },
  { path: '/admin/import', component: () => import('@/views/Admin/Import.vue'), meta: { title: '数据导入' } },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
