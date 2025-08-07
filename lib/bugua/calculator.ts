/**
 * 卜卦系统 - 基于易经六十四卦的占卜计算
 */

// 八卦基础数据
export const BAGUA = {
  '☰': { name: '乾', number: 1, element: '金', nature: '天', direction: '西北' },
  '☱': { name: '兑', number: 2, element: '金', nature: '泽', direction: '西' },
  '☲': { name: '离', number: 3, element: '火', nature: '火', direction: '南' },
  '☳': { name: '震', number: 4, element: '木', nature: '雷', direction: '东' },
  '☴': { name: '巽', number: 5, element: '木', nature: '风', direction: '东南' },
  '☵': { name: '坎', number: 6, element: '水', nature: '水', direction: '北' },
  '☶': { name: '艮', number: 7, element: '土', nature: '山', direction: '东北' },
  '☷': { name: '坤', number: 8, element: '土', nature: '地', direction: '西南' }
}

// 六十四卦数据（部分核心卦象）
export const HEXAGRAMS = {
  '☰☰': { name: '乾为天', number: 1, meaning: '元亨利贞', element: '金', fortune: '大吉' },
  '☷☷': { name: '坤为地', number: 2, meaning: '元亨利牝马之贞', element: '土', fortune: '吉' },
  '☵☳': { name: '水雷屯', number: 3, meaning: '元亨利贞勿用有攸往', element: '水', fortune: '中平' },
  '☶☵': { name: '山水蒙', number: 4, meaning: '亨匪我求童蒙', element: '土', fortune: '中平' },
  '☵☰': { name: '水天需', number: 5, meaning: '有孚光亨贞吉', element: '水', fortune: '吉' },
  '☰☵': { name: '天水讼', number: 6, meaning: '有孚窒惕中吉', element: '金', fortune: '凶' },
  '☷☵': { name: '地水师', number: 7, meaning: '贞丈人吉无咎', element: '土', fortune: '中吉' },
  '☵☷': { name: '水地比', number: 8, meaning: '吉原筮元永贞', element: '水', fortune: '吉' },
  '☴☰': { name: '风天小畜', number: 9, meaning: '亨密云不雨', element: '木', fortune: '小吉' },
  '☰☱': { name: '天泽履', number: 10, meaning: '履虎尾不咥人亨', element: '金', fortune: '中吉' },
  '☷☰': { name: '地天泰', number: 11, meaning: '小往大来吉亨', element: '土', fortune: '大吉' },
  '☰☷': { name: '天地否', number: 12, meaning: '否之匪人不利君子', element: '金', fortune: '凶' },
  '☰☲': { name: '天火同人', number: 13, meaning: '同人于野亨', element: '金', fortune: '吉' },
  '☲☰': { name: '火天大有', number: 14, meaning: '元亨', element: '火', fortune: '大吉' },
  '☷☶': { name: '地山谦', number: 15, meaning: '亨君子有终', element: '土', fortune: '大吉' },
  '☳☷': { name: '雷地豫', number: 16, meaning: '利建侯行师', element: '木', fortune: '吉' },
  '☱☳': { name: '泽雷随', number: 17, meaning: '元亨利贞无咎', element: '金', fortune: '吉' },
  '☶☴': { name: '山风蛊', number: 18, meaning: '元亨利涉大川', element: '土', fortune: '中平' },
  '☷☱': { name: '地泽临', number: 19, meaning: '元亨利贞至于八月', element: '土', fortune: '吉' },
  '☴☷': { name: '风地观', number: 20, meaning: '盥而不荐有孚颙若', element: '木', fortune: '中吉' }
}

export interface BuguaQuestion {
  question: string // 占卜问题
  category: 'career' | 'love' | 'wealth' | 'health' | 'study' | 'family' | 'travel' | 'other'
  urgency: 'high' | 'medium' | 'low' // 问题紧急程度
}

export interface BuguaResult {
  question: BuguaQuestion
  hexagram: {
    upper: keyof typeof BAGUA // 上卦
    lower: keyof typeof BAGUA // 下卦
    name: string // 卦名
    number: number // 卦序
    meaning: string // 卦辞
    element: string // 主要五行
    fortune: string // 吉凶判断
  }
  interpretation: {
    overall: string // 总体解释
    advice: string // 建议
    timing: string // 时机
    caution: string // 注意事项
  }
  details: {
    upper_gua_analysis: string // 上卦分析
    lower_gua_analysis: string // 下卦分析
    interaction: string // 上下卦相互作用
    five_elements: string // 五行分析
  }
  scores: {
    success_rate: number // 成功概率 0-100
    risk_level: number // 风险等级 0-100  
    timing_score: number // 时机评分 0-100
    overall_score: number // 综合评分 0-100
  }
  timeframe: {
    short_term: string // 近期预测（1-3个月）
    medium_term: string // 中期预测（3-12个月）
    long_term: string // 远期预测（1-3年）
  }
}

