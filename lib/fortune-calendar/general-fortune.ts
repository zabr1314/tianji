import { DailyFortune } from '@/lib/types/fortune-calendar'

// 通用运势模板 - 不依赖个人八字信息
const GENERAL_FORTUNE_TEMPLATES = {
  // 财运建议模板
  wealth: {
    excellent: [
      '适合投资理财，关注新机会',
      '财务规划良机，理性决策',
      '商务谈判有利，把握时机'
    ],
    good: [
      '适度投资，稳健理财',
      '日常开支需注意，避免冲动消费',
      '收入稳定，可制定理财计划'
    ],
    average: [
      '保守理财，避免高风险投资',
      '日常开支正常，无特殊变化',
      '维持现状，不宜大额消费'
    ],
    poor: [
      '避免投资和借贷',
      '谨慎消费，减少不必要支出',
      '理财需保守，现金为王'
    ]
  },
  
  // 事业建议模板  
  career: {
    excellent: [
      '工作表现突出，适合展示才能',
      '领导关注度高，把握升职机会',
      '团队合作顺畅，项目进展良好'
    ],
    good: [
      '工作稳步推进，保持积极态度',
      '同事关系和谐，互相支持',
      '适合学习新技能，提升竞争力'
    ],
    average: [
      '按部就班工作，避免冒险决策',
      '维护现有关系，低调行事',
      '专注本职工作，不宜多管闲事'
    ],
    poor: [
      '工作中需谨慎，避免出错',
      '人际关系需留意，少说多做',
      '不宜主动求变，稳定为主'
    ]
  },
  
  // 感情建议模板
  love: {
    excellent: [
      '感情运佳，单身者有望遇到良缘',
      '恋人关系和谐，适合深入交流',
      '家庭氛围温馨，亲子关系良好'
    ],
    good: [
      '感情稳定发展，相处愉快',
      '适合约会聚会，增进感情',
      '家人朋友支持，社交运不错'
    ],
    average: [
      '感情平淡，需主动制造浪漫',
      '避免争吵，多一些理解包容',
      '社交一般，维持现有关系'
    ],
    poor: [
      '感情易生摩擦，需控制情绪',
      '避免冲突，多倾听少争辩',
      '不宜做重要感情决定'
    ]
  },
  
  // 健康建议模板
  health: {
    excellent: [
      '身体状态佳，精力充沛',
      '适合运动锻炼，增强体质',
      '心情愉悦，睡眠质量好'
    ],
    good: [
      '健康状况良好，注意休息',
      '饮食规律，保持运动习惯',
      '精神状态积极向上'
    ],
    average: [
      '健康平平，需注意作息',
      '饮食清淡，避免熬夜',
      '适度运动，放松心情'
    ],
    poor: [
      '身体疲劳，需要充分休息',
      '饮食要清淡，多喝水',
      '避免剧烈运动，注意安全'
    ]
  }
}

// 活动建议模板
const ACTIVITY_TEMPLATES = {
  suitable: {
    excellent: ['签约合作', '重要会议', '投资理财', '求职面试', '表白求婚', '搬家装修', '开业庆典'],
    good: ['学习充电', '朋友聚会', '购物消费', '锻炼运动', '旅行出游', '清理整顿'],
    average: ['日常工作', '读书学习', '居家休息', '简单社交', '轻松娱乐'],
    poor: ['休养生息', '独处思考', '整理规划', '温和运动']
  },
  avoid: {
    excellent: ['冲动消费', '情绪化决策'],
    good: ['熬夜加班', '激烈争论'],
    average: ['重大决策', '高风险活动', '复杂谈判'],
    poor: ['重要签约', '投资决策', '激烈运动', '情感表白', '搬家出行', '手术医疗']
  }
}

// 幸运要素模板
const LUCKY_ELEMENTS = {
  colors: ['红色', '蓝色', '绿色', '黄色', '紫色', '白色', '黑色', '粉色', '橙色', '灰色'],
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
}

