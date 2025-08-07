import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

type Tables = Database['public']['Tables']
type TianjiAccount = Tables['tianji_accounts']['Row']
type UserProfile = Tables['user_profiles']['Row']

// 天机点服务
export class TianjiPointsService {
  /**
   * 获取用户天机点余额
   */
  static async getUserPoints(userId: string): Promise<TianjiAccount | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('tianji_accounts')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user points:', error)
      return null
    }
    
    return data
  }

  /**
   * 获取用户天机点余额 (简化版本)
   */
  static async getBalance(userId: string): Promise<number> {
    const account = await this.getUserPoints(userId)
    return account ? account.current_points : 100 // 新用户默认100天机点
  }

  /**
   * 检查用户是否有足够的天机点
   */
  static async hasEnoughPoints(userId: string, requiredPoints: number): Promise<boolean> {
    const account = await this.getUserPoints(userId)
    return account ? account.current_points >= requiredPoints : false
  }

  /**
   * 扣除天机点
   */
  static async spendPoints(
    userId: string, 
    amount: number, 
    serviceType: string, 
    description?: string,
    referenceId?: string
  ): Promise<boolean> {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc('spend_tianji_points', {
      p_user_id: userId,
      p_amount: amount,
      p_service_type: serviceType,
      p_description: description,
      p_reference_id: referenceId
    })
    
    if (error) {
      console.error('Error spending points:', error)
      return false
    }
    
    return data === true
  }

  /**
   * 增加天机点
   */
  static async addPoints(
    userId: string, 
    amount: number, 
    transactionType: string = 'earn', 
    description?: string
  ): Promise<boolean> {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc('add_tianji_points', {
      p_user_id: userId,
      p_amount: amount,
      p_transaction_type: transactionType,
      p_description: description
    })
    
    if (error) {
      console.error('Error adding points:', error)
      return false
    }
    
    return data === true
  }

  /**
   * 获取用户交易记录
   */
  static async getUserTransactions(userId: string, limit: number = 50) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('tianji_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
    
    return data
  }
}

// 八字分析服务
export class BaziAnalysisService {
  /**
   * 保存八字分析结果
   */
  static async saveAnalysis(data: Tables['bazi_analyses']['Insert']) {
    const supabase = await createClient()
    
    const { data: result, error } = await supabase
      .from('bazi_analyses')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      console.error('Error saving bazi analysis:', error)
      return null
    }
    
    return result
  }

  /**
   * 获取用户的八字分析记录
   */
  static async getUserAnalyses(userId: string, limit: number = 20) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('bazi_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching bazi analyses:', error)
      return []
    }
    
    return data
  }

  /**
   * 获取单个分析记录
   */
  static async getAnalysisById(id: string, userId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('bazi_analyses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching bazi analysis:', error)
      return null
    }
    
    return data
  }
}

// 合盘分析服务
export class HepanAnalysisService {
  /**
   * 保存合盘分析结果
   */
  static async saveAnalysis(data: Tables['hepan_analyses']['Insert']) {
    const supabase = await createClient()
    
    const { data: result, error } = await supabase
      .from('hepan_analyses')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      console.error('Error saving hepan analysis:', error)
      return null
    }
    
    return result
  }

  /**
   * 获取用户的合盘分析记录
   */
  static async getUserAnalyses(userId: string, limit: number = 20) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('hepan_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching hepan analyses:', error)
      return []
    }
    
    return data
  }
}

// 卜卦服务
export class BuguaService {
  /**
   * 保存卜卦结果
   */
  static async saveDivination(data: Tables['bugua_divinations']['Insert']) {
    const supabase = await createClient()
    
    const { data: result, error } = await supabase
      .from('bugua_divinations')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      console.error('Error saving bugua divination:', error)
      return null
    }
    
    return result
  }

  /**
   * 获取用户的卜卦记录
   */
  static async getUserDivinations(userId: string, limit: number = 20) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('bugua_divinations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching bugua divinations:', error)
      return []
    }
    
    return data
  }
}

// 运势日历服务
export class CalendarFortuneService {
  /**
   * 保存运势分析结果
   */
  static async saveFortune(data: Tables['calendar_fortunes']['Insert']) {
    const supabase = await createClient()
    
    const { data: result, error } = await supabase
      .from('calendar_fortunes')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      console.error('Error saving calendar fortune:', error)
      return null
    }
    
