// 八字命盘基础类型定义

export interface BaziChart {
  year_ganzhi: string    // 年柱干支，如 "庚午"
  month_ganzhi: string   // 月柱干支，如 "壬午"
  day_ganzhi: string     // 日柱干支，如 "甲子"
  hour_ganzhi: string    // 时柱干支，如 "丙寅"
}

export interface WuXingAnalysis {
  wood: number     // 木的数量
  fire: number     // 火的数量
  earth: number    // 土的数量
  metal: number    // 金的数量
  water: number    // 水的数量
  strongest: WuXingElement    // 最强的五行
  weakest: WuXingElement      // 最弱的五行
  percentages: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
}

export type WuXingElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water'

export interface DayunPeriod {
  sequence: number      // 第几步大运 (1-8)
  start_age: number     // 起始年龄
  end_age: number       // 结束年龄
  ganzhi: string        // 大运干支
  description?: string  // 大运描述
}

export interface BaziProfile {
  id: string
  user_id: string
  name: string
  birth_date: string
  birth_time: string
  birth_city: string
  birth_longitude: number
  birth_latitude: number
  timezone_offset: number
  is_time_uncertain: boolean
  bazi_chart: BaziChart
  wuxing_analysis: WuXingAnalysis
  yongshen: string      // 用神
  xishen: string        // 喜神
  jishen: string        // 忌神
  dayun_periods: DayunPeriod[]
  created_at: string
  updated_at: string
}

// 天干地支常量
export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

// 五行对应关系
export const WUXING_MAP = {
  // 天干五行
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water',
  
  // 地支五行
  '子': 'water', '亥': 'water',
  '寅': 'wood', '卯': 'wood',
  '巳': 'fire', '午': 'fire',
  '申': 'metal', '酉': 'metal',
  '丑': 'earth', '辰': 'earth', '未': 'earth', '戌': 'earth'
} as const

export type TianganChar = typeof TIANGAN[number]
export type DizhiChar = typeof DIZHI[number]
export type GanzhiChar = TianganChar | DizhiChar