// 生成运势等级的函数
function generateFortuneLevel(date: Date): 'excellent' | 'good' | 'average' | 'poor' {
  // 使用日期作为种子，确保同一天的运势相同
  const seed = date.getTime() + date.getDate() + date.getMonth()
  const random = (seed * 9301 + 49297) % 233280 / 233280
  
  // 运势等级概率分布：优秀15%，良好35%，一般35%，欠佳15%
  if (random < 0.15) return 'excellent'
  if (random < 0.50) return 'good'
  if (random < 0.85) return 'average'
  return 'poor'
}

// 随机选择模板内容
function randomChoice<T>(arr: T[], seed: number): T {
  const random = (seed * 16807) % 2147483647 / 2147483647
  return arr[Math.floor(random * arr.length)]
}

// 生成指定日期的通用运势
export function generateGeneralFortune(date: Date): DailyFortune {
  const dateString = date.toISOString().split('T')[0]
  const seed = date.getTime() + date.getDate()
  
  // 生成运势等级
  const level = generateFortuneLevel(date)
  
  // 生成各维度分数
  const baseScore = {
    excellent: 85 + Math.floor((seed % 15)),
    good: 65 + Math.floor((seed % 20)),
    average: 45 + Math.floor((seed % 20)),
    poor: 25 + Math.floor((seed % 20))
  }[level]
  
  // 各维度得分有一定随机性
  const categories = {
    wealth: Math.max(0, Math.min(100, baseScore + Math.floor((seed * 17) % 21) - 10)),
    love: Math.max(0, Math.min(100, baseScore + Math.floor((seed * 23) % 21) - 10)),
    career: Math.max(0, Math.min(100, baseScore + Math.floor((seed * 31) % 21) - 10)),
    health: Math.max(0, Math.min(100, baseScore + Math.floor((seed * 37) % 21) - 10))
  }
  
  // 总分为各项平均
  const score = Math.round((categories.wealth + categories.love + categories.career + categories.health) / 4)
  
  // 生成建议内容
  const wealthAdvice = randomChoice(GENERAL_FORTUNE_TEMPLATES.wealth[level], seed * 2)
  const careerAdvice = randomChoice(GENERAL_FORTUNE_TEMPLATES.career[level], seed * 3)
  const loveAdvice = randomChoice(GENERAL_FORTUNE_TEMPLATES.love[level], seed * 5)
  const healthAdvice = randomChoice(GENERAL_FORTUNE_TEMPLATES.health[level], seed * 7)
  
  const advice = `财运：${wealthAdvice}；事业：${careerAdvice}；感情：${loveAdvice}；健康：${healthAdvice}`
  
  // 生成适宜和避免的活动
  const suitableActivities = ACTIVITY_TEMPLATES.suitable[level].slice(0, 3 + Math.floor((seed % 3)))
  const avoidActivities = ACTIVITY_TEMPLATES.avoid[level].slice(0, 2 + Math.floor((seed % 2)))
  
  // 生成幸运要素
  const luckyColor = randomChoice(LUCKY_ELEMENTS.colors, seed * 11)
  const luckyNumber = randomChoice(LUCKY_ELEMENTS.numbers, seed * 13)
  
  return {
    date: dateString,
    level,
    score,
    summary: `${level === 'excellent' ? '运势极佳' : level === 'good' ? '运势良好' : level === 'average' ? '运势平常' : '需要谨慎'}，总分${score}分`,
    advice,
    avoid: avoidActivities.join('、'),
    luckyColor,
    luckyNumber,
    suitableActivities,
    avoidActivities,
    categories
  }
}

// 生成指定月份的通用运势
export function generateMonthlyGeneralFortune(year: number, month: number): DailyFortune[] {
  const fortunes: DailyFortune[] = []
  const daysInMonth = new Date(year, month, 0).getDate()
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    fortunes.push(generateGeneralFortune(date))
  }
  
  return fortunes
}