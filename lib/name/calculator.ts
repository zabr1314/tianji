/**
 * 姓名学分析计算器
 * 基于传统姓名学理论，分析姓名的五行配置、数理吉凶、音韵特点等
 */

// 汉字五行对照表（简化版）
const CHAR_WUXING: { [key: string]: string } = {
  // 木属性字
  '甲': '木', '乙': '木', '寅': '木', '卯': '木', '东': '木', '春': '木', '青': '木', '绿': '木',
  '林': '木', '森': '木', '树': '木', '木': '木', '松': '木', '柏': '木', '梅': '木', '兰': '木',
  '竹': '木', '菊': '木', '花': '木', '草': '木', '叶': '木', '根': '木', '枝': '木', '果': '木',
  '建': '木', '健': '木', '康': '木', '强': '木', '军': '木', '君': '木', '杰': '木', '楠': '木',
  
  // 火属性字
  '丙': '火', '丁': '火', '巳': '火', '午': '火', '南': '火', '夏': '火', '红': '火', '赤': '火',
  '火': '火', '炎': '火', '焰': '火', '燃': '火', '烈': '火', '热': '火', '温': '火', '暖': '火',
  '明': '火', '亮': '火', '光': '火', '辉': '火', '灿': '火', '烂': '火', '阳': '火', '昌': '火',
  '晨': '火', '晓': '火', '旭': '火', '日': '火', '星': '火', '月': '火', '电': '火', '雷': '火',
  
  // 土属性字
  '戊': '土', '己': '土', '辰': '土', '戌': '土', '丑': '土', '未': '土', '中': '土', '央': '土',
  '土': '土', '地': '土', '山': '土', '岩': '土', '石': '土', '沙': '土', '尘': '土', '坤': '土',
  '城': '土', '墙': '土', '堡': '土', '垒': '土', '坚': '土', '固': '土', '厚': '土', '重': '土',
  '安': '土', '定': '土', '稳': '土', '静': '土', '田': '土', '里': '土', '村': '土', '乡': '土',
  
  // 金属性字
  '庚': '金', '辛': '金', '申': '金', '酉': '金', '西': '金', '秋': '金', '白': '金', '银': '金',
  '金': '金', '铁': '金', '钢': '金', '铜': '金', '锡': '金', '铅': '金', '铝': '金', '锌': '金',
  '刀': '金', '剑': '金', '刃': '金', '锋': '金', '利': '金', '尖': '金', '锐': '金', '钻': '金',
  '钱': '金', '财': '金', '富': '金', '贵': '金', '宝': '金', '珠': '金', '玉': '金', '钰': '金',
  
  // 水属性字
  '壬': '水', '癸': '水', '子': '水', '亥': '水', '北': '水', '冬': '水', '黑': '水', '蓝': '水',
  '水': '水', '江': '水', '河': '水', '海': '水', '湖': '水', '池': '水', '泉': '水', '溪': '水',
  '雨': '水', '雪': '水', '霜': '水', '露': '水', '雾': '水', '云': '水', '波': '水', '浪': '水',
  '流': '水', '润': '水', '清': '水', '洁': '水', '净': '水', '纯': '水', '澄': '水', '深': '水'
}

