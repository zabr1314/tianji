# 天机AI - AI Prompt大师执行文档

## 1. DeepSeek API集成架构

### 1.1 API配置与认证
```typescript
// lib/ai/deepseek-config.ts
export const DEEPSEEK_CONFIG = {
  BASE_URL: 'https://api.deepseek.com',
  MODEL: 'deepseek-chat',
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.7,
  TOP_P: 0.9,
  STREAM: false,
  TIMEOUT: 30000, // 30秒超时
};

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: DeepSeekMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

### 1.2 AI服务封装
```typescript
// lib/ai/deepseek-service.ts
export class DeepSeekService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = DEEPSEEK_CONFIG.BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async chat(messages: DeepSeekMessage[], options?: Partial<typeof DEEPSEEK_CONFIG>): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options?.MODEL || DEEPSEEK_CONFIG.MODEL,
          messages,
          max_tokens: options?.MAX_TOKENS || DEEPSEEK_CONFIG.MAX_TOKENS,
          temperature: options?.TEMPERATURE || DEEPSEEK_CONFIG.TEMPERATURE,
          top_p: options?.TOP_P || DEEPSEEK_CONFIG.TOP_P,
          stream: options?.STREAM || DEEPSEEK_CONFIG.STREAM,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API Error: ${response.status} ${response.statusText}`);
      }

      const data: DeepSeekResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw new Error('AI服务暂时不可用，请稍后再试');
    }
  }

  // 流式响应处理
  async streamChat(messages: DeepSeekMessage[], onChunk: (chunk: string) => void): Promise<void> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.MODEL,
        messages,
        stream: true,
        max_tokens: DEEPSEEK_CONFIG.MAX_TOKENS,
        temperature: DEEPSEEK_CONFIG.TEMPERATURE,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }
}
```

## 2. 核心Prompt体系设计

### 2.1 八字分析Prompt模板
```typescript
// lib/ai/prompts/bazi-analysis.ts
export const BAZI_ANALYSIS_PROMPTS = {
  SYSTEM_PROMPT: `
你是天机AI的首席命理大师，拥有30年的八字命理实战经验，深谙传统文化精髓，同时具备现代心理学素养。

你的使命：
- 将古老的八字智慧转化为现代人能理解和应用的人生指导
- 始终保持积极、建设性的语调，重在赋能而非宿命
- 避免使用"吉凶"等绝对化词汇，改用"机遇"和"挑战"
- 提供具体可行的人生建议和策略

分析原则：
1. 科学理性：基于阴阳五行理论，逻辑清晰
2. 个性化：每个人的八字都是独特的生命密码
3. 温度感：语言亲和，充满人文关怀
4. 实用性：提供可操作的人生指导建议
`,

  PERSONALITY_PROMPT: `
基于以下八字信息，请深度分析此人的人格特质：

八字四柱：
年柱：{year_ganzhi} ({year_wuxing})
月柱：{month_ganzhi} ({month_wuxing})  
日柱：{day_ganzhi} ({day_wuxing}) [日主]
时柱：{hour_ganzhi} ({hour_wuxing})

五行分析：
- 五行强弱：{wuxing_strength}
- 用神：{yongshen}
- 喜神：{xishen}
- 忌神：{jishen}

请从以下维度分析，生成一份类似"MBTI"但更具东方智慧的人格报告：

1. **核心性格特质**
   - 日主特性分析（如甲木的正直担当，乙木的灵活变通等）
   - 十神影响（正官的责任感，食神的创造力等）
   - 整体性格画像

2. **天赋潜能**
   - 五行优势带来的天然禀赋
   - 适合的事业方向和发展领域
   - 学习和成长的最佳路径

3. **个人风格**
   - 处事方式和思维模式
   - 人际交往的特点
   - 决策习惯和行为模式

4. **内在驱动**
   - 深层次的价值追求
   - 人生目标和理想
   - 精神层面的需求

要求：
- 语言生动有趣，避免晦涩术语
- 每个特质都要举例说明
- 突出积极面，对不足之处给出成长建议
- 字数控制在800-1200字

输出格式：
使用JSON格式，包含以下字段：
{
  "core_traits": "核心性格特质描述",
  "talents": "天赋潜能分析", 
  "personal_style": "个人风格描述",
  "inner_drive": "内在驱动分析",
  "summary": "整体人格画像总结"
}
`,

  FORTUNE_PROMPT: `
基于八字信息，分析未来大运流年的机遇与挑战：

