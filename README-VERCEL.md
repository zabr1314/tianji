# 🚀 Vercel 部署指南 - 天机AI

## 📋 Vercel 部署步骤

### 1. **创建 Vercel 项目**
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 从 GitHub 导入 `tianji` 仓库

### 2. **配置项目设置**

#### 项目设置：
- **Framework Preset**: Next.js
- **Root Directory**: `./` (项目根目录)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (自动检测)
- **Install Command**: `npm install`

#### 分支设置：
- **Production Branch**: `production`
- **Preview Branches**: `main`, `dev`

### 3. **环境变量配置**

在 Vercel 项目的 **Settings → Environment Variables** 中添加：

#### 生产环境变量 (Production)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://wenprajwqscmklqcrsmh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbnByYWp3cXNjbWtscWNyc21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTQ1MDAsImV4cCI6MjA2OTg3MDUwMH0.1y5DowkCW_l0f4Lq2BgQei4lhvXd8fu13PFT87W4VH0
DEEPSEEK_API_KEY=sk-1513a3a52f564975935e6019724ac8c0
ZPAY_PID=2025072110321034
ZPAY_PKEY=UYUBMiKrXVKRPljuGgeRpIlR43ZnHCqH
NEXT_PUBLIC_SITE_URL=https://your-project-name.vercel.app
NODE_ENV=production
```

**重要**: 
- 每个变量都要设置 Environment 为 `Production`
- `NEXT_PUBLIC_SITE_URL` 需要在首次部署后更新为实际的 Vercel 域名

### 4. **部署流程**

#### 首次部署：
1. 推送 `production` 分支到 GitHub
2. Vercel 会自动检测并开始构建
3. 构建完成后获得 `.vercel.app` 域名
4. 更新环境变量中的 `NEXT_PUBLIC_SITE_URL`

#### 后续更新：
1. 在 `production` 分支进行更改
2. 推送到 GitHub
3. Vercel 自动重新部署

### 5. **域名配置（可选）**

#### 自定义域名：
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加自定义域名
3. 配置 DNS 记录
4. 更新环境变量中的 `NEXT_PUBLIC_SITE_URL`

## ⚙️ 高级配置

### 分支管理策略
- **`main`**: 开发分支，用于预览部署
- **`production`**: 生产分支，用于正式部署
- **`dev`**: 功能开发分支（可选）

### 性能优化
- ✅ 自动代码分割
- ✅ 图片优化（Next.js Image）
- ✅ 静态资源压缩
- ✅ 边缘函数优化

### 安全配置
- ✅ 安全 Headers 已配置
- ✅ 环境变量安全存储
- ✅ API 路由保护

## 🔍 部署后检查

### 功能验证清单
- [ ] 首页正常加载
- [ ] 用户注册/登录
- [ ] 八字分析功能
- [ ] 合盘配对功能
- [ ] 卜卦占卜功能
- [ ] 运势日历功能
- [ ] 姓名分析功能
- [ ] AI解梦功能
- [ ] 天机点系统
- [ ] 历史记录查看
- [ ] 移动端适配

### 性能检查
- [ ] 页面加载速度 < 3秒
- [ ] API 响应时间 < 2秒
- [ ] 移动端体验良好
- [ ] SEO 设置正确

## 🚨 常见问题

### 1. 构建失败
```bash
# 检查构建日志中的错误信息
# 常见原因：
- 环境变量缺失
- TypeScript 类型错误
- 依赖版本冲突
```

### 2. 环境变量不生效
- 确认变量名正确
- 检查 Environment 设置为 `Production`
- 重新部署应用

### 3. API 调用失败
- 检查 Supabase 连接
- 验证 DeepSeek API 密钥
- 查看 Vercel Functions 日志

### 4. 域名配置问题
- 确认 DNS 设置正确
- 等待 DNS 传播（最多24小时）
- 检查 SSL 证书状态

## 📞 技术支持

### Vercel 相关
- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Vercel 支持](https://vercel.com/support)

### 项目相关
- 查看项目 `DEPLOYMENT.md` 详细文档
- 检查 GitHub Issues
- 查看 Vercel 部署日志

---

## 🎉 部署成功！

完成部署后，您的天机AI平台将在以下地址可访问：
- **生产环境**: `https://your-project-name.vercel.app`
- **预览环境**: `https://your-project-name-git-main.vercel.app`

记得更新环境变量中的 `NEXT_PUBLIC_SITE_URL` 为实际域名！