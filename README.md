# 罗小黑妖灵论坛 - 移动端应用

基于 Vue 3 构建的罗小黑主题社区论坛移动端应用，融合妖灵世界观的社交互动平台，支持用户交流、积分体系、会馆管理等特色功能。


## 项目简介

罗小黑妖灵论坛是一款以《罗小黑战记》为世界观背景的社区论坛应用，采用前后端分离架构：
- 前端使用 Vue 3 + TypeScript 开发，结合 Element Plus 与 Vant 组件库构建响应式界面，支持移动端适配
- 后端基于 SpringBoot + MyBatis-Plus 搭建，配合 Redis 缓存与 MySQL 数据库提供稳定服务
- 支持 Electron 桌面端打包与 HBuilder X 移动端打包，实现多端适配

论坛围绕"妖灵"世界观设计核心功能，包括用户积分体系（妖灵币、灵气等）、会馆（分区）管理、角色权限组等特色模块，为粉丝提供沉浸式社区体验。


## 核心功能

### 🔑 用户系统
- 账号管理：邮箱注册、密码找回、登录状态维护
- 个人信息：支持修改用户名、性别、种族、系别等个性化信息
- 积分体系：包含妖灵币（流通货币）、人气、灵气（活跃度）、值钱玉佩（活动货币）、天明珠（贡献点）等多种积分类型
- 权限组：基于积分自动升级的普通权限组（物质灵→生灵→精灵→妖灵等）、特殊权限组（创作者、艺术家）及管理权限组（馆长、执行者）


### 🏛️ 会馆（分区）管理
- 分区浏览：按主题分类的会馆列表，支持自定义图标与名称
- 分区管理：后台可创建、编辑分区，配置权限与展示规则
- 群组功能：支持创建"各地会馆"（群组），需消耗妖灵币，具有等级与维护机制


### 📝 内容互动
- 帖子管理：发布、编辑、查看帖子，支持富文本编辑
- 互动功能：回复、引用、点赞等社交互动
- 内容安全：权限控制与内容审核机制


### 🎮 娱乐模块
- 每日签到：获取灵气积分
- 誓言录：任务系统，完成可获得奖励
- 成就体系：基于用户行为解锁的特色成就
- 众鸽之门：特色娱乐功能（详情见应用内说明）


### 🔧 后台管理
- 用户管理：权限配置、状态管理
- 内容管理：帖子审核、分区配置
- 数据统计：积分流水、活跃数据监控


## 技术栈

### 前端
- **核心框架**：Vue 3、TypeScript
- **状态管理**：Vuex 4
- **路由管理**：Vue Router 4
- **UI 组件**：Element Plus（桌面端）、Vant（移动端）
- **网络请求**：Axios
- **构建工具**：Vue CLI 5
- **打包工具**：Electron（桌面端）、HBuilder X（移动端）

### 后端
- **核心框架**：SpringBoot
- **构建工具**：Maven
- **ORM 框架**：MyBatis-Plus
- **缓存**：Redis
- **数据库**：MySQL


## 环境要求

- 前端：Node.js ≥ 14.x，npm ≥ 6.x 或 yarn ≥ 1.x
- 后端：JDK ≥ 1.8，MySQL ≥ 5.7，Redis ≥ 5.0


## 安装与启动

### 前端部署
1. 克隆项目
```bash
git clone <项目仓库地址>
cd heibbs-client-vue
```

2. 安装依赖
```bash
npm install
```

3. 开发环境启动（热更新）
```bash
npm run serve
```
项目将在 `http://localhost:8080` 启动

4. 打包构建
```bash
# 移动端打包（需HBuilder X配合）
npm run build:h5

# 桌面端打包（Electron）
npm run electron:build
```


## 项目结构（前端核心）

```
src/
├── api/            # 接口请求封装（用户、帖子、会馆等模块）
├── assets/         # 静态资源（图片、样式、主题素材）
├── components/     # 通用组件（导航栏、卡片、弹窗等）
├── config/         # 配置文件（API地址、全局常量）
├── router/         # 路由配置（用户页、帖子页、会馆页等）
├── store/          # Vuex状态管理（用户信息、积分、权限等）
├── views/          # 页面组件
│   ├── main/       # 首页、登录/注册页
│   ├── user/       # 个人中心、信息编辑页
│   ├── post/       # 帖子列表、详情页
│   ├── block/      # 会馆分区页
│   └── admin/      # 后台管理页
└── main.ts         # 应用入口
```


## 许可证

[MIT](LICENSE)


## 参考资料

- Vue 3 官方文档：https://cn.vuejs.org/
- Element Plus 文档：https://element-plus.gitee.io/zh-CN/
- Axios 文档：https://www.axios-http.cn/docs/intro
- Electron 文档：https://www.electronjs.org/zh/docs/latest/
- SpringBoot 文档：https://spring.io/projects/spring-boot
- MyBatis-Plus 文档：https://baomidou.com/pages/24112f/
- Redis 文档：https://www.redis.net.cn/