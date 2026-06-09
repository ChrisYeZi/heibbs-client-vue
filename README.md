<p align="center">
  <img src="https://www.heibbs.net/favicon.ico" width="80" alt="HeiBBS Logo" />
</p>

<h1 align="center">HeiBBS — 罗小黑妖灵论坛</h1>
<p align="center">
  <strong>HeiBBS / Luo Xiao Hei Spirit Forum</strong>
</p>

<p align="center">
  <a href="#chinese-simplified">简体中文</a> &nbsp;|&nbsp;
  <a href="#chinese-traditional">繁體中文</a> &nbsp;|&nbsp;
  <a href="#english">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.2-4FC08D?logo=vue.js" alt="Vue" />
  <img src="https://img.shields.io/badge/TypeScript-4.7-3178C6?logo=typescript" alt="TS" />
  <img src="https://img.shields.io/badge/Element_Plus-2.x-409EFF?logo=element" alt="Element Plus" />
  <img src="https://img.shields.io/badge/Vant-4.x-07C160" alt="Vant" />
  <img src="https://img.shields.io/badge/Spring_Boot-2.6-6DB33F?logo=springboot" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/MyBatis_Plus-3.x-00B4D8" alt="MyBatis-Plus" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

<p align="center"><em>以《罗小黑战记》世界观构建的沉浸式社区论坛 —— 前后端分离，多端适配。</em></p>
<p align="center"><em>A community forum built with the Luo Xiao Hei universe — full-stack, multi-platform.</em></p>

---

<h2 id="chinese-simplified">简体中文</h2>

### 项目简介

HeiBBS（罗小黑妖灵论坛）是一款以动画《罗小黑战记》为世界观背景的全功能社区论坛系统。采用 **Vue 3 + SpringBoot** 前后端分离架构，集成 Element Plus 与 Vant 双 UI 体系，支持 Web / Android APK / iOS 多端运行。

论坛围绕"妖灵"世界观构建了完整的社区生态：会馆分区、用户积分体系、权限组晋升、帖子互动、集市交易、勋章成就、任务系统等模块。

### 核心功能

| 模块 | 功能描述 |
|------|---------|
| 用户系统 | 邮箱注册登录、JWT 令牌认证、BCrypt 密码加密、头像上传、个人信息编辑 |
| 会馆管理 | 分区创建/编辑（妖灵会馆、地方会馆、小组），自定义图标与税率，馆长权限 |
| 帖子系统 | 富文本编辑器（@wangeditor）、图片上传、图章标记、关闭/隐藏/置顶状态管理 |
| 积分体系 | 灵气/妖灵币/值钱玉佩/天明珠 四种积分，评分机制（按用户组每日限额）、积分明细分页 |
| 勋章系统 | 传奇/普通勋章分类，积分购买/人工发放，用户自定义排序，帖子列表全局展示 |
| 股票交易 | 妖灵会馆股票买卖（周限额1000股），K线走势图，股价根据财政动态计算 |
| 会馆银行 | 存款/取款，月息按税率结算，满月计息，积分明细体现流水 |
| 集市系统 | 物品一口价出售/1-3天拍卖，最高出价者实时显示，倒计时面板 |
| 任务系统 | 每日/每周/每月/一次性任务，手动接受/完成/取消，管理确认流程 |
| 通知中心 | 回复/点赞/评分/勋章/任务/举报 系统消息，通过千里传音器（UID:1876）推送 |
| 权限控制 | 9级普通用户组自动晋升（需天明珠确认），特殊权限组（管理员/馆长/艺术家），维护模式开关 |
| 移动端适配 | Cordova 打包 APK，硬件返回键处理，状态栏沉浸，全屏滑动侧边栏，禁用缩放 |

### 技术栈

**前端：**
- Vue 3 + TypeScript + Vuex 4 + Vue Router 4
- Element Plus（桌面管理端）+ Vant 4（移动端）
- Axios + @wangeditor 富文本编辑器
- SCSS 模块化样式

