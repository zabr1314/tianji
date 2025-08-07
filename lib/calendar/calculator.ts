import { BaziCalculator } from '../bazi/calculator'

/**
 * 个人运势日历计算器
 * 基于个人八字和当日干支计算每日运势
 */

export interface PersonalInfo {
  name: string
  birthDate: Date
  birthTime: string
  birthCity: string
  gender: 'male' | 'female'
}

export interface DailyFortune {
  date: Date
  dayGanzhi: string // 当日干支
  overall_score: number // 总体运势评分 0-100
  categories: {
    career: number // 事业运 0-100
    wealth: number // 财运 0-100
    love: number // 感情运 0-100
    health: number // 健康运 0-100
    study: number // 学习运 0-100
    travel: number // 出行运 0-100
  }
  lucky_elements: string[] // 有利五行
  unlucky_elements: string[] // 不利五行
  lucky_directions: string[] // 吉利方位
  lucky_colors: string[] // 幸运颜色
  lucky_numbers: number[] // 幸运数字
  suitable_activities: string[] // 适宜活动
  avoid_activities: string[] // 忌讳活动
  advice: string // 当日建议
  warning: string // 注意事项
}

export interface MonthlyFortune {
  year: number
  month: number
  overall_trend: 'rising' | 'stable' | 'declining' // 整体趋势
  peak_days: Date[] // 运势高峰日
  low_days: Date[] // 运势低谷日
  monthly_advice: string // 月度建议
  key_events: Array<{
    date: Date
    event_type: 'opportunity' | 'challenge' | 'neutral'
    description: string
  }>
}

export class FortuneCalendarCalculator {
  /**
   * 计算单日运势
   * @param person 个人信息
   * @param targetDate 目标日期
   * @returns 当日运势详情
   */
  static calculateDailyFortune(person: PersonalInfo, targetDate: Date): DailyFortune {
    // 计算个人八字
    const solarTime = BaziCalculator.calculateSolarTime(person.birthDate, 116.4074)
    const personalBazi = BaziCalculator.generateBazi(solarTime)
    const personalWuxing = BaziCalculator.analyzeWuXing(personalBazi)

    // 计算当日干支
    const dayGanzhi = this.calculateDayGanzhi(targetDate)
    
    // 计算当日五行力量
    const dayWuxing = this.calculateDayWuxing(dayGanzhi)
    
    // 分析个人八字与当日干支的关系
    const compatibility = this.analyzeDayCompatibility(personalBazi, personalWuxing, dayGanzhi, dayWuxing)
    
    // 计算各项运势评分
    const categories = this.calculateCategoryScores(personalWuxing, dayWuxing, compatibility)
    
    // 计算总体评分
    const overallScore = Math.round(
      (categories.career * 0.25 + categories.wealth * 0.2 + categories.love * 0.2 + 
       categories.health * 0.15 + categories.study * 0.1 + categories.travel * 0.1)
    )

    // 生成幸运要素
    const luckyElements = this.calculateLuckyElements(personalWuxing, dayWuxing)
    const unluckyElements = this.calculateUnluckyElements(personalWuxing, dayWuxing)
    const luckyDirections = this.calculateLuckyDirections(dayGanzhi)
    const luckyColors = this.calculateLuckyColors(luckyElements)
    const luckyNumbers = this.calculateLuckyNumbers(dayGanzhi, personalBazi)

    // 生成活动建议
    const suitableActivities = this.generateSuitableActivities(categories, luckyElements)
    const avoidActivities = this.generateAvoidActivities(categories, unluckyElements)

    // 生成建议和注意事项
    const advice = this.generateDailyAdvice(overallScore, categories, luckyElements)
    const warning = this.generateDailyWarning(categories, unluckyElements)

    return {
      date: targetDate,
      dayGanzhi,
      overall_score: overallScore,
      categories,
      lucky_elements: luckyElements,
      unlucky_elements: unluckyElements,
      lucky_directions: luckyDirections,
      lucky_colors: luckyColors,
      lucky_numbers: luckyNumbers,
      suitable_activities: suitableActivities,
      avoid_activities: avoidActivities,
      advice,
      warning
    }
  }

