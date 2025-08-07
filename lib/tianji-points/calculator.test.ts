import { TianjiPointsCalculator } from './calculator'

describe('TianjiPointsCalculator', () => {
  describe('calculatePoints', () => {
    it('should calculate correct points for basic RMB amounts', () => {
      expect(TianjiPointsCalculator.calculatePoints(1)).toBe(10)
      expect(TianjiPointsCalculator.calculatePoints(10)).toBe(100)
      expect(TianjiPointsCalculator.calculatePoints(50)).toBe(530) // 500基础 + 30赠送(30元档)
    })

    it('should handle decimal amounts correctly', () => {
      expect(TianjiPointsCalculator.calculatePoints(1.5)).toBe(15)
      expect(TianjiPointsCalculator.calculatePoints(3.6)).toBe(36)
    })

    it('should calculate bonus points for tier amounts', () => {
      // 30元档位: 300点 + 30点赠送 = 330点
      expect(TianjiPointsCalculator.calculatePoints(30)).toBe(330)
      
      // 68元档位: 680点 + 88点赠送 = 768点
      expect(TianjiPointsCalculator.calculatePoints(68)).toBe(768)
    })

    it('should handle edge cases', () => {
      expect(TianjiPointsCalculator.calculatePoints(0)).toBe(0)
      expect(() => TianjiPointsCalculator.calculatePoints(-1)).toThrow('Amount must be non-negative')
    })
  })

  describe('calculateBonusPoints', () => {
    it('should return correct bonus for standard tiers', () => {
      expect(TianjiPointsCalculator.calculateBonusPoints(6)).toBe(0)   // 基础档
      expect(TianjiPointsCalculator.calculateBonusPoints(30)).toBe(30) // 30元档
      expect(TianjiPointsCalculator.calculateBonusPoints(68)).toBe(88) // 68元档
    })

    it('should return 0 bonus for amounts below threshold', () => {
      expect(TianjiPointsCalculator.calculateBonusPoints(5)).toBe(0)
      expect(TianjiPointsCalculator.calculateBonusPoints(25)).toBe(0)
    })

    it('should handle amounts between tiers', () => {
      expect(TianjiPointsCalculator.calculateBonusPoints(35)).toBe(30) // 按30元档计算
      expect(TianjiPointsCalculator.calculateBonusPoints(50)).toBe(30) // 按30元档计算
      expect(TianjiPointsCalculator.calculateBonusPoints(70)).toBe(88) // 按68元档计算
    })
  })

  describe('hasSufficientPoints', () => {
    it('should return true when points are sufficient', () => {
      expect(TianjiPointsCalculator.hasSufficientPoints(100, 38)).toBe(true)
      expect(TianjiPointsCalculator.hasSufficientPoints(100, 100)).toBe(true)
      expect(TianjiPointsCalculator.hasSufficientPoints(200, 150)).toBe(true)
    })

    it('should return false when points are insufficient', () => {
      expect(TianjiPointsCalculator.hasSufficientPoints(30, 38)).toBe(false)
      expect(TianjiPointsCalculator.hasSufficientPoints(0, 1)).toBe(false)
      expect(TianjiPointsCalculator.hasSufficientPoints(50, 100)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(TianjiPointsCalculator.hasSufficientPoints(0, 0)).toBe(true)
      expect(() => TianjiPointsCalculator.hasSufficientPoints(-1, 10)).toThrow('Points cannot be negative')
      expect(() => TianjiPointsCalculator.hasSufficientPoints(100, -1)).toThrow('Cost cannot be negative')
    })
  })

  describe('getServiceCost', () => {
    it('should return correct costs for different services', () => {
      expect(TianjiPointsCalculator.getServiceCost('bazi_analysis')).toBe(38)
      expect(TianjiPointsCalculator.getServiceCost('compatibility_analysis')).toBe(58)
      expect(TianjiPointsCalculator.getServiceCost('divination')).toBe(18)
      expect(TianjiPointsCalculator.getServiceCost('name_analysis')).toBe(28)
      expect(TianjiPointsCalculator.getServiceCost('dream_analysis')).toBe(18)
      expect(TianjiPointsCalculator.getServiceCost('yearly_fortune')).toBe(88)
    })

    it('should throw error for unknown service', () => {
      expect(() => TianjiPointsCalculator.getServiceCost('unknown_service')).toThrow('Unknown service type')
    })
  })

  describe('calculateRefund', () => {
    it('should calculate full refund within refund window', () => {
      const purchaseTime = new Date()
      const refundTime = new Date(purchaseTime.getTime() + 30 * 60 * 1000) // 30分钟后
      
      const refund = TianjiPointsCalculator.calculateRefund(100, purchaseTime, refundTime)
      
      expect(refund.eligible).toBe(true)
      expect(refund.amount).toBe(100)
      expect(refund.reason).toBe('Full refund within 1 hour')
    })

    it('should not allow refund after time window', () => {
      const purchaseTime = new Date()
      const refundTime = new Date(purchaseTime.getTime() + 2 * 60 * 60 * 1000) // 2小时后
      
      const refund = TianjiPointsCalculator.calculateRefund(100, purchaseTime, refundTime)
      
      expect(refund.eligible).toBe(false)
      expect(refund.amount).toBe(0)
      expect(refund.reason).toBe('Refund window expired')
    })

    it('should handle partial usage refund', () => {
      const purchaseTime = new Date()
      const refundTime = new Date(purchaseTime.getTime() + 30 * 60 * 1000)
      
      // 100点购买，使用了20点，剩余80点
      const refund = TianjiPointsCalculator.calculateRefund(100, purchaseTime, refundTime, 20)
      
      expect(refund.eligible).toBe(true)
      expect(refund.amount).toBe(80) // 只退未使用的部分
      expect(refund.reason).toBe('Partial refund for unused points')
    })
  })

  describe('membership calculations', () => {
    it('should calculate monthly membership value', () => {
      const membership = TianjiPointsCalculator.calculateMembershipValue('monthly')
      
      expect(membership.price_rmb).toBe(29)
      expect(membership.included_points).toBe(300)
      expect(membership.free_services).toContain('daily_fortune')
      expect(membership.duration_days).toBe(30)
    })

    it('should calculate yearly membership value', () => {
      const membership = TianjiPointsCalculator.calculateMembershipValue('yearly')
      
      expect(membership.price_rmb).toBe(299)
      expect(membership.included_points).toBe(3500)
      expect(membership.free_services).toContain('all_reports')
      expect(membership.duration_days).toBe(365)
    })

    it('should throw error for invalid membership type', () => {
      expect(() => TianjiPointsCalculator.calculateMembershipValue('invalid' as any))
        .toThrow('Invalid membership type')
    })
  })

  describe('points conversion utilities', () => {
    it('should convert points to RMB value', () => {
      expect(TianjiPointsCalculator.pointsToRMB(100)).toBe(10)
      expect(TianjiPointsCalculator.pointsToRMB(330)).toBe(33) // 包含赠送点的实际价值
      expect(TianjiPointsCalculator.pointsToRMB(0)).toBe(0)
    })

    it('should convert RMB to points (without bonus)', () => {
      expect(TianjiPointsCalculator.rmbToPoints(10)).toBe(100)
      expect(TianjiPointsCalculator.rmbToPoints(6.8)).toBe(68)
      expect(TianjiPointsCalculator.rmbToPoints(0)).toBe(0)
    })
  })

  describe('usage analytics', () => {
    it('should calculate average service cost', () => {
      const services = ['bazi_analysis', 'divination', 'name_analysis']
      const avgCost = TianjiPointsCalculator.calculateAverageServiceCost(services)
      
      // (38 + 18 + 28) / 3 = 28
      expect(avgCost).toBe(28)
    })

    it('should calculate points needed for service bundle', () => {
      const services = ['bazi_analysis', 'compatibility_analysis']
      const totalCost = TianjiPointsCalculator.calculateBundleCost(services)
      
      // 38 + 58 = 96
      expect(totalCost).toBe(96)
    })

    it('should recommend optimal purchase amount', () => {
      const recommendation = TianjiPointsCalculator.recommendPurchaseAmount(200) // 需要200点
      
      expect(recommendation.amount_rmb).toBeDefined()
      expect(recommendation.total_points).toBeGreaterThanOrEqual(200)
      expect(recommendation.bonus_points).toBeGreaterThanOrEqual(0)
    })
  })
})