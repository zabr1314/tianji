import { BaziChart, WuXingAnalysis } from './types'

// 十神定义
export const SHISHEN = {
  '比肩': 'bijian',
  '劫财': 'jiecai', 
  '食神': 'shishen',
  '伤官': 'shangguan',
  '偏财': 'piancai',
  '正财': 'zhengcai',
  '七杀': 'qisha',
  '正官': 'zhengguan',
  '偏印': 'pianyin',
  '正印': 'zhengyin'
} as const

// 神煞定义
export const SHENSHAS = {
  '桃花': 'taohua',
  '贵人': 'guiren',
  '驿马': 'yima',
  '文昌': 'wenchang',
  '华盖': 'huagai',
  '孤辰': 'guchen',
  '寡宿': 'guasu'
} as const

// 扩展的八字分析结果
export interface EnhancedBaziAnalysis {
  // 基础信息
  basic: {
    bazi_chart: BaziChart
    wuxing_analysis: WuXingAnalysis
    yongshen: string
    rizhu_strength: 'strong' | 'weak' | 'neutral'
    pattern: string
  }

  // 十神分析
  shishen_analysis: {
    year_tiangan: string
    year_dizhi: string
    month_tiangan: string  
    month_dizhi: string
    day_tiangan: string // 日主
    day_dizhi: string
    hour_tiangan: string
    hour_dizhi: string
    main_shishen: string[]
    shishen_explanation: Record<string, string>
  }

  // 大运分析
  dayun_analysis: {
    current_dayun: {
      ganzhi: string
      age_range: string
      start_year: number
      end_year: number
      evaluation: string
      key_events: string[]
    }
    next_dayun: {
      ganzhi: string
      age_range: string  
      start_year: number
      end_year: number
      evaluation: string
      preparation_advice: string
    }
    life_stages: Array<{
      age_range: string
      description: string
      fortune_level: 1 | 2 | 3 | 4 | 5
      key_points: string[]
    }>
  }

  // 流年分析
  liunian_analysis: {
    current_year: {
      year: number
      ganzhi: string
      overall_fortune: 1 | 2 | 3 | 4 | 5
      monthly_fortune: Array<{
        month: number
        fortune_level: 1 | 2 | 3 | 4 | 5
        key_points: string
      }>
      important_events: string[]
      precautions: string[]
    }
    next_5_years: Array<{
      year: number
      ganzhi: string
      fortune_level: 1 | 2 | 3 | 4 | 5
      key_themes: string[]
      opportunities: string[]
      challenges: string[]
    }>
  }

  // 宫位分析
  gongwei_analysis: {
    year_pillar: {
      name: '祖辈宫'
      content: string
      influence: string
      early_life: string
    }
    month_pillar: {
      name: '父母宫/事业宫'
      content: string
      career_direction: string
      family_relationship: string
    }
    day_pillar: {
      name: '夫妻宫/自身宫'
      content: string
      personality: string
      marriage_info: string
    }
    hour_pillar: {
      name: '子女宫/晚年宫'
      content: string
      children_info: string
      later_life: string
    }
  }

  // 神煞分析
  shensha_analysis: {
    positive_shenshas: Array<{
      name: string
      description: string
      effect: string
      activation_time: string
    }>
    negative_shenshas: Array<{
      name: string
      description: string
      effect: string
      resolution_method: string
    }>
    special_combinations: Array<{
      name: string
      description: string
      significance: string
    }>
  }

  // 专项分析
  specialized_analysis: {
    marriage: {
      spouse_characteristics: string[]
      marriage_timing: string
      relationship_advice: string
      compatibility_factors: string[]
    }
    career: {
      suitable_industries: string[]
      career_peak_period: string
      entrepreneurship_advice: string
      work_style: string
    }
    wealth: {
      wealth_source: string
      investment_advice: string
      wealth_accumulation_period: string
      financial_habits: string
    }
    health: {
      health_constitution: string
      vulnerable_areas: string[]
      health_advice: string[]
      beneficial_activities: string[]
    }
  }

