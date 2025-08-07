import { BaziCalculator } from './calculator'
import { BaziChart, WuXingAnalysis } from './types'

describe('BaziCalculator', () => {
  describe('calculateSolarTime', () => {
    it('should calculate correct solar time for Beijing', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      const longitude = 116.4074 // 北京经度
      
      const result = BaziCalculator.calculateSolarTime(date, longitude)
      
      expect(result).toBeInstanceOf(Date)
      // 北京在东八区，经度116.4074度，与标准时间差约为 (116.4074 - 120) / 15 = -0.24小时
      expect(result.getUTCHours()).toBe(11) // 12 - 0.24 ≈ 11点多
    })

    it('should handle timezone offset correctly for different cities', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      const shanghaiLongitude = 121.4737 // 上海经度
      
      const result = BaziCalculator.calculateSolarTime(date, shanghaiLongitude)
      
      expect(result).toBeInstanceOf(Date)
      // 上海经度121.4737，与标准120度的差异约为 1.4737/15 = 0.098小时 ≈ 6分钟
      const timeDiffMinutes = Math.abs(result.getTime() - date.getTime()) / (1000 * 60)
      expect(timeDiffMinutes).toBeCloseTo(6, 0)
    })

    it('should handle negative longitude (western cities)', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      const longitude = -120 // 西经120度
      
      const result = BaziCalculator.calculateSolarTime(date, longitude)
      
      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).not.toBe(date.getTime())
    })
  })

  describe('generateBazi', () => {
    it('should generate valid bazi for known date', () => {
      const solarTime = new Date('1990-06-15T14:30:00')
      
      const bazi = BaziCalculator.generateBazi(solarTime)
      
      expect(bazi).toHaveProperty('year_ganzhi')
      expect(bazi).toHaveProperty('month_ganzhi')
      expect(bazi).toHaveProperty('day_ganzhi')
      expect(bazi).toHaveProperty('hour_ganzhi')
      
      // 验证干支格式 (天干地支组合)
      expect(bazi.year_ganzhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/)
      expect(bazi.month_ganzhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/)
      expect(bazi.day_ganzhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/)
      expect(bazi.hour_ganzhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/)
    })

    it('should generate consistent results for same input', () => {
      const solarTime = new Date('1990-06-15T14:30:00')
      
      const bazi1 = BaziCalculator.generateBazi(solarTime)
      const bazi2 = BaziCalculator.generateBazi(solarTime)
      
      expect(bazi1).toEqual(bazi2)
    })

    it('should generate different results for different dates', () => {
      const date1 = new Date('1990-06-15T14:30:00')
      const date2 = new Date('1991-06-15T14:30:00')
      
      const bazi1 = BaziCalculator.generateBazi(date1)
      const bazi2 = BaziCalculator.generateBazi(date2)
      
      expect(bazi1.year_ganzhi).not.toBe(bazi2.year_ganzhi)
    })

    it('should handle leap years correctly', () => {
      const leapYearDate = new Date('2024-02-29T12:00:00') // 闰年2月29日
      
      const bazi = BaziCalculator.generateBazi(leapYearDate)
      
      expect(bazi).toHaveProperty('year_ganzhi')
      expect(bazi).toHaveProperty('month_ganzhi')
      expect(bazi).toHaveProperty('day_ganzhi')
      expect(bazi).toHaveProperty('hour_ganzhi')
    })
  })

  describe('analyzeWuXing', () => {
    it('should analyze five elements strength correctly', () => {
      const mockBazi: BaziChart = {
        year_ganzhi: '庚午', // 金火
        month_ganzhi: '壬午', // 水火
        day_ganzhi: '甲子',   // 木水
        hour_ganzhi: '丙寅'   // 火木
      }

      const analysis = BaziCalculator.analyzeWuXing(mockBazi)
      
      expect(analysis).toHaveProperty('wood')
      expect(analysis).toHaveProperty('fire')
      expect(analysis).toHaveProperty('earth')
      expect(analysis).toHaveProperty('metal')
      expect(analysis).toHaveProperty('water')
      
      // 验证五行计数
      expect(analysis.wood).toBeGreaterThan(0) // 甲、寅
      expect(analysis.fire).toBeGreaterThan(0) // 午、丙
      expect(analysis.water).toBeGreaterThan(0) // 壬、子
      expect(analysis.metal).toBeGreaterThan(0) // 庚
      
      // 总数应该为8 (4个天干 + 4个地支)
      const total = analysis.wood + analysis.fire + analysis.earth + analysis.metal + analysis.water
      expect(total).toBe(8)
    })

    it('should identify strongest and weakest elements', () => {
      const mockBazi: BaziChart = {
        year_ganzhi: '甲寅', // 木木
        month_ganzhi: '乙卯', // 木木  
        day_ganzhi: '丙午', // 火火
        hour_ganzhi: '丁巳'  // 火火
      }

      const analysis = BaziCalculator.analyzeWuXing(mockBazi)
      
      expect(analysis.strongest).toBeDefined()
      expect(analysis.weakest).toBeDefined()
      expect(['wood', 'fire', 'earth', 'metal', 'water']).toContain(analysis.strongest)
      expect(['wood', 'fire', 'earth', 'metal', 'water']).toContain(analysis.weakest)
      // 在这个例子中，木和火最多，应该是strongest
      expect(['wood', 'fire']).toContain(analysis.strongest)
    })

    it('should calculate element percentages', () => {
      const mockBazi: BaziChart = {
        year_ganzhi: '庚午',
        month_ganzhi: '壬午', 
        day_ganzhi: '甲子',
        hour_ganzhi: '丙寅'
      }

      const analysis = BaziCalculator.analyzeWuXing(mockBazi)
      
      expect(analysis.percentages).toBeDefined()
      expect(analysis.percentages.wood).toBeGreaterThanOrEqual(0)
      expect(analysis.percentages.wood).toBeLessThanOrEqual(100)
      
      // 所有百分比之和应该等于100
      const totalPercentage = Object.values(analysis.percentages).reduce((sum, p) => sum + p, 0)
      expect(totalPercentage).toBeCloseTo(100, 1)
    })
  })

  describe('calculateDayun', () => {
    it('should calculate correct dayun periods', () => {
      const mockBazi: BaziChart = {
        year_ganzhi: '庚午',
        month_ganzhi: '壬午',
        day_ganzhi: '甲子',
        hour_ganzhi: '丙寅'
      }
      const birthDate = new Date('1990-06-15')
      const gender = 'male' // 男性

      const dayunPeriods = BaziCalculator.calculateDayun(mockBazi, birthDate, gender)
      
      expect(dayunPeriods).toHaveLength(8) // 通常计算8步大运
      
      // 验证大运期间的连续性
      for (let i = 0; i < dayunPeriods.length - 1; i++) {
        expect(dayunPeriods[i].end_age).toBe(dayunPeriods[i + 1].start_age - 1)
      }
      
      // 验证第一步大运的开始年龄
      expect(dayunPeriods[0].start_age).toBeGreaterThan(0)
      expect(dayunPeriods[0].start_age).toBeLessThan(20)
      
      // 验证每步大运都有干支
      dayunPeriods.forEach(period => {
        expect(period.ganzhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/)
      })
    })

    it('should handle different genders correctly', () => {
      const mockBazi: BaziChart = {
        year_ganzhi: '庚午',
        month_ganzhi: '壬午',
        day_ganzhi: '甲子',
        hour_ganzhi: '丙寅'
      }
      const birthDate = new Date('1990-06-15')

      const maleDayun = BaziCalculator.calculateDayun(mockBazi, birthDate, 'male')
      const femaleDayun = BaziCalculator.calculateDayun(mockBazi, birthDate, 'female')
      
      // 男女大运方向可能不同
      expect(maleDayun).toHaveLength(femaleDayun.length)
      
      // 但起运年龄和干支序列可能不同
      expect(maleDayun[0].start_age).toBeDefined()
      expect(femaleDayun[0].start_age).toBeDefined()
    })
  })

  describe('determinYongshen', () => {
    it('should determine correct yongshen for weak day master', () => {
      const mockAnalysis: WuXingAnalysis = {
        wood: 1, // 日主为木，较弱
        fire: 2,
        earth: 3,
        metal: 2,
        water: 0,
        strongest: 'earth',
        weakest: 'water',
        percentages: {
          wood: 12.5,
          fire: 25,
          earth: 37.5,
          metal: 25,
          water: 0
        }
      }
      const dayMaster = '甲' // 甲木

      const yongshen = BaziCalculator.determinYongshen(mockAnalysis, dayMaster)
      
      // 木弱的情况下，通常用水生木或木帮身
      expect(['水', '木']).toContain(yongshen)
    })

    it('should determine correct yongshen for strong day master', () => {
      const mockAnalysis: WuXingAnalysis = {
        wood: 4, // 日主为木，很强
        fire: 1,
        earth: 1,
        metal: 1,
        water: 1,
        strongest: 'wood',
        weakest: 'fire',
        percentages: {
          wood: 50,
          fire: 12.5,
          earth: 12.5,
          metal: 12.5,
          water: 12.5
        }
      }
      const dayMaster = '甲' // 甲木

      const yongshen = BaziCalculator.determinYongshen(mockAnalysis, dayMaster)
      
      // 木强的情况下，通常用火泄木气或金克木
      expect(['火', '金']).toContain(yongshen)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle invalid dates gracefully', () => {
      const invalidDate = new Date('invalid')
      
      expect(() => {
        BaziCalculator.generateBazi(invalidDate)
      }).toThrow('Invalid date provided')
    })

    it('should handle extreme longitude values', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      const extremeLongitude = 200 // 超出正常范围
      
      expect(() => {
        BaziCalculator.calculateSolarTime(date, extremeLongitude)
      }).toThrow('Invalid longitude')
    })

    it('should validate bazi input for wuxing analysis', () => {
      const invalidBazi = {
        year_ganzhi: '无效',
        month_ganzhi: '无效',
        day_ganzhi: '无效',
        hour_ganzhi: '无效'
      } as BaziChart

      expect(() => {
        BaziCalculator.analyzeWuXing(invalidBazi)
      }).toThrow('Invalid ganzhi format')
    })
  })
})