// 数理吉凶表（1-81数）
const NUMBER_FORTUNE: { [key: number]: { fortune: string, meaning: string } } = {
  1: { fortune: '大吉', meaning: '天赐好运，万事顺利' },
  2: { fortune: '凶', meaning: '分离破败，困苦不堪' },
  3: { fortune: '大吉', meaning: '立身出世，家门隆昌' },
  4: { fortune: '凶', meaning: '破败凶变，孤独悲惨' },
  5: { fortune: '大吉', meaning: '福禄长寿，阴阳和合' },
  6: { fortune: '大吉', meaning: '天德地祥，富贵安康' },
  7: { fortune: '吉', meaning: '刚毅果断，勇往直前' },
  8: { fortune: '大吉', meaning: '意志坚刚，克己助人' },
  9: { fortune: '凶', meaning: '兴尽凶始，困苦不绝' },
  10: { fortune: '凶', meaning: '乌云遮月，暗淡无光' },
  11: { fortune: '大吉', meaning: '草木逢春，雨露沾恩' },
  12: { fortune: '凶', meaning: '薄弱无力，孤立无援' },
  13: { fortune: '大吉', meaning: '天赋吉运，能得人望' },
  14: { fortune: '凶', meaning: '沦落天涯，失意烦闷' },
  15: { fortune: '大吉', meaning: '福寿双全，富贵荣誉' },
  16: { fortune: '大吉', meaning: '贵人得助，天乙贵人' },
  17: { fortune: '吉', meaning: '刚强不屈，突破万难' },
  18: { fortune: '大吉', meaning: '有志竟成，内外有运' },
  19: { fortune: '凶', meaning: '风云蔽日，辛苦重来' },
  20: { fortune: '凶', meaning: '实而不华，深藏不露' },
  21: { fortune: '大吉', meaning: '先历困苦，后得幸福' },
  22: { fortune: '凶', meaning: '秋草逢霜，怀才不遇' },
  23: { fortune: '大吉', meaning: '旭日东升，名显四方' },
  24: { fortune: '大吉', meaning: '家门余庆，金钱丰盈' },
  25: { fortune: '吉', meaning: '英俊敏捷，才能奇特' },
  26: { fortune: '凶', meaning: '变怪奇异，英雄豪杰' },
  27: { fortune: '凶', meaning: '一成一败，波澜重叠' },
  28: { fortune: '凶', meaning: '鱼临旱地，不得其时' },
  29: { fortune: '吉', meaning: '如龙得云，青云直上' },
  30: { fortune: '半吉', meaning: '一成一败，得失参半' },
  31: { fortune: '大吉', meaning: '此数大吉，名利双收' },
  32: { fortune: '大吉', meaning: '龙在池中，风云际会' },
  33: { fortune: '大吉', meaning: '意气风发，人望具备' },
  34: { fortune: '凶', meaning: '灾难不绝，不可用此数' },
  35: { fortune: '吉', meaning: '温和平静，智达通畅' },
  36: { fortune: '凶', meaning: '波澜重叠，常陷穷困' },
  37: { fortune: '大吉', meaning: '逢凶化吉，吉人天相' },
  38: { fortune: '半吉', meaning: '名虽可得，利难获取' },
  39: { fortune: '大吉', meaning: '云开见日，指日可待' },
  40: { fortune: '半吉', meaning: '一盛一衰，浮沉不定' },
  41: { fortune: '大吉', meaning: '天赋吉运，德望兼备' },
  42: { fortune: '凶', meaning: '事业不专，十九不成' },
  43: { fortune: '凶', meaning: '雨夜之花，外祥内苦' },
  44: { fortune: '凶', meaning: '须眉难展，事不如意' },
  45: { fortune: '大吉', meaning: '新生泰和，顺风扬帆' },
  46: { fortune: '凶', meaning: '罗网密布，难逃厄运' },
  47: { fortune: '大吉', meaning: '得贵人助，可成大业' },
  48: { fortune: '大吉', meaning: '美华丰实，鹤立鸡群' }
}