  // 实用建议
  practical_advice: {
    lucky_elements: {
      colors: string[]
      numbers: number[]
      directions: string[]
      seasons: string[]
    }
    lifestyle_suggestions: {
      living_environment: string
      daily_habits: string[]
      social_interaction: string
      exercise_recommendations: string[]
    }
    timing_advice: {
      best_months: string[]
      important_ages: number[]
      decision_making_periods: string[]
      caution_periods: string[]
    }
    improvement_methods: {
      feng_shui_tips: string[]
      personal_cultivation: string[]
      relationship_harmony: string[]
      career_enhancement: string[]
    }
  }
}

export class EnhancedBaziCalculator {
  /**
   * 生成增强版八字分析
   */
  static generateEnhancedAnalysis(
    bazi: BaziChart, 
    wuxing: WuXingAnalysis,
    yongshen: string,
    birthDate: Date,
    gender: 'male' | 'female'
  ): EnhancedBaziAnalysis {
    // 这里实现具体的分析逻辑
    // 目前先返回一个模板结构
    
    return {
      basic: {
        bazi_chart: bazi,
        wuxing_analysis: wuxing,
        yongshen: yongshen,
        rizhu_strength: this.calculateRizhuStrength(bazi, wuxing),
        pattern: this.determinePattern(bazi, wuxing)
      },

      shishen_analysis: {
        year_tiangan: this.calculateShishen(bazi.day_ganzhi[0], bazi.year_ganzhi[0]),
        year_dizhi: this.calculateShishen(bazi.day_ganzhi[0], bazi.year_ganzhi[1]),
        month_tiangan: this.calculateShishen(bazi.day_ganzhi[0], bazi.month_ganzhi[0]),
        month_dizhi: this.calculateShishen(bazi.day_ganzhi[0], bazi.month_ganzhi[1]),
        day_tiangan: '日主',
        day_dizhi: this.calculateShishen(bazi.day_ganzhi[0], bazi.day_ganzhi[1]),
        hour_tiangan: this.calculateShishen(bazi.day_ganzhi[0], bazi.hour_ganzhi[0]),
        hour_dizhi: this.calculateShishen(bazi.day_ganzhi[0], bazi.hour_ganzhi[1]),
        main_shishen: this.getMainShishen(bazi),
        shishen_explanation: this.explainShishen(bazi)
      },

      dayun_analysis: this.calculateDayunAnalysis(bazi, birthDate, gender),
      liunian_analysis: this.calculateLiunianAnalysis(bazi, birthDate),
      gongwei_analysis: this.analyzeGongwei(bazi),
      shensha_analysis: this.analyzeShensha(bazi),
      specialized_analysis: this.generateSpecializedAnalysis(bazi, wuxing, yongshen),
      practical_advice: this.generatePracticalAdvice(bazi, wuxing, yongshen)
    }
  }

