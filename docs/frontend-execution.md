# 天机AI - 前端开发执行文档

## 1. 项目初始化与环境配置

### 1.1 技术栈
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand / React Context
- **UI组件**: Shadcn/ui + 自定义组件
- **图表库**: Recharts / Chart.js
- **动画**: Framer Motion
- **日期处理**: date-fns
- **表单验证**: React Hook Form + Zod

### 1.2 项目结构
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证相关页面
│   ├── dashboard/         # 仪表板
│   ├── bazi/             # 八字命盘
│   ├── compatibility/     # 合盘分析
│   ├── divination/       # 卜卦模块
│   └── profile/          # 个人中心
├── components/
│   ├── ui/               # 基础UI组件
│   ├── charts/           # 图表组件
│   ├── forms/            # 表单组件
│   └── modules/          # 功能模块组件
├── lib/
│   ├── api/              # API 调用
│   ├── types/            # TypeScript 类型
│   ├── utils/            # 工具函数
│   └── constants/        # 常量配置
└── stores/               # 状态管理
```

## 2. 核心功能界面实现

### 2.1 个人八字命盘模块 (Bazi Blueprint)

#### 2.1.1 输入界面组件
```typescript
// components/forms/BaziInputForm.tsx
interface BaziInputProps {
  name: string;
  birthDate: Date;
  birthTime: string;
  birthCity: string;
  isTimeUncertain: boolean;
}
```

**实现要点**:
- 图形化日期时间选择器 (shadcn/ui DatePicker + TimePicker)
- 智能城市搜索联想 (使用中国城市数据库)
- 真太阳时计算集成
- "不确定时辰"选项处理

#### 2.1.2 命盘可视化组件
```typescript
// components/charts/BaziChart.tsx
interface BaziChartProps {
  baziData: BaziAnalysis;
  interactive?: boolean;
}
```

**实现要点**:
- 使用Canvas或SVG绘制传统八字盘
- 可交互元素 (十神、地支点击弹窗)
- 悬浮提示卡片
- 响应式设计

#### 2.1.3 报告展示组件
```typescript
// components/modules/BaziReport.tsx
interface ReportSection {
  title: string;
  content: string;
  highlight?: boolean;
  icon?: string;
}
```

**UI设计**:
- 可折叠卡片布局
- 五行喜忌置顶高亮
- 机遇/挑战象限分色显示
- 渐进式内容加载

### 2.2 八字合盘模块 (Compatibility Analysis)

#### 2.2.1 关系选择界面
```typescript
// components/forms/RelationshipSelector.tsx
type RelationType = 'romantic' | 'business' | 'family' | 'friendship';
```

#### 2.2.2 匹配度可视化
```typescript
// components/charts/CompatibilityRadar.tsx
interface RadarData {
  personality: number;
  fiveElements: number;
  practical: number;
  conflicts: number;
  growth: number;
}
```

**实现要点**:
- 0-100分综合评分显示
- 五维雷达图 (使用Recharts)
- 动态评分动画
- 色彩心理学应用

### 2.3 日常卜卦模块 (Divination Oracle)

#### 2.3.1 摇卦动画组件
```typescript
// components/animations/CoinTossAnimation.tsx
interface CoinTossProps {
  onComplete: (result: string) => void;
  soundEnabled?: boolean;
}
```

**实现要点**:
- 3D铜钱模拟 (CSS 3D Transform + Framer Motion)
- 音效集成 (Web Audio API)
- 摇卦仪式感设计
- 触觉反馈 (移动端振动)

#### 2.3.2 问题引导界面
```typescript
// components/forms/DivinationForm.tsx
interface QuestionTemplate {
  category: string;
  template: string;
  placeholder: string;
}
```

## 3. 增值功能界面

### 3.1 个人运势日历
```typescript
// components/modules/FortuneCalendar.tsx
interface DailyFortune {
  date: string;
  fortune: 'excellent' | 'good' | 'neutral' | 'caution';
  tags: string[];
  description: string;
}
```

**实现要点**:
- 月历视图 + 周历视图
- 运势标签颜色编码
- 推送提醒设置
- 历史运势查看

### 3.2 姓名学分析界面
```typescript
// components/modules/NameAnalysis.tsx
interface NameAnalysisResult {
  traditional: object; // 三才五格
  numerical: object;   // 数理分析
  fiveElements: object; // 五行分析
  phonetic: object;    // 音形义
}
```

### 3.3 AI解梦界面
```typescript
// components/modules/DreamAnalysis.tsx
interface DreamInput {
  description: string;
  emotions: string[];
  recentEvents?: string;
}
```

## 4. 用户体验优化

### 4.1 响应式设计
- 移动端优先设计
- 平板端适配
- 桌面端扩展布局

### 4.2 无障碍访问
- ARIA标签完整性
- 键盘导航支持
- 色彩对比度检查
- 屏幕阅读器兼容

### 4.3 性能优化
- 图片懒加载
- 代码分割 (Next.js动态导入)
- 组件级缓存
- CDN资源优化

## 5. 状态管理架构

### 5.1 全局状态 (Zustand)
```typescript
interface AppState {
  user: UserProfile | null;
  tianjiPoints: number;
  theme: 'light' | 'dark';
  preferences: UserPreferences;
}
```

### 5.2 页面级状态
- React Hook Form for 表单状态
- React Query for 服务端状态
- Local Storage for 持久化

## 6. 主题与设计系统

### 6.1 色彩方案
```css
:root {
  /* 主色调 - 神秘紫 */
  --primary: 285 85% 35%;
  --primary-foreground: 285 5% 95%;
  
  /* 五行色系 */
  --wood: 150 85% 35%;    /* 木 - 绿色 */
  --fire: 0 85% 55%;      /* 火 - 红色 */
  --earth: 45 85% 45%;    /* 土 - 黄色 */
  --metal: 210 15% 75%;   /* 金 - 白色 */
  --water: 210 85% 35%;   /* 水 - 蓝色 */
}
```

### 6.2 Typography
- 主标题: 思源宋体 (中文传统感)
- 正文: PingFang SC (现代可读性)
- 代码/数据: JetBrains Mono

### 6.3 图标系统
- Lucide React (基础图标)
- 自定义SVG (八字、卦象专用图标)

## 7. 开发流程与规范

### 7.1 组件开发规范
- 每个组件必须有TypeScript接口定义
- 使用React.forwardRef处理ref传递
- 错误边界包装
- Storybook文档

### 7.2 代码质量控制
- ESLint + Prettier
- Husky + lint-staged
- 单元测试 (Jest + React Testing Library)
- E2E测试 (Playwright)

### 7.3 性能监控
- Web Vitals tracking
- 用户行为分析
- 错误监控 (Sentry)

## 8. 部署与发布

### 8.1 环境配置
- Development: localhost
- Staging: Vercel Preview
- Production: Vercel

### 8.2 CI/CD流程
- GitHub Actions
- 自动化测试
- 构建优化
- 部署验证

## 9. 移动端特殊处理

### 9.1 PWA支持
- Service Worker
- 离线缓存
- 桌面安装提示

### 9.2 原生交互
- 触摸手势
- 设备权限 (相机、通知)
- 分享API

## 10. 国际化准备

### 10.1 i18n架构
- next-intl集成
- 动态语言切换
- RTL布局支持

这份文档为前端开发提供了全面的技术路线图和实现指导，确保项目按照设计要求高质量交付。