// 天机点系统类型定义

export type ServiceType = 
  | 'bazi_analysis'
  | 'compatibility_analysis' 
  | 'divination'
  | 'name_analysis'
  | 'dream_analysis'
  | 'yearly_fortune'

export type MembershipType = 'basic' | 'monthly' | 'yearly'

export type TransactionType = 'earn' | 'spend' | 'refund'

export type TransactionSource = 
  | 'purchase'
  | 'signup'
  | 'daily_checkin'
  | 'service_usage'
  | 'refund'
  | 'bonus'

export interface TianjiTransaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  source: TransactionSource
  service_type?: ServiceType
  description: string
  metadata?: Record<string, any>
  created_at: string
}

export interface RefundCalculation {
  eligible: boolean
  amount: number
  reason: string
}

export interface MembershipValue {
  type: MembershipType
  price_rmb: number
  included_points: number
  free_services: string[]
  duration_days: number
  discount_rate: number
}

export interface PurchaseRecommendation {
  amount_rmb: number
  base_points: number
  bonus_points: number
  total_points: number
  value_rating: 'poor' | 'fair' | 'good' | 'excellent'
}

export interface PointsBalance {
  current: number
  earned_total: number
  spent_total: number
  last_updated: string
}

// 服务定价配置
export const SERVICE_COSTS: Record<ServiceType, number> = {
  bazi_analysis: 38,
  compatibility_analysis: 58,
  divination: 18,
  name_analysis: 28,
  dream_analysis: 18,
  yearly_fortune: 88
}

// 充值档位配置
export const RECHARGE_TIERS = [
  { amount_rmb: 6, base_points: 60, bonus_points: 0 },
  { amount_rmb: 30, base_points: 300, bonus_points: 30 },
  { amount_rmb: 68, base_points: 680, bonus_points: 88 }
] as const

// 会员配置
export const MEMBERSHIP_CONFIG: Record<Exclude<MembershipType, 'basic'>, MembershipValue> = {
  monthly: {
    type: 'monthly',
    price_rmb: 29,
    included_points: 300,
    free_services: ['daily_fortune'],
    duration_days: 30,
    discount_rate: 0.1
  },
  yearly: {
    type: 'yearly', 
    price_rmb: 299,
    included_points: 3500,
    free_services: ['all_reports', 'daily_fortune'],
    duration_days: 365,
    discount_rate: 0.2
  }
}

// 系统常量
export const TIANJI_POINTS_RATE = 10 // 1元 = 10天机点
export const REFUND_WINDOW_HOURS = 1 // 1小时内可退款
export const SIGNUP_BONUS_POINTS = 100 // 注册赠送点数