export interface NameAnalysisResult {
  name: string
  surname: string // 姓
  given_name: string // 名
  total_strokes: number // 总笔画
  surname_strokes: number // 姓笔画
  given_strokes: number // 名笔画
  wuxing_analysis: {
    surname_wuxing: string // 姓的五行
    given_wuxing: string[] // 名各字的五行
    overall_wuxing: string // 整体五行属性
    wuxing_balance: {
      wood: number
      fire: number
      earth: number
      metal: number
      water: number
    }
    wuxing_compatibility: string // 五行配合情况
  }
  numerology: {
    tiange: number // 天格（姓+1）
    dige: number // 地格（名的笔画数）
    renge: number // 人格（姓末字+名首字）
    waige: number // 外格（总格-人格+1）
    zongge: number // 总格（总笔画）
    tiange_fortune: string // 天格吉凶
    dige_fortune: string // 地格吉凶
    renge_fortune: string // 人格吉凶
    waige_fortune: string // 外格吉凶
    zongge_fortune: string // 总格吉凶
  }
  phonetics: {
    tones: number[] // 声调组合
    tone_harmony: string // 音调和谐度
    pronunciation_difficulty: string // 发音难易度
    rhyme_quality: string // 韵律美感
  }
  meanings: {
    positive_meanings: string[] // 积极寓意
    potential_issues: string[] // 潜在问题
    cultural_connotations: string[] // 文化内涵
  }
  scores: {
    wuxing_score: number // 五行评分 0-100
    numerology_score: number // 数理评分 0-100
    phonetic_score: number // 音韵评分 0-100
    meaning_score: number // 寓意评分 0-100
    overall_score: number // 综合评分 0-100
  }
  suggestions: {
    strengths: string[] // 优势特点
    weaknesses: string[] // 不足之处
    improvement_suggestions: string[] // 改进建议
    lucky_directions: string[] // 有利方位
    suitable_careers: string[] // 适合职业
  }
}

export class NameAnalysisCalculator {
  /**
   * 分析姓名
   * @param fullName 完整姓名
   * @returns 姓名分析结果
   */
  static analyzeChineseName(fullName: string): NameAnalysisResult {
    if (!fullName || fullName.length < 2) {
      throw new Error('姓名长度不能少于2个字')
    }

    // 分离姓和名
    const surname = fullName.charAt(0)
    const givenName = fullName.substring(1)
    
    // 计算笔画数（简化处理，实际应查康熙字典）
    const surnameStrokes = this.getCharacterStrokes(surname)
    const givenStrokes = this.getNameStrokes(givenName)
    const totalStrokes = surnameStrokes + givenStrokes

    // 五行分析
    const wuxingAnalysis = this.analyzeWuxing(surname, givenName)
    
    // 数理分析
    const numerology = this.analyzeNumerology(surnameStrokes, givenStrokes, totalStrokes)
    
    // 音韵分析
    const phonetics = this.analyzePhonetics(fullName)
    
    // 寓意分析
    const meanings = this.analyzeMeanings(surname, givenName)
    
    // 计算各项评分
    const scores = this.calculateScores(wuxingAnalysis, numerology, phonetics, meanings)
    
    // 生成建议
    const suggestions = this.generateSuggestions(wuxingAnalysis, numerology, meanings, scores)

    return {
      name: fullName,
      surname,
      given_name: givenName,
      total_strokes: totalStrokes,
      surname_strokes: surnameStrokes,
      given_strokes: givenStrokes,
      wuxing_analysis: wuxingAnalysis,
      numerology,
      phonetics,
      meanings,
      scores,
      suggestions
    }
  }

  /**
   * 获取单个汉字的笔画数（简化版）
   */
  private static getCharacterStrokes(char: string): number {
    // 简化的笔画数计算，实际应查康熙字典
    const commonStrokes: { [key: string]: number } = {
      '王': 4, '李': 7, '张': 11, '刘': 15, '陈': 16, '杨': 13, '赵': 14, '黄': 12, '周': 8, '吴': 7,
      '徐': 10, '孙': 10, '胡': 9, '朱': 6, '高': 10, '林': 8, '何': 7, '郭': 15, '马': 10, '罗': 19,
      '梁': 11, '宋': 7, '郑': 19, '谢': 17, '韩': 17, '唐': 10, '冯': 12, '于': 3, '董': 15, '萧': 18,
      '明': 8, '华': 14, '强': 12, '伟': 11, '峰': 10, '磊': 15, '军': 9, '建': 9, '国': 11, '志': 14,
      '勇': 9, '杰': 12, '涛': 18, '海': 11, '亮': 9, '超': 12, '辉': 15, '宇': 6, '鹏': 19, '斌': 12,
      '敏': 11, '静': 16, '丽': 19, '娟': 10, '秀': 7, '慧': 15, '洁': 16, '雯': 12, '颖': 16, '红': 9,
      '玲': 10, '芳': 10, '婷': 12, '霞': 17, '燕': 16, '莉': 13, '萍': 14, '蓉': 16, '倩': 10, '雪': 11
    }
    
    return commonStrokes[char] || Math.ceil(Math.random() * 10) + 5 // 简化处理
  }

