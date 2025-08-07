# 天机AI - 后端开发执行文档

## 1. Supabase 项目初始化

### 1.1 Supabase 项目配置
```bash
# 安装Supabase CLI
npm install -g supabase

# 初始化项目
supabase init
supabase start

# 连接到远程项目
supabase link --project-ref YOUR_PROJECT_ID
```

### 1.2 环境变量配置
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# DeepSeek AI配置
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com

# 天机点系统配置
TIANJI_POINTS_RATE=10  # 1元=10天机点
```

## 2. 数据库设计与Schema

### 2.1 用户系统表
```sql
-- users 表 (继承Supabase Auth)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    tianji_points INTEGER DEFAULT 100, -- 初始赠送100点
    membership_type VARCHAR(20) DEFAULT 'basic', -- basic, monthly, yearly
    membership_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 天机点交易记录
CREATE TABLE public.tianji_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id),
    type VARCHAR(20) NOT NULL, -- 'earn', 'spend', 'refund'
    amount INTEGER NOT NULL,
    source VARCHAR(50), -- 'purchase', 'signup', 'daily_checkin', 'service_usage'
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 八字命理数据表
```sql
-- 用户八字数据
CREATE TABLE public.bazi_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id),
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    birth_time TIME NOT NULL,
    birth_city VARCHAR(100) NOT NULL,
    birth_longitude DECIMAL(10,7),
    birth_latitude DECIMAL(10,7),
    timezone_offset INTEGER, -- 时区偏移（分钟）
    is_time_uncertain BOOLEAN DEFAULT FALSE,
    
    -- 八字基础数据
    year_ganzhi VARCHAR(10) NOT NULL, -- 年柱干支
    month_ganzhi VARCHAR(10) NOT NULL, -- 月柱干支
    day_ganzhi VARCHAR(10) NOT NULL, -- 日柱干支
    hour_ganzhi VARCHAR(10) NOT NULL, -- 时柱干支
    
    -- 五行分析
    wuxing_analysis JSONB, -- 五行强弱分析
    yongshen VARCHAR(10), -- 用神
    xishen VARCHAR(10), -- 喜神
    jishen VARCHAR(10), -- 忌神
    
    -- AI分析结果缓存
    ai_analysis JSONB,
    last_analyzed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 大运流年数据
CREATE TABLE public.bazi_dayun (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bazi_profile_id UUID REFERENCES public.bazi_profiles(id),
    sequence INTEGER NOT NULL, -- 第几步大运
    start_age INTEGER NOT NULL,
    end_age INTEGER NOT NULL,
    ganzhi VARCHAR(10) NOT NULL,
    description TEXT,
    opportunities JSONB, -- 机遇分析
    challenges JSONB, -- 挑战分析
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.3 合盘分析表
```sql
-- 合盘分析记录
CREATE TABLE public.compatibility_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id),
    person_a_bazi_id UUID REFERENCES public.bazi_profiles(id),
    person_b_bazi_id UUID REFERENCES public.bazi_profiles(id),
    relationship_type VARCHAR(20) NOT NULL, -- 'romantic', 'business', 'family', 'friendship'
    
    -- 综合评分
    overall_score INTEGER, -- 0-100
    personality_score INTEGER,
    wuxing_score INTEGER,
    practical_score INTEGER,
    conflict_score INTEGER,
    growth_score INTEGER,
    
    -- AI分析结果
    ai_analysis JSONB,
    recommendations JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.4 卜卦系统表
