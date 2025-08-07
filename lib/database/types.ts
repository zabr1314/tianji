// Supabase 数据库类型定义

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string | null
          email: string
          avatar_url: string | null
          tianji_points: number
          membership_type: 'basic' | 'monthly' | 'yearly'
          membership_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          email: string
          avatar_url?: string | null
          tianji_points?: number
          membership_type?: 'basic' | 'monthly' | 'yearly'
          membership_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          email?: string
          avatar_url?: string | null
          tianji_points?: number
          membership_type?: 'basic' | 'monthly' | 'yearly'
          membership_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tianji_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'earn' | 'spend' | 'refund'
          amount: number
          source: string
          description: string
          metadata: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'earn' | 'spend' | 'refund'
          amount: number
          source: string
          description: string
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'earn' | 'spend' | 'refund'
          amount?: number
          source?: string
          description?: string
          metadata?: Record<string, any> | null
          created_at?: string
        }
      }
      bazi_profiles: {
        Row: {
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
          year_ganzhi: string
          month_ganzhi: string
          day_ganzhi: string
          hour_ganzhi: string
          wuxing_analysis: Record<string, any>
          yongshen: string | null
          xishen: string | null
          jishen: string | null
          ai_analysis: Record<string, any> | null
          last_analyzed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          birth_date: string
          birth_time: string
          birth_city: string
          birth_longitude: number
          birth_latitude: number
          timezone_offset: number
          is_time_uncertain?: boolean
          year_ganzhi: string
          month_ganzhi: string
          day_ganzhi: string
          hour_ganzhi: string
          wuxing_analysis: Record<string, any>
          yongshen?: string | null
          xishen?: string | null
          jishen?: string | null
          ai_analysis?: Record<string, any> | null
          last_analyzed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          birth_date?: string
          birth_time?: string
          birth_city?: string
          birth_longitude?: number
          birth_latitude?: number
          timezone_offset?: number
          is_time_uncertain?: boolean
          year_ganzhi?: string
          month_ganzhi?: string
          day_ganzhi?: string
          hour_ganzhi?: string
          wuxing_analysis?: Record<string, any>
          yongshen?: string | null
          xishen?: string | null
          jishen?: string | null
          ai_analysis?: Record<string, any> | null
          last_analyzed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bazi_dayun: {
        Row: {
          id: string
          bazi_profile_id: string
          sequence: number
          start_age: number
          end_age: number
          ganzhi: string
          description: string | null
          opportunities: Record<string, any> | null
          challenges: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          bazi_profile_id: string
          sequence: number
          start_age: number
          end_age: number
          ganzhi: string
          description?: string | null
          opportunities?: Record<string, any> | null
          challenges?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          bazi_profile_id?: string
          sequence?: number
          start_age?: number
          end_age?: number
          ganzhi?: string
          description?: string | null
          opportunities?: Record<string, any> | null
          challenges?: Record<string, any> | null
          created_at?: string
        }
      }
      compatibility_analyses: {
        Row: {
          id: string
          user_id: string
          person_a_bazi_id: string
          person_b_bazi_id: string
          relationship_type: string
          overall_score: number
          personality_score: number
          wuxing_score: number
          practical_score: number
          conflict_score: number
          growth_score: number
          ai_analysis: Record<string, any> | null
          recommendations: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          person_a_bazi_id: string
          person_b_bazi_id: string
          relationship_type: string
          overall_score: number
          personality_score: number
          wuxing_score: number
          practical_score: number
          conflict_score: number
          growth_score: number
          ai_analysis?: Record<string, any> | null
          recommendations?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          person_a_bazi_id?: string
          person_b_bazi_id?: string
          relationship_type?: string
          overall_score?: number
          personality_score?: number
          wuxing_score?: number
          practical_score?: number
          conflict_score?: number
          growth_score?: number
          ai_analysis?: Record<string, any> | null
          recommendations?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      divination_records: {
        Row: {
          id: string
          user_id: string
          question: string
          question_category: string | null
          hexagram_upper: string
          hexagram_lower: string
          changing_lines: Record<string, any> | null
          primary_hexagram: string
          transformed_hexagram: string | null
          divination_method: string
          divination_time: string
          ai_interpretation: Record<string, any> | null
          conclusion: string | null
          suggestions: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question: string
          question_category?: string | null
          hexagram_upper: string
          hexagram_lower: string
          changing_lines?: Record<string, any> | null
          primary_hexagram: string
          transformed_hexagram?: string | null
          divination_method?: string
          divination_time?: string
          ai_interpretation?: Record<string, any> | null
          conclusion?: string | null
          suggestions?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question?: string
          question_category?: string | null
          hexagram_upper?: string
          hexagram_lower?: string
          changing_lines?: Record<string, any> | null
          primary_hexagram?: string
          transformed_hexagram?: string | null
          divination_method?: string
          divination_time?: string
          ai_interpretation?: Record<string, any> | null
          conclusion?: string | null
          suggestions?: Record<string, any> | null
          created_at?: string
        }
      }
      daily_fortunes: {
        Row: {
          id: string
          user_id: string
          fortune_date: string
          day_ganzhi: string
          fortune_level: string
          suitable_activities: Record<string, any> | null
          unsuitable_activities: Record<string, any> | null
          brief_description: string | null
          detailed_description: string | null
          auspicious_hours: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          fortune_date: string
          day_ganzhi: string
          fortune_level: string
          suitable_activities?: Record<string, any> | null
          unsuitable_activities?: Record<string, any> | null
          brief_description?: string | null
          detailed_description?: string | null
          auspicious_hours?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          fortune_date?: string
          day_ganzhi?: string
          fortune_level?: string
          suitable_activities?: Record<string, any> | null
          unsuitable_activities?: Record<string, any> | null
          brief_description?: string | null
          detailed_description?: string | null
          auspicious_hours?: Record<string, any> | null
          created_at?: string
        }
      }
      name_analyses: {
        Row: {
          id: string
          user_id: string
          name: string
          bazi_profile_id: string | null
          sancai_wuge: Record<string, any> | null
          numerical_analysis: Record<string, any> | null
          wuxing_analysis: Record<string, any> | null
          phonetic_analysis: Record<string, any> | null
          ai_suggestions: Record<string, any> | null
          overall_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          bazi_profile_id?: string | null
          sancai_wuge?: Record<string, any> | null
          numerical_analysis?: Record<string, any> | null
          wuxing_analysis?: Record<string, any> | null
          phonetic_analysis?: Record<string, any> | null
          ai_suggestions?: Record<string, any> | null
          overall_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          bazi_profile_id?: string | null
          sancai_wuge?: Record<string, any> | null
          numerical_analysis?: Record<string, any> | null
          wuxing_analysis?: Record<string, any> | null
          phonetic_analysis?: Record<string, any> | null
          ai_suggestions?: Record<string, any> | null
          overall_score?: number | null
          created_at?: string
        }
      }
      dream_analyses: {
        Row: {
          id: string
          user_id: string
          dream_description: string
          dream_emotions: Record<string, any> | null
          recent_events: string | null
          ai_interpretation: Record<string, any> | null
          psychological_analysis: Record<string, any> | null
          traditional_analysis: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dream_description: string
          dream_emotions?: Record<string, any> | null
          recent_events?: string | null
          ai_interpretation?: Record<string, any> | null
          psychological_analysis?: Record<string, any> | null
          traditional_analysis?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dream_description?: string
          dream_emotions?: Record<string, any> | null
          recent_events?: string | null
          ai_interpretation?: Record<string, any> | null
          psychological_analysis?: Record<string, any> | null
          traditional_analysis?: Record<string, any> | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_tianji_points: {
        Args: {
          user_id: string
          amount: number
          service_type: string
        }
        Returns: boolean
      }
      spend_tianji_points: {
        Args: {
          p_user_id: string
          p_amount: number
          p_service: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}