  // 辅助方法（简化实现）
  private static calculateRizhuStrength(bazi: BaziChart, wuxing: WuXingAnalysis): 'strong' | 'weak' | 'neutral' {
    const dayGan = bazi.day_ganzhi[0]
    const dayDizhi = bazi.day_ganzhi[1]
    const monthDizhi = bazi.month_ganzhi[1]
    
    const dayGanWuxing = this.getWuxingFromGan(dayGan)
    const dayDizhiWuxing = this.getWuxingFromGan(dayDizhi)
    const monthDizhiWuxing = this.getWuxingFromGan(monthDizhi)
    
    let strengthScore = 0
    
    // 日主在月令的旺衰 (最重要，权重50%)
    if (dayGanWuxing === monthDizhiWuxing) {
      strengthScore += 50 // 月令得地
    } else if (this.wuxingGenerates(monthDizhiWuxing, dayGanWuxing)) {
      strengthScore += 30 // 月令相生
    } else if (this.wuxingDestroys(monthDizhiWuxing, dayGanWuxing)) {
      strengthScore -= 30 // 月令相克
    }
    
    // 日支帮扶 (权重20%)
    if (dayGanWuxing === dayDizhiWuxing || this.wuxingGenerates(dayDizhiWuxing, dayGanWuxing)) {
      strengthScore += 20
    }
    
    // 其他柱的帮扶 (权重30%)
    const allGanzhi = [bazi.year_ganzhi, bazi.month_ganzhi, bazi.hour_ganzhi]
    let helpCount = 0
    let harmCount = 0
    
    allGanzhi.forEach(ganzhi => {
      const gan = ganzhi[0]
      const zhi = ganzhi[1]
      const ganWuxing = this.getWuxingFromGan(gan)
      const zhiWuxing = this.getWuxingFromGan(zhi)
      
      // 天干帮扶
      if (ganWuxing === dayGanWuxing || this.wuxingGenerates(ganWuxing, dayGanWuxing)) {
        helpCount++
      } else if (this.wuxingDestroys(ganWuxing, dayGanWuxing)) {
        harmCount++
      }
      
      // 地支帮扶
      if (zhiWuxing === dayGanWuxing || this.wuxingGenerates(zhiWuxing, dayGanWuxing)) {
        helpCount++
      } else if (this.wuxingDestroys(zhiWuxing, dayGanWuxing)) {
        harmCount++
      }
    })
    
    strengthScore += (helpCount - harmCount) * 5
    
    // 判断强弱
    if (strengthScore >= 30) return 'strong'
    if (strengthScore <= -10) return 'weak'
    return 'neutral'
  }

  private static determinePattern(bazi: BaziChart, wuxing: WuXingAnalysis): string {
    const dayGan = bazi.day_ganzhi[0]
    const monthGan = bazi.month_ganzhi[0]
    const monthZhi = bazi.month_ganzhi[1]
    
    // 获取月令藏干主气
    const monthMainQi = this.getMainQiFromDizhi(monthZhi)
    
    // 判断是否透干
    const isTransparent = (element: string): boolean => {
      return [bazi.year_ganzhi[0], monthGan, bazi.hour_ganzhi[0]].some(gan => 
        this.getWuxingFromGan(gan) === element
      )
    }
    
    // 财格判断
    if (this.wuxingDestroys(this.getWuxingFromGan(dayGan), monthMainQi)) {
      return isTransparent(monthMainQi) ? '正财格' : '偏财格'
    }
    
    // 官杀格判断  
    if (this.wuxingDestroys(monthMainQi, this.getWuxingFromGan(dayGan))) {
      const dayPolarity = this.getGanPolarity(dayGan)
      const monthPolarity = this.getGanPolarity(this.getGanFromWuxing(monthMainQi))
      return dayPolarity === monthPolarity ? '七杀格' : '正官格'
    }
    
    // 印格判断
    if (this.wuxingGenerates(monthMainQi, this.getWuxingFromGan(dayGan))) {
      const dayPolarity = this.getGanPolarity(dayGan)
      const monthPolarity = this.getGanPolarity(this.getGanFromWuxing(monthMainQi))
      return dayPolarity === monthPolarity ? '正印格' : '偏印格'
    }
    
    // 食伤格判断
    if (this.wuxingGenerates(this.getWuxingFromGan(dayGan), monthMainQi)) {
      const dayPolarity = this.getGanPolarity(dayGan)
      const monthPolarity = this.getGanPolarity(this.getGanFromWuxing(monthMainQi))
      return dayPolarity === monthPolarity ? '食神格' : '伤官格'
    }
    
    // 比劫格（月令本气与日干同类）
    if (this.getWuxingFromGan(dayGan) === monthMainQi) {
      return '比肩格'
    }
    
    // 特殊格局判断
    const specialPatterns = this.checkSpecialPatterns(bazi)
    if (specialPatterns.length > 0) {
      return specialPatterns[0]
    }
    
    return '普通格局'
  }
  