  /**
   * 获取名字部分的总笔画数
   */
  private static getNameStrokes(givenName: string): number {
    let total = 0
    for (const char of givenName) {
      total += this.getCharacterStrokes(char)
    }
    return total
  }

  /**
   * 分析五行配置
   */
  private static analyzeWuxing(surname: string, givenName: string): any {
    const surnameWuxing = CHAR_WUXING[surname] || '土' // 默认为土
    const givenWuxing: string[] = []
    
    for (const char of givenName) {
      givenWuxing.push(CHAR_WUXING[char] || '土')
    }

    // 计算五行分布
    const wuxingBalance = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
    
    // 姓的五行权重为2
    this.addWuxingWeight(wuxingBalance, surnameWuxing, 2)
    
    // 名的每个字权重为1
    givenWuxing.forEach(wuxing => {
      this.addWuxingWeight(wuxingBalance, wuxing, 1)
    })

    // 分析五行配合
    const compatibility = this.analyzeWuxingCompatibility(surnameWuxing, givenWuxing)
    
    // 确定整体五行属性
    const overallWuxing = this.getStrongestWuxing(wuxingBalance)

    return {
      surname_wuxing: surnameWuxing,
      given_wuxing: givenWuxing,
      overall_wuxing: overallWuxing,
      wuxing_balance: wuxingBalance,
      wuxing_compatibility: compatibility
    }
  }

  /**
   * 添加五行权重
   */
  private static addWuxingWeight(balance: any, wuxing: string, weight: number): void {
    const wuxingMap: { [key: string]: keyof typeof balance } = {
      '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water'
    }
    
    const key = wuxingMap[wuxing]
    if (key) {
      balance[key] += weight
    }
  }

  /**
   * 获取最强的五行
   */
  private static getStrongestWuxing(balance: any): string {
    const wuxingMap = {
      wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
    }
    
    let maxKey = 'earth'
    let maxValue = balance.earth
    
    Object.keys(balance).forEach(key => {
      if (balance[key] > maxValue) {
        maxValue = balance[key]
        maxKey = key
      }
    })
    
    return wuxingMap[maxKey as keyof typeof wuxingMap]
  }

  /**
   * 分析五行配合情况
   */
  private static analyzeWuxingCompatibility(surnameWuxing: string, givenWuxing: string[]): string {
    const generationCycle: { [key: string]: string } = {
      '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
    }
    
    let hasGeneration = false
    let hasDestruction = false
    
    givenWuxing.forEach(wuxing => {
      if (generationCycle[surnameWuxing] === wuxing || generationCycle[wuxing] === surnameWuxing) {
        hasGeneration = true
      }
      
      const destructionCycle: { [key: string]: string } = {
        '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
      }
      
      if (destructionCycle[surnameWuxing] === wuxing || destructionCycle[wuxing] === surnameWuxing) {
        hasDestruction = true
      }
    })
    
    if (hasGeneration && !hasDestruction) return '相生和谐'
    if (hasDestruction && !hasGeneration) return '相克不利'
    if (hasGeneration && hasDestruction) return '生克并存'
    return '五行平衡'
  }