export class BuguaCalculator {
  /**
   * 使用时间和问题内容生成卦象
   * @param question 占卜问题
   * @param timestamp 占卜时间戳
   * @returns 卦象结果
   */
  static generateHexagram(question: BuguaQuestion, timestamp: number = Date.now()): BuguaResult {
    // 基于时间戳和问题内容生成随机种子
    const seed = this.generateSeed(question.question, timestamp)
    
    // 生成上下卦
    const upperGua = this.getGuaFromSeed(seed, 'upper')
    const lowerGua = this.getGuaFromSeed(seed, 'lower')
    
    // 查找对应的六十四卦
    const hexagramKey = `${upperGua}${lowerGua}` as keyof typeof HEXAGRAMS
    const hexagram = HEXAGRAMS[hexagramKey] || {
      name: `${BAGUA[upperGua].name}${BAGUA[lowerGua].name}`,
      number: 0,
      meaning: '此卦需要深入分析',
      element: BAGUA[upperGua].element,
      fortune: '中平'
    }

    // 生成解释和分析
    const interpretation = this.generateInterpretation(question, upperGua, lowerGua, hexagram)
    const details = this.generateDetails(upperGua, lowerGua)
    const scores = this.calculateScores(question, upperGua, lowerGua, hexagram)
    const timeframe = this.generateTimeframe(question, hexagram, scores)

    return {
      question,
      hexagram: {
        upper: upperGua,
        lower: lowerGua,
        name: hexagram.name,
        number: hexagram.number,
        meaning: hexagram.meaning,
        element: hexagram.element,
        fortune: hexagram.fortune
      },
      interpretation,
      details,
      scores,
      timeframe
    }
  }

  /**
   * 硬币占卜方式生成卦象
   * @param question 占卜问题  
   * @param coinResults 6次投币结果，每次3枚硬币
   * @returns 卦象结果
   */
  static generateHexagramByCoins(question: BuguaQuestion, coinResults: number[]): BuguaResult {
    if (coinResults.length !== 6) {
      throw new Error('需要6次投币结果')
    }

    // 将投币结果转换为爻（每次3枚硬币，正面=3，反面=2）
    const yaos = coinResults.map(coins => {
      // coins 是3枚硬币正面数量 (0-3)
      if (coins === 0) return { type: '老阴', symbol: '--x--', value: 6 } // 3个反面
      if (coins === 1) return { type: '少阳', symbol: '-----', value: 7 } // 1正2反
      if (coins === 2) return { type: '少阴', symbol: '-- --', value: 8 } // 2正1反  
      if (coins === 3) return { type: '老阳', symbol: '--o--', value: 9 } // 3个正面
      throw new Error('无效的投币结果')
    })

    // 从下往上构建卦象（第一次投币是初爻）
    const lowerGuaYaos = yaos.slice(0, 3)
    const upperGuaYaos = yaos.slice(3, 6)

    // 转换为八卦符号
    const lowerGua = this.yaosToGua(lowerGuaYaos)
    const upperGua = this.yaosToGua(upperGuaYaos)

    // 查找对应的六十四卦
    const hexagramKey = `${upperGua}${lowerGua}` as keyof typeof HEXAGRAMS
    const hexagram = HEXAGRAMS[hexagramKey] || {
      name: `${BAGUA[upperGua].name}${BAGUA[lowerGua].name}`,
      number: 0,
      meaning: '此卦象需要深入分析',
      element: BAGUA[upperGua].element,
      fortune: '中平'
    }

    // 生成解释和分析
    const interpretation = this.generateInterpretation(question, upperGua, lowerGua, hexagram)
    const details = this.generateDetails(upperGua, lowerGua)
    const scores = this.calculateScores(question, upperGua, lowerGua, hexagram)
    const timeframe = this.generateTimeframe(question, hexagram, scores)

    return {
      question,
      hexagram: {
        upper: upperGua,
        lower: lowerGua,
        name: hexagram.name,
        number: hexagram.number,
        meaning: hexagram.meaning,
        element: hexagram.element,
        fortune: hexagram.fortune
      },
      interpretation,
      details,
      scores,
      timeframe
    }
  }

