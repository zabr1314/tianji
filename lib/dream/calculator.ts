/**
 * AI解梦分析器
 * 基于心理学理论和传统解梦文化，结合AI智能分析梦境内容
 */

// 梦境分类枚举
export enum DreamCategory {
  PEOPLE = '人物',
  ANIMALS = '动物',
  OBJECTS = '物品',
  NATURE = '自然',
  EMOTIONS = '情感',
  ACTIONS = '行为',
  PLACES = '场所',
  SUPERNATURAL = '超自然',
  WORK_STUDY = '工作学习',
  OTHER = '其他'
}

// 梦境情绪类型
export enum DreamMood {
  HAPPY = '愉快',
  ANXIOUS = '焦虑',
  FEARFUL = '恐惧',
  CONFUSED = '困惑',
  PEACEFUL = '平静',
  EXCITED = '兴奋',
  SAD = '悲伤',
  ANGRY = '愤怒',
  NEUTRAL = '中性'
}

// 梦境解析输入
export interface DreamAnalysisInput {
  dream_content: string // 梦境内容描述
  dream_category: DreamCategory // 梦境主要分类
  dream_mood: DreamMood // 梦境中的情绪
  dreamer_info?: {
    age_range?: '18-25' | '26-35' | '36-45' | '46-55' | '55+'
    gender?: 'male' | 'female'
    life_stage?: 'student' | 'working' | 'married' | 'retired'
    recent_stress?: boolean // 最近是否有压力
  }
  dream_frequency?: 'rare' | 'occasional' | 'frequent' // 做梦频率
  lucid_dream?: boolean // 是否为清醒梦
}

// 梦境解析结果
export interface DreamAnalysisResult {
  dream_summary: string // 梦境摘要
  category_analysis: {
    primary_category: DreamCategory
    secondary_categories: DreamCategory[]
    symbolic_elements: string[] // 象征性元素
  }
  psychological_analysis: {
    subconscious_themes: string[] // 潜意识主题
    emotional_state: string // 情绪状态分析
    potential_triggers: string[] // 可能的触发因素
    stress_indicators: string[] // 压力指标
  }
  symbolic_interpretation: {
    key_symbols: Array<{
      symbol: string
      traditional_meaning: string // 传统解梦含义
      psychological_meaning: string // 心理学含义
      personal_relevance: string // 个人相关性
    }>
  }
  life_guidance: {
    current_situation_insights: string[] // 当前生活状况洞察
    emotional_needs: string[] // 情感需求
    growth_opportunities: string[] // 成长机会
    recommended_actions: string[] // 建议行动
  }
  dream_quality: {
    clarity_score: number // 梦境清晰度 1-10
    emotional_intensity: number // 情感强度 1-10
    symbolic_richness: number // 象征丰富度 1-10
    overall_significance: number // 整体重要性 1-10
  }
  warnings_and_suggestions: {
    health_reminders: string[] // 健康提醒
    relationship_insights: string[] // 人际关系洞察
    career_guidance: string[] // 职业指导
    spiritual_messages: string[] // 精神层面信息
  }
}

export class DreamAnalysisCalculator {
  /**
   * 分析梦境内容
   * @param input 梦境分析输入
   * @returns 梦境分析结果
   */
  static analyzeDream(input: DreamAnalysisInput): DreamAnalysisResult {
    // 分析梦境分类
    const categoryAnalysis = this.analyzeDreamCategory(input)
    
    // 心理学分析
    const psychologicalAnalysis = this.analyzePsychological(input)
    
    // 象征解释
    const symbolicInterpretation = this.analyzeSymbols(input)
    
    // 生活指导
    const lifeGuidance = this.generateLifeGuidance(input, psychologicalAnalysis)
    
    // 梦境质量评估
    const dreamQuality = this.assessDreamQuality(input)
    
    // 警示和建议
    const warningsAndSuggestions = this.generateWarningsAndSuggestions(input, psychologicalAnalysis)

    return {
      dream_summary: this.generateDreamSummary(input),
      category_analysis: categoryAnalysis,
      psychological_analysis: psychologicalAnalysis,
      symbolic_interpretation: symbolicInterpretation,
      life_guidance: lifeGuidance,
      dream_quality: dreamQuality,
      warnings_and_suggestions: warningsAndSuggestions
    }
  }