```sql
-- 卜卦记录
CREATE TABLE public.divination_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id),
    question TEXT NOT NULL,
    question_category VARCHAR(50),
    
    -- 卦象数据
    hexagram_upper VARCHAR(10), -- 上卦
    hexagram_lower VARCHAR(10), -- 下卦
    changing_lines JSONB, -- 变爻
    primary_hexagram VARCHAR(20), -- 主卦名称
    transformed_hexagram VARCHAR(20), -- 变卦名称
    
    -- 起卦信息
    divination_method VARCHAR(20) DEFAULT 'coin_toss', -- 起卦方法
    divination_time TIMESTAMP DEFAULT NOW(),
    
    -- AI解读结果
    ai_interpretation JSONB,
    conclusion TEXT,
    suggestions JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.5 运势日历表
```sql
-- 每日运势
CREATE TABLE public.daily_fortunes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id),
    fortune_date DATE NOT NULL,
    
    -- 当日干支
    day_ganzhi VARCHAR(10) NOT NULL,
    
    -- 运势等级
    fortune_level VARCHAR(20), -- 'excellent', 'good', 'neutral', 'caution'
    
    -- 宜忌标签
    suitable_activities JSONB, -- 宜做的事
    unsuitable_activities JSONB, -- 忌做的事
    
    -- 详细说明
    brief_description TEXT, -- 简要说明（免费）
    detailed_description TEXT, -- 详细解读（会员）
    
    -- 吉时
    auspicious_hours JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, fortune_date)
);
```

### 2.6 其他功能表
```sql
-- 姓名分析记录
CREATE TABLE public.name_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id),
    name VARCHAR(100) NOT NULL,
    bazi_profile_id UUID REFERENCES public.bazi_profiles(id), -- 关联八字
    
    -- 分析结果
    sancai_wuge JSONB, -- 三才五格
    numerical_analysis JSONB, -- 数理分析
    wuxing_analysis JSONB, -- 五行分析
    phonetic_analysis JSONB, -- 音形义分析
    
    ai_suggestions JSONB, -- AI改名建议
    overall_score INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- 解梦记录
CREATE TABLE public.dream_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id),
    dream_description TEXT NOT NULL,
    dream_emotions JSONB, -- 梦境情绪
    recent_events TEXT, -- 近期事件
    
    -- AI解读
    ai_interpretation JSONB,
    psychological_analysis JSONB,
    traditional_analysis JSONB, -- 周公解梦
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 3. Row Level Security (RLS) 策略

### 3.1 用户数据安全
```sql
-- 启用RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bazi_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compatibility_analyses ENABLE ROW LEVEL SECURITY;
-- ... 所有用户相关表

-- 基础RLS策略
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 八字数据策略
CREATE POLICY "Users can view own bazi data" ON public.bazi_profiles
    FOR ALL USING (user_id = auth.uid());

-- 天机点交易策略
CREATE POLICY "Users can view own transactions" ON public.tianji_transactions
    FOR SELECT USING (user_id = auth.uid());
```

## 4. API路由设计

### 4.1 认证相关API
```typescript
// app/api/auth/signup/route.ts
export async function POST(request: Request) {
  // 用户注册 + 初始天机点赠送
}

// app/api/auth/profile/route.ts
export async function GET() {
  // 获取用户资料
}
export async function PUT() {
  // 更新用户资料
}
```

### 4.2 八字分析API
```typescript
// app/api/bazi/analyze/route.ts
export async function POST(request: Request) {
  const { name, birthDate, birthTime, birthCity } = await request.json();
  
  // 1. 计算真太阳时
  // 2. 排八字
  // 3. 五行分析
  // 4. 调用DeepSeek AI分析
  // 5. 存储分析结果
  // 6. 扣除天机点
}

// app/api/bazi/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  // 获取已分析的八字数据
}
```

### 4.3 合盘分析API
```typescript
// app/api/compatibility/analyze/route.ts
export async function POST(request: Request) {
  const { personA, personB, relationshipType } = await request.json();
  
  // 1. 获取双方八字数据
  // 2. 计算合盘分析
  // 3. AI深度解读
  // 4. 生成综合评分
  // 5. 扣除天机点
}
```

### 4.4 卜卦系统API
```typescript
// app/api/divination/cast/route.ts
export async function POST(request: Request) {
  const { question, method } = await request.json();
  
  // 1. 生成卦象
  // 2. AI解读卦象
  // 3. 生成建议
  // 4. 存储卦象记录
  // 5. 扣除天机点
}

// app/api/divination/history/route.ts
export async function GET() {
  // 获取用户卜卦历史
}
```

