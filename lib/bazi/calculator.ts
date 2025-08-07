import { 
  BaziChart, 
  WuXingAnalysis, 
  DayunPeriod, 
  WuXingElement,
  TIANGAN, 
  DIZHI, 
  WUXING_MAP,
  TianganChar,
  DizhiChar 
} from './types'

export class BaziCalculator {
  /**
   * 计算真太阳时
   * @param date 标准时间
   * @param longitude 经度
   * @returns 真太阳时
   */
  static calculateSolarTime(date: Date, longitude: number): Date {
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date provided')
    }
    
    if (longitude < -180 || longitude > 180) {
      throw new Error('Invalid longitude')
    }

    // 计算时差：每15度经度相差1小时
    // 中国标准时间基于东经120度
    const standardLongitude = 120
    const timeDifference = (longitude - standardLongitude) / 15 // 小时差
    
    const solarTime = new Date(date)
    solarTime.setTime(solarTime.getTime() + timeDifference * 60 * 60 * 1000)
    
    return solarTime
  }

  /**
   * 生成八字
   * @param solarTime 真太阳时
   * @returns 八字命盘
   */
  static generateBazi(solarTime: Date): BaziChart {
    if (isNaN(solarTime.getTime())) {
      throw new Error('Invalid date provided')
    }

    const year = solarTime.getFullYear()
    const month = solarTime.getMonth() + 1
    const day = solarTime.getDate()
    const hour = solarTime.getHours()

    return {
      year_ganzhi: this.calculateYearGanzhi(year),
      month_ganzhi: this.calculateMonthGanzhi(year, month),
      day_ganzhi: this.calculateDayGanzhi(solarTime),
      hour_ganzhi: this.calculateHourGanzhi(hour, this.calculateDayGanzhi(solarTime))
    }
  }

  /**
   * 分析五行强弱
   * @param bazi 八字命盘
   * @returns 五行分析结果
   */
  static analyzeWuXing(bazi: BaziChart): WuXingAnalysis {
    // 验证输入格式
    const ganzhiPattern = /^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/
    if (!ganzhiPattern.test(bazi.year_ganzhi) || 
        !ganzhiPattern.test(bazi.month_ganzhi) ||
        !ganzhiPattern.test(bazi.day_ganzhi) || 
        !ganzhiPattern.test(bazi.hour_ganzhi)) {
      throw new Error('Invalid ganzhi format')
    }

    const elementCount = {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0
    }

    // 统计四柱中每个字符的五行
    const allChars = [
      bazi.year_ganzhi[0], bazi.year_ganzhi[1],  // 年柱天干地支
      bazi.month_ganzhi[0], bazi.month_ganzhi[1], // 月柱天干地支
      bazi.day_ganzhi[0], bazi.day_ganzhi[1],     // 日柱天干地支
      bazi.hour_ganzhi[0], bazi.hour_ganzhi[1]    // 时柱天干地支
    ]

    allChars.forEach(char => {
      const element = WUXING_MAP[char as keyof typeof WUXING_MAP]
      if (element) {
        elementCount[element]++
      }
    })

    // 找出最强和最弱的五行
    let strongest: WuXingElement = 'wood'
    let weakest: WuXingElement = 'wood'
    let maxCount = elementCount.wood
    let minCount = elementCount.wood

    Object.entries(elementCount).forEach(([element, count]) => {
      if (count > maxCount) {
        maxCount = count
        strongest = element as WuXingElement
      }
      if (count < minCount) {
        minCount = count
        weakest = element as WuXingElement
      }
    })

    // 计算百分比
    const total = Object.values(elementCount).reduce((sum, count) => sum + count, 0)
    const percentages = {
      wood: (elementCount.wood / total) * 100,
      fire: (elementCount.fire / total) * 100,
      earth: (elementCount.earth / total) * 100,
      metal: (elementCount.metal / total) * 100,
      water: (elementCount.water / total) * 100
    }

    return {
      ...elementCount,
      strongest,
      weakest,
      percentages
    }
  }

  /**
   * 计算大运
   * @param bazi 八字命盘
   * @param birthDate 出生日期
   * @param gender 性别
   * @returns 大运期间数组
   */
  static calculateDayun(bazi: BaziChart, birthDate: Date, gender: 'male' | 'female'): DayunPeriod[] {
    const periods: DayunPeriod[] = []
    
    // 根据阴阳年和性别确定顺逆
    const yearTiangan = bazi.year_ganzhi[0] as TianganChar
    const yearIndex = TIANGAN.indexOf(yearTiangan)
    const isYangYear = yearIndex % 2 === 0
    
    // 男逢阳年顺排，阴年逆排；女逢阳年逆排，阴年顺排
    const isForward = (gender === 'male' && isYangYear) || (gender === 'female' && !isYangYear)
    
    // 从月柱开始排大运
    const monthTiangan = bazi.month_ganzhi[0] as TianganChar
    const monthDizhi = bazi.month_ganzhi[1] as DizhiChar
    
    let tianganIndex = TIANGAN.indexOf(monthTiangan)
    let dizhiIndex = DIZHI.indexOf(monthDizhi)
    
    // 起运年龄（简化计算，实际需要根据节气精确计算）
    let startAge = gender === 'male' ? 8 : 7
    
    for (let i = 0; i < 8; i++) {
      // 计算当前大运的干支
      if (isForward) {
        tianganIndex = (tianganIndex + 1) % 10
        dizhiIndex = (dizhiIndex + 1) % 12
      } else {
        tianganIndex = (tianganIndex - 1 + 10) % 10
        dizhiIndex = (dizhiIndex - 1 + 12) % 12
      }
      
      const currentGanzhi = TIANGAN[tianganIndex] + DIZHI[dizhiIndex]
      
      periods.push({
        sequence: i + 1,
        start_age: startAge,
        end_age: startAge + 9,
        ganzhi: currentGanzhi,
        description: `第${i + 1}步大运：${currentGanzhi}`
      })
      
      startAge += 10
    }
    
    return periods
  }

  /**
   * 确定用神
   * @param wuxingAnalysis 五行分析
   * @param dayMaster 日主天干
   * @returns 用神
   */
  static determinYongshen(wuxingAnalysis: WuXingAnalysis, dayMaster: string): string {
    const dayMasterElement = WUXING_MAP[dayMaster as keyof typeof WUXING_MAP]
    
    if (!dayMasterElement) {
      throw new Error('Invalid day master')
    }

    // 简化的用神判断逻辑
    const dayMasterStrength = wuxingAnalysis[dayMasterElement]
    const total = Object.values(wuxingAnalysis).slice(0, 5).reduce((sum, count) => sum + count, 0)
    const averageStrength = total / 5

    if (dayMasterStrength < averageStrength) {
      // 日主偏弱，需要生扶
      switch (dayMasterElement) {
        case 'wood': return '水' // 水生木
        case 'fire': return '木' // 木生火
        case 'earth': return '火' // 火生土
        case 'metal': return '土' // 土生金
        case 'water': return '金' // 金生水
        default: return '水'
      }
    } else {
      // 日主偏强，需要泄耗
      switch (dayMasterElement) {
        case 'wood': return '火' // 木生火，泄木气
        case 'fire': return '土' // 火生土，泄火气
        case 'earth': return '金' // 土生金，泄土气
        case 'metal': return '水' // 金生水，泄金气
        case 'water': return '木' // 水生木，泄水气
        default: return '火'
      }
    }
  }

  // 私有辅助方法

  /**
   * 计算年柱干支
   * @param year 年份
   * @returns 年柱干支
   */
  private static calculateYearGanzhi(year: number): string {
    // 以甲子年为基准（1984年为甲子年）
    // 注意：传统命理以立春为界，这里简化处理
    const baseYear = 1984
    const yearOffset = year - baseYear
    
    const tianganIndex = ((yearOffset % 10) + 10) % 10
    const dizhiIndex = ((yearOffset % 12) + 12) % 12
    
    return TIANGAN[tianganIndex] + DIZHI[dizhiIndex]
  }

  /**
   * 计算月柱干支
   * @param year 年份
   * @param month 月份
   * @returns 月柱干支
   */
  private static calculateMonthGanzhi(year: number, month: number): string {
    // 简化计算，实际需要根据节气确定月柱
    const yearTianganIndex = TIANGAN.indexOf(this.calculateYearGanzhi(year)[0] as TianganChar)
    
    // 月柱天干的起法：甲己之年丙作首
    const monthTianganBase = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0] // 对应甲年起丙、乙年起戊...
    const monthTianganIndex = (monthTianganBase[yearTianganIndex] + month - 1) % 10
    
    // 月柱地支：正月建寅
    const monthDizhiIndex = (month + 1) % 12
    
    return TIANGAN[monthTianganIndex] + DIZHI[monthDizhiIndex]
  }

  /**
   * 计算日柱干支
   * @param date 日期
   * @returns 日柱干支
   */
  private static calculateDayGanzhi(date: Date): string {
    // 以1900年1月1日为甲戌日进行推算（修正：1900年1月1日实际是庚戌日）
    const baseDate = new Date(1900, 0, 1)
    const daysDiff = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // 1900年1月1日是庚戌日，庚在天干中是6，戌在地支中是10
    const baseTianganIndex = 6
    const baseDizhiIndex = 10
    
    const tianganIndex = ((baseTianganIndex + daysDiff) % 10 + 10) % 10
    const dizhiIndex = ((baseDizhiIndex + daysDiff) % 12 + 12) % 12
    
    return TIANGAN[tianganIndex] + DIZHI[dizhiIndex]
  }

  /**
   * 计算时柱干支
   * @param hour 小时
   * @param dayGanzhi 日柱干支
   * @returns 时柱干支
   */
  private static calculateHourGanzhi(hour: number, dayGanzhi: string): string {
    // 确定时辰地支（修正时辰对应关系）
    // 子时23-1，丑时1-3，寅时3-5，卯时5-7，辰时7-9，巳时9-11
    // 午时11-13，未时13-15，申时15-17，酉时17-19，戌时19-21，亥时21-23
    let hourDizhiIndex: number
    if (hour >= 23 || hour < 1) hourDizhiIndex = 0  // 子时
    else if (hour >= 1 && hour < 3) hourDizhiIndex = 1   // 丑时
    else if (hour >= 3 && hour < 5) hourDizhiIndex = 2   // 寅时
    else if (hour >= 5 && hour < 7) hourDizhiIndex = 3   // 卯时
    else if (hour >= 7 && hour < 9) hourDizhiIndex = 4   // 辰时
    else if (hour >= 9 && hour < 11) hourDizhiIndex = 5  // 巳时
    else if (hour >= 11 && hour < 13) hourDizhiIndex = 6 // 午时
    else if (hour >= 13 && hour < 15) hourDizhiIndex = 7 // 未时
    else if (hour >= 15 && hour < 17) hourDizhiIndex = 8 // 申时
    else if (hour >= 17 && hour < 19) hourDizhiIndex = 9 // 酉时
    else if (hour >= 19 && hour < 21) hourDizhiIndex = 10 // 戌时
    else hourDizhiIndex = 11 // 亥时
    
    // 时柱天干的起法：甲己起甲子，乙庚起丙子...
    const dayTianganIndex = TIANGAN.indexOf(dayGanzhi[0] as TianganChar)
    const hourTianganBase = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8] // 对应甲日起甲子、乙日起丙子...
    const hourTianganIndex = (hourTianganBase[dayTianganIndex] + hourDizhiIndex) % 10
    
    return TIANGAN[hourTianganIndex] + DIZHI[hourDizhiIndex]
  }
}