  /**
   * 生成梦境摘要
   */
  private static generateDreamSummary(input: DreamAnalysisInput): string {
    const content = input.dream_content.substring(0, 100)
    const category = input.dream_category
    const mood = input.dream_mood
    
    return `这是一个关于${category}的${mood}梦境：${content}${input.dream_content.length > 100 ? '...' : ''}`
  }

  /**
   * 分析梦境分类
   */
  private static analyzeDreamCategory(input: DreamAnalysisInput): any {
    const primaryCategory = input.dream_category
    const secondaryCategories: DreamCategory[] = []
    const symbolicElements: string[] = []

    // 基于梦境内容识别次要分类和象征元素
    const content = input.dream_content.toLowerCase()
    
    // 检测次要分类
    if (content.includes('人') || content.includes('朋友') || content.includes('家人')) {
      if (primaryCategory !== DreamCategory.PEOPLE) secondaryCategories.push(DreamCategory.PEOPLE)
    }
    if (content.includes('水') || content.includes('山') || content.includes('天')) {
      if (primaryCategory !== DreamCategory.NATURE) secondaryCategories.push(DreamCategory.NATURE)
    }
    if (content.includes('房子') || content.includes('学校') || content.includes('办公室')) {
      if (primaryCategory !== DreamCategory.PLACES) secondaryCategories.push(DreamCategory.PLACES)
    }

    // 提取象征元素
    const symbolPatterns = [
      { pattern: /(飞|飞行)/, symbol: '飞行' },
      { pattern: /(水|河|海|湖)/, symbol: '水' },
      { pattern: /(死|死亡)/, symbol: '死亡' },
      { pattern: /(追|追赶)/, symbol: '追逐' },
      { pattern: /(掉|坠落)/, symbol: '坠落' },
      { pattern: /(火|燃烧)/, symbol: '火焰' },
      { pattern: /(蛇|龙)/, symbol: '蛇龙' },
      { pattern: /(考试|测试)/, symbol: '考试' }
    ]

    symbolPatterns.forEach(({ pattern, symbol }) => {
      if (pattern.test(content)) {
        symbolicElements.push(symbol)
      }
    })

    return {
      primary_category: primaryCategory,
      secondary_categories: secondaryCategories,
      symbolic_elements: symbolicElements
    }
  }

  /**
   * 心理学分析
   */
  private static analyzePsychological(input: DreamAnalysisInput): any {
    const subconsciousThemes: string[] = []
    const potentialTriggers: string[] = []
    const stressIndicators: string[] = []
    
    // 基于梦境情绪和内容分析
    switch (input.dream_mood) {
      case DreamMood.ANXIOUS:
        subconsciousThemes.push('内心焦虑', '未解决的担忧')
        stressIndicators.push('心理压力过大', '对未来的不确定感')
        break
      case DreamMood.FEARFUL:
        subconsciousThemes.push('恐惧情绪', '安全感缺失')
        stressIndicators.push('面临挑战或威胁', '需要勇气面对现实')
        break
      case DreamMood.HAPPY:
        subconsciousThemes.push('内心满足', '积极心态')
        break
      case DreamMood.CONFUSED:
        subconsciousThemes.push('方向迷失', '需要清晰的指引')
        stressIndicators.push('决策困难', '信息过载')
        break
    }

    // 基于梦境分类添加触发因素
    switch (input.dream_category) {
      case DreamCategory.WORK_STUDY:
        potentialTriggers.push('工作或学习压力', '成就感需求')
        break
      case DreamCategory.PEOPLE:
        potentialTriggers.push('人际关系变化', '社交需求')
        break
      case DreamCategory.EMOTIONS:
        potentialTriggers.push('情感波动', '内心冲突')
        break
    }

    // 基于个人信息调整分析
    if (input.dreamer_info?.recent_stress) {
      stressIndicators.push('近期压力的心理映射', '需要放松和调节')
    }

    const emotionalState = this.analyzeEmotionalState(input.dream_mood, input.dream_category)

    return {
      subconscious_themes: subconsciousThemes,
      emotional_state: emotionalState,
      potential_triggers: potentialTriggers,
      stress_indicators: stressIndicators
    }
  }

