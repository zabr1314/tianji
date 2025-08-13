import { BaziCalculator } from '../bazi/calculator'

export interface HepanPerson {
  name: string
  birthDate: Date
  birthTime: string
  birthCity: string
  gender: 'male' | 'female'
}

export interface HepanResult {
  person1: {
    name: string
    bazi: any
    wuxing: any  
  }
  person2: {
    name: string
    bazi: any
    wuxing: any
  }
  compatibility: {
    overall_score: number // 0-100
    wuxing_compatibility: number // 五行相合度
    ganzhi_compatibility: number // 干支相合度
    yongshen_compatibility: number // 用神相合度
    dayun_compatibility: number // 大运相合度
  }
  analysis: {
    strengths: string[] // 优势方面
    challenges: string[] // 挑战方面  
    suggestions: string[] // 改善建议
  }
  detailed_scores: {
    love_score: number // 感情和谐度
    career_score: number // 事业配合度
    wealth_score: number // 财运互补度
    health_score: number // 健康相助度
    family_score: number // 家庭和睦度
  }
}

export class HepanCalculator {
  /**
   * 计算两人八字合盘
   * @param person1 第一个人的信息
   * @param person2 第二个人的信息
   * @returns 合盘分析结果
   */
  static calculateHepan(person1: HepanPerson, person2: HepanPerson): HepanResult {
    // 计算两人的八字
    const solarTime1 = BaziCalculator.calculateSolarTime(person1.birthDate, 116.4074)
    const bazi1 = BaziCalculator.generateBazi(solarTime1)
    const wuxing1 = BaziCalculator.analyzeWuXing(bazi1)
    const yongshen1 = BaziCalculator.determinYongshen(wuxing1, bazi1.day_ganzhi[0])

    const solarTime2 = BaziCalculator.calculateSolarTime(person2.birthDate, 116.4074)
    const bazi2 = BaziCalculator.generateBazi(solarTime2)
    const wuxing2 = BaziCalculator.analyzeWuXing(bazi2)
    const yongshen2 = BaziCalculator.determinYongshen(wuxing2, bazi2.day_ganzhi[0])

    // 计算各项相合度
    const wuxingScore = this.calculateWuxingCompatibility(wuxing1, wuxing2)
    const ganzhiScore = this.calculateGanzhiCompatibility(bazi1, bazi2)
    const yongshenScore = this.calculateYongshenCompatibility(yongshen1, yongshen2)
    const dayunScore = this.calculateDayunCompatibility(bazi1, bazi2, person1.gender, person2.gender)

    // 计算总体评分
    const overallScore = Math.round(
      (wuxingScore * 0.3 + ganzhiScore * 0.25 + yongshenScore * 0.25 + dayunScore * 0.2)
    )

    // 生成分析内容
    const analysis = this.generateAnalysis(overallScore, wuxingScore, ganzhiScore, yongshenScore)
    const detailedScores = this.calculateDetailedScores(wuxing1, wuxing2, bazi1, bazi2)

    return {
      person1: {
        name: person1.name,
        bazi: bazi1,
        wuxing: wuxing1
      },
      person2: {
        name: person2.name,
        bazi: bazi2,
        wuxing: wuxing2
      },
      compatibility: {
        overall_score: overallScore,
        wuxing_compatibility: wuxingScore,
        ganzhi_compatibility: ganzhiScore,
        yongshen_compatibility: yongshenScore,
        dayun_compatibility: dayunScore
      },
      analysis,
      detailed_scores: detailedScores
    }
  }

  /**
   * 计算五行相合度
   */
  private static calculateWuxingCompatibility(wuxing1: any, wuxing2: any): number {
    const elements = ['wood', 'fire', 'earth', 'metal', 'water']
    let compatibilityScore = 0
    let totalComparisons = 0

    // 计算五行互补和相生关系
    for (const element of elements) {
      const strength1 = wuxing1[element] || 0
      const strength2 = wuxing2[element] || 0
      
      // 互补关系：一强一弱得高分
      const complementScore = this.calculateComplementScore(strength1, strength2)
      
      // 相生关系：检查是否有相生关系
      const generationScore = this.calculateGenerationScore(element, wuxing1, wuxing2)
      
      compatibilityScore += (complementScore + generationScore) / 2
      totalComparisons++
    }

    return Math.round((compatibilityScore / totalComparisons) * 100)
  }

  /**
   * 计算互补得分
   */
  private static calculateComplementScore(strength1: number, strength2: number): number {
    const total = strength1 + strength2
    if (total === 0) return 0.5
    
    const balance = 1 - Math.abs(strength1 - strength2) / Math.max(strength1 + strength2, 1)
    return balance
  }