当前大运：{current_dayun} (年龄：{current_age}-{dayun_end_age})
流年分析：{current_year} ({year_ganzhi})

历史大运：
{historical_dayun}

未来大运：
{future_dayun}

请分析：

1. **当前运势阶段**
   - 大运特点及其对命主的影响
   - 当前流年的机遇和挑战
   - 本阶段的核心主题

2. **机遇象限** ⭐
   - 在哪些领域容易有突破
   - 什么类型的机会值得把握
   - 最佳行动时机和策略

3. **挑战象限** ⚠️
   - 可能遇到的困难和阻碍
   - 需要特别注意的风险点
   - 化解挑战的具体方法

4. **长期趋势**
   - 未来10年的整体运势走向
   - 人生重要节点的时间预测
   - 长期规划建议

要求：
- 避免使用"大吉大凶"等极端词汇
- 重点在指导行动，而非预测结果
- 提供具体的时间节点和行动建议
- 语言要有温度，给人希望和力量

输出JSON格式：
{
  "current_phase": "当前阶段分析",
  "opportunities": "机遇象限描述",
  "challenges": "挑战象限描述", 
  "long_term_trend": "长期趋势分析",
  "action_suggestions": ["具体行动建议数组"]
}
`,

  LIFE_GUIDANCE_PROMPT: `
基于完整的八字分析，提供全方位的人生指导建议：

八字信息：{complete_bazi_info}
人格分析：{personality_analysis}
运势分析：{fortune_analysis}

请从以下四个维度提供深度建议：

1. **事业发展** 💼
   - 最适合的行业和职业方向
   - 创业 vs 就业的选择建议
   - 职场发展的关键策略
   - 贵人方位和合作伙伴类型

2. **感情婚姻** 💕
   - 理想伴侣的特质画像
   - 恋爱和婚姻中需要注意的问题
   - 感情发展的最佳时机
   - 维护关系的智慧建议

3. **健康养生** 🏥
   - 基于五行的体质分析
   - 容易出现的健康问题及预防
   - 适合的运动和养生方式
   - 饮食调理建议

4. **财富管理** 💰
   - 财运特点和赚钱方式
   - 投资理财的风格建议
   - 破财风险和防范措施
   - 聚财的最佳策略

要求：
- 建议要具体可操作
- 结合现代生活实际情况
- 保持积极向上的基调
- 每个维度都要有3-5条具体建议

输出JSON格式：
{
  "career": {
    "suitable_industries": ["适合行业"],
    "development_strategy": "发展策略",
    "key_suggestions": ["关键建议"]
  },
  "relationship": {
    "ideal_partner": "理想伴侣特质",
    "relationship_advice": "感情建议",
    "timing_guidance": "时机指导"
  },
  "health": {
    "constitution_analysis": "体质分析",
    "health_risks": ["健康风险"],
    "wellness_advice": ["养生建议"]
  },
  "wealth": {
    "wealth_pattern": "财运特点",
    "investment_style": "投资建议",
    "wealth_building": ["聚财策略"]
  }
}
`
};
```

### 2.2 合盘分析Prompt模板
```typescript
// lib/ai/prompts/compatibility.ts
export const COMPATIBILITY_PROMPTS = {
  ANALYSIS_PROMPT: `
你是专业的情感咨询师和关系分析专家，精通八字合盘理论。

请分析以下两人的八字匹配度：

**人员A信息：**
姓名：{person_a_name}
八字：{person_a_bazi}
五行：{person_a_wuxing}
用神：{person_a_yongshen}

**人员B信息：**
姓名：{person_b_name}  
八字：{person_b_bazi}
五行：{person_b_wuxing}
用神：{person_b_yongshen}

**关系类型：** {relationship_type}

请从以下五个维度进行详细分析（每个维度1-100分评分）：

1. **性格契合度** (Personality Compatibility)
   - 双方性格的互补性和冲突点
   - 沟通方式的匹配程度
   - 价值观和人生观的一致性

2. **五行互补性** (Five Elements Harmony)
   - 双方五行的生克关系
   - 用神是否互为补益
   - 整体五行平衡程度

3. **现实助益度** (Practical Support)
   - 在事业上的相互帮助
   - 生活中的互补支持
   - 共同目标的实现能力

4. **潜在冲突点** (Potential Conflicts)
   - 可能的摩擦和分歧
   - 需要磨合的地方
   - 矛盾化解的难易程度

5. **共同成长性** (Growth Potential)
   - 一起进步的可能性
   - 相互激励的程度
   - 长期发展的前景