  /**
   * 分析情绪状态
   */
  private static analyzeEmotionalState(mood: DreamMood, category: DreamCategory): string {
    const moodAnalysis = {
      [DreamMood.HAPPY]: '您的潜意识呈现积极乐观的状态，内心充满正能量',
      [DreamMood.ANXIOUS]: '您的内心存在一定的焦虑和不安，可能面临压力或挑战',
      [DreamMood.FEARFUL]: '您的潜意识反映出对某些事物的恐惧或不安全感',
      [DreamMood.CONFUSED]: '您的内心可能存在迷茫和困惑，需要更清晰的方向',
      [DreamMood.PEACEFUL]: '您的内心相对平静，心理状态较为稳定',
      [DreamMood.EXCITED]: '您的潜意识反映出对某些事物的期待和兴奋',
      [DreamMood.SAD]: '您的内心可能存在悲伤或失落的情绪',
      [DreamMood.ANGRY]: '您的潜意识可能积压了愤怒或不满的情绪',
      [DreamMood.NEUTRAL]: '您的情绪状态相对中性，心理平衡较好'
    }

    return moodAnalysis[mood] || '您的情绪状态需要进一步观察和分析'
  }

  /**
   * 分析象征符号
   */
  private static analyzeSymbols(input: DreamAnalysisInput): any {
    const keySymbols: any[] = []
    const content = input.dream_content.toLowerCase()

    // 常见梦境符号解析
    const symbolDatabase = [
      {
        pattern: /(飞|飞行)/,
        symbol: '飞行',
        traditional_meaning: '渴望自由，超越现实束缚',
        psychological_meaning: '追求解脱，对现状的不满或对更高层次的渴望',
        personal_relevance: '可能反映您对当前生活限制的突破愿望'
      },
      {
        pattern: /(水|河|海|湖)/,
        symbol: '水',
        traditional_meaning: '情感、潜意识、生命力的象征',
        psychological_meaning: '代表情感流动、内心深处的感受或精神净化',
        personal_relevance: '暗示您需要关注内心情感或进行心灵净化'
      },
      {
        pattern: /(追|追赶|逃跑)/,
        symbol: '追逐',
        traditional_meaning: '逃避或面对某种压力',
        psychological_meaning: '对压力的逃避心理或对目标的追求',
        personal_relevance: '提醒您面对而非逃避生活中的挑战'
      },
      {
        pattern: /(死|死亡)/,
        symbol: '死亡',
        traditional_meaning: '结束与新开始，转变的象征',
        psychological_meaning: '代表生活中某个阶段的结束或心理的转变',
        personal_relevance: '暗示您可能正在经历重要的人生转折期'
      },
      {
        pattern: /(蛇)/,
        symbol: '蛇',
        traditional_meaning: '智慧、治愈力或威胁',
        psychological_meaning: '代表潜在的威胁、诱惑或内在的智慧力量',
        personal_relevance: '提醒您注意生活中的潜在风险或开发内在智慧'
      }
    ]

    symbolDatabase.forEach(symbolInfo => {
      if (symbolInfo.pattern.test(content)) {
        keySymbols.push({
          symbol: symbolInfo.symbol,
          traditional_meaning: symbolInfo.traditional_meaning,
          psychological_meaning: symbolInfo.psychological_meaning,
          personal_relevance: symbolInfo.personal_relevance
        })
      }
    })

    return { key_symbols: keySymbols }
  }

  /**
   * 生成生活指导
   */
  private static generateLifeGuidance(input: DreamAnalysisInput, psychological: any): any {
    const currentSituationInsights: string[] = []
    const emotionalNeeds: string[] = []
    const growthOpportunities: string[] = []
    const recommendedActions: string[] = []

    // 基于心理分析生成指导
    if (psychological.stress_indicators.length > 0) {
      currentSituationInsights.push('您当前可能承受一定的心理压力')
      emotionalNeeds.push('需要放松和情绪调节')
      recommendedActions.push('适当安排休息时间', '寻找健康的压力释放方式')
    }

    // 基于梦境情绪生成建议
    switch (input.dream_mood) {
      case DreamMood.ANXIOUS:
        emotionalNeeds.push('安全感和稳定感')
        recommendedActions.push('建立规律的生活作息', '练习冥想或深呼吸')
        growthOpportunities.push('学会管理焦虑情绪')
        break
      case DreamMood.CONFUSED:
        emotionalNeeds.push('明确的方向和目标')
        recommendedActions.push('理清思路，制定明确计划', '寻求专业指导或建议')
        growthOpportunities.push('提升决策能力和自我认知')
        break
      case DreamMood.HAPPY:
        currentSituationInsights.push('您的内心状态相对积极')
        growthOpportunities.push('继续保持乐观心态', '分享正能量给他人')
        break
    }

    // 基于年龄阶段提供建议
    if (input.dreamer_info?.age_range) {
      switch (input.dreamer_info.age_range) {
        case '18-25':
          growthOpportunities.push('探索自我身份认同', '建立人生目标')
          break
        case '26-35':
          growthOpportunities.push('平衡工作与生活', '建立稳定关系')
          break
        case '36-45':
          growthOpportunities.push('重新审视人生价值', '关注身心健康')
          break
      }
    }

    return {
      current_situation_insights: currentSituationInsights,
      emotional_needs: emotionalNeeds,
      growth_opportunities: growthOpportunities,
      recommended_actions: recommendedActions
    }
  }