  /**
   * 计算五行相生得分
   */
  private static calculateGenerationScore(element: string, wuxing1: any, wuxing2: any): number {
    const generationCycle = {
      wood: 'fire',
      fire: 'earth', 
      earth: 'metal',
      metal: 'water',
      water: 'wood'
    }

    const generates = generationCycle[element as keyof typeof generationCycle]
    if (!generates) return 0

    const elementStrength1 = wuxing1[element] || 0
    const elementStrength2 = wuxing2[element] || 0
    const generatedStrength1 = wuxing1[generates] || 0
    const generatedStrength2 = wuxing2[generates] || 0

    // 如果一方某元素强，另一方它生的元素弱，则有相生互补关系
    let score = 0
    if (elementStrength1 > 2 && generatedStrength2 < 2) score += 0.3
    if (elementStrength2 > 2 && generatedStrength1 < 2) score += 0.3
    
    return score
  }

  /**
   * 计算干支相合度
   */
  private static calculateGanzhiCompatibility(bazi1: any, bazi2: any): number {
    let compatibility = 0
    let totalChecks = 0

    // 日柱天干相合检查
    const dayTiangan1 = bazi1.day_ganzhi[0]
    const dayTiangan2 = bazi2.day_ganzhi[0]
    compatibility += this.checkTianganHe(dayTiangan1, dayTiangan2) ? 25 : 0
    totalChecks += 25

    // 日柱地支相合检查
    const dayDizhi1 = bazi1.day_ganzhi[1] 
    const dayDizhi2 = bazi2.day_ganzhi[1]
    compatibility += this.checkDizhiHe(dayDizhi1, dayDizhi2) ? 20 : 0
    totalChecks += 20

    // 年柱相合检查
    const yearTiangan1 = bazi1.year_ganzhi[0]
    const yearTiangan2 = bazi2.year_ganzhi[0]
    compatibility += this.checkTianganHe(yearTiangan1, yearTiangan2) ? 15 : 0
    totalChecks += 15

    // 月柱相合检查  
    const monthDizhi1 = bazi1.month_ganzhi[1]
    const monthDizhi2 = bazi2.month_ganzhi[1]
    compatibility += this.checkDizhiHe(monthDizhi1, monthDizhi2) ? 15 : 0
    totalChecks += 15

    // 检查相冲相害
    const chonghai = this.checkChongHai(bazi1, bazi2)
    compatibility -= chonghai * 10 // 每个相冲相害减10分
    
    return Math.max(0, Math.round((compatibility / totalChecks) * 100))
  }

  /**
   * 检查天干相合
   */
  private static checkTianganHe(tiangan1: string, tiangan2: string): boolean {
    const tianganHe = [
      ['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸']
    ]
    
    return tianganHe.some(pair => 
      (pair[0] === tiangan1 && pair[1] === tiangan2) ||
      (pair[1] === tiangan1 && pair[0] === tiangan2)
    )
  }

  /**
   * 检查地支相合
   */
  private static checkDizhiHe(dizhi1: string, dizhi2: string): boolean {
    const dizhiHe = [
      ['子', '丑'], ['寅', '亥'], ['卯', '戌'], 
      ['辰', '酉'], ['巳', '申'], ['午', '未']
    ]
    
    return dizhiHe.some(pair =>
      (pair[0] === dizhi1 && pair[1] === dizhi2) ||
      (pair[1] === dizhi1 && pair[0] === dizhi2)
    )
  }

  /**
   * 检查相冲相害
   */
  private static checkChongHai(bazi1: any, bazi2: any): number {
    let chongHaiCount = 0
    
    // 地支相冲检查
    const chong = [
      ['子', '午'], ['丑', '未'], ['寅', '申'],
      ['卯', '酉'], ['辰', '戌'], ['巳', '亥']
    ]
    
    const allDizhi1 = [bazi1.year_ganzhi[1], bazi1.month_ganzhi[1], bazi1.day_ganzhi[1], bazi1.hour_ganzhi[1]]
    const allDizhi2 = [bazi2.year_ganzhi[1], bazi2.month_ganzhi[1], bazi2.day_ganzhi[1], bazi2.hour_ganzhi[1]]
    
    for (const dizhi1 of allDizhi1) {
      for (const dizhi2 of allDizhi2) {
        const isChong = chong.some(pair =>
          (pair[0] === dizhi1 && pair[1] === dizhi2) ||
          (pair[1] === dizhi1 && pair[0] === dizhi2)
        )
        if (isChong) chongHaiCount++
      }
    }
    
    return chongHaiCount
  }

  /**
   * 计算用神相合度
   */
  private static calculateYongshenCompatibility(yongshen1: string, yongshen2: string): number {
    if (yongshen1 === yongshen2) return 90 // 用神相同得高分
    
    // 检查用神是否相生
    const generationCycle = {
      '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
    }
    
    const generates1 = generationCycle[yongshen1 as keyof typeof generationCycle]
    const generates2 = generationCycle[yongshen2 as keyof typeof generationCycle]
    
    if (generates1 === yongshen2 || generates2 === yongshen1) {
      return 75 // 用神相生得较高分
    }
    
    // 检查用神是否相克
    const destructionCycle = {
      '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
    }
    
    const destroys1 = destructionCycle[yongshen1 as keyof typeof destructionCycle]
    const destroys2 = destructionCycle[yongshen2 as keyof typeof destructionCycle]
    
    if (destroys1 === yongshen2 || destroys2 === yongshen1) {
      return 30 // 用神相克得低分
    }
    
    return 60 // 其他情况中等分
  }