  // 获取地支主气
  private static getMainQiFromDizhi(dizhi: string): string {
    const dizhiMainQi: Record<string, string> = {
      '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
      '辰': 'earth', '巳': 'fire', '午': 'fire', '未': 'earth',
      '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water'
    }
    return dizhiMainQi[dizhi] || 'earth'
  }
  
  // 获取天干阴阳
  private static getGanPolarity(gan: string): 'yang' | 'yin' {
    const yangGan = ['甲', '丙', '戊', '庚', '壬']
    return yangGan.includes(gan) ? 'yang' : 'yin'
  }
  
  // 从五行获取代表天干
  private static getGanFromWuxing(wuxing: string): string {
    const wuxingToGan: Record<string, string> = {
      'wood': '甲', 'fire': '丙', 'earth': '戊', 'metal': '庚', 'water': '壬'
    }
    return wuxingToGan[wuxing] || '甲'
  }
  
  // 检查特殊格局
  private static checkSpecialPatterns(bazi: BaziChart): string[] {
    const patterns: string[] = []
    
    // 从革格、润下格、稼穑格、曲直格、炎上格等
    const allGan = [bazi.year_ganzhi[0], bazi.month_ganzhi[0], bazi.day_ganzhi[0], bazi.hour_ganzhi[0]]
    const wuxingCount: Record<string, number> = {}
    
    allGan.forEach(gan => {
      const wuxing = this.getWuxingFromGan(gan)
      wuxingCount[wuxing] = (wuxingCount[wuxing] || 0) + 1
    })
    
    // 如果某个五行占主导地位（3个或以上）
    Object.entries(wuxingCount).forEach(([wuxing, count]) => {
      if (count >= 3) {
        switch (wuxing) {
          case 'metal': patterns.push('从革格'); break
          case 'water': patterns.push('润下格'); break
          case 'wood': patterns.push('曲直格'); break
          case 'fire': patterns.push('炎上格'); break
          case 'earth': patterns.push('稼穑格'); break
        }
      }
    })
    
    return patterns
  }

  private static calculateShishen(dayGan: string, targetGan: string): string {
    // 十神计算逻辑：基于天干的阴阳五行关系
    const ganWuxing: Record<string, { element: string; polarity: 'yang' | 'yin' }> = {
      '甲': { element: 'wood', polarity: 'yang' },
      '乙': { element: 'wood', polarity: 'yin' },
      '丙': { element: 'fire', polarity: 'yang' },
      '丁': { element: 'fire', polarity: 'yin' },
      '戊': { element: 'earth', polarity: 'yang' },
      '己': { element: 'earth', polarity: 'yin' },
      '庚': { element: 'metal', polarity: 'yang' },
      '辛': { element: 'metal', polarity: 'yin' },
      '壬': { element: 'water', polarity: 'yang' },
      '癸': { element: 'water', polarity: 'yin' }
    }

    const dayInfo = ganWuxing[dayGan]
    const targetInfo = ganWuxing[targetGan]
    
    if (!dayInfo || !targetInfo) return '未知'
    
    // 如果是同一个天干，返回比肩
    if (dayGan === targetGan) return '比肩'
    
    // 相同五行但不同阴阳
    if (dayInfo.element === targetInfo.element) {
      return '劫财'
    }
    
    // 日主生目标 - 食伤
    if (this.wuxingGenerates(dayInfo.element, targetInfo.element)) {
      return dayInfo.polarity === targetInfo.polarity ? '食神' : '伤官'
    }
    
    // 目标生日主 - 印枭
    if (this.wuxingGenerates(targetInfo.element, dayInfo.element)) {
      return dayInfo.polarity === targetInfo.polarity ? '正印' : '偏印'
    }
    
    // 日主克目标 - 财星
    if (this.wuxingDestroys(dayInfo.element, targetInfo.element)) {
      return dayInfo.polarity === targetInfo.polarity ? '偏财' : '正财'
    }
    
    // 目标克日主 - 官杀
    if (this.wuxingDestroys(targetInfo.element, dayInfo.element)) {
      return dayInfo.polarity === targetInfo.polarity ? '七杀' : '正官'
    }
    
    return '未知'
  }