### 4.5 天机点系统API
```typescript
// app/api/tianji-points/balance/route.ts
export async function GET() {
  // 获取用户天机点余额
}

// app/api/tianji-points/recharge/route.ts
export async function POST(request: Request) {
  // 充值天机点（集成支付）
}

// app/api/tianji-points/consume/route.ts
export async function POST(request: Request) {
  // 消费天机点
}

// app/api/tianji-points/transactions/route.ts
export async function GET() {
  // 获取交易记录
}
```

## 5. DeepSeek AI集成

### 5.1 AI服务抽象层
```typescript
// lib/ai/deepseek-client.ts
export class DeepSeekClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async chat(messages: Message[], model: string = 'deepseek-chat'): Promise<string> {
    // DeepSeek API调用逻辑
  }

  async analyzeBazi(baziData: BaziData): Promise<BaziAnalysis> {
    // 八字分析专用方法
  }

  async analyzeCompatibility(personA: BaziData, personB: BaziData, relationshipType: string): Promise<CompatibilityAnalysis> {
    // 合盘分析专用方法
  }

  async interpretDivination(hexagramData: HexagramData, question: string): Promise<DivinationInterpretation> {
    // 卜卦解读专用方法
  }
}
```

### 5.2 Prompt管理系统
```typescript
// lib/ai/prompts.ts
export const PROMPTS = {
  BAZI_ANALYSIS: `
    你是一位资深的八字命理大师，具有深厚的传统文化底蕴和现代心理学知识。
    请分析以下八字信息，给出积极建设性的解读：

    八字信息：
    年柱：{year_ganzhi}
    月柱：{month_ganzhi}
    日柱：{day_ganzhi}
    时柱：{hour_ganzhi}

    请从以下维度进行分析：
    1. 人格画像（性格特点、天赋潜能）
    2. 大运流年（机遇象限、挑战象限）
    3. 五行喜忌（用神分析、调候建议）
    4. 人生建议（事业、感情、健康、财运）

    注意：
    - 避免使用"吉凶"等绝对性词汇
    - 重点在于赋能和指导，而非预测命运
    - 语言要通俗易懂，富有温度
  `,
  
  COMPATIBILITY_ANALYSIS: `
    你是一位专业的关系咨询师，结合八字命理学分析两人的匹配度。
    
    人员A八字：{person_a_bazi}
    人员B八字：{person_b_bazi}
    关系类型：{relationship_type}

    请从以下维度分析（1-100分评分）：
    1. 性格契合度
    2. 五行互补性  
    3. 现实助益度
    4. 潜在冲突点
    5. 共同成长性

    并提供具体的相处建议和改善方案。
  `,
  
  DIVINATION_INTERPRETATION: `
    你是一位智慧的占卜师，擅长将古老的易经智慧转化为现代生活指导。

    问题：{question}
    主卦：{primary_hexagram}
    变卦：{transformed_hexagram}
    变爻：{changing_lines}

    请按以下结构解读：
    1. 核心结论（直接回答问题）
    2. 逻辑分析（解释卦象含义）
    3. 行动建议（具体指导方案）

    语言要智慧而温和，避免绝对性预言。
  `
};
```

## 6. 数据处理工作流

### 6.1 八字计算引擎
```typescript
// lib/bazi/calculator.ts
export class BaziCalculator {
  // 真太阳时计算
  static calculateSolarTime(date: Date, longitude: number): Date {
    // 实现真太阳时算法
  }

  // 排八字
  static generateBazi(solarTime: Date): BaziChart {
    // 实现八字排盘算法
  }

  // 五行分析
  static analyzeWuXing(bazi: BaziChart): WuXingAnalysis {
    // 实现五行强弱分析
  }

  // 大运计算
  static calculateDayun(bazi: BaziChart): DayunPeriod[] {
    // 计算大运周期
  }
}
```

