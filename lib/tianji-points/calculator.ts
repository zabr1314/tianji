import {
  ServiceType,
  MembershipType,
  RefundCalculation,
  MembershipValue,
  PurchaseRecommendation,
  SERVICE_COSTS,
  RECHARGE_TIERS,
  MEMBERSHIP_CONFIG,
  TIANJI_POINTS_RATE,
  REFUND_WINDOW_HOURS
} from './types'

export class TianjiPointsCalculator {
  /**
   * 计算人民币对应的天机点数量（包含赠送）
   * @param amountRMB 人民币金额
   * @returns 总天机点数量
   */
  static calculatePoints(amountRMB: number): number {
    if (amountRMB < 0) {
      throw new Error('Amount must be non-negative')
    }

    if (amountRMB === 0) {
      return 0
    }

    const basePoints = amountRMB * TIANJI_POINTS_RATE
    const bonusPoints = this.calculateBonusPoints(amountRMB)
    
    return basePoints + bonusPoints
  }

  /**
   * 计算赠送点数
   * @param amountRMB 人民币金额
   * @returns 赠送点数
   */
  static calculateBonusPoints(amountRMB: number): number {
    // 找到最适合的充值档位
    const tier = RECHARGE_TIERS
      .filter(t => amountRMB >= t.amount_rmb)
      .sort((a, b) => b.amount_rmb - a.amount_rmb)[0]

    return tier?.bonus_points || 0
  }

  /**
   * 检查用户点数是否足够支付服务
   * @param currentPoints 当前点数
   * @param cost 服务费用
   * @returns 是否足够
   */
  static hasSufficientPoints(currentPoints: number, cost: number): boolean {
    if (currentPoints < 0) {
      throw new Error('Points cannot be negative')
    }
    
    if (cost < 0) {
      throw new Error('Cost cannot be negative')
    }

    return currentPoints >= cost
  }

  /**
   * 获取服务费用
   * @param serviceType 服务类型
   * @returns 服务费用（天机点）
   */
  static getServiceCost(serviceType: string): number {
    const cost = SERVICE_COSTS[serviceType as ServiceType]
    
    if (cost === undefined) {
      throw new Error('Unknown service type')
    }

    return cost
  }

  /**
   * 计算退款
   * @param originalPoints 原始购买点数
   * @param purchaseTime 购买时间
   * @param refundTime 退款时间
   * @param usedPoints 已使用点数
   * @returns 退款计算结果
   */
  static calculateRefund(
    originalPoints: number,
    purchaseTime: Date,
    refundTime: Date,
    usedPoints: number = 0
  ): RefundCalculation {
    const timeDiffHours = (refundTime.getTime() - purchaseTime.getTime()) / (1000 * 60 * 60)
    
    // 超过退款时间窗口
    if (timeDiffHours > REFUND_WINDOW_HOURS) {
      return {
        eligible: false,
        amount: 0,
        reason: 'Refund window expired'
      }
    }

    const remainingPoints = originalPoints - usedPoints

    if (usedPoints === 0) {
      return {
        eligible: true,
        amount: originalPoints,
        reason: 'Full refund within 1 hour'
      }
    } else {
      return {
        eligible: true,
        amount: remainingPoints,
        reason: 'Partial refund for unused points'
      }
    }
  }

  /**
   * 计算会员价值
   * @param membershipType 会员类型
   * @returns 会员价值信息
   */
  static calculateMembershipValue(membershipType: Exclude<MembershipType, 'basic'>): MembershipValue {
    const config = MEMBERSHIP_CONFIG[membershipType]
    
    if (!config) {
      throw new Error('Invalid membership type')
    }

    return config
  }

  /**
   * 天机点转人民币价值
   * @param points 天机点数量
   * @returns 人民币价值
   */
  static pointsToRMB(points: number): number {
    return points / TIANJI_POINTS_RATE
  }

  /**
   * 人民币转天机点（不含赠送）
   * @param amountRMB 人民币金额
   * @returns 基础天机点数量
   */
  static rmbToPoints(amountRMB: number): number {
    return amountRMB * TIANJI_POINTS_RATE
  }

  /**
   * 计算多个服务的平均费用
   * @param services 服务类型数组
   * @returns 平均费用
   */
  static calculateAverageServiceCost(services: string[]): number {
    const totalCost = services.reduce((sum, service) => {
      return sum + this.getServiceCost(service)
    }, 0)

    return Math.round(totalCost / services.length)
  }

  /**
   * 计算服务包费用
   * @param services 服务类型数组
   * @returns 总费用
   */
  static calculateBundleCost(services: string[]): number {
    return services.reduce((sum, service) => {
      return sum + this.getServiceCost(service)
    }, 0)
  }

  /**
   * 推荐最优充值金额
   * @param neededPoints 需要的点数
   * @returns 充值建议
   */
  static recommendPurchaseAmount(neededPoints: number): PurchaseRecommendation {
    // 找到能满足需求的最小充值档位
    let bestTier: typeof RECHARGE_TIERS[number] = RECHARGE_TIERS[0]
    let bestValue: 'poor' | 'fair' | 'good' | 'excellent' = 'poor'

    for (const tier of RECHARGE_TIERS) {
      const totalPoints = tier.base_points + tier.bonus_points
      
      if (totalPoints >= neededPoints) {
        bestTier = tier
        
        // 评估性价比
        const efficiency = tier.bonus_points / tier.base_points
        if (efficiency >= 0.15) {
          bestValue = 'excellent'
        } else if (efficiency >= 0.1) {
          bestValue = 'good'
        } else if (efficiency > 0) {
          bestValue = 'fair'
        }
        
        break
      }
    }

    // 如果没有档位能满足需求，推荐最大档位
    if (bestTier.base_points + bestTier.bonus_points < neededPoints) {
      bestTier = RECHARGE_TIERS[RECHARGE_TIERS.length - 1]
      bestValue = 'poor'
    }

    return {
      amount_rmb: bestTier.amount_rmb,
      base_points: bestTier.base_points,
      bonus_points: bestTier.bonus_points,
      total_points: bestTier.base_points + bestTier.bonus_points,
      value_rating: bestValue
    }
  }

  /**
   * 验证交易金额
   * @param amount 金额
   * @returns 是否有效
   */
  static validateTransactionAmount(amount: number): boolean {
    return amount > 0 && amount <= 10000 && Number.isFinite(amount)
  }

  /**
   * 计算会员折扣后价格
   * @param originalCost 原价
   * @param membershipType 会员类型
   * @returns 折扣后价格
   */
  static calculateMembershipDiscount(originalCost: number, membershipType: MembershipType): number {
    if (membershipType === 'basic') {
      return originalCost
    }

    const membership = MEMBERSHIP_CONFIG[membershipType]
    if (!membership) {
      return originalCost
    }

    return Math.round(originalCost * (1 - membership.discount_rate))
  }

  /**
   * 检查服务是否对会员免费
   * @param serviceType 服务类型
   * @param membershipType 会员类型
   * @returns 是否免费
   */
  static isServiceFreeForMember(serviceType: string, membershipType: MembershipType): boolean {
    if (membershipType === 'basic') {
      return false
    }

    const membership = MEMBERSHIP_CONFIG[membershipType]
    if (!membership) {
      return false
    }

    return membership.free_services.includes(serviceType) || 
           membership.free_services.includes('all_reports')
  }
}