  // 五行相生判断
  private static wuxingGenerates(element1: string, element2: string): boolean {
    const generateMap: Record<string, string> = {
      'wood': 'fire',
      'fire': 'earth', 
      'earth': 'metal',
      'metal': 'water',
      'water': 'wood'
    }
    return generateMap[element1] === element2
  }
  
  // 五行相克判断
  private static wuxingDestroys(element1: string, element2: string): boolean {
    const destroyMap: Record<string, string> = {
      'wood': 'earth',
      'fire': 'metal',
      'earth': 'water',
      'metal': 'wood', 
      'water': 'fire'
    }
    return destroyMap[element1] === element2
  }

  private static getMainShishen(bazi: BaziChart): string[] {
    const dayGan = bazi.day_ganzhi[0]
    const allShishen = [
      this.calculateShishen(dayGan, bazi.year_ganzhi[0]),
      this.calculateShishen(dayGan, bazi.month_ganzhi[0]),
      this.calculateShishen(dayGan, bazi.hour_ganzhi[0])
    ].filter(s => s !== '比肩')
    
    // 统计出现频率
    const shishenCount: Record<string, number> = {}
    allShishen.forEach(s => {
      shishenCount[s] = (shishenCount[s] || 0) + 1
    })
    
    // 返回出现频率最高的十神
    return Object.entries(shishenCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([shishen]) => shishen)
  }

  private static explainShishen(bazi: BaziChart): Record<string, string> {
    const explanations: Record<string, string> = {
      '比肩': '代表自我、兄弟姐妹、独立性，性格倔强，善于协作但也容易固执',
      '劫财': '代表竞争、合作伙伴、偏财运，积极进取但可能过于冲动',
      '食神': '代表才华、创意、子女运，温和有才，善于表达和创新',
      '伤官': '代表叛逆、创新、表现欲，聪明多才但容易任性',
      '偏财': '代表投资、偏财、父亲，善于理财但可能不够稳定',
      '正财': '代表正当收入、妻子、节俭，务实踏实，财运稳定',
      '七杀': '代表权威、压力、挑战，有强烈事业心但压力较大',
      '正官': '代表官职、名誉、责任，正直有序，适合管理工作',
      '偏印': '代表继母、创意、神秘学，思维独特但可能孤独',
      '正印': '代表母亲、学问、名声，学习能力强，有贵人运'
    }
    
    const mainShishen = this.getMainShishen(bazi)
    const result: Record<string, string> = {}
    
    mainShishen.forEach(shishen => {
      if (explanations[shishen]) {
        result[shishen] = explanations[shishen]
      }
    })
    
    return result
  }

  private static calculateDayunAnalysis(bazi: BaziChart, birthDate: Date, gender: 'male' | 'female'): EnhancedBaziAnalysis['dayun_analysis'] {
    const currentYear = new Date().getFullYear()
    const age = currentYear - birthDate.getFullYear()
    
    return {
      current_dayun: {
        ganzhi: '甲子',
        age_range: `${Math.floor(age/10)*10}-${Math.floor(age/10)*10+9}岁`,
        start_year: Math.floor(age/10)*10 + birthDate.getFullYear(),
        end_year: Math.floor(age/10)*10 + birthDate.getFullYear() + 9,
        evaluation: '运势平稳，适合稳定发展',
        key_events: ['事业发展', '人际关系改善']
      },
      next_dayun: {
        ganzhi: '乙丑',
        age_range: `${Math.floor(age/10)*10+10}-${Math.floor(age/10)*10+19}岁`,
        start_year: Math.floor(age/10)*10 + birthDate.getFullYear() + 10,
        end_year: Math.floor(age/10)*10 + birthDate.getFullYear() + 19,
        evaluation: '运势上升，机会增多',
        preparation_advice: '提前做好准备，把握机遇'
      },
      life_stages: [
        {
          age_range: '25-35岁',
          description: '事业奠基期',
          fortune_level: 3,
          key_points: ['专业技能提升', '人脉积累']
        }
      ]
    }
  }