  /**
   * 计算大运相合度
   */
  private static calculateDayunCompatibility(bazi1: any, bazi2: any, gender1: string, gender2: string): number {
    try {
      const dayun1 = BaziCalculator.calculateDayun(bazi1, new Date(), gender1 as 'male' | 'female')
      const dayun2 = BaziCalculator.calculateDayun(bazi2, new Date(), gender2 as 'male' | 'female')
      
      if (!dayun1.length || !dayun2.length) return 50
      
      // 比较当前大运期的相合度
      const currentDayun1 = dayun1[0]
      const currentDayun2 = dayun2[0]
      
      let compatibility = 0
      
      // 比较大运天干地支
      const tiangan1 = currentDayun1.ganzhi.charAt(0)
      const dizhi1 = currentDayun1.ganzhi.charAt(1)
      const tiangan2 = currentDayun2.ganzhi.charAt(0)
      const dizhi2 = currentDayun2.ganzhi.charAt(1)
      
      if (this.checkTianganHe(tiangan1, tiangan2)) {
        compatibility += 30
      }
      
      if (this.checkDizhiHe(dizhi1, dizhi2)) {
        compatibility += 30  
      }
      
      // 检查大运是否相冲
      const chong = [
        ['子', '午'], ['丑', '未'], ['寅', '申'],
        ['卯', '酉'], ['辰', '戌'], ['巳', '亥']
      ]
      
      const isChong = chong.some(pair =>
        (pair[0] === dizhi1 && pair[1] === dizhi2) ||
        (pair[1] === dizhi1 && pair[0] === dizhi2)
      )
      
      if (isChong) compatibility -= 20
      
      return Math.max(0, Math.min(100, compatibility + 50)) // 基础分50
    } catch (error) {
      return 50 // 出错时返回中等分
    }
  }

  /**
   * 生成分析内容
   */
  private static generateAnalysis(overallScore: number, wuxingScore: number, ganzhiScore: number, yongshenScore: number) {
    const strengths: string[] = []
    const challenges: string[] = []
    const suggestions: string[] = []

    // 根据得分生成优势
    if (overallScore >= 80) {
      strengths.push('两人八字高度相合，天作之合')
      strengths.push('性格互补，能够相互扶持')
    } else if (overallScore >= 60) {
      strengths.push('两人八字较为相合，关系和谐')
      strengths.push('有共同语言，相处融洽')
    }

    if (wuxingScore >= 70) {
      strengths.push('五行配置互补，能量平衡')
    }

    if (ganzhiScore >= 70) {
      strengths.push('干支相配，命理相合')
    }

    if (yongshenScore >= 70) {
      strengths.push('用神相助，运势提升')
    }

    // 根据得分生成挑战
    if (overallScore < 50) {
      challenges.push('八字配对有一定挑战性')
      challenges.push('需要更多的理解和包容')
    }

    if (wuxingScore < 50) {
      challenges.push('五行配置需要调和')
    }

    if (ganzhiScore < 50) {
      challenges.push('部分时期可能有摩擦')
    }

    // 生成建议
    suggestions.push('保持良好沟通，增进相互理解')
    suggestions.push('在重要决策时互相商议')
    
    if (wuxingScore < 60) {
      suggestions.push('可通过调整居住环境来改善五行配置')
    }

    if (overallScore < 70) {
      suggestions.push('选择有利的时间段进行重要活动')
      suggestions.push('保持耐心和包容心')
    }

    return { strengths, challenges, suggestions }
  }

  /**
   * 计算详细评分
   */
  private static calculateDetailedScores(wuxing1: any, wuxing2: any, bazi1: any, bazi2: any) {
    // 基于五行和八字配置计算各方面得分
    const baseScore = 60

    return {
      love_score: Math.round(baseScore + (this.calculateWuxingCompatibility(wuxing1, wuxing2) - 60) * 0.6),
      career_score: Math.round(baseScore + (this.calculateWuxingCompatibility(wuxing1, wuxing2) - 60) * 0.4),
      wealth_score: Math.round(baseScore + (this.calculateWuxingCompatibility(wuxing1, wuxing2) - 60) * 0.5),
      health_score: Math.round(baseScore + (this.calculateWuxingCompatibility(wuxing1, wuxing2) - 60) * 0.3),
      family_score: Math.round(baseScore + (this.calculateWuxingCompatibility(wuxing1, wuxing2) - 60) * 0.7)
    }
  }
}