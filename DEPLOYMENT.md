# 🚀 天机AI 部署指南

## 📋 部署前检查清单

### ✅ 已完成项目优化
- [x] TypeScript 编译错误修复
- [x] 图片优化（使用 Next.js Image 组件）
- [x] React Hooks 警告修复
- [x] 按钮重叠问题修复
- [x] 响应式设计验证
- [x] 性能优化和代码清理

### ✅ 构建验证
- [x] 生产构建成功 (无错误)
- [x] 所有页面正常渲染
- [x] API 路由正常工作
- [x] 静态资源优化

## 🌐 部署选项

### 1. Vercel 部署 (推荐)

#### 步骤 1: 连接 GitHub
1. 登录 [Vercel](https://vercel.com)
2. 点击 "Import Project"
3. 连接您的 GitHub 仓库

#### 步骤 2: 配置环境变量
在 Vercel 项目设置中添加以下环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wenprajwqscmklqcrsmh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbnByYWp3cXNjbWtscWNyc21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTQ1MDAsImV4cCI6MjA2OTg3MDUwMH0.1y5DowkCW_l0f4Lq2BgQei4lhvXd8fu13PFT87W4VH0
DEEPSEEK_API_KEY=sk-1513a3a52f564975935e6019724ac8c0
ZPAY_PID=2025072110321034
ZPAY_PKEY=UYUBMiKrXVKRPljuGgeRpIlR43ZnHCqH
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

#### 步骤 3: 部署
- Vercel 会自动检测 Next.js 项目并部署
- 部署完成后，更新 `NEXT_PUBLIC_SITE_URL` 为实际域名

### 2. Netlify 部署

#### 构建设置：
```bash
Build command: npm run build
Publish directory: .next
```

#### 环境变量：
同 Vercel 配置

### 3. 其他平台 (Railway, DigitalOcean 等)

确保平台支持：
- Node.js 18+
- 自动安装依赖 (npm install)
- 构建命令 (npm run build)
- 启动命令 (npm start)

## 🔧 环境变量配置详解

### 必需变量
| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | https://xxx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | Supabase 公开密钥 | eyJhbGci... |
| `DEEPSEEK_API_KEY` | DeepSeek AI API 密钥 | sk-xxx |
| `NEXT_PUBLIC_SITE_URL` | 网站完整 URL | https://your-domain.com |

### 可选变量
| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `ZPAY_PID` | 支付平台 PID | - |
| `ZPAY_PKEY` | 支付平台密钥 | - |

## 🗄️ 数据库配置

### Supabase 设置
确保 Supabase 项目已配置：
- [x] 用户认证已启用
- [x] 所需数据表已创建
- [x] RLS (行级安全) 策略已配置
- [x] API 访问权限正确设置

### 数据表检查
项目需要以下数据表：
- `bazi_analyses` - 八字分析记录
- `hepan_analyses` - 合盘分析记录
- `bugua_divinations` - 卜卦记录
- `calendar_fortunes` - 运势记录
- `name_analyses` - 姓名分析记录
- `dream_interpretations` - 解梦记录
- `tianji_accounts` - 天机点账户
- `tianji_transactions` - 天机点交易记录
- `user_favorites` - 用户收藏

## 🔐 安全检查

### 已实施的安全措施
- [x] 环境变量安全存储
- [x] API 密钥服务器端保护
- [x] 用户认证和授权
- [x] 数据库 RLS 保护
- [x] 输入验证和清理

### 部署后安全检查
- [ ] 验证所有 API 端点需要认证
- [ ] 检查环境变量未暴露到客户端
- [ ] 确认数据库访问权限正确
- [ ] 测试用户权限隔离

## 📊 性能优化

### 已实施优化
- [x] 图片懒加载和优化
- [x] 代码分割和树摇
- [x] 静态资源压缩
- [x] API 响应优化
- [x] 数据库查询优化

### 监控建议
部署后建议添加：
- 性能监控 (Vercel Analytics)
- 错误跟踪 (Sentry)
- 用户行为分析 (Google Analytics)

## 🚨 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 清除缓存重新构建
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### 2. 环境变量不生效
- 检查变量名拼写
- 确认客户端变量以 `NEXT_PUBLIC_` 开头
- 重新部署应用

#### 3. API 调用失败
- 验证 Supabase 连接
- 检查 DeepSeek API 密钥
- 查看服务器日志

#### 4. 样式问题
- 确认 Tailwind CSS 正确配置
- 检查自定义 CSS 文件
- 验证响应式断点

## 📞 技术支持

### 部署后测试清单
- [ ] 首页正常加载
- [ ] 用户注册/登录功能
- [ ] 所有分析功能正常工作
- [ ] 支付功能正常（如适用）
- [ ] 移动端适配正常
- [ ] 性能表现满意

### 联系方式
如遇到部署问题，请：
1. 检查本文档的故障排除部分
2. 查看平台部署日志
3. 验证环境变量配置
4. 确认数据库连接状态

---

## 🎉 部署成功

恭喜！您的天机AI平台已成功部署。

**下一步建议：**
1. 设置自定义域名
2. 配置 SSL 证书
3. 添加监控和分析
4. 定期备份数据库
5. 关注用户反馈并持续优化

**记住更新环境变量中的 `NEXT_PUBLIC_SITE_URL` 为您的实际域名！**