### 6.2 运势计算任务
```typescript
// lib/tasks/daily-fortune.ts
export async function generateDailyFortunes() {
  // Cron任务：每日0点为所有用户生成当日运势
  const users = await getUsersWithBazi();
  
  for (const user of users) {
    const todayFortune = calculateDailyFortune(
      user.baziProfile,
      new Date()
    );
    
    await saveDailyFortune(user.id, todayFortune);
    
    // 发送推送通知（可选）
    if (user.notificationsEnabled) {
      await sendPushNotification(user.id, todayFortune.brief);
    }
  }
}
```

## 7. 支付集成

### 7.2 天机点充值流程
```typescript
// lib/payments/tianji-points.ts
export async function processTianjiPointsPurchase(
  userId: string,
  amount: number, // 人民币金额
  paymentMethod: string
): Promise<TransactionResult> {
  
  const tianjiPoints = amount * TIANJI_POINTS_RATE;
  const bonusPoints = calculateBonusPoints(amount);
  
  // 1. 创建支付订单
  const paymentIntent = await createPaymentIntent(amount, paymentMethod);
  
  // 2. 支付成功后处理
  if (paymentIntent.status === 'succeeded') {
    // 增加天机点
    await addTianjiPoints(userId, tianjiPoints + bonusPoints, 'purchase');
    
    // 记录交易
    await recordTransaction(userId, {
      type: 'earn',
      amount: tianjiPoints + bonusPoints,
      source: 'purchase',
      description: `充值 ¥${amount}，获得 ${tianjiPoints + bonusPoints} 天机点`
    });
  }
  
  return { success: true, points: tianjiPoints + bonusPoints };
}
```

## 8. 缓存策略

### 8.1 Redis缓存配置
```typescript
// lib/cache/redis.ts
export class CacheManager {
  // 用户八字数据缓存（24小时）
  static async cacheBaziAnalysis(userId: string, data: BaziAnalysis) {
    await redis.setex(`bazi:${userId}`, 86400, JSON.stringify(data));
  }

  // AI分析结果缓存（7天）
  static async cacheAIAnalysis(key: string, result: any) {
    await redis.setex(`ai:${key}`, 604800, JSON.stringify(result));
  }

  // 每日运势缓存（当日有效）
  static async cacheDailyFortune(userId: string, date: string, fortune: DailyFortune) {
    const expireAt = new Date(date + 'T23:59:59').getTime();
    await redis.setex(`fortune:${userId}:${date}`, expireAt, JSON.stringify(fortune));
  }
}
```

## 9. 监控与日志

### 9.1 性能监控
```typescript
// lib/monitoring/performance.ts
export function trackAPIPerformance(endpoint: string, duration: number) {
  // 记录API响应时间
  console.log(`API ${endpoint} took ${duration}ms`);
  
  // 发送到监控服务（如Sentry）
  if (duration > 5000) {
    console.warn(`Slow API detected: ${endpoint}`);
  }
}
```

### 9.2 业务日志
```typescript
// lib/logging/business.ts
export function logTianjiPointsUsage(userId: string, action: string, points: number) {
  console.log(`User ${userId} ${action} ${points} Tianji Points`);
}

export function logAIAnalysisRequest(userId: string, type: string, cost: number) {
  console.log(`User ${userId} requested ${type} analysis, cost: ${cost} points`);
}
```

## 10. 部署与运维

### 10.1 数据库迁移
```bash
# 生成迁移文件
supabase db diff -f create_initial_schema

# 应用迁移
supabase db push

# 重置数据库（开发环境）
supabase db reset
```

### 10.2 环境管理
- **开发环境**: Supabase本地实例
- **测试环境**: Supabase Staging项目
- **生产环境**: Supabase Production项目

### 10.3 数据备份策略
- 每日自动备份（Supabase内置）
- 关键数据导出脚本
- 灾难恢复预案

这份后端执行文档提供了完整的Supabase开发指南，确保天机AI平台的后端服务稳定高效运行。