// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          birth_date: string | null
          birth_time: string | null
          birth_city: string | null
          gender: 'male' | 'female' | null
          phone: string | null
          wechat_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          birth_time?: string | null
          birth_city?: string | null
          gender?: 'male' | 'female' | null
          phone?: string | null
          wechat_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          birth_time?: string | null
          birth_city?: string | null
          gender?: 'male' | 'female' | null
          phone?: string | null
          wechat_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tianji_accounts: {
        Row: {
          id: string
          user_id: string
          current_points: number
          total_earned: number
          total_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_points?: number
          total_earned?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_points?: number
          total_earned?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
      }
      tianji_transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type: 'earn' | 'spend' | 'refund' | 'gift'
          amount: number
          balance_after: number
          service_type: string | null
          description: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type: 'earn' | 'spend' | 'refund' | 'gift'
          amount: number
          balance_after: number
          service_type?: string | null
          description?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_type?: 'earn' | 'spend' | 'refund' | 'gift'
          amount?: number
          balance_after?: number
          service_type?: string | null
          description?: string | null
          reference_id?: string | null
          created_at?: string
        }
      }
      bazi_analyses: {
        Row: {
          id: string
          user_id: string
          person_name: string
          birth_date: string
          birth_time: string
          birth_city: string
          gender: 'male' | 'female' | null
          bazi_result: any // JSONB
          ai_analysis: string | null
          points_cost: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          person_name: string
          birth_date: string
          birth_time: string
          birth_city: string
          gender?: 'male' | 'female' | null
          bazi_result: any // JSONB
          ai_analysis?: string | null
          points_cost?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          person_name?: string
          birth_date?: string
          birth_time?: string
          birth_city?: string
          gender?: 'male' | 'female' | null
          bazi_result?: any // JSONB
          ai_analysis?: string | null
          points_cost?: number
          created_at?: string
        }
      }
      hepan_analyses: {
        Row: {
          id: string
          user_id: string
          person1_name: string
          person1_birth_date: string
          person1_birth_time: string
          person1_birth_city: string
          person1_gender: 'male' | 'female' | null
          person2_name: string
          person2_birth_date: string
          person2_birth_time: string
          person2_birth_city: string
          person2_gender: 'male' | 'female' | null
          compatibility_result: any // JSONB
          ai_analysis: string | null
          points_cost: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          person1_name: string
          person1_birth_date: string
          person1_birth_time: string
          person1_birth_city: string
          person1_gender?: 'male' | 'female' | null
          person2_name: string
          person2_birth_date: string
          person2_birth_time: string
          person2_birth_city: string
          person2_gender?: 'male' | 'female' | null
          compatibility_result: any // JSONB
          ai_analysis?: string | null
          points_cost?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          person1_name?: string
          person1_birth_date?: string
          person1_birth_time?: string
          person1_birth_city?: string
          person1_gender?: 'male' | 'female' | null
          person2_name?: string
          person2_birth_date?: string
          person2_birth_time?: string
          person2_birth_city?: string
          person2_gender?: 'male' | 'female' | null
          compatibility_result?: any // JSONB
          ai_analysis?: string | null
          points_cost?: number
          created_at?: string
        }
      }
      bugua_divinations: {
        Row: {
          id: string
          user_id: string
          question: string
          question_category: string
          divination_method: 'coins' | 'time' | null
          coin_results: number[] | null
          hexagram_result: any // JSONB
          ai_analysis: string | null
          points_cost: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question: string
          question_category: string
          divination_method?: 'coins' | 'time' | null
          coin_results?: number[] | null
          hexagram_result: any // JSONB
          ai_analysis?: string | null
          points_cost?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question?: string
          question_category?: string
          divination_method?: 'coins' | 'time' | null
          coin_results?: number[] | null
          hexagram_result?: any // JSONB
          ai_analysis?: string | null
          points_cost?: number
          created_at?: string
        }
      }
      calendar_fortunes: {
        Row: {
          id: string
          user_id: string
          person_name: string
          birth_date: string
          birth_time: string
          birth_city: string
          gender: 'male' | 'female' | null
          target_date: string
          fortune_result: any // JSONB
          ai_analysis: string | null
          points_cost: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          person_name: string
          birth_date: string
          birth_time: string
          birth_city: string
          gender?: 'male' | 'female' | null
          target_date: string
          fortune_result: any // JSONB
          ai_analysis?: string | null
          points_cost?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          person_name?: string
          birth_date?: string
          birth_time?: string
          birth_city?: string
          gender?: 'male' | 'female' | null
          target_date?: string
          fortune_result?: any // JSONB
          ai_analysis?: string | null
          points_cost?: number
          created_at?: string
        }
      }
      name_analyses: {
        Row: {
          id: string
          user_id: string
          name_to_analyze: string
          analysis_type: 'current' | 'suggestion' | null
          birth_date: string | null
          birth_time: string | null
          birth_city: string | null
          gender: 'male' | 'female' | null
          analysis_result: any // JSONB
          ai_analysis: string | null
          points_cost: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name_to_analyze: string
          analysis_type?: 'current' | 'suggestion' | null
          birth_date?: string | null
          birth_time?: string | null
          birth_city?: string | null
          gender?: 'male' | 'female' | null
          analysis_result: any // JSONB
          ai_analysis?: string | null
          points_cost?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name_to_analyze?: string
          analysis_type?: 'current' | 'suggestion' | null
          birth_date?: string | null
          birth_time?: string | null
          birth_city?: string | null
          gender?: 'male' | 'female' | null
          analysis_result?: any // JSONB
          ai_analysis?: string | null
          points_cost?: number
          created_at?: string
        }
      }
      dream_interpretations: {
        Row: {
          id: string
          user_id: string
          dream_content: string
          dream_category: string
          dream_mood: string
          dream_frequency: string | null
          lucid_dream: boolean | null
          dreamer_age_range: string | null
          dreamer_gender: 'male' | 'female' | null
          dreamer_life_stage: string | null
          recent_stress: boolean | null
          interpretation_result: any // JSONB
          ai_analysis: string | null
          points_cost: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dream_content: string
          dream_category: string
          dream_mood: string
          dream_frequency?: string | null
          lucid_dream?: boolean | null
          dreamer_age_range?: string | null
          dreamer_gender?: 'male' | 'female' | null
          dreamer_life_stage?: string | null
          recent_stress?: boolean | null
          interpretation_result: any // JSONB
          ai_analysis?: string | null
          points_cost?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dream_content?: string
          dream_category?: string
          dream_mood?: string
          dream_frequency?: string | null
          lucid_dream?: boolean | null
          dreamer_age_range?: string | null
          dreamer_gender?: 'male' | 'female' | null
          dreamer_life_stage?: string | null
          recent_stress?: boolean | null
          interpretation_result?: any // JSONB
          ai_analysis?: string | null
          points_cost?: number
          created_at?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          analysis_type: string
          analysis_id: string
          title: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          analysis_type: string
          analysis_id: string
          title?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          analysis_type?: string
          analysis_id?: string
          title?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: any // JSONB
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: any // JSONB
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: any // JSONB
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recharge_orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          amount: number
          points: number
          payment_method: string
          payment_status: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_id: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number: string
          amount: number
          points: number
          payment_method: string
          payment_status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          amount?: number
          points?: number
          payment_method?: string
          payment_status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      spend_tianji_points: {
        Args: {
          p_user_id: string
          p_amount: number
          p_service_type: string
          p_description?: string
          p_reference_id?: string
        }
        Returns: boolean
      }
      add_tianji_points: {
        Args: {
          p_user_id: string
          p_amount: number
          p_transaction_type?: string
          p_description?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}