  /**
   * 分析数理吉凶
   */
  private static analyzeNumerology(surnameStrokes: number, givenStrokes: number, totalStrokes: number): any {
    // 计算五格
    const tiange = surnameStrokes + 1 // 天格（单姓加1）
    const dige = givenStrokes // 地格
    const renge = Math.floor((surnameStrokes + givenStrokes) / 2) + 1 // 人格（简化计算）
    const zongge = totalStrokes // 总格
    const waige = zongge - renge + 1 // 外格

    // 查询吉凶
    const getFortuneInfo = (num: number) => {
      const adjustedNum = ((num - 1) % 81) + 1 // 确保在1-81范围内
      return NUMBER_FORTUNE[adjustedNum] || { fortune: '平', meaning: '平常无奇' }
    }

    return {
      tiange,
      dige,
      renge,
      waige,
      zongge,
      tiange_fortune: getFortuneInfo(tiange).fortune,
      dige_fortune: getFortuneInfo(dige).fortune,
      renge_fortune: getFortuneInfo(renge).fortune,
      waige_fortune: getFortuneInfo(waige).fortune,
      zongge_fortune: getFortuneInfo(zongge).fortune
    }
  }

  /**
   * 分析音韵特点
   */
  private static analyzePhonetics(fullName: string): any {
    // 简化的声调分析（实际需要拼音库支持）
    const tones = fullName.split('').map(() => Math.floor(Math.random() * 4) + 1)
    
    let toneHarmony = '和谐'
    if (tones.every(tone => tone === tones[0])) {
      toneHarmony = '单调'
    } else if (tones.includes(1) && tones.includes(4)) {
      toneHarmony = '富有变化'
    }

    const pronunciationDifficulty = fullName.length <= 3 ? '容易' : '一般'
    const rhymeQuality = Math.random() > 0.5 ? '优美' : '一般'

    return {
      tones,
      tone_harmony: toneHarmony,
      pronunciation_difficulty: pronunciationDifficulty,
      rhyme_quality: rhymeQuality
    }
  }

  /**
   * 分析名字寓意
   */
  private static analyzeMeanings(surname: string, givenName: string): any {
    const positiveChars = ['明', '华', '强', '伟', '杰', '慧', '美', '善', '贤', '智', '勇', '刚', '毅', '恒']
    const negativeChars = ['病', '死', '凶', '恶', '穷', '苦', '难', '愁', '忧', '悲', '哭', '泣']
    
    const positiveMeanings: string[] = []
    const potentialIssues: string[] = []
    const culturalConnotations: string[] = []

    // 检查积极字符
    for (const char of givenName) {
      if (positiveChars.includes(char)) {
        positiveMeanings.push(`"${char}"字寓意美好`)
      }
      if (negativeChars.includes(char)) {
        potentialIssues.push(`"${char}"字寓意不佳`)
      }
    }

    // 默认添加一些文化内涵
    culturalConnotations.push('体现了中华文化的深厚底蕴')
    culturalConnotations.push('承载着家族的美好期望')

    if (positiveMeanings.length === 0) {
      positiveMeanings.push('名字整体寓意积极向上')
    }

    return {
      positive_meanings: positiveMeanings,
      potential_issues: potentialIssues,
      cultural_connotations: culturalConnotations
    }
  }