针对{relationship_type}关系，请提供：
- 相处的黄金法则
- 避免冲突的智慧
- 关系升华的建议

输出JSON格式：
{
  "overall_score": 总分,
  "dimension_scores": {
    "personality": 性格契合度分数,
    "five_elements": 五行互补性分数,
    "practical": 现实助益度分数,
    "conflicts": 潜在冲突点分数（反向计分）,
    "growth": 共同成长性分数
  },
  "detailed_analysis": {
    "personality_analysis": "性格分析详述",
    "five_elements_analysis": "五行关系分析",
    "practical_analysis": "现实层面分析",
    "conflict_analysis": "冲突点分析",
    "growth_analysis": "成长潜力分析"
  },
  "relationship_advice": {
    "golden_rules": ["相处黄金法则"],
    "conflict_resolution": ["冲突化解方法"],
    "enhancement_tips": ["关系提升建议"]
  },
  "summary": "综合评价总结"
}
`,

  ROMANTIC_FOCUS_PROMPT: `
重点分析情侣关系的匹配度，额外关注：
- 浪漫指数和激情程度
- 婚姻稳定性预测
- 生育子女的配合度
- 家庭分工的和谐性
- 爱情保鲜的秘诀
`,

  BUSINESS_FOCUS_PROMPT: `
重点分析商业合作的可行性，额外关注：
- 能力互补和分工协作
- 决策风格的匹配
- 风险承担能力
- 利益分配的和谐性
- 长期合作的稳定性
`,

  FAMILY_FOCUS_PROMPT: `
重点分析家庭关系（如亲子、兄弟姐妹），额外关注：
- 代际沟通的顺畅度
- 教育理念的一致性
- 家庭责任的分担
- 情感支持的互动
- 家族和谐的维护
`
};
```

### 2.3 卜卦解读Prompt模板
```typescript
// lib/ai/prompts/divination.ts
export const DIVINATION_PROMPTS = {
  INTERPRETATION_PROMPT: `
你是一位深谙易经智慧的卜卦大师，能够将古老的卦象智慧转化为现代人的生活指导。

卜卦信息：
问题：{question}
主卦：{primary_hexagram} - {hexagram_name}
变卦：{transformed_hexagram} - {transformed_name}
变爻：{changing_lines}
起卦时间：{divination_time}

卦象基本含义：
{hexagram_meaning}

请按照以下结构进行解读：

1. **核心结论** 🎯
   - 直接回答用户的问题
   - 给出明确的趋势判断
   - 用一句话概括卦象要义

2. **逻辑分析** 🔍
   - 解释主卦的象征意义
   - 分析变爻的作用和影响
   - 说明变卦所示的发展方向
   - 结合问题的具体情境

3. **行动建议** 💡
   - 提供3-5条具体可行的建议
   - 指出最佳行动时机
   - 建议需要注意的事项
   - 给出替代方案（如果需要）

4. **时间指导** ⏰
   - 分析有利的时间节点
   - 建议避开的不利时期
   - 给出具体的日期建议（如适用）

要求：
- 语言要智慧而温和，避免绝对性预言
- 重在指导行动，而非预测命运
- 结合现代生活实际情况
- 保持神秘感但不要过于玄奥
- 给人信心和力量

输出JSON格式：
{
  "core_conclusion": "核心结论",
  "logical_analysis": "逻辑分析详述",
  "action_suggestions": [
    {
      "suggestion": "具体建议",
      "priority": "high/medium/low",
      "timing": "时机建议"
    }
  ],
  "timing_guidance": {
    "favorable_period": "有利时期",
    "unfavorable_period": "不利时期", 
    "optimal_timing": "最佳时机"
  },
  "additional_notes": "补充说明",
  "confidence_level": "high/medium/low"
}
`,

  QUESTION_CATEGORIES: {
    career: "事业工作类问题的解读重点：职业发展、升职加薪、跳槽创业、商业决策",
    relationship: "感情关系类问题的解读重点：恋爱婚姻、感情发展、关系修复、相处之道",
    health: "健康平安类问题的解读重点：身体状况、疾病康复、安全出行、意外预防",
    wealth: "财运投资类问题的解读重点：财运走势、投资决策、理财规划、生意经营",
    family: "家庭生活类问题的解读重点：家庭和睦、子女教育、长辈关系、家宅安康",
    study: "学习考试类问题的解读重点：学业进展、考试运势、专业选择、技能提升",
    general: "综合运势类问题的解读重点：整体运势、人生方向、重大决策、趋吉避凶"
  }
};
```