    return result
  }

  /**
   * 检查是否已经查询过某日的运势
   */
  static async hasFortuneForDate(userId: string, personName: string, targetDate: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('calendar_fortunes')
      .select('id')
      .eq('user_id', userId)
      .eq('person_name', personName)
      .eq('target_date', targetDate)
      .single()
    
    return !error && data !== null
  }

  /**
   * 获取用户的运势记录
   */
  static async getUserFortunes(userId: string, limit: number = 20) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('calendar_fortunes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching calendar fortunes:', error)
      return []
    }
    
    return data
  }
}

// 姓名分析服务
export class NameAnalysisService {
  /**
   * 保存姓名分析结果
   */
  static async saveAnalysis(data: Tables['name_analyses']['Insert']) {
    const supabase = await createClient()
    
    const { data: result, error } = await supabase
      .from('name_analyses')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      console.error('Error saving name analysis:', error)
      return null
    }
    
    return result
  }

  /**
   * 获取用户的姓名分析记录
   */
  static async getUserAnalyses(userId: string, limit: number = 20) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('name_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching name analyses:', error)
      return []
    }
    
    return data
  }
}

// 解梦服务
export class DreamInterpretationService {
  /**
   * 保存解梦结果
   */
  static async saveInterpretation(data: Tables['dream_interpretations']['Insert']) {
    const supabase = await createClient()
    
    const { data: result, error } = await supabase
      .from('dream_interpretations')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      console.error('Error saving dream interpretation:', error)
      return null
    }
    
    return result
  }

  /**
   * 获取用户的解梦记录
   */
  static async getUserInterpretations(userId: string, limit: number = 20) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('dream_interpretations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching dream interpretations:', error)
      return []
    }
    
    return data
  }
}

// 用户资料服务
export class UserProfileService {
  /**
   * 获取用户资料
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    
    return data
  }

  /**
   * 更新用户资料
   */
  static async updateProfile(userId: string, updates: Tables['user_profiles']['Update']) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }
    
    return data
  }
}

// 收藏服务
export class FavoriteService {
  /**
   * 添加收藏
   */
  static async addFavorite(data: Tables['user_favorites']['Insert']) {
    const supabase = await createClient()
    
    const { data: result, error } = await supabase
      .from('user_favorites')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      console.error('Error adding favorite:', error)
      return null
    }
    
    return result
  }

  /**
   * 删除收藏
   */
  static async removeFavorite(userId: string, analysisType: string, analysisId: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('analysis_type', analysisType)
      .eq('analysis_id', analysisId)
    
    if (error) {
      console.error('Error removing favorite:', error)
      return false
    }
    
    return true
  }

  /**
   * 获取用户收藏列表
   */
  static async getUserFavorites(userId: string, limit: number = 50) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching user favorites:', error)
      return []
    }
    
    return data
  }

  /**
   * 检查是否已收藏
   */
  static async isFavorited(userId: string, analysisType: string, analysisId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('analysis_type', analysisType)
      .eq('analysis_id', analysisId)
      .single()
    
    return !error && data !== null
  }
}

// 分析记录服务（统一历史记录管理）
export class AnalysisRecordsService {
  /**
   * 保存分析记录
   */
  static async saveRecord(data: {
    userId: string
    analysisType: 'bazi' | 'hepan' | 'bugua' | 'dream' | 'name' | 'calendar'
    title: string
    summary?: string
    inputData: any
    outputData: any
    pointsCost: number
  }) {
    const supabase = await createClient()
    
    const { data: result, error } = await supabase
      .from('analysis_records')
      .insert({
        user_id: data.userId,
        analysis_type: data.analysisType,
        title: data.title,
        summary: data.summary,
        input_data: data.inputData,
        output_data: data.outputData,
        points_cost: data.pointsCost
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error saving analysis record:', error)
      return null
    }
    
    return result
  }

  /**
   * 获取用户的分析记录列表（支持筛选和搜索）
   */
  static async getRecords(params: {
    userId: string
    analysisType?: string
    isFavorite?: boolean
    searchQuery?: string
    tags?: string[]
    limit?: number
    offset?: number
    sortBy?: 'created_at' | 'points_cost'
    sortOrder?: 'asc' | 'desc'
  }) {
    const supabase = await createClient()
    
    let query = supabase
      .from('analysis_records')
      .select('*')
      .eq('user_id', params.userId)
    
    // 分析类型筛选
    if (params.analysisType) {
      query = query.eq('analysis_type', params.analysisType)
    }
    
    // 收藏筛选
    if (params.isFavorite) {
      query = query.eq('is_favorite', true)
    }
    
    // 标签筛选
    if (params.tags && params.tags.length > 0) {
      query = query.contains('tags', params.tags)
    }
    
    // 全文搜索
    if (params.searchQuery) {
      query = query.textSearch('title', params.searchQuery, { 
        type: 'websearch',
        config: 'simple' 
      })
    }
    
    // 排序
    const sortBy = params.sortBy || 'created_at'
    const sortOrder = params.sortOrder || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    
    // 分页
    const limit = params.limit || 20
    const offset = params.offset || 0
    query = query.range(offset, offset + limit - 1)
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching analysis records:', error)
      return []
    }
    
    return data || []
  }

