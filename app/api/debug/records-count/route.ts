import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: '用户未认证' }, { status: 401 })
    }

    const tableConfigs = [
      { table: 'bazi_analyses', type: 'bazi' },
      { table: 'hepan_analyses', type: 'hepan' },
      { table: 'bugua_divinations', type: 'bugua' },
      { table: 'calendar_fortunes', type: 'calendar' },
      { table: 'name_analyses', type: 'name' },
      { table: 'dream_interpretations', type: 'dream' }
    ]

    const results: Record<string, number> = {}
    let totalCount = 0

    for (const config of tableConfigs) {
      try {
        const { count, error } = await supabase
          .from(config.table)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        const tableCount = !error && count !== null ? count : 0
        results[config.type] = tableCount
        totalCount += tableCount
        
        console.log(`调试统计 - 表 ${config.table}: ${tableCount} 条记录`)
      } catch (error) {
        console.error(`调试统计错误 - 表 ${config.table}:`, error)
        results[config.type] = 0
      }
    }

    console.log(`调试统计 - 总计: ${totalCount} 条记录`)

    return NextResponse.json({
      success: true,
      totalCount,
      tableBreakdown: results
    })

  } catch (error) {
    console.error('Debug records count API error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : '获取统计失败' 
    }, { status: 500 })
  }
}