### 2.4 其他功能Prompt模板
```typescript
// lib/ai/prompts/others.ts
export const OTHER_PROMPTS = {
  NAME_ANALYSIS_PROMPT: `
你是姓名学专家，精通三才五格、数理分析、五行配置等姓名学理论。

请分析以下姓名：
姓名：{name}
对应八字：{bazi_info}（如果有）

分析维度：

1. **三才五格分析**
   - 天格、人格、地格、外格、总格的数理
   - 三才配置（天人地）的五行关系
   - 数理吉凶的现代解读

2. **五行配置**
   - 姓名整体的五行属性
   - 与八字用神的匹配度
   - 五行补益或冲克关系

3. **音形义分析**
   - 读音的响亮度和节奏感
   - 字形的美观度和书写便利性
   - 寓意的积极性和文化内涵

4. **现代适用性**
   - 社交场合的适用性
   - 职场印象分析
   - 国际化程度

输出JSON格式包含具体分析和改进建议。
`,

  DREAM_ANALYSIS_PROMPT: `
你是解梦专家，融合《周公解梦》传统智慧、弗洛伊德梦的解析理论、荣格心理学原型理论。

梦境信息：
梦境描述：{dream_description}
梦境情绪：{dream_emotions}
现实背景：{recent_events}
做梦人信息：{dreamer_info}

请从以下角度分析：

1. **传统解梦** (周公解梦)
   - 梦境象征的传统含义
   - 吉凶预示的现代转化
   - 文化符号的深层解读

2. **心理分析** (弗洛伊德 + 荣格)
   - 潜意识的表达和需求
   - 内心冲突和压抑情绪
   - 个人成长的暗示

3. **现实指导**
   - 与当前生活的关联
   - 需要关注的现实问题
   - 积极的行动建议

要求：
- 避免过于迷信的解释
- 重在心理疏导和生活指导
- 语言温和，给人启发

输出JSON格式。
`,

  DAILY_FORTUNE_PROMPT: `
基于用户八字信息，生成今日运势提醒：

用户八字：{user_bazi}
今日干支：{today_ganzhi}
当前大运：{current_dayun}

请生成：
1. 简要运势（1句话，免费用户可见）
2. 详细解读（200字左右，会员用户可见）
3. 宜做事项（3-5项）
4. 忌做事项（3-5项）  
5. 吉时推荐

语调要轻松愉快，富有正能量。
`
};
```

## 3. AI响应格式化与后处理

### 3.1 响应解析器
```typescript
// lib/ai/response-parser.ts
export class AIResponseParser {
  // 解析JSON格式的AI响应
  static parseJSONResponse<T>(response: string): T {
    try {
      // 清理可能的markdown代码块标记
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      return JSON.parse(cleanedResponse);
    } catch (error) {
      throw new Error('AI响应格式解析失败');
    }
  }

  // 解析八字分析响应
  static parseBaziAnalysis(response: string): BaziAnalysisResult {
    const parsed = this.parseJSONResponse<BaziAnalysisResult>(response);
    
    // 验证必要字段
    if (!parsed.core_traits || !parsed.talents) {
      throw new Error('八字分析响应格式不完整');
    }
    
    return parsed;
  }

  // 解析合盘分析响应
  static parseCompatibilityAnalysis(response: string): CompatibilityResult {
    const parsed = this.parseJSONResponse<CompatibilityResult>(response);
    
    // 验证评分范围
    if (parsed.overall_score < 0 || parsed.overall_score > 100) {
      throw new Error('合盘分析评分超出有效范围');
    }
    
    return parsed;
  }

  // 解析卜卦解读响应
  static parseDivinationInterpretation(response: string): DivinationResult {
    const parsed = this.parseJSONResponse<DivinationResult>(response);
    
    // 验证置信度
    if (!['high', 'medium', 'low'].includes(parsed.confidence_level)) {
      parsed.confidence_level = 'medium';
    }
    
    return parsed;
  }
}
```