  /**
   * 获取单个记录详情
   */
  static async getRecord(id: string, userId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('analysis_records')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching analysis record:', error)
      return null
    }
    
    return data
  }

  /**
   * 更新记录（收藏、标签等）
   */
  static async updateRecord(
    id: string, 
    userId: string, 
    updates: {
      isFavorite?: boolean
      tags?: string[]
      summary?: string
    }
  ) {
    const supabase = await createClient()
    
    const updateData: any = {}
    if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.summary !== undefined) updateData.summary = updates.summary
    
    const { data, error } = await supabase
      .from('analysis_records')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating analysis record:', error)
      return null
    }
    
    return data
  }

  /**
   * 删除记录
   */
  static async deleteRecord(id: string, userId: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('analysis_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error deleting analysis record:', error)
      return false
    }
    
    return true
  }

  /**
   * 批量删除记录
   */
  static async deleteRecords(ids: string[], userId: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('analysis_records')
      .delete()
      .in('id', ids)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error deleting analysis records:', error)
      return false
    }
    
    return true
  }

  /**
   * 获取用户统计信息
   */
  static async getUserStats(userId: string) {
    const supabase = await createClient()
    
    // 总记录数
    const { count: totalCount } = await supabase
      .from('analysis_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    // 各类型统计
    const { data: typeStats } = await supabase
      .from('analysis_records')
      .select('analysis_type')
      .eq('user_id', userId)
    
    // 总消耗点数
    const { data: pointsData } = await supabase
      .from('analysis_records')
      .select('points_cost')
      .eq('user_id', userId)
    
    const totalPoints = pointsData?.reduce((sum, record) => sum + record.points_cost, 0) || 0
    
    // 按类型分组统计
    const typeCounts = typeStats?.reduce((acc, record) => {
      acc[record.analysis_type] = (acc[record.analysis_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
    
    return {
      totalCount: totalCount || 0,
      totalPoints,
      typeCounts
    }
  }

  /**
   * 生成分享令牌
   */
  static async generateShareToken(id: string, userId: string) {
    const supabase = await createClient()
    
    // 生成随机令牌
    const shareToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
    
    const { data, error } = await supabase
      .from('analysis_records')
      .update({ 
        is_shared: true, 
        share_token: shareToken 
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error generating share token:', error)
      return null
    }
    
    return data
  }

  /**
   * 通过分享令牌获取记录
   */
  static async getRecordByShareToken(shareToken: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('analysis_records')
      .select('*')
      .eq('share_token', shareToken)
      .eq('is_shared', true)
      .single()
    
    if (error) {
      console.error('Error fetching shared record:', error)
      return null
    }
    
    return data
  }
}

// 系统设置服务
export class SystemSettingsService {
  /**
   * 获取系统设置
   */
  static async getSetting(key: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single()
    
    if (error) {
      console.error('Error fetching system setting:', error)
      return null
    }
    
    return data.setting_value
  }

  /**
   * 获取服务费用配置
   */
  static async getServiceCosts() {
    const costs = await this.getSetting('service_costs')
    return costs || {
      bazi: 200,
      hepan: 300,
      bugua: 150,
      calendar: 100,
      name: 120,
      dream: 80
    }
  }

  /**
   * 获取天机点兑换率
   */
  static async getPointsRates() {
    const rates = await this.getSetting('points_rates')
    return rates || {
      "1_rmb": 10,
      "new_user_bonus": 100
    }
  }
}