# 天机AI (UltraThink) - TDD 开发计划

## 1. TDD 开发策略概览

### 1.1 测试金字塔
```
        E2E Tests (10%)
    ┌─────────────────────┐
    │   用户完整流程测试   │
    └─────────────────────┘
    
         Integration Tests (20%)
    ┌───────────────────────────┐
    │  API + Database + AI 集成  │
    └───────────────────────────┘
    
           Unit Tests (70%)
    ┌─────────────────────────────────┐
    │  组件、函数、工具类单元测试    │
    └─────────────────────────────────┘
```

### 1.2 技术栈与测试工具
- **Unit Tests**: Jest + React Testing Library + @testing-library/jest-dom
- **Component Tests**: Storybook + Chromatic
- **Integration Tests**: Playwright + Supabase Testing
- **E2E Tests**: Playwright + Real Database
- **API Mocking**: MSW (Mock Service Worker)
- **AI Mocking**: Custom DeepSeek API mocks

### 1.3 TDD 开发流程
```
Red → Green → Refactor → Commit → Deploy
↑                                     ↓
└─────────── 持续集成循环 ──────────────┘
```

## 2. 第一阶段：基础设施与核心组件 (Week 1-2)

### 2.1 测试环境配置

#### 2.1.1 安装测试依赖
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jest-environment-jsdom
npm install -D msw @playwright/test storybook
```

#### 2.1.2 Jest 配置 (jest.config.js)
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### 2.2 核心工具类单元测试

#### 2.2.1 八字计算引擎测试
```typescript
// lib/bazi/calculator.test.ts
describe('BaziCalculator', () => {
  describe('calculateSolarTime', () => {
    it('should calculate correct solar time for Beijing', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const longitude = 116.4074; // 北京经度
      
      const result = BaziCalculator.calculateSolarTime(date, longitude);
      
      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(12); // 北京正午应该是12点
    });

    it('should handle timezone offset correctly', () => {
      const date = new Date('2024-01-01T06:00:00Z');
      const longitude = 120; // 东八区
      
      const result = BaziCalculator.calculateSolarTime(date, longitude);
      
      expect(result.getHours()).toBe(6); // UTC+8 早上6点
    });
  });

  describe('generateBazi', () => {
    it('should generate valid bazi for known date', () => {
      const solarTime = new Date('1990-06-15T14:30:00');
      
      const bazi = BaziCalculator.generateBazi(solarTime);
      
      expect(bazi).toHaveProperty('year_ganzhi');
      expect(bazi).toHaveProperty('month_ganzhi');
      expect(bazi).toHaveProperty('day_ganzhi');
      expect(bazi).toHaveProperty('hour_ganzhi');
      expect(bazi.year_ganzhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    });
  });

  describe('analyzeWuXing', () => {
    it('should analyze five elements strength correctly', () => {
      const mockBazi = {
        year_ganzhi: '庚午',
        month_ganzhi: '壬午', 
        day_ganzhi: '甲子',
        hour_ganzhi: '丙寅'
      };

      const analysis = BaziCalculator.analyzeWuXing(mockBazi);
      
      expect(analysis).toHaveProperty('wood');
      expect(analysis).toHaveProperty('fire');
      expect(analysis).toHaveProperty('earth');
      expect(analysis).toHaveProperty('metal');
      expect(analysis).toHaveProperty('water');
      expect(analysis.wood).toBeGreaterThan(0);
    });
  });
});
```

#### 2.2.2 天机点系统测试
```typescript
// lib/tianji-points/calculator.test.ts
describe('TianjiPointsCalculator', () => {
  it('should calculate correct points for RMB amount', () => {
    expect(TianjiPointsCalculator.calculatePoints(10)).toBe(100);
    expect(TianjiPointsCalculator.calculatePoints(68)).toBe(768); // 包含赠送
  });

  it('should calculate bonus points correctly', () => {
    expect(TianjiPointsCalculator.calculateBonusPoints(30)).toBe(30);
    expect(TianjiPointsCalculator.calculateBonusPoints(68)).toBe(88);
  });

  it('should validate sufficient points for service', () => {
    expect(TianjiPointsCalculator.hasSufficientPoints(100, 38)).toBe(true);
    expect(TianjiPointsCalculator.hasSufficientPoints(30, 38)).toBe(false);
  });
});
```

### 2.3 Supabase 数据库层测试

#### 2.3.1 用户配置文件测试
```typescript
// lib/database/user-profiles.test.ts
describe('UserProfileService', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
  });

  it('should create user profile with initial points', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com'
    };

    await UserProfileService.createProfile(mockUser);

    expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      id: 'test-user-id',
      email: 'test@example.com',
      tianji_points: 100,
      membership_type: 'basic'
    });
  });

  it('should deduct points for service usage', async () => {
    const userId = 'test-user-id';
    const cost = 38;

    await UserProfileService.deductPoints(userId, cost, 'bazi_analysis');

    expect(mockSupabase.rpc).toHaveBeenCalledWith('deduct_tianji_points', {
      user_id: userId,
      amount: cost,
      service_type: 'bazi_analysis'
    });
  });
});
```

### 2.4 AI 服务层测试

#### 2.4.1 DeepSeek API 包装器测试  
```typescript
// lib/ai/deepseek-service.test.ts
describe('DeepSeekService', () => {
  let service: DeepSeekService;
  
  beforeEach(() => {
    service = new DeepSeekService('test-api-key');
    // Mock fetch globally
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should make successful API call', async () => {
    const mockResponse = {
      choices: [{ message: { content: '测试回复' } }],
      usage: { total_tokens: 100 }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse)
    });

    const result = await service.chat([
      { role: 'user', content: '测试消息' }
    ]);

    expect(result).toBe('测试回复');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json'
        }
      })
    );
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Rate Limited'
    });

    await expect(service.chat([{ role: 'user', content: 'test' }]))
      .rejects.toThrow('AI服务暂时不可用，请稍后再试');
  });

  it('should apply custom temperature and max_tokens', async () => {
    const mockResponse = {
      choices: [{ message: { content: '回复' } }],
      usage: { total_tokens: 50 }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse)
    });

    await service.chat(
      [{ role: 'user', content: 'test' }],
      { TEMPERATURE: 0.9, MAX_TOKENS: 2000 }
    );

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    
    expect(requestBody.temperature).toBe(0.9);
    expect(requestBody.max_tokens).toBe(2000);
  });
});
```

## 3. 第二阶段：前端组件与用户界面 (Week 3-4)

### 3.1 核心表单组件测试

#### 3.1.1 八字输入表单测试
```typescript
// components/forms/BaziInputForm.test.tsx
describe('BaziInputForm', () => {
  it('should render all required fields', () => {
    render(<BaziInputForm onSubmit={jest.fn()} />);
    
    expect(screen.getByLabelText('姓名')).toBeInTheDocument();
    expect(screen.getByLabelText('出生日期')).toBeInTheDocument();
    expect(screen.getByLabelText('出生时间')).toBeInTheDocument();
    expect(screen.getByLabelText('出生城市')).toBeInTheDocument();
    expect(screen.getByLabelText('时辰不确定')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const mockSubmit = jest.fn();
    render(<BaziInputForm onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: '开始分析' });
    await user.click(submitButton);
    
    expect(screen.getByText('请输入姓名')).toBeInTheDocument();
    expect(screen.getByText('请选择出生日期')).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('should handle city autocomplete', async () => {
    render(<BaziInputForm onSubmit={jest.fn()} />);
    
    const cityInput = screen.getByLabelText('出生城市');
    await user.type(cityInput, '北京');
    
    expect(screen.getByText('北京市')).toBeInTheDocument();
    expect(screen.getByText('北京市朝阳区')).toBeInTheDocument();
  });

  it('should show uncertainty warning when selected', async () => {
    render(<BaziInputForm onSubmit={jest.fn()} />);
    
    const uncertainCheckbox = screen.getByLabelText('时辰不确定');
    await user.click(uncertainCheckbox);
    
    expect(screen.getByText(/时辰不确定会影响分析准确性/)).toBeInTheDocument();
  });

  it('should submit with correct data format', async () => {
    const mockSubmit = jest.fn();
    render(<BaziInputForm onSubmit={mockSubmit} />);
    
    await user.type(screen.getByLabelText('姓名'), '张三');
    await user.click(screen.getByLabelText('出生日期'));
    // ... 填写表单数据
    
    await user.click(screen.getByRole('button', { name: '开始分析' }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      name: '张三',
      birthDate: expect.any(Date),
      birthTime: expect.any(String),
      birthCity: expect.any(String),
      isTimeUncertain: false
    });
  });
});
```

#### 3.1.2 八字图表组件测试
```typescript
// components/charts/BaziChart.test.tsx
describe('BaziChart', () => {
  const mockBaziData = {
    year_ganzhi: '庚午',
    month_ganzhi: '壬午',
    day_ganzhi: '甲子',
    hour_ganzhi: '丙寅',
    wuxing_analysis: {
      wood: 2, fire: 3, earth: 1, metal: 2, water: 2
    }
  };

  it('should render bazi chart with correct ganzhi', () => {
    render(<BaziChart baziData={mockBaziData} />);
    
    expect(screen.getByText('庚午')).toBeInTheDocument();
    expect(screen.getByText('壬午')).toBeInTheDocument();
    expect(screen.getByText('甲子')).toBeInTheDocument();
    expect(screen.getByText('丙寅')).toBeInTheDocument();
  });

  it('should show tooltip on ganzhi hover', async () => {
    render(<BaziChart baziData={mockBaziData} interactive />);
    
    const yearGanzhi = screen.getByText('庚午');
    await user.hover(yearGanzhi);
    
    expect(screen.getByText(/年柱代表祖辈和早年/)).toBeInTheDocument();
  });

  it('should render five elements visualization', () => {
    render(<BaziChart baziData={mockBaziData} />);
    
    const woodElement = screen.getByTestId('wuxing-wood');
    expect(woodElement).toHaveStyle({ height: '20%' }); // 2/10 = 20%
    
    const fireElement = screen.getByTestId('wuxing-fire');
    expect(fireElement).toHaveStyle({ height: '30%' }); // 3/10 = 30%
  });
});
```

### 3.2 功能模块组件测试

#### 3.2.1 合盘分析组件测试
```typescript
// components/modules/CompatibilityAnalysis.test.tsx
describe('CompatibilityAnalysis', () => {
  const mockAnalysisResult = {
    overall_score: 78,
    dimension_scores: {
      personality: 85,
      five_elements: 72,
      practical: 80,
      conflicts: 25, // 低分表示冲突少
      growth: 88
    },
    relationship_advice: {
      golden_rules: ['相互尊重', '沟通理解'],
      conflict_resolution: ['及时沟通', '换位思考']
    }
  };

  it('should display overall compatibility score', () => {
    render(<CompatibilityAnalysis result={mockAnalysisResult} />);
    
    expect(screen.getByText('78')).toBeInTheDocument();
    expect(screen.getByText('整体匹配度')).toBeInTheDocument();
  });

  it('should render radar chart with dimension scores', () => {
    render(<CompatibilityAnalysis result={mockAnalysisResult} />);
    
    const radarChart = screen.getByTestId('compatibility-radar');
    expect(radarChart).toBeInTheDocument();
    
    // 检查各维度数据点
    expect(screen.getByText('性格契合度: 85')).toBeInTheDocument();
    expect(screen.getByText('五行互补性: 72')).toBeInTheDocument();
  });

  it('should show relationship advice sections', () => {
    render(<CompatibilityAnalysis result={mockAnalysisResult} />);
    
    expect(screen.getByText('相处黄金法则')).toBeInTheDocument();
    expect(screen.getByText('相互尊重')).toBeInTheDocument();
    expect(screen.getByText('沟通理解')).toBeInTheDocument();
  });
});
```

#### 3.2.2 卜卦动画组件测试
```typescript
// components/animations/CoinTossAnimation.test.tsx
describe('CoinTossAnimation', () => {
  it('should render three coins initially', () => {
    render(<CoinTossAnimation onComplete={jest.fn()} />);
    
    const coins = screen.getAllByTestId('coin');
    expect(coins).toHaveLength(3);
  });

  it('should trigger animation on click', async () => {
    const mockOnComplete = jest.fn();
    render(<CoinTossAnimation onComplete={mockOnComplete} />);
    
    const tossButton = screen.getByRole('button', { name: '摇卦' });
    await user.click(tossButton);
    
    // 检查动画class是否添加
    const coins = screen.getAllByTestId('coin');
    coins.forEach(coin => {
      expect(coin).toHaveClass('animate-spin');
    });
  });

  it('should call onComplete with hexagram result', async () => {
    jest.useFakeTimers();
    const mockOnComplete = jest.fn();
    render(<CoinTossAnimation onComplete={mockOnComplete} />);
    
    const tossButton = screen.getByRole('button', { name: '摇卦' });
    await user.click(tossButton);
    
    // 快进动画时间
    jest.advanceTimersByTime(3000);
    
    expect(mockOnComplete).toHaveBeenCalledWith(
      expect.stringMatching(/^[阴阳]{6}$/) // 6爻结果
    );
    
    jest.useRealTimers();
  });

  it('should play sound effects when enabled', async () => {
    const mockPlay = jest.fn();
    global.Audio = jest.fn().mockImplementation(() => ({
      play: mockPlay
    }));

    render(<CoinTossAnimation onComplete={jest.fn()} soundEnabled />);
    
    const tossButton = screen.getByRole('button', { name: '摇卦' });
    await user.click(tossButton);
    
    expect(mockPlay).toHaveBeenCalled();
  });
});
```

### 3.3 状态管理测试

#### 3.3.1 用户状态管理测试
```typescript
// stores/user-store.test.ts
describe('UserStore', () => {
  beforeEach(() => {
    useUserStore.getState().reset(); // 重置状态
  });

  it('should initialize with default state', () => {
    const state = useUserStore.getState();
    
    expect(state.user).toBeNull();
    expect(state.tianjiPoints).toBe(0);
    expect(state.membership).toBe('basic');
  });

  it('should set user profile correctly', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      tianji_points: 150
    };

    useUserStore.getState().setUser(mockUser);
    
    const state = useUserStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.tianjiPoints).toBe(150);
  });

  it('should deduct points for service usage', () => {
    useUserStore.getState().setTianjiPoints(100);
    useUserStore.getState().deductPoints(38);
    
    const state = useUserStore.getState();
    expect(state.tianjiPoints).toBe(62);
  });

  it('should not allow negative points', () => {
    useUserStore.getState().setTianjiPoints(20);
    
    expect(() => {
      useUserStore.getState().deductPoints(50);
    }).toThrow('天机点余额不足');
  });
});
```

## 4. 第三阶段：API 路由与业务逻辑 (Week 5-6)

### 4.1 API 路由测试

#### 4.1.1 八字分析 API 测试
```typescript
// app/api/bazi/analyze/route.test.ts
describe('/api/bazi/analyze', () => {
  let mockSupabase: any;
  let mockDeepSeek: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockDeepSeek = createMockDeepSeekService();
  });

  it('should analyze bazi successfully', async () => {
    const requestBody = {
      name: '张三',
      birthDate: '1990-06-15',
      birthTime: '14:30',
      birthCity: '北京市'
    };

    mockDeepSeek.chat.mockResolvedValue(JSON.stringify({
      core_traits: '测试人格分析',
      talents: '测试天赋分析',
      summary: '测试总结'
    }));

    const request = new Request('http://localhost:3000/api/bazi/analyze', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('bazi_profile');
    expect(data).toHaveProperty('ai_analysis');
    expect(mockSupabase.from).toHaveBeenCalledWith('bazi_profiles');
  });

  it('should return 400 for invalid input', async () => {
    const request = new Request('http://localhost:3000/api/bazi/analyze', {
      method: 'POST',
      body: JSON.stringify({ name: '' }) // 缺少必要字段
    });

    const response = await POST(request);
    
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('error');
  });

  it('should check user points before analysis', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { tianji_points: 10 }, // 不足38点
          error: null
        })
      })
    });

    const request = new Request('http://localhost:3000/api/bazi/analyze', {
      method: 'POST',
      body: JSON.stringify({
        name: '张三',
        birthDate: '1990-06-15',
        birthTime: '14:30',
        birthCity: '北京市'
      })
    });

    const response = await POST(request);
    
    expect(response.status).toBe(402); // Payment Required
    expect(await response.json()).toMatchObject({
      error: '天机点余额不足'
    });
  });
});
```

#### 4.1.2 合盘分析 API 测试
```typescript
// app/api/compatibility/analyze/route.test.ts
describe('/api/compatibility/analyze', () => {
  it('should analyze compatibility between two people', async () => {
    const requestBody = {
      personA: { name: '张三', bazi_id: 'bazi-1' },
      personB: { name: '李四', bazi_id: 'bazi-2' },
      relationshipType: 'romantic'
    };

    // Mock 八字数据查询
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [
              { id: 'bazi-1', year_ganzhi: '庚午', /* ... */ },
              { id: 'bazi-2', year_ganzhi: '壬子', /* ... */ }
            ],
            error: null
          })
        })
      })
    });

    mockDeepSeek.chat.mockResolvedValue(JSON.stringify({
      overall_score: 78,
      dimension_scores: { personality: 85, five_elements: 72 },
      relationship_advice: { golden_rules: ['相互尊重'] }
    }));

    const request = new Request('http://localhost:3000/api/compatibility/analyze', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.overall_score).toBe(78);
    expect(data.relationship_advice).toBeDefined();
  });

  it('should handle different relationship types', async () => {
    const businessRequest = {
      personA: { name: '张三', bazi_id: 'bazi-1' },
      personB: { name: '李四', bazi_id: 'bazi-2' },
      relationshipType: 'business'
    };

    // ... setup mocks

    const request = new Request('http://localhost:3000/api/compatibility/analyze', {
      method: 'POST',
      body: JSON.stringify(businessRequest)
    });

    const response = await POST(request);
    
    expect(response.status).toBe(200);
    // 验证使用了商业关系的prompt模板
    expect(mockDeepSeek.chat).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining('商业合作')
        })
      ])
    );
  });
});
```

### 4.2 数据库操作测试

#### 4.2.1 天机点交易测试
```typescript
// lib/database/tianji-transactions.test.ts
describe('TianjiTransactionService', () => {
  it('should record point earning transaction', async () => {
    const transaction = {
      user_id: 'user-1',
      type: 'earn',
      amount: 100,
      source: 'signup',
      description: '新用户注册赠送'
    };

    await TianjiTransactionService.recordTransaction(transaction);

    expect(mockSupabase.from).toHaveBeenCalledWith('tianji_transactions');
    expect(mockSupabase.insert).toHaveBeenCalledWith(transaction);
  });

  it('should record point spending transaction', async () => {
    const userId = 'user-1';
    const cost = 38;
    const service = 'bazi_analysis';

    await TianjiTransactionService.recordSpending(userId, cost, service);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('spend_tianji_points', {
      p_user_id: userId,
      p_amount: cost,
      p_service: service
    });
  });

  it('should get user transaction history', async () => {
    const userId = 'user-1';
    
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [
              { type: 'earn', amount: 100, source: 'signup' },
              { type: 'spend', amount: 38, source: 'bazi_analysis' }
            ],
            error: null
          })
        })
      })
    });

    const history = await TianjiTransactionService.getTransactionHistory(userId);

    expect(history).toHaveLength(2);
    expect(history[0].type).toBe('earn');
    expect(history[1].type).toBe('spend');
  });
});
```

### 4.3 AI 服务集成测试

#### 4.3.1 Prompt 质量测试
```typescript
// lib/ai/prompt-quality.test.ts
describe('AI Prompt Quality', () => {
  let aiService: DeepSeekService;

  beforeEach(() => {
    aiService = new DeepSeekService('test-key');
  });

  it('should generate consistent bazi analysis structure', async () => {
    const testBaziData = {
      year_ganzhi: '庚午',
      month_ganzhi: '壬午',
      day_ganzhi: '甲子',
      hour_ganzhi: '丙寅'
    };

    // Mock multiple calls to test consistency
    const mockResponses = [1, 2, 3].map(i => JSON.stringify({
      core_traits: `人格分析${i}`,
      talents: `天赋分析${i}`,
      summary: `总结${i}`
    }));

    aiService.chat = jest.fn()
      .mockResolvedValueOnce(mockResponses[0])
      .mockResolvedValueOnce(mockResponses[1])
      .mockResolvedValueOnce(mockResponses[2]);

    const results = await Promise.all([
      analyzeBaziWithAI(testBaziData),
      analyzeBaziWithAI(testBaziData),
      analyzeBaziWithAI(testBaziData)
    ]);

    // 验证所有响应都有必要的字段
    results.forEach(result => {
      expect(result).toHaveProperty('core_traits');
      expect(result).toHaveProperty('talents');
      expect(result).toHaveProperty('summary');
    });
  });

  it('should avoid negative language in responses', async () => {
    const testPrompt = BAZI_ANALYSIS_PROMPTS.PERSONALITY_PROMPT;
    
    // 检查prompt本身不包含负面词汇
    const negativeWords = ['死', '灾', '凶', '败', '破'];
    negativeWords.forEach(word => {
      expect(testPrompt).not.toContain(word);
    });

    // 检查prompt引导积极表达
    expect(testPrompt).toContain('积极');
    expect(testPrompt).toContain('建设性');
    expect(testPrompt).toContain('机遇');
  });
});
```

## 5. 第四阶段：集成测试与用户流程 (Week 7-8)

### 5.1 完整用户流程测试

#### 5.1.1 八字分析完整流程
```typescript
// e2e/bazi-analysis-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('八字分析完整流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-btn"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('用户可以完成完整的八字分析流程', async ({ page }) => {
    // Step 1: 导航到八字分析页面
    await page.click('[data-testid="bazi-analysis-nav"]');
    await expect(page).toHaveURL('/bazi');

    // Step 2: 填写八字信息表单
    await page.fill('[data-testid="name-input"]', '张三');
    
    // 选择出生日期
    await page.click('[data-testid="birth-date-picker"]');
    await page.click('[data-testid="year-1990"]');
    await page.click('[data-testid="month-6"]');
    await page.click('[data-testid="day-15"]');
    
    // 选择出生时间
    await page.selectOption('[data-testid="birth-time"]', '14:30');
    
    // 输入城市并选择
    await page.fill('[data-testid="birth-city"]', '北京');
    await page.click('[data-testid="city-beijing"]');

    // Step 3: 检查天机点余额
    const pointsBalance = await page.textContent('[data-testid="points-balance"]');
    expect(parseInt(pointsBalance!)).toBeGreaterThanOrEqual(38);

    // Step 4: 提交分析请求
    await page.click('[data-testid="analyze-btn"]');
    
    // Step 5: 等待分析完成
    await expect(page.locator('[data-testid="analysis-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="analysis-result"]')).toBeVisible({ timeout: 30000 });

    // Step 6: 验证分析结果显示
    await expect(page.locator('[data-testid="bazi-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="personality-analysis"]')).toBeVisible();
    await expect(page.locator('[data-testid="fortune-analysis"]')).toBeVisible();

    // Step 7: 验证天机点已扣除
    const newPointsBalance = await page.textContent('[data-testid="points-balance"]');
    expect(parseInt(newPointsBalance!)).toBe(parseInt(pointsBalance!) - 38);
  });

  test('用户天机点不足时应显示充值提示', async ({ page }) => {
    // 模拟用户点数不足
    await page.route('/api/user/profile', route => {
      route.fulfill({
        json: { tianji_points: 10, membership_type: 'basic' }
      });
    });

    await page.goto('/bazi');
    
    // 填写表单
    await page.fill('[data-testid="name-input"]', '张三');
    // ... 其他表单字段

    await page.click('[data-testid="analyze-btn"]');

    // 应显示余额不足提示
    await expect(page.locator('[data-testid="insufficient-points-modal"]')).toBeVisible();
    await expect(page.locator('text=天机点余额不足')).toBeVisible();
  });
});
```

#### 5.1.2 合盘分析流程测试
```typescript
// e2e/compatibility-analysis-flow.spec.ts
test('用户可以进行合盘分析', async ({ page }) => {
  await page.goto('/compatibility');

  // Step 1: 选择关系类型
  await page.click('[data-testid="relationship-romantic"]');

  // Step 2: 输入两人信息
  await page.fill('[data-testid="person-a-name"]', '张三');
  // 为人员A选择已有八字
  await page.click('[data-testid="person-a-bazi-select"]');
  await page.click('[data-testid="bazi-option-1"]');

  await page.fill('[data-testid="person-b-name"]', '李四');
  // 为人员B创建新八字
  await page.click('[data-testid="person-b-create-new"]');
  // ... 填写八字信息

  // Step 3: 开始分析
  await page.click('[data-testid="start-compatibility-analysis"]');

  // Step 4: 验证结果
  await expect(page.locator('[data-testid="compatibility-score"]')).toBeVisible();
  await expect(page.locator('[data-testid="radar-chart"]')).toBeVisible();
  await expect(page.locator('[data-testid="relationship-advice"]')).toBeVisible();

  // Step 5: 测试交互功能
  await page.hover('[data-testid="personality-score"]');
  await expect(page.locator('[data-testid="personality-tooltip"]')).toBeVisible();
});
```

### 5.2 错误处理与边界情况测试

#### 5.2.1 API 错误处理测试
```typescript
// e2e/error-handling.spec.ts
test.describe('错误处理', () => {
  test('处理 AI 服务不可用', async ({ page }) => {
    // Mock AI API 错误
    await page.route('/api/bazi/analyze', route => {
      route.fulfill({
        status: 503,
        json: { error: 'AI服务暂时不可用' }
      });
    });

    await page.goto('/bazi');
    // ... 填写表单
    await page.click('[data-testid="analyze-btn"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=AI服务暂时不可用')).toBeVisible();
    await expect(page.locator('[data-testid="retry-btn"]')).toBeVisible();
  });

  test('处理网络连接错误', async ({ page }) => {
    // 模拟网络断开
    await page.context().setOffline(true);

    await page.goto('/bazi');
    // ... 填写表单
    await page.click('[data-testid="analyze-btn"]');

    await expect(page.locator('text=网络连接错误')).toBeVisible();

    // 恢复网络连接
    await page.context().setOffline(false);
    await page.click('[data-testid="try-again-btn"]');

    // 应该重新尝试请求
    await expect(page.locator('[data-testid="analysis-loading"]')).toBeVisible();
  });
});
```

### 5.3 性能测试

#### 5.3.1 页面加载性能测试
```typescript
// performance/load-times.spec.ts
test('页面加载性能测试', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/bazi');
  
  // 等待关键内容加载
  await expect(page.locator('[data-testid="bazi-form"]')).toBeVisible();
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000); // 3秒内加载完成

  // 检查 Core Web Vitals
  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve(entries.map(entry => ({
          name: entry.name,
          value: entry.value
        })));
      }).observe({ entryTypes: ['measure', 'navigation'] });
    });
  });

  // 验证性能指标
  expect(metrics).toBeDefined();
});
```

## 6. 第五阶段：部署与监控 (Week 9-10)

### 6.1 CI/CD 流水线测试

#### 6.1.1 GitHub Actions 配置
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run unit tests
      run: npm run test:unit
      
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

    - name: Run E2E tests
      run: npm run test:e2e
      
    - name: Build application
      run: npm run build

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - name: Deploy to Vercel Staging
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        scope: staging

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to Vercel Production
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### 6.2 监控与告警测试

#### 6.2.1 健康检查端点测试
```typescript
// app/api/health/route.test.ts
describe('/api/health', () => {
  it('should return healthy status', async () => {
    const request = new Request('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      status: 'healthy',
      timestamp: expect.any(String),
      services: {
        database: 'connected',
        ai_service: 'available'
      }
    });
  });

  it('should return unhealthy when database is down', async () => {
    // Mock database connection failure
    mockSupabase.from.mockImplementation(() => {
      throw new Error('Connection failed');
    });

    const request = new Request('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('unhealthy');
    expect(data.services.database).toBe('disconnected');
  });
});
```

## 7. 测试覆盖率目标与质量门禁

### 7.1 覆盖率目标
- **单元测试覆盖率**: ≥ 80%
- **集成测试覆盖率**: ≥ 60%
- **E2E 测试覆盖率**: ≥ 40%

### 7.2 质量门禁标准
```typescript
// jest.config.js
module.exports = {
  // ... 其他配置
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './lib/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

### 7.3 代码质量检查
```json
// package.json scripts
{
  "scripts": {
    "test:unit": "jest",
    "test:integration": "jest --config jest.integration.config.js",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "quality:check": "npm run lint && npm run type-check && npm run test:coverage"
  }
}
```

## 8. 开发时间线与里程碑

| 阶段 | 时间 | 主要任务 | 可交付成果 |
|------|------|----------|------------|
| **Phase 1** | Week 1-2 | 基础设施与核心工具类 | 八字计算引擎、数据库 Schema、AI 服务封装 |
| **Phase 2** | Week 3-4 | 前端组件与 UI | 核心表单组件、图表组件、状态管理 |
| **Phase 3** | Week 5-6 | API 路由与业务逻辑 | 完整的后端 API、数据库操作、AI 集成 |
| **Phase 4** | Week 7-8 | 集成测试与用户流程 | E2E 测试、错误处理、性能优化 |
| **Phase 5** | Week 9-10 | 部署与监控 | CI/CD 流水线、生产环境部署、监控告警 |

## 9. TDD 最佳实践总结

### 9.1 红-绿-重构循环
1. **红 (Red)**: 写一个失败的测试
2. **绿 (Green)**: 写最少代码让测试通过
3. **重构 (Refactor)**: 改进代码质量，保持测试通过

### 9.2 测试命名约定
```typescript
describe('模块或组件名称', () => {
  it('should 预期行为 when 特定条件', () => {
    // 测试实现
  });
});
```

### 9.3 测试数据管理
- 使用工厂函数创建测试数据
- 每个测试独立，不依赖其他测试的状态
- 使用固定的测试数据确保可重现性

### 9.4 Mock 策略
- 外部 API 调用必须 Mock
- 数据库操作使用内存数据库或 Mock
- 时间相关功能使用 jest.useFakeTimers()

这个 TDD 开发计划提供了完整的测试驱动开发策略，确保天机AI平台的每个功能都经过充分测试，代码质量高，用户体验稳定可靠。