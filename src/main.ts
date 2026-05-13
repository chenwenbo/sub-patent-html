import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as echarts from 'echarts'

import App from './App.vue'
import { router } from './router'
import { govBlueTheme } from './styles/echarts-theme'
import './styles/global.scss'

echarts.registerTheme('gov-blue', govBlueTheme)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