**后端（独立项目 [heibbs-backend-java](../heibbs-backend-java)）：**
- SpringBoot 2.6 + MyBatis-Plus 3.x + MySQL + Redis
- JWT 认证 + BCrypt 加密
- RESTful API 统一响应格式

### 快速开始

```bash
# 1. 克隆项目
git clone <repo-url>
cd heibbs-app-vue

# 2. 安装依赖
npm install

# 3. 配置 API 地址
# 编辑 src/config/index.ts 中的 baseApi

# 4. 启动开发服务器
npm run serve
# -> http://localhost:8080

# 5. 生产构建
npm run build
```

### 项目结构

```
src/
├── api/index.ts          # 集中式 API 封装（100+ 接口）
├── assets/               # 静态资源（图片/图标/JS工具）
├── components/           # 可复用组件
│   ├── base/             # 基础组件（导航栏/标签栏/返回栏）
│   ├── common/           # 通用组件（帖子条/消息条）
│   └── user/             # 用户组件（侧边栏）
├── config/               # 全局配置（API地址/请求实例）
├── router/               # 路由配置（50+ 路由，含嵌套/守卫）
├── store/                # Vuex 状态管理（用户/系统模块）
├── views/
│   ├── main/             # 首页/帖子/登录/搜索/编辑/消息/通知
│   ├── user/             # 个人信息/设置/积分/物品/邀请码/勋章/帖子
│   ├── admin/            # 管理面板（仪表盘/用户/帖子/会馆/图章/Banner/任务/物品/勋章/积分/附件管理）
│   └── gugu/             # 鸽门（追更日历/集市）
└── main.ts               # 应用入口 + 移动端原生适配
```

### 后端仓库

[heibbs-backend-java](../heibbs-backend-java) — SpringBoot + MyBatis-Plus + MySQL

### 许可证

[MIT](LICENSE)

---

<h2 id="chinese-traditional">繁體中文</h2>

### 項目簡介

HeiBBS（羅小黑妖靈論壇）是一款以動畫《羅小黑戰記》世界觀構建的全功能社群論壇系統。採用 **Vue 3 + SpringBoot** 前後端分離架構，整合 Element Plus 與 Vant 雙 UI 體系，支援 Web / Android APK / iOS 多端運行。

論壇圍繞「妖靈」世界觀構建了完整的社群生態：會館分區、用戶積分體系、權限組晉升、帖子互動、市集交易、勳章成就、任務系統等模組。

### 核心功能

| 模組 | 功能描述 |
|------|---------|
| 用戶系統 | 郵箱註冊登入、JWT 令牌認證、BCrypt 密碼加密、頭像上傳、個人資訊編輯 |
| 會館管理 | 分區建立/編輯（妖靈會館、地方會館、小組），自訂圖示與稅率，館長權限 |
| 帖子系統 | 富文本編輯器（@wangeditor）、圖片上傳、圖章標記、關閉/隱藏/置頂狀態管理 |
| 積分體系 | 靈氣/妖靈幣/值錢玉佩/天明珠 四種積分，評分機制（按用戶組每日限額）、積分明細分頁 |
| 勳章系統 | 傳奇/普通勳章分類，積分購買/人工發放，用戶自訂排序，帖子列表全域展示 |
| 股票交易 | 妖靈會館股票買賣（週限額1000股），K線走勢圖，股價根據財政動態計算 |
| 會館銀行 | 存款/取款，月息按稅率結算，滿月計息，積分明細體現流水 |
| 市集系統 | 物品一口價出售/1-3天拍賣，最高出價者即時顯示，倒計時面板 |
| 任務系統 | 每日/每週/每月/一次性任務，手動接受/完成/取消，管理確認流程 |
| 通知中心 | 回覆/讚/評分/勳章/任務/舉報 系統訊息，透過千里傳音器（UID:1876）推送 |
| 權限控制 | 9級普通用戶組自動晉升（需天明珠確認），特殊權限組（管理員/館長/藝術家），維護模式開關 |
| 行動端適配 | Cordova 打包 APK，硬體返回鍵處理，狀態欄沉浸，全螢幕滑動側邊欄，禁用縮放 |