  /**
   * 计算月度运势
   * @param person 个人信息
   * @param year 年份
   * @param month 月份（1-12）
   * @returns 月度运势分析
   */
  static calculateMonthlyFortune(person: PersonalInfo, year: number, month: number): MonthlyFortune {
    const dailyFortunesInMonth: DailyFortune[] = []
    const daysInMonth = new Date(year, month, 0).getDate()

    // 计算整月的每日运势
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day)
      const dailyFortune = this.calculateDailyFortune(person, date)
      dailyFortunesInMonth.push(dailyFortune)
    }

    // 分析整体趋势
    const scores = dailyFortunesInMonth.map(f => f.overall_score)
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const trendSlope = this.calculateTrendSlope(scores)
    
    let overallTrend: 'rising' | 'stable' | 'declining'
    if (trendSlope > 2) overallTrend = 'rising'
    else if (trendSlope < -2) overallTrend = 'declining'
    else overallTrend = 'stable'

    // 找出高峰和低谷日
    const peakDays = dailyFortunesInMonth
      .filter(f => f.overall_score >= averageScore + 15)
      .map(f => f.date)
    
    const lowDays = dailyFortunesInMonth
      .filter(f => f.overall_score <= averageScore - 15)
      .map(f => f.date)

    // 生成关键事件
    const keyEvents = this.generateKeyEvents(dailyFortunesInMonth)

    // 生成月度建议
    const monthlyAdvice = this.generateMonthlyAdvice(overallTrend, averageScore, peakDays, lowDays)

    return {
      year,
      month,
      overall_trend: overallTrend,
      peak_days: peakDays,
      low_days: lowDays,
      monthly_advice: monthlyAdvice,
      key_events: keyEvents
    }
  }

  /**
   * 计算当日干支
   */
  private static calculateDayGanzhi(date: Date): string {
    // 简化的干支计算（实际应用中需要更精确的算法）
    const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    
    // 以1900年1月1日为基准日（甲子日）
    const baseDate = new Date(1900, 0, 1)
    const daysDiff = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
    
    const tianganIndex = daysDiff % 10
    const dizhiIndex = daysDiff % 12
    
    return tiangan[tianganIndex] + dizhi[dizhiIndex]
  }

  /**
   * 计算当日五行力量
   */
  private static calculateDayWuxing(dayGanzhi: string): any {
    const tianganWuxing: { [key: string]: string } = {
      '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
      '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
    }
    
    const dizhiWuxing: { [key: string]: string } = {
      '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
      '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
    }

    const tiangan = dayGanzhi[0]
    const dizhi = dayGanzhi[1]
    
    const tianganElement = tianganWuxing[tiangan]
    const dizhiElement = dizhiWuxing[dizhi]

    // 简化的五行力量计算
    const wuxing = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
    
    // 天干力量为3，地支力量为2
    const tianganPower = 3
    const dizhiPower = 2
    
    switch (tianganElement) {
      case '木': wuxing.wood += tianganPower; break
      case '火': wuxing.fire += tianganPower; break
      case '土': wuxing.earth += tianganPower; break
      case '金': wuxing.metal += tianganPower; break
      case '水': wuxing.water += tianganPower; break
    }
    
    switch (dizhiElement) {
      case '木': wuxing.wood += dizhiPower; break
      case '火': wuxing.fire += dizhiPower; break
      case '土': wuxing.earth += dizhiPower; break
      case '金': wuxing.metal += dizhiPower; break
      case '水': wuxing.water += dizhiPower; break
    }

    return wuxing
  }

  /**
   * 分析当日兼容性
   */
  private static analyzeDayCompatibility(personalBazi: any, personalWuxing: any, dayGanzhi: string, dayWuxing: any): any {
    // 检查日柱与个人日柱的关系
    const personalDayTiangan = personalBazi.day_ganzhi[0]
    const personalDayDizhi = personalBazi.day_ganzhi[1]
    const dayTiangan = dayGanzhi[0]
    const dayDizhi = dayGanzhi[1]

    let tianganRelation = 'neutral'
    let dizhiRelation = 'neutral'

    // 简化的干支关系判断
    if (personalDayTiangan === dayTiangan) tianganRelation = 'same'
    if (personalDayDizhi === dayDizhi) dizhiRelation = 'same'

    // 五行生克关系
    const wuxingRelation = this.analyzeWuxingRelation(personalWuxing, dayWuxing)

    return {
      tiangan_relation: tianganRelation,
      dizhi_relation: dizhiRelation,
      wuxing_relation: wuxingRelation,
      compatibility_score: this.calculateCompatibilityScore(tianganRelation, dizhiRelation, wuxingRelation)
    }
  }

  /**
   * 分析五行关系
   */
  private static analyzeWuxingRelation(personalWuxing: any, dayWuxing: any): string {
    // 找出个人最强和最弱的五行
    const personalElements = Object.keys(personalWuxing)
    const personalStrongest = personalElements.reduce((a, b) => 
      personalWuxing[a] > personalWuxing[b] ? a : b
    )

    const dayElements = Object.keys(dayWuxing)
    const dayStrongest = dayElements.reduce((a, b) => 
      dayWuxing[a] > dayWuxing[b] ? a : b
    )

    // 相生相克关系判断
    const generationCycle: { [key: string]: string } = {
      wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood'
    }

    const destructionCycle: { [key: string]: string } = {
      wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire'
    }

    if (generationCycle[personalStrongest] === dayStrongest) {
      return 'generation' // 我生日
    } else if (generationCycle[dayStrongest] === personalStrongest) {
      return 'nourishment' // 日生我
    } else if (destructionCycle[personalStrongest] === dayStrongest) {
      return 'control' // 我克日
    } else if (destructionCycle[dayStrongest] === personalStrongest) {
      return 'restriction' // 日克我
    } else {
      return 'neutral'
    }
  }

  /**
   * 计算兼容性评分
   */
  private static calculateCompatibilityScore(tianganRel: string, dizhiRel: string, wuxingRel: string): number {
    let score = 50 // 基础分

    // 天干关系加分
    if (tianganRel === 'same') score += 10

    // 地支关系加分
    if (dizhiRel === 'same') score += 10

    // 五行关系加分
    switch (wuxingRel) {
      case 'generation': score += 20; break
      case 'nourishment': score += 25; break
      case 'control': score += 5; break
      case 'restriction': score -= 15; break
      case 'neutral': break
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 计算各类运势评分
   */
  private static calculateCategoryScores(personalWuxing: any, dayWuxing: any, compatibility: any): any {
    const baseScore = 50
    const compatibilityBonus = (compatibility.compatibility_score - 50) * 0.8

    return {
      career: Math.round(Math.max(0, Math.min(100, baseScore + compatibilityBonus + Math.random() * 10 - 5))),
      wealth: Math.round(Math.max(0, Math.min(100, baseScore + compatibilityBonus + Math.random() * 10 - 5))),
      love: Math.round(Math.max(0, Math.min(100, baseScore + compatibilityBonus + Math.random() * 10 - 5))),
      health: Math.round(Math.max(0, Math.min(100, baseScore + compatibilityBonus + Math.random() * 10 - 5))),
      study: Math.round(Math.max(0, Math.min(100, baseScore + compatibilityBonus + Math.random() * 10 - 5))),
      travel: Math.round(Math.max(0, Math.min(100, baseScore + compatibilityBonus + Math.random() * 10 - 5)))
    }
  }

  /**
   * 计算有利五行
   */
  private static calculateLuckyElements(personalWuxing: any, dayWuxing: any): string[] {
    const elements = ['木', '火', '土', '金', '水']
    const luckyElements: string[] = []

    // 找出个人较弱的五行作为有利五行
    const elementStrengths = [
      { element: '木', strength: personalWuxing.wood },
      { element: '火', strength: personalWuxing.fire },
      { element: '土', strength: personalWuxing.earth },
      { element: '金', strength: personalWuxing.metal },
      { element: '水', strength: personalWuxing.water }
    ]

    elementStrengths.sort((a, b) => a.strength - b.strength)
    luckyElements.push(elementStrengths[0].element, elementStrengths[1].element)

    return luckyElements
  }

  /**
   * 计算不利五行
   */
  private static calculateUnluckyElements(personalWuxing: any, dayWuxing: any): string[] {
    const unluckyElements: string[] = []

    // 找出个人过强的五行作为不利五行
    const elementStrengths = [
      { element: '木', strength: personalWuxing.wood },
      { element: '火', strength: personalWuxing.fire },
      { element: '土', strength: personalWuxing.earth },
      { element: '金', strength: personalWuxing.metal },
      { element: '水', strength: personalWuxing.water }
    ]

    elementStrengths.sort((a, b) => b.strength - a.strength)
    if (elementStrengths[0].strength > 3) {
      unluckyElements.push(elementStrengths[0].element)
    }

    return unluckyElements
  }

  /**
   * 计算吉利方位
   */
  private static calculateLuckyDirections(dayGanzhi: string): string[] {
    const directionMap: { [key: string]: string[] } = {
      '甲': ['东', '东南'], '乙': ['东', '东南'], '丙': ['南', '西南'], '丁': ['南', '西南'],
      '戊': ['中央', '西南'], '己': ['中央', '西南'], '庚': ['西', '西北'], '辛': ['西', '西北'],
      '壬': ['北', '东北'], '癸': ['北', '东北']
    }

    const tiangan = dayGanzhi[0]
    return directionMap[tiangan] || ['东']
  }

  /**
   * 计算幸运颜色
   */
  private static calculateLuckyColors(luckyElements: string[]): string[] {
    const colorMap: { [key: string]: string[] } = {
      '木': ['绿色', '青色'],
      '火': ['红色', '橙色'],
      '土': ['黄色', '棕色'],
      '金': ['白色', '金色'],
      '水': ['黑色', '蓝色']
    }

    const colors: string[] = []
    luckyElements.forEach(element => {
      colors.push(...(colorMap[element] || []))
    })

    return [...new Set(colors)] // 去重
  }

  /**
   * 计算幸运数字
   */
  private static calculateLuckyNumbers(dayGanzhi: string, personalBazi: any): number[] {
    const tianganNumbers: { [key: string]: number } = {
      '甲': 1, '乙': 2, '丙': 3, '丁': 4, '戊': 5,
      '己': 6, '庚': 7, '辛': 8, '壬': 9, '癸': 0
    }

    const numbers: number[] = []
    const dayTiangan = dayGanzhi[0]
    const personalTiangan = personalBazi.day_ganzhi[0]

    numbers.push(tianganNumbers[dayTiangan])
    numbers.push(tianganNumbers[personalTiangan])
    numbers.push((tianganNumbers[dayTiangan] + tianganNumbers[personalTiangan]) % 10)

    return [...new Set(numbers)].slice(0, 3)
  }

  /**
   * 生成适宜活动
   */
  private static generateSuitableActivities(categories: any, luckyElements: string[]): string[] {
    const activities: string[] = []

    if (categories.career > 70) activities.push('签署合同', '商务洽谈', '求职面试')
    if (categories.wealth > 70) activities.push('投资理财', '开店营业', '收账催款')
    if (categories.love > 70) activities.push('约会表白', '相亲见面', '结婚登记')
    if (categories.health > 70) activities.push('体检保健', '运动健身', '户外活动')
    if (categories.study > 70) activities.push('学习考试', '培训充电', '读书写作')
    if (categories.travel > 70) activities.push('出差旅行', '搬家迁移', '拜访亲友')

    // 根据有利五行添加活动
    if (luckyElements.includes('木')) activities.push('种植花草', '户外运动')
    if (luckyElements.includes('火')) activities.push('聚会社交', '文艺演出')
    if (luckyElements.includes('金')) activities.push('金融交易', '购买首饰')

    return [...new Set(activities)].slice(0, 6)
  }

  /**
   * 生成忌讳活动
   */
  private static generateAvoidActivities(categories: any, unluckyElements: string[]): string[] {
    const activities: string[] = []

    if (categories.career < 40) activities.push('重要决策', '投资创业', '跳槽辞职')
    if (categories.wealth < 40) activities.push('大额投资', '借贷放账', '赌博投机')
    if (categories.love < 40) activities.push('争吵冲突', '分手离婚', '感情告白')
    if (categories.health < 40) activities.push('手术开刀', '熬夜劳累', '暴饮暴食')
    if (categories.travel < 40) activities.push('远途旅行', '危险运动', '夜间出行')

    return [...new Set(activities)].slice(0, 5)
  }

  /**
   * 生成每日建议
   */
  private static generateDailyAdvice(overallScore: number, categories: any, luckyElements: string[]): string {
    if (overallScore >= 80) {
      return '今日运势极佳，是行动的好日子。可以积极推进重要事务，把握难得的机遇。'
    } else if (overallScore >= 60) {
      return '今日运势良好，适合稳步推进计划。保持积极心态，注意细节处理。'
    } else if (overallScore >= 40) {
      return '今日运势平稳，宜守不宜攻。专注于日常事务，避免重大决策。'
    } else {
      return '今日运势欠佳，建议低调行事。多休息调养，等待更好的时机。'
    }
  }

  /**
   * 生成每日注意事项
   */
  private static generateDailyWarning(categories: any, unluckyElements: string[]): string {
    const warnings: string[] = []

    if (categories.health < 50) warnings.push('注意身体健康')
    if (categories.wealth < 50) warnings.push('谨慎理财投资')
    if (categories.love < 50) warnings.push('避免感情冲突')
    if (categories.career < 50) warnings.push('工作谨慎细致')

    if (warnings.length === 0) {
      return '整体运势平稳，保持平常心即可。'
    }

    return warnings.join('，') + '。'
  }

  /**
   * 计算趋势斜率
   */
  private static calculateTrendSlope(scores: number[]): number {
    const n = scores.length
    const sumX = (n * (n - 1)) / 2
    const sumY = scores.reduce((sum, score) => sum + score, 0)
    const sumXY = scores.reduce((sum, score, index) => sum + (index * score), 0)
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  }

  /**
   * 生成关键事件
   */
  private static generateKeyEvents(dailyFortunes: DailyFortune[]): Array<any> {
    const events: Array<any> = []

    dailyFortunes.forEach(fortune => {
      if (fortune.overall_score >= 85) {
        events.push({
          date: fortune.date,
          event_type: 'opportunity',
          description: '运势极佳，适合重要行动'
        })
      } else if (fortune.overall_score <= 30) {
        events.push({
          date: fortune.date,
          event_type: 'challenge',
          description: '运势较低，需要谨慎行事'
        })
      }
    })

    return events.slice(0, 5) // 最多返回5个关键事件
  }

  /**
   * 生成月度建议
   */
  private static generateMonthlyAdvice(trend: string, avgScore: number, peakDays: Date[], lowDays: Date[]): string {
    let advice = ''

    switch (trend) {
      case 'rising':
        advice = '本月运势呈上升趋势，可以逐步推进重要计划。'
        break
      case 'declining':
        advice = '本月运势有所下滑，建议保守行事，做好防范。'
        break
      default:
        advice = '本月运势相对平稳，保持现状即可。'
    }

    if (peakDays.length > 0) {
      advice += `特别关注${peakDays.length}个高峰日，把握重要机遇。`
    }

    if (lowDays.length > 0) {
      advice += `注意${lowDays.length}个低谷日，避免重要决策。`
    }

    return advice
  }
}