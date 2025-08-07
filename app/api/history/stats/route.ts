import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AnalysisRecordsService } from '@/lib/database/services'

// 从所有表中聚合统计信息
async function getAggregatedStats(userId: string) {
  const supabase = await createClient()
  
  const tableConfigs = [
    { table: 'bazi_analyses', type: 'bazi', pointsCost: 200 },
    { table: 'hepan_analyses', type: 'hepan', pointsCost: 300 },
    { table: 'bugua_divinations', type: 'bugua', pointsCost: 150 },
    { table: 'calendar_fortunes', type: 'calendar', pointsCost: 100 },
    { table: 'name_analyses', type: 'name', pointsCost: 120 },
    { table: 'dream_interpretations', type: 'dream', pointsCost: 80 }
  ]

  let totalCount = 0
  let totalPoints = 0
  const typeCounts: Record<string, number> = {}

  for (const config of tableConfigs) {
    try {
      const { count, error } = await supabase
        .from(config.table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (!error && count !== null) {
        totalCount += count
        totalPoints += count * config.pointsCost
        if (count > 0) {
          typeCounts[config.type] = count
        }
      }
    } catch (error) {
      console.error(`Error counting ${config.table}:`, error)
      // 继续查询其他表
    }
  }

  return {
    totalCount,
    totalPoints,
    typeCounts
  }
}

// 获取用户历史记录统计信息
export async function GET(request: NextRequest) {
  try {
    // 验证用户认证
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    // 获取统计信息 - 从所有表中聚合
    const stats = await getAggregatedStats(user.id)

    // 计算额外的统计信息
    const totalTypes = Object.keys(stats.typeCounts).length
    const mostUsedType = Object.entries(stats.typeCounts).reduce(
      (max, [type, count]) => count > max.count ? { type, count } : max,
      { type: '', count: 0 }
    )

    const response = {
      success: true,
      data: {
        ...stats,
        totalTypes,
        mostUsedType: mostUsedType.type || null,
        averagePointsPerRecord: stats.totalCount > 0 
          ? Math.round(stats.totalPoints / stats.totalCount) 
          : 0
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('History stats API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '获取统计信息失败' 
      },
      { status: 500 }
    )
  }
}