  /**
   * 根据问题和时间戳生成随机种子
   */
  private static generateSeed(question: string, timestamp: number): number {
    let hash = 0
    const combined = question + timestamp.toString()
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash)
  }

  /**
   * 从种子生成八卦
   */
  private static getGuaFromSeed(seed: number, position: 'upper' | 'lower'): keyof typeof BAGUA {
    const offset = position === 'upper' ? 100 : 0
    const index = (seed + offset) % 8
    const guaKeys = Object.keys(BAGUA) as Array<keyof typeof BAGUA>
    return guaKeys[index]
  }

  /**
   * 将爻序列转换为八卦符号
   */
  private static yaosToGua(yaos: any[]): keyof typeof BAGUA {
    // 根据爻的阴阳性质确定八卦（阳爻=1，阴爻=0）
    const binary = yaos.map(yao => yao.value % 2 === 1 ? '1' : '0').join('')
    
    const guaMap: { [key: string]: keyof typeof BAGUA } = {
      '111': '☰', // 乾
      '110': '☱', // 兑
      '101': '☲', // 离
      '100': '☳', // 震
      '011': '☴', // 巽
      '010': '☵', // 坎
      '001': '☶', // 艮
      '000': '☷'  // 坤
    }
    
    return guaMap[binary] || '☰'
  }

  /**
   * 生成卦象解释
   */
  private static generateInterpretation(
    question: BuguaQuestion, 
    upperGua: keyof typeof BAGUA, 
    lowerGua: keyof typeof BAGUA, 
    hexagram: any
  ) {
    const upperInfo = BAGUA[upperGua]
    const lowerInfo = BAGUA[lowerGua]

    let overall = ''
    let advice = ''
    let timing = ''
    let caution = ''

    // 根据卦象和问题类型生成解释
    switch (question.category) {
      case 'career':
        overall = `在事业方面，${hexagram.name}预示着${hexagram.fortune === '大吉' ? '前景光明，发展顺利' : hexagram.fortune === '吉' ? '稳步发展，需要耐心' : '需要谨慎处理，避免冒进'}`
        advice = `建议采取${upperInfo.nature === '天' ? '积极主动' : upperInfo.nature === '地' ? '稳重踏实' : '灵活变通'}的策略`
        timing = `当前时机${hexagram.fortune.includes('吉') ? '较为有利' : '需要等待'}，${upperInfo.direction}方向有利`
        caution = `需要注意${lowerInfo.nature}的特性，避免${hexagram.fortune === '凶' ? '重大决策' : '急躁冒进'}`
        break
        
      case 'love':
        overall = `在感情方面，${hexagram.name}显示${hexagram.fortune === '大吉' ? '感情和谐美满' : hexagram.fortune === '吉' ? '关系稳定向好' : '需要更多沟通理解'}`
        advice = `建议保持${upperInfo.element === '火' ? '热情主动' : upperInfo.element === '水' ? '温柔包容' : '真诚坦率'}的态度`
        timing = `感情发展${hexagram.fortune.includes('吉') ? '时机良好' : '需要耐心培养'}`
        caution = `注意${lowerInfo.element}属性的影响，避免${hexagram.fortune === '凶' ? '争执冲突' : '过于被动'}`
        break
        
      case 'wealth':
        overall = `在财运方面，${hexagram.name}暗示${hexagram.fortune === '大吉' ? '财源广进，收益丰厚' : hexagram.fortune === '吉' ? '财运稳定，小有收获' : '需要谨慎理财，控制支出'}`
        advice = `建议采用${upperInfo.element === '金' ? '保守稳健' : upperInfo.element === '木' ? '积极投资' : '多元化配置'}的理财策略`
        timing = `投资时机${hexagram.fortune.includes('吉') ? '相对适宜' : '不宜急进'}`
        caution = `注意${lowerInfo.element}元素的制约，避免${hexagram.fortune === '凶' ? '高风险投资' : '盲目跟风'}`
        break
        
      default:
        overall = `关于您的问题，${hexagram.name}提供了${hexagram.fortune}的指引`
        advice = `建议根据${upperInfo.nature}的特性，采取相应的行动策略`
        timing = `时机选择需要考虑${upperInfo.direction}方向的有利因素`
        caution = `需要注意${lowerInfo.nature}的影响，保持谨慎乐观的态度`
    }

    return { overall, advice, timing, caution }
  }

  /**
   * 生成详细分析
   */
  private static generateDetails(upperGua: keyof typeof BAGUA, lowerGua: keyof typeof BAGUA) {
    const upperInfo = BAGUA[upperGua]
    const lowerInfo = BAGUA[lowerGua]

    return {
      upper_gua_analysis: `上卦${upperInfo.name}(${upperGua})代表${upperInfo.nature}，五行属${upperInfo.element}，象征着外在环境和发展趋势`,
      lower_gua_analysis: `下卦${lowerInfo.name}(${lowerGua})代表${lowerInfo.nature}，五行属${lowerInfo.element}，象征着内在基础和根本态度`,
      interaction: this.analyzeGuaInteraction(upperInfo, lowerInfo),
      five_elements: this.analyzeFiveElements(upperInfo.element, lowerInfo.element)
    }
  }

  /**
   * 分析卦象相互作用
   */
  private static analyzeGuaInteraction(upperInfo: any, lowerInfo: any): string {
    if (upperInfo.element === lowerInfo.element) {
      return `上下卦同属${upperInfo.element}，力量集中，效果显著，但需要注意过犹不及`
    }
    
    const generationCycle = {
      '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
    }
    
    if (generationCycle[upperInfo.element as keyof typeof generationCycle] === lowerInfo.element) {
      return `上卦${upperInfo.element}生下卦${lowerInfo.element}，上下相生，发展顺利，有贵人相助`
    }
    
    if (generationCycle[lowerInfo.element as keyof typeof generationCycle] === upperInfo.element) {
      return `下卦${lowerInfo.element}生上卦${upperInfo.element}，基础坚实，能量向上，前景良好`
    }
    
    return `上下卦五行配置形成特殊格局，需要平衡协调，化解冲突`
  }

  /**
   * 分析五行关系
   */
  private static analyzeFiveElements(upperElement: string, lowerElement: string): string {
    const destructionCycle = {
      '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
    }
    
    if (destructionCycle[upperElement as keyof typeof destructionCycle] === lowerElement) {
      return `上卦${upperElement}克下卦${lowerElement}，外部环境对内在基础有压制作用，需要增强内在力量`
    }
    
    if (destructionCycle[lowerElement as keyof typeof destructionCycle] === upperElement) {
      return `下卦${lowerElement}克上卦${upperElement}，内在力量制约外在发展，需要调整策略`
    }
    
    return `五行配置和谐，内外协调，发展平衡`
  }

  /**
   * 计算各项评分
   */
  private static calculateScores(
    question: BuguaQuestion,
    upperGua: keyof typeof BAGUA,
    lowerGua: keyof typeof BAGUA,
    hexagram: any
  ) {
    const baseScore = 50
    let fortuneBonus = 0
    
    switch (hexagram.fortune) {
      case '大吉': fortuneBonus = 40; break
      case '吉': fortuneBonus = 25; break
      case '中吉': fortuneBonus = 15; break
      case '小吉': fortuneBonus = 10; break
      case '中平': fortuneBonus = 0; break
      case '凶': fortuneBonus = -25; break
    }
    
    const upperInfo = BAGUA[upperGua]
    const lowerInfo = BAGUA[lowerGua]
    
    // 根据问题类型调整评分
    let categoryBonus = 0
    if (question.category === 'career' && upperInfo.nature === '天') categoryBonus = 10
    if (question.category === 'love' && (upperInfo.element === '火' || lowerInfo.element === '水')) categoryBonus = 10
    if (question.category === 'wealth' && upperInfo.element === '金') categoryBonus = 10
    
    const successRate = Math.max(0, Math.min(100, baseScore + fortuneBonus + categoryBonus))
    const riskLevel = Math.max(0, Math.min(100, 100 - successRate))
    const timingScore = Math.max(0, Math.min(100, baseScore + fortuneBonus / 2))
    const overallScore = Math.round((successRate + (100 - riskLevel) + timingScore) / 3)
    
    return {
      success_rate: successRate,
      risk_level: riskLevel,
      timing_score: timingScore,
      overall_score: overallScore
    }
  }

  /**
   * 生成时间预测
   */
  private static generateTimeframe(question: BuguaQuestion, hexagram: any, scores: any) {
    const baseShort = hexagram.fortune.includes('吉') ? '近期运势向好' : '近期需要谨慎'
    const baseMedium = scores.overall_score > 60 ? '中期发展稳定' : '中期需要调整策略'  
    const baseLong = hexagram.element === '金' ? '长期前景稳固' : '长期发展需要持续努力'
    
    return {
      short_term: `${baseShort}，建议把握当前机会，${question.urgency === 'high' ? '可以积极行动' : '稳步推进'}`,
      medium_term: `${baseMedium}，关注${hexagram.element}属性的发展，适时调整方向`,
      long_term: `${baseLong}，持续关注内外环境变化，保持初心不变`
    }
  }
}