### 3.2 响应质量验证
```typescript
// lib/ai/quality-validator.ts
export class AIQualityValidator {
  // 验证响应完整性
  static validateCompleteness(response: any, requiredFields: string[]): boolean {
    return requiredFields.every(field => 
      response[field] !== undefined && response[field] !== null && response[field] !== ''
    );
  }

  // 验证内容质量
  static validateContentQuality(text: string): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // 检查长度
    if (text.length < 50) {
      issues.push('内容过短');
    }
    
    if (text.length > 5000) {
      issues.push('内容过长');
    }
    
    // 检查是否包含负面词汇
    const negativeWords = ['死', '灾', '凶', '败', '破'];
    if (negativeWords.some(word => text.includes(word))) {
      issues.push('包含负面词汇');
    }
    
    // 检查是否过于绝对化
    const absoluteWords = ['必须', '绝对', '一定会', '永远不'];
    if (absoluteWords.some(word => text.includes(word))) {
      issues.push('表述过于绝对化');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  // 验证评分合理性
  static validateScores(scores: Record<string, number>): boolean {
    return Object.values(scores).every(score => 
      typeof score === 'number' && score >= 0 && score <= 100
    );
  }
}
```

## 4. Prompt工程最佳实践

### 4.1 Prompt优化策略
```typescript
// lib/ai/prompt-optimizer.ts
export class PromptOptimizer {
  // 动态调整temperature
  static getOptimalTemperature(taskType: string): number {
    const temperatureMap: Record<string, number> = {
      'bazi_analysis': 0.7,    // 需要创造性和人文温度
      'compatibility': 0.6,    // 相对客观，略有创造性
      'divination': 0.8,       // 需要更多直觉和创造性
      'name_analysis': 0.5,    // 相对技术性和客观
      'dream_analysis': 0.9,   // 高度创造性和直觉性
      'daily_fortune': 0.6     // 平衡客观性和趣味性
    };
    
    return temperatureMap[taskType] || 0.7;
  }

  // 根据用户特征个性化prompt
  static personalizePrompt(basePrompt: string, userProfile: UserProfile): string {
    let personalizedPrompt = basePrompt;
    
    // 根据年龄调整语言风格
    if (userProfile.age < 25) {
      personalizedPrompt += '\n注意：用户较为年轻，语言要更活泼有趣，多用比喻和现代化表达。';
    } else if (userProfile.age > 45) {
      personalizedPrompt += '\n注意：用户较为成熟，语言要更稳重深刻，可适当引用古典文化。';
    }
    
    // 根据会员等级调整详细度
    if (userProfile.membershipType === 'yearly') {
      personalizedPrompt += '\n注意：用户是年度会员，提供最详细和深度的分析。';
    }
    
    return personalizedPrompt;
  }

  // Prompt版本A/B测试
  static getPromptVariant(basePrompt: string, variant: 'A' | 'B'): string {
    if (variant === 'A') {
      return basePrompt; // 原版本
    } else {
      // B版本：更注重实用性
      return basePrompt + '\n特别注意：多提供具体的、可操作的建议，减少理论阐述。';
    }
  }
}
```

### 4.2 Context管理
```typescript
// lib/ai/context-manager.ts
export class ContextManager {
  // 构建完整的上下文信息
  static buildContext(
    userProfile: UserProfile,
    analysisHistory: AnalysisRecord[],
    currentRequest: any
  ): DeepSeekMessage[] {
    const messages: DeepSeekMessage[] = [];
    
    // 系统角色设定
    messages.push({
      role: 'system',
      content: this.getSystemPrompt(currentRequest.type)
    });
    
    // 用户历史分析简要摘要（提供连续性）
    if (analysisHistory.length > 0) {
      const historyContext = this.summarizeHistory(analysisHistory);
      messages.push({
        role: 'user',
        content: `历史分析摘要：${historyContext}`
      });
    }
    
    // 当前请求
    messages.push({
      role: 'user',
      content: this.formatCurrentRequest(currentRequest)
    });
    
    return messages;
  }

  private static summarizeHistory(history: AnalysisRecord[]): string {
    // 提取关键信息，避免context过长
    const recentAnalyses = history.slice(-3); // 只保留最近3次分析
    
    return recentAnalyses.map(record => 
      `${record.type}: ${record.keyFindings.slice(0, 100)}...`
    ).join('\n');
  }

  private static formatCurrentRequest(request: any): string {
    // 根据请求类型格式化
    switch (request.type) {
      case 'bazi_analysis':
        return `请分析八字：${JSON.stringify(request.baziData)}`;
      case 'compatibility':
        return `请分析合盘：${JSON.stringify(request.compatibilityData)}`;
      default:
        return JSON.stringify(request);
    }
  }
}
```

## 5. 错误处理与降级策略