  private static calculateLiunianAnalysis(bazi: BaziChart, birthDate: Date): EnhancedBaziAnalysis['liunian_analysis'] {
    const currentYear = new Date().getFullYear()
    
    return {
      current_year: {
        year: currentYear,
        ganzhi: '甲辰',
        overall_fortune: 4,
        monthly_fortune: Array.from({length: 12}, (_, i) => ({
          month: i + 1,
          fortune_level: (3 + Math.random() * 2) as 1 | 2 | 3 | 4 | 5,
          key_points: `${i+1}月运势要点`
        })),
        important_events: ['工作机会', '投资机会'],
        precautions: ['注意健康', '谨慎投资']
      },
      next_5_years: Array.from({length: 5}, (_, i) => ({
        year: currentYear + i + 1,
        ganzhi: `未来${i+1}年`,
        fortune_level: (3 + Math.random() * 2) as 1 | 2 | 3 | 4 | 5,
        key_themes: ['事业发展', '感情运势'],
        opportunities: ['升职机会', '投资机会'],
        challenges: ['竞争激烈', '压力增大']
      }))
    }
  }

  private static analyzeGongwei(bazi: BaziChart): EnhancedBaziAnalysis['gongwei_analysis'] {
    return {
      year_pillar: {
        name: '祖辈宫',
        content: `年柱：${bazi.year_ganzhi}`,
        influence: '祖辈对你的影响较为正面',
        early_life: '早年生活环境良好'
      },
      month_pillar: {
        name: '父母宫/事业宫',
        content: `月柱：${bazi.month_ganzhi}`,
        career_direction: '适合从事管理或技术类工作',
        family_relationship: '与父母关系和谐'
      },
      day_pillar: {
        name: '夫妻宫/自身宫',
        content: `日柱：${bazi.day_ganzhi}`,
        personality: '性格温和，有责任心',
        marriage_info: '婚姻运势良好，配偶贤惠'
      },
      hour_pillar: {
        name: '子女宫/晚年宫',
        content: `时柱：${bazi.hour_ganzhi}`,
        children_info: '子女聪明有出息',
        later_life: '晚年生活安逸'
      }
    }
  }

  private static analyzeShensha(bazi: BaziChart): EnhancedBaziAnalysis['shensha_analysis'] {
    return {
      positive_shenshas: [
        {
          name: '天乙贵人',
          description: '命中带贵人星',
          effect: '人生路上常有贵人相助',
          activation_time: '青年时期开始显现'
        }
      ],
      negative_shenshas: [],
      special_combinations: []
    }
  }

  private static generateSpecializedAnalysis(bazi: BaziChart, wuxing: WuXingAnalysis, yongshen: string): EnhancedBaziAnalysis['specialized_analysis'] {
    return {
      marriage: {
        spouse_characteristics: ['温和贤惠', '有责任心', '家庭观念强'],
        marriage_timing: '25-30岁之间最佳',
        relationship_advice: '多沟通，相互理解',
        compatibility_factors: ['性格互补', '价值观相近']
      },
      career: {
        suitable_industries: ['金融', '教育', '管理', '技术'],
        career_peak_period: '35-45岁',
        entrepreneurship_advice: '适合在有经验后创业',
        work_style: '稳重踏实，注重细节'
      },
      wealth: {
        wealth_source: '主要来源于工作收入',
        investment_advice: '适合稳健投资，避免高风险',
        wealth_accumulation_period: '中年后财富增长明显',
        financial_habits: '善于理财，消费理性'
      },
      health: {
        health_constitution: '体质较好，抵抗力强',
        vulnerable_areas: ['肠胃', '心血管'],
        health_advice: ['规律作息', '适量运动', '饮食清淡'],
        beneficial_activities: ['太极', '游泳', '瑜伽']
      }
    }
  }

