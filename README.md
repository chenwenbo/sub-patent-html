# sub-patent-html

> 湖北省专精特新「小巨人」企业专利分析驾驶舱 —— **静态离线版**

主项目 `patent-dashboard` 的"客户离线交付版本"。完全去掉 FastAPI 后端，所有数据通过浏览器内 Excel 导入获得，
所有指标 / 图表 / 排行 / Excel 导出全部在前端 JavaScript 中完成。Build 后的 `dist/` 目录可丢到任意静态文件服务器（甚至直接双击 `index.html`）打开使用。

## 与主项目的差异

| 维度          | 主项目 (`frontend` + `backend`)               | 本项目 (`sub-patent-html`)                  |
| ----------- | ----------------------------------------- | ---------------------------------------- |
| 数据来源        | FastAPI 提供的 9 个 REST 接口                   | 浏览器内 Excel 解析（SheetJS）+ localStorage 持久化 |
| 指标计算        | `backend/app/services/metrics.py`（pandas） | `src/data/queries.ts`（TS 移植，公式 1:1 对齐）   |
| 路由模式        | history 路由 + 静态资源 / `/api` 代理              | hash 路由 (`#/dashboard`)，可双击 index.html 运行 |
| 页面          | Dashboard / Companies / Quality / Reports / Admin | **仅** Dashboard / Companies / Admin/Import |
| 报告 (Word)  | docxtpl + LLM 生成                           | 不提供（前端无 docx 模板渲染能力，按客户要求仅做 Excel 导出）   |
| Excel 导出    | 后端流式响应                                    | 前端 `xlsx` 直接 `writeFile()`               |

## 一分钟启动（开发模式）

```bash
cd sub-patent-html
npm install            # 或 pnpm install
npm run dev            # 默认 http://localhost:5174
```

打开浏览器 → 自动跳到 `#/dashboard` → 顶部「数据导入」上传 Excel → 自动回到驾驶舱看图。

## 给客户的"打包交付"流程

```bash
npm install
npm run build          # 产出 ./dist
```

把 `dist/` 整个目录交给客户即可：

- **方式 A（最简单）**：双击 `dist/index.html` 用浏览器打开。
- **方式 B（推荐）**：丢到任何静态服务器（nginx / IIS / GitHub Pages / cos-bucket / Tomcat 静态映射 …），无需任何后端。

## Excel 导入格式

固定列顺序（含表头）：

| 列   | 字段       | 必填  | 示例                  |
| --- | -------- | --- | ------------------- |
| A   | 序号       | ✗   | 1                   |
| B   | 地市       | ✓   | 宜昌市 / 宜昌            |
| C   | 企业名称     | ✓   | 湖北 XX 有限公司          |
| D   | 认定批次     | ✗   | 第五批专精特新…            |
| E   | 专利数量     | ✗   | 42（空 / 非数字按 0 处理）   |
| F   | 产业领域     | ✗   | 高端装备制造产业（未识别归"其他产业"） |

在 **数据导入** 页可点击「下载导入模板」拿到一份示例 xlsx。

地市归一表与产业归一表与后端 `services/importer.py` 完全对齐，详见 [`src/data/dictionaries.ts`](src/data/dictionaries.ts)。

## 目录结构

```
sub-patent-html/
├── index.html
├── package.json
├── vite.config.ts
└── src/
    ├── App.vue
    ├── main.ts
    ├── router/index.ts          # 改 hash 路由
    ├── data/                    # ← 后端逻辑的前端等价物
    │   ├── types.ts             # Company / Dataset / FilterScope
    │   ├── dictionaries.ts      # 17 市州 + 产业 + 批次归一
    │   ├── importer.ts          # 浏览器内 Excel 解析（SheetJS）
    │   ├── exporter.ts          # 前端 Excel 导出
    │   └── queries.ts           # KPI / 区域 / 产业 / 分布 / 排行
    ├── stores/
    │   ├── dataset.ts           # 数据集 + localStorage 持久化
    │   └── filter.ts            # 筛选条件（区域/产业/批次）
    ├── views/
    │   ├── Dashboard/index.vue
    │   ├── Companies/{List,Detail}.vue
    │   └── Admin/Import.vue
    ├── components/              # 与主项目共享：charts / common / screen
    └── styles/                  # 深蓝政务风 tokens + echarts 主题
```

## 数据安全说明

所有数据**仅保存在用户本机浏览器的 `localStorage`**（key 为 `sub-patent-html:dataset:v1`），不会上传到任何服务器。
导入页提供"清空数据"按钮可手动清除。同一浏览器 / 同源（域名+端口）下数据持久。