  /**
   * 评估梦境质量
   */
  private static assessDreamQuality(input: DreamAnalysisInput): any {
    // 清晰度评分（基于描述长度和细节）
    const clarityScore = Math.min(Math.max(Math.floor(input.dream_content.length / 20), 3), 10)
    
    // 情感强度评分
    const emotionalIntensityMap = {
      [DreamMood.FEARFUL]: 9,
      [DreamMood.EXCITED]: 8,
      [DreamMood.ANGRY]: 8,
      [DreamMood.ANXIOUS]: 7,
      [DreamMood.HAPPY]: 7,
      [DreamMood.SAD]: 6,
      [DreamMood.CONFUSED]: 5,
      [DreamMood.PEACEFUL]: 4,
      [DreamMood.NEUTRAL]: 3
    }
    const emotionalIntensity = emotionalIntensityMap[input.dream_mood] || 5

    // 象征丰富度（基于内容复杂性）
    const symbolicRichness = this.calculateSymbolicRichness(input.dream_content)
    
    // 整体重要性（综合评估）
    const overallSignificance = Math.round((clarityScore + emotionalIntensity + symbolicRichness) / 3)

    return {
      clarity_score: clarityScore,
      emotional_intensity: emotionalIntensity,
      symbolic_richness: symbolicRichness,
      overall_significance: overallSignificance
    }
  }

  /**
   * 计算象征丰富度
   */
  private static calculateSymbolicRichness(content: string): number {
    const symbolKeywords = ['飞', '水', '死', '追', '蛇', '火', '山', '房子', '朋友', '家人', '考试', '工作']
    let richness = 0
    
    symbolKeywords.forEach(keyword => {
      if (content.includes(keyword)) richness += 1
    })
    
    return Math.min(richness + 2, 10) // 基础分2分，每个符号+1分，最高10分
  }

  /**
   * 生成警示和建议
   */
  private static generateWarningsAndSuggestions(input: DreamAnalysisInput, psychological: any): any {
    const healthReminders: string[] = []
    const relationshipInsights: string[] = []
    const careerGuidance: string[] = []
    const spiritualMessages: string[] = []

    // 健康提醒
    if (psychological.stress_indicators.length > 0) {
      healthReminders.push('注意身心健康，避免过度疲劳')
      healthReminders.push('保持充足睡眠，规律作息')
    }

    if (input.dream_mood === DreamMood.ANXIOUS || input.dream_mood === DreamMood.FEARFUL) {
      healthReminders.push('关注心理健康，必要时寻求专业帮助')
    }

    // 人际关系洞察
    if (input.dream_category === DreamCategory.PEOPLE) {
      relationshipInsights.push('关注身边人际关系的变化')
      relationshipInsights.push('加强与家人朋友的沟通交流')
    }

    // 职业指导
    if (input.dream_category === DreamCategory.WORK_STUDY) {
      careerGuidance.push('思考职业发展方向和目标')
      careerGuidance.push('平衡工作压力与个人成长')
    }

    // 精神层面信息
    if (input.dream_category === DreamCategory.SUPERNATURAL) {
      spiritualMessages.push('关注内心精神世界的需求')
      spiritualMessages.push('探索生命的更深层意义')
    }

    spiritualMessages.push('梦境是心灵的镜子，反映内在真实状态')
    spiritualMessages.push('用积极心态面对梦境启示')

    return {
      health_reminders: healthReminders,
      relationship_insights: relationshipInsights,
      career_guidance: careerGuidance,
      spiritual_messages: spiritualMessages
    }
  }
}