### 5.1 AI服务容错机制
```typescript
// lib/ai/error-handler.ts
export class AIErrorHandler {
  // API调用重试机制
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError!;
  }

  // 服务降级处理
  static async fallbackAnalysis(requestType: string, inputData: any): Promise<any> {
    console.warn(`AI服务不可用，使用降级方案: ${requestType}`);
    
    switch (requestType) {
      case 'bazi_analysis':
        return this.getFallbackBaziAnalysis(inputData);
      case 'compatibility':
        return this.getFallbackCompatibilityAnalysis(inputData);
      case 'divination':
        return this.getFallbackDivinationAnalysis(inputData);
      default:
        throw new Error('暂无可用的分析服务');
    }
  }

  private static getFallbackBaziAnalysis(baziData: any) {
    // 基于规则的简化分析
    return {
      core_traits: "基于您的八字配置，您是一个有责任心、具有领导能力的人。",
      talents: "您在沟通和管理方面有天赋，适合从事与人打交道的工作。",
      summary: "您的八字显示出均衡的特质，建议保持积极的心态面对生活挑战。"
    };
  }
}
```

### 5.2 响应时间优化
```typescript
// lib/ai/performance-optimizer.ts
export class PerformanceOptimizer {
  // 并行处理多个AI请求
  static async parallelAnalysis(requests: AIRequest[]): Promise<AIResponse[]> {
    const promises = requests.map(request => 
      this.processSingleRequest(request)
    );
    
    return Promise.all(promises);
  }

  // 缓存常见分析结果
  static async getCachedOrAnalyze(
    cacheKey: string,
    analysisFunction: () => Promise<any>
  ): Promise<any> {
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    const result = await analysisFunction();
    await this.saveToCache(cacheKey, result, 3600); // 缓存1小时
    
    return result;
  }

  // 流式响应处理
  static async streamingAnalysis(
    prompt: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const deepseek = new DeepSeekService(process.env.DEEPSEEK_API_KEY!);
    
    await deepseek.streamChat([
      { role: 'user', content: prompt }
    ], onChunk);
  }
}
```

## 6. 质量监控与优化

### 6.1 AI响应质量评估
```typescript
// lib/ai/quality-monitor.ts
export class QualityMonitor {
  // 用户满意度跟踪
  static async trackUserFeedback(
    analysisId: string,
    rating: number,
    feedback?: string
  ): Promise<void> {
    await supabase
      .from('ai_feedback')
      .insert({
        analysis_id: analysisId,
        rating,
        feedback,
        created_at: new Date().toISOString()
      });
  }

  // 响应质量评分
  static evaluateResponse(response: any): QualityScore {
    let score = 0;
    const metrics: Record<string, number> = {};
    
    // 完整性评分
    metrics.completeness = this.evaluateCompleteness(response);
    
    // 可读性评分
    metrics.readability = this.evaluateReadability(response);
    
    // 实用性评分
    metrics.usefulness = this.evaluateUsefulness(response);
    
    // 积极性评分
    metrics.positivity = this.evaluatePositivity(response);
    
    score = Object.values(metrics).reduce((sum, val) => sum + val, 0) / 4;
    
    return { overall: score, metrics };
  }

  // A/B测试结果分析
  static async analyzeABTest(testId: string): Promise<ABTestResult> {
    const results = await supabase
      .from('ab_test_results')
      .select('*')
      .eq('test_id', testId);
    
    // 分析转化率、用户满意度等指标
    return this.calculateABTestMetrics(results.data || []);
  }
}
```

### 6.2 Prompt迭代优化
```typescript
// lib/ai/prompt-evolution.ts
export class PromptEvolution {
  // 基于反馈优化prompt
  static async evolvePrompt(
    currentPrompt: string,
    feedbackData: FeedbackData[]
  ): Promise<string> {
    // 分析负面反馈的共同模式
    const commonIssues = this.analyzeCommonIssues(feedbackData);
    
    // 生成优化建议
    const optimizations = this.generateOptimizations(commonIssues);
    
    // 应用优化到prompt
    return this.applyOptimizations(currentPrompt, optimizations);
  }

  // 自动生成prompt变体
  static generatePromptVariants(basePrompt: string): string[] {
    const variants: string[] = [];
    
    // 变体1：更注重实用性
    variants.push(basePrompt + '\n重点提供实用的、可操作的建议。');
    
    // 变体2：更注重情感共鸣
    variants.push(basePrompt + '\n语言要更有温度，注重情感共鸣。');
    
    // 变体3：更注重简洁性
    variants.push(basePrompt + '\n回答要简洁明了，突出重点。');
    
    return variants;
  }
}
```

这份AI Prompt大师执行文档提供了完整的DeepSeek API集成方案和prompt工程指导，确保天机AI平台的AI服务高质量运行。