  private static generatePracticalAdvice(bazi: BaziChart, wuxing: WuXingAnalysis, yongshen: string): EnhancedBaziAnalysis['practical_advice'] {
    // 根据用神确定开运元素
    const yongshenAdvice = this.getYongshenAdvice(yongshen)
    const dayGanWuxing = this.getWuxingFromGan(bazi.day_ganzhi[0])
    const personalAdvice = this.getPersonalAdvice(dayGanWuxing)
    
    return {
      lucky_elements: {
        colors: [...yongshenAdvice.colors, ...personalAdvice.colors].slice(0, 4),
        numbers: [...yongshenAdvice.numbers, ...personalAdvice.numbers].slice(0, 6),
        directions: [...yongshenAdvice.directions, ...personalAdvice.directions].slice(0, 3),
        seasons: [...yongshenAdvice.seasons, ...personalAdvice.seasons].slice(0, 2)
      },
      lifestyle_suggestions: {
        living_environment: yongshenAdvice.living_environment,
        daily_habits: [...yongshenAdvice.daily_habits, ...personalAdvice.daily_habits].slice(0, 5),
        social_interaction: personalAdvice.social_interaction,
        exercise_recommendations: [...yongshenAdvice.exercise, ...personalAdvice.exercise].slice(0, 4)
      },
      timing_advice: {
        best_months: yongshenAdvice.best_months,
        important_ages: this.calculateImportantAges(bazi),
        decision_making_periods: yongshenAdvice.decision_periods,
        caution_periods: yongshenAdvice.caution_periods
      },
      improvement_methods: {
        feng_shui_tips: [...yongshenAdvice.feng_shui, ...personalAdvice.feng_shui].slice(0, 5),
        personal_cultivation: ['修身养性', '积德行善', '学而时习', '慎独自省'],
        relationship_harmony: ['以和为贵', '宽容理解', '真诚沟通', '互相支持'],
        career_enhancement: this.getCareerEnhancement(bazi, wuxing)
      }
    }
  }
  
