import { createClient } from '@/lib/supabase/server'
import { Database } from './types'
import { TianjiTransaction, TransactionType, TransactionSource } from '@/lib/tianji-points/types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export class UserService {
  /**
   * 创建用户配置文件
   * @param userInsert 用户插入数据
   * @returns 创建的用户配置文件
   */
  static async createProfile(userInsert: UserProfileInsert): Promise<UserProfile> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        ...userInsert,
        tianji_points: 100, // 新用户赠送100点
        membership_type: 'basic',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`)
    }

    // 记录注册赠送积分的交易
    await this.recordTransaction({
      user_id: data.id,
      type: 'earn',
      amount: 100,
      source: 'signup',
      description: '新用户注册赠送100天机点'
    })

    return data
  }

  /**
   * 获取用户配置文件
   * @param userId 用户ID
   * @returns 用户配置文件
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      throw new Error(`Failed to get user profile: ${error.message}`)
    }

    return data
  }

  /**
   * 更新用户配置文件
   * @param userId 用户ID
   * @param updates 更新数据
   * @returns 更新后的用户配置文件
   */
  static async updateProfile(userId: string, updates: UserProfileUpdate): Promise<UserProfile> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`)
    }

    return data
  }

  /**
   * 扣除用户天机点
   * @param userId 用户ID
   * @param amount 扣除数量
   * @param serviceType 服务类型
   * @returns 是否成功
   */
  static async deductPoints(userId: string, amount: number, serviceType: string): Promise<boolean> {
    const supabase = await createClient()
    
    // 使用数据库函数确保原子性操作
    const { data, error } = await supabase.rpc('deduct_tianji_points', {
      user_id: userId,
      amount: amount,
      service_type: serviceType
    })

    if (error) {
      throw new Error(`Failed to deduct points: ${error.message}`)
    }

    if (data) {
      // 记录消费交易
      await this.recordTransaction({
        user_id: userId,
        type: 'spend',
        amount: amount,
        source: 'service_usage',
        description: `使用${serviceType}服务消费${amount}天机点`
      })
    }

    return data
  }

  /**
   * 增加用户天机点
   * @param userId 用户ID
   * @param amount 增加数量
   * @param source 来源
   * @param description 描述
   * @returns 更新后的用户配置文件
   */
  static async addPoints(
    userId: string, 
    amount: number, 
    source: TransactionSource, 
    description: string
  ): Promise<UserProfile> {
    const supabase = await createClient()
    
    // 先获取当前积分
    const currentProfile = await this.getProfile(userId)
    if (!currentProfile) {
      throw new Error('User profile not found')
    }

    // 更新用户积分
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        tianji_points: currentProfile.tianji_points + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add points: ${error.message}`)
    }

    // 记录获得积分的交易
    await this.recordTransaction({
      user_id: userId,
      type: 'earn',
      amount: amount,
      source: source,
      description: description
    })

    return data
  }

  /**
   * 检查用户是否有足够的天机点
   * @param userId 用户ID
   * @param requiredAmount 需要的点数
   * @returns 是否足够
   */
  static async hasEnoughPoints(userId: string, requiredAmount: number): Promise<boolean> {
    const profile = await this.getProfile(userId)
    
    if (!profile) {
      return false
    }

    return profile.tianji_points >= requiredAmount
  }

  /**
   * 记录天机点交易
   * @param transaction 交易信息
   * @returns 交易记录
   */
  static async recordTransaction(transaction: Omit<TianjiTransaction, 'id' | 'created_at'>): Promise<void> {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('tianji_transactions')
      .insert({
        ...transaction,
        created_at: new Date().toISOString()
      })

    if (error) {
      throw new Error(`Failed to record transaction: ${error.message}`)
    }
  }

  /**
   * 获取用户交易历史
   * @param userId 用户ID
   * @param limit 限制数量
   * @returns 交易历史
   */
  static async getTransactionHistory(userId: string, limit: number = 50): Promise<TianjiTransaction[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('tianji_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get transaction history: ${error.message}`)
    }

    return data
  }

  /**
   * 更新用户会员状态
   * @param userId 用户ID
   * @param membershipType 会员类型
   * @param expiresAt 过期时间
   * @returns 更新后的用户配置文件
   */
  static async updateMembership(
    userId: string,
    membershipType: 'basic' | 'monthly' | 'yearly',
    expiresAt?: string
  ): Promise<UserProfile> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        membership_type: membershipType,
        membership_expires_at: expiresAt || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update membership: ${error.message}`)
    }

    return data
  }

  /**
   * 检查用户会员状态是否有效
   * @param userId 用户ID
   * @returns 是否为有效会员
   */
  static async isValidMember(userId: string): Promise<{ valid: boolean; type: string }> {
    const profile = await this.getProfile(userId)
    
    if (!profile || profile.membership_type === 'basic') {
      return { valid: false, type: 'basic' }
    }

    if (!profile.membership_expires_at) {
      return { valid: true, type: profile.membership_type }
    }

    const now = new Date()
    const expiresAt = new Date(profile.membership_expires_at)
    
    return {
      valid: now < expiresAt,
      type: profile.membership_type
    }
  }
}