### 技術棧

- Vue 3 + TypeScript + Vuex 4 + Vue Router 4
- Element Plus（桌面管理端）+ Vant 4（行動端）
- Axios + @wangeditor 富文本編輯器
- SCSS 模組化樣式

後端：[heibbs-backend-java](../heibbs-backend-java) — SpringBoot 2.6 + MyBatis-Plus 3.x + MySQL + Redis

### 快速開始

```bash
npm install
# 編輯 src/config/index.ts 設定 API 地址
npm run serve    # 開發 -> http://localhost:8080
npm run build    # 生產構建
```

### 許可證

[MIT](LICENSE)

---

<h2 id="english">English</h2>

### Overview

HeiBBS (Luo Xiao Hei Spirit Forum) is a full-featured community forum built with the universe of the animated series *Luo Xiao Hei*. It adopts a **Vue 3 + SpringBoot** front-end/back-end separated architecture, integrating Element Plus and Vant dual UI frameworks, supporting Web, Android APK, and iOS platforms.

The forum creates a complete community ecosystem around the "Spirit" lore: guild sections, credit system, group promotions, post interactions, marketplace trading, medals & achievements, task system, and more.

### Key Features

| Module | Description |
|--------|-------------|
| User System | Email registration/login, JWT auth, BCrypt encryption, avatar upload, profile editing |
| Guilds | Section CRUD (Main Guild, Regional Guilds, Groups), custom icons, tax rates, owner permissions |
| Posts | Rich text editor (@wangeditor), image upload, stamp marking, close/hide/pin state management |
| Credits | 4 credit types (Spirit Energy, Coins, Jade, Pearl), rating with daily limits per group, paginated history |
| Medals | Legendary/Normal categories, credit purchase/manual grant, reorder, global display in post lists |
| Stocks | Guild stock trading (weekly 1000-share limit), candlestick chart, dynamic price based on treasury |
| Bank | Deposit/withdraw, monthly interest tied to tax rate, settled monthly, recorded in credit history |
| Marketplace | Fixed-price / 1-3 day auction sales, real-time highest bidder display, countdown |
| Tasks | Daily/Weekly/Monthly/One-time, manual accept/complete/cancel, admin confirmation flow |
| Notifications | System messages for replies, likes, ratings, medals, tasks, reports via system account (UID:1876) |
| Access Control | 9-tier auto-promotion user groups, special groups (Admin/Guild Master/Artist), maintenance mode |
| Mobile | Cordova APK packaging, hardware back button, immersive status bar, full-screen swipe drawer, zoom disabled |

### Tech Stack

- Vue 3 + TypeScript + Vuex 4 + Vue Router 4
- Element Plus (admin) + Vant 4 (mobile)
- Axios + @wangeditor editor
- SCSS modular styles

Backend: [heibbs-backend-java](../heibbs-backend-java) — SpringBoot 2.6 + MyBatis-Plus 3.x + MySQL + Redis

### Quick Start

```bash
npm install
# Edit src/config/index.ts to set API endpoint
npm run serve    # Dev -> http://localhost:8080
npm run build    # Production build
```

### Project Structure

```
src/
├── api/index.ts          # Centralized API (100+ endpoints)
├── components/           # Reusable components (nav, tabbar, sidebars)
├── config/               # Global config + axios instance
├── router/               # Routes (50+ with guards)
├── store/                # Vuex modules (user, system)
├── views/                # Pages (main, user, admin, gugu)
│   ├── main/             # Home, posts, search, messages, notifications
│   ├── user/             # Profile, settings, credits, inventory, medals
│   ├── admin/            # Dashboard, users, posts, stamps, banners, tasks, items, medals, credits, attachments
│   └── gugu/             # Anime calendar, marketplace
└── main.ts               # Entry point + mobile native adapters
```

### License

[MIT](LICENSE)