  // 根据用神获取建议
  private static getYongshenAdvice(yongshen: string) {
    const adviceMap: Record<string, any> = {
      '木': {
        colors: ['绿色', '青色', '碧色'],
        numbers: [1, 2, 3, 8],
        directions: ['东方', '东南'],
        seasons: ['春季'],
        living_environment: '适合居住在有绿植、靠近公园的环境',
        daily_habits: ['早起', '多接触自然', '养植物'],
        exercise: ['户外运动', '太极', '瑜伽'],
        best_months: ['2月', '3月', '4月'],
        decision_periods: ['春季', '上午'],
        caution_periods: ['秋季金旺时'],
        feng_shui: ['东方放绿植', '佩戴木质饰品']
      },
      '火': {
        colors: ['红色', '紫色', '粉色'],
        numbers: [2, 7, 9],
        directions: ['南方'],
        seasons: ['夏季'],
        living_environment: '适合居住在阳光充足、朝南的环境',
        daily_habits: ['保持活力', '多参与社交', '适度运动'],
        exercise: ['有氧运动', '舞蹈', '球类'],
        best_months: ['5月', '6月', '7月'],
        decision_periods: ['夏季', '中午'],
        caution_periods: ['冬季水旺时'],
        feng_shui: ['南方摆红色装饰', '保持光线明亮']
      },
      '土': {
        colors: ['黄色', '棕色', '土色'],
        numbers: [5, 6, 10],
        directions: ['中央', '西南', '东北'],
        seasons: ['四季末月'],
        living_environment: '适合居住在稳定、地势平坦的环境',
        daily_habits: ['规律作息', '稳重行事', '重视储蓄'],
        exercise: ['散步', '登山', '园艺'],
        best_months: ['3月', '6月', '9月', '12月'],
        decision_periods: ['季节交替时'],
        caution_periods: ['木旺克土时'],
        feng_shui: ['中央放黄色装饰', '使用陶瓷用品']
      },
      '金': {
        colors: ['白色', '金色', '银色'],
        numbers: [4, 7, 8, 9],
        directions: ['西方', '西北'],
        seasons: ['秋季'],
        living_environment: '适合居住在整洁、有金属装饰的环境',
        daily_habits: ['保持整洁', '理性思考', '注重品质'],
        exercise: ['器械训练', '武术', '精密运动'],
        best_months: ['8月', '9月', '10月'],
        decision_periods: ['秋季', '下午'],
        caution_periods: ['春季木旺时'],
        feng_shui: ['西方摆金属饰品', '保持环境整洁']
      },
      '水': {
        colors: ['黑色', '蓝色', '深色'],
        numbers: [1, 6, 10],
        directions: ['北方'],
        seasons: ['冬季'],
        living_environment: '适合居住在靠近水源、安静的环境',
        daily_habits: ['多喝水', '保持宁静', '深度思考'],
        exercise: ['游泳', '水上运动', '静坐'],
        best_months: ['11月', '12月', '1月'],
        decision_periods: ['冬季', '晚上'],
        caution_periods: ['夏季火旺时'],
        feng_shui: ['北方摆水景', '使用蓝黑色装饰']
      }
    }
    
    return adviceMap[yongshen] || adviceMap['水']
  }
  
  // 根据日干五行获取个性化建议
  private static getPersonalAdvice(dayGanWuxing: string) {
    return this.getYongshenAdvice(dayGanWuxing === 'wood' ? '木' : 
                                   dayGanWuxing === 'fire' ? '火' :
                                   dayGanWuxing === 'earth' ? '土' :
                                   dayGanWuxing === 'metal' ? '金' : '水')
  }
  
  // 计算重要年龄
  private static calculateImportantAges(bazi: BaziChart): number[] {
    const baseAges = [16, 26, 36, 46, 56, 66]
    // 可以根据大运转换点进行调整
    return baseAges
  }
  
  // 获取事业增强建议
  private static getCareerEnhancement(bazi: BaziChart, wuxing: WuXingAnalysis): string[] {
    const dayGan = bazi.day_ganzhi[0]
    const mainShishen = this.getMainShishen(bazi)
    
    const enhancements = ['提升专业技能', '扩展人脉关系']
    
    if (mainShishen.includes('正官') || mainShishen.includes('七杀')) {
      enhancements.push('提升领导能力', '承担更多责任')
    }
    
    if (mainShishen.includes('正财') || mainShishen.includes('偏财')) {
      enhancements.push('学习理财投资', '开拓财源渠道')
    }
    
    if (mainShishen.includes('食神') || mainShishen.includes('伤官')) {
      enhancements.push('发挥创意才能', '注重个人表达')
    }
    
    return enhancements.slice(0, 5)
  }

  private static getWuxingFromGan(gan: string): string {
    const ganWuxingMap: Record<string, string> = {
      '甲': 'wood', '乙': 'wood',
      '丙': 'fire', '丁': 'fire', 
      '戊': 'earth', '己': 'earth',
      '庚': 'metal', '辛': 'metal',
      '壬': 'water', '癸': 'water',
      // 地支五行
      '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
      '辰': 'earth', '巳': 'fire', '午': 'fire', '未': 'earth',
      '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water'
    }
    return ganWuxingMap[gan] || 'earth'
  }
}