  /**
   * 计算各项评分
   */
  private static calculateScores(wuxingAnalysis: any, numerology: any, phonetics: any, meanings: any): any {
    // 五行评分
    let wuxingScore = 60
    if (wuxingAnalysis.wuxing_compatibility === '相生和谐') wuxingScore += 20
    else if (wuxingAnalysis.wuxing_compatibility === '五行平衡') wuxingScore += 10
    else if (wuxingAnalysis.wuxing_compatibility === '相克不利') wuxingScore -= 15

    // 数理评分
    const fortuneScores = {
      '大吉': 20, '吉': 15, '半吉': 10, '平': 5, '凶': -10
    }
    
    let numerologyScore = 50
    numerologyScore += (fortuneScores[numerology.tiange_fortune as keyof typeof fortuneScores] || 0)
    numerologyScore += (fortuneScores[numerology.renge_fortune as keyof typeof fortuneScores] || 0)
    numerologyScore += (fortuneScores[numerology.zongge_fortune as keyof typeof fortuneScores] || 0)

    // 音韵评分
    let phoneticScore = 60
    if (phonetics.tone_harmony === '富有变化') phoneticScore += 15
    else if (phonetics.tone_harmony === '单调') phoneticScore -= 10
    if (phonetics.pronunciation_difficulty === '容易') phoneticScore += 10
    if (phonetics.rhyme_quality === '优美') phoneticScore += 15

    // 寓意评分
    let meaningScore = 70
    meaningScore += meanings.positive_meanings.length * 10
    meaningScore -= meanings.potential_issues.length * 15

    // 确保评分在0-100范围内
    wuxingScore = Math.max(0, Math.min(100, wuxingScore))
    numerologyScore = Math.max(0, Math.min(100, numerologyScore))
    phoneticScore = Math.max(0, Math.min(100, phoneticScore))
    meaningScore = Math.max(0, Math.min(100, meaningScore))

    const overallScore = Math.round(
      (wuxingScore * 0.3 + numerologyScore * 0.3 + phoneticScore * 0.2 + meaningScore * 0.2)
    )

    return {
      wuxing_score: wuxingScore,
      numerology_score: numerologyScore,
      phonetic_score: phoneticScore,
      meaning_score: meaningScore,
      overall_score: overallScore
    }
  }

  /**
   * 生成建议
   */
  private static generateSuggestions(wuxingAnalysis: any, numerology: any, meanings: any, scores: any): any {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const improvementSuggestions: string[] = []
    const luckyDirections: string[] = []
    const suitableCareers: string[] = []

    // 分析优势
    if (scores.wuxing_score >= 75) strengths.push('五行配置和谐')
    if (scores.numerology_score >= 75) strengths.push('数理格局优良')
    if (scores.phonetic_score >= 75) strengths.push('音韵优美动听')
    if (scores.meaning_score >= 75) strengths.push('寓意积极美好')

    // 分析不足
    if (scores.wuxing_score < 60) weaknesses.push('五行配置需要调和')
    if (scores.numerology_score < 60) weaknesses.push('数理格局有待改善')
    if (scores.phonetic_score < 60) weaknesses.push('音韵搭配可以优化')
    if (scores.meaning_score < 60) weaknesses.push('名字寓意需要加强')

    // 改进建议
    if (wuxingAnalysis.wuxing_compatibility === '相克不利') {
      improvementSuggestions.push('建议通过颜色、方位等方式调和五行')
    }
    if (scores.overall_score < 70) {
      improvementSuggestions.push('可考虑在合适时机进行改名')
    }

    // 有利方位（基于主要五行）
    const directionMap: { [key: string]: string[] } = {
      '木': ['东方', '东南方'], '火': ['南方', '西南方'], '土': ['中央', '东北方'],
      '金': ['西方', '西北方'], '水': ['北方', '东北方']
    }
    luckyDirections.push(...(directionMap[wuxingAnalysis.overall_wuxing] || ['东方']))

    // 适合职业（基于五行属性）
    const careerMap: { [key: string]: string[] } = {
      '木': ['教育', '文化', '出版', '园艺'], '火': ['电子', '能源', '娱乐', '广告'],
      '土': ['房地产', '建筑', '农业', '陶瓷'], '金': ['金融', '机械', '汽车', '钢铁'],
      '水': ['航运', '水利', '旅游', '餐饮']
    }
    suitableCareers.push(...(careerMap[wuxingAnalysis.overall_wuxing] || ['综合性行业']))

    return {
      strengths,
      weaknesses,
      improvement_suggestions: improvementSuggestions,
      lucky_directions: luckyDirections,
      suitable_careers: suitableCareers
    }
  }
}