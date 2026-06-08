# DocKit

DocKit 是一个隐私友好型本地文书工具箱，目标是把常见 PDF 与文书处理能力聚合到一个轻量、离线优先的 Web/PWA 应用中。

当前版本聚焦于 **PDF 盖章去白底**：PDF 预览、印章图片去白底、盖章位置调整、PDF 合成导出、草稿本地保存均在浏览器端完成，不上传用户文件。

## 功能状态

- 首页：DocKit 产品入口、能力展示、工具箱导航。
- PDF 盖章去白底：上传 PDF 与印章图片，Canvas 去除白底后放置到 PDF 页面。
- PDF 预览：基于 `pdfjs-dist` 在前端渲染页面预览。
- PDF 导出：基于 `pdf-lib` 在本地合成并下载新 PDF。
- 本地草稿：基于 `localForage` / IndexedDB 保存 PDF、印章与盖章配置。
- PWA：支持离线缓存与安装为独立窗口。

## 技术栈

- Vite
- React 19
- TypeScript
- Tailwind CSS 4
- pdfjs-dist
- pdf-lib
- localForage
- vite-plugin-pwa
- lucide-react

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

Windows PowerShell 如果拦截 `npm.ps1`，可以使用：

```bash
npm.cmd run dev
```

构建生产版本：

```bash
npm run build
```

预览构建产物：

```bash
npm run preview
```

## 项目结构

```text
DocKit/
├─ public/                 # PWA 图标与静态资源
├─ src/
│  ├─ features/
│  │  └─ PdfStampTool.tsx  # PDF 盖章去白底功能页
│  ├─ lib/
│  │  ├─ files.ts          # 文件读取、下载、大小格式化
│  │  ├─ pdf.ts            # PDF 预览渲染与合成导出
│  │  ├─ stamp.ts          # Canvas 印章去白底
│  │  └─ storage.ts        # localForage 草稿存储
│  ├─ App.tsx              # 首页、导航、工具箱入口
│  ├─ index.css            # Tailwind 引入、主题 token、全局 base
│  ├─ main.tsx             # React 入口与 PWA 注册
│  └─ types.ts             # 项目共享类型
├─ tailwind.config.js      # Tailwind 扩展配置
├─ vite.config.ts          # Vite、React、Tailwind、PWA 配置
└─ package.json
```

## 隐私说明

DocKit 的核心处理流程在浏览器本地完成：

- 文件不会被上传到服务器。
- 草稿保存在当前浏览器的 IndexedDB 中。
- 导出 PDF 由本机浏览器完成合成并触发下载。

清理草稿时，可在应用草稿箱中删除，也可通过浏览器站点数据管理清除本地 IndexedDB。

## 开发路线

- PDF 页面提取
- 多 PDF 合并
- PDF 压缩
- 图片与 PDF 双向转换
- 手写签名生成器
- 离线 OCR
- Tauri 桌面客户端打包

## 备注

当前项目优先完成 Web/PWA 核心体验。桌面客户端计划基于 Tauri 2.0 接入原生保存、文件拖拽与窗口定制能力。
