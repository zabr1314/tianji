import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 简化版优化API - 不使用RPC函数，先用原来的查询方式
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    
    // 解析查询参数
    const analysisType = searchParams.get('type') || undefined
    const isFavorite = searchParams.get('favorite') === 'true'
    const searchQuery = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 并行执行统计查询和记录查询
    const [statsResult, recordsResult] = await Promise.all([
      // 获取统计信息 - 使用原有API
      fetch(`${request.nextUrl.origin}/api/history/stats`, {
        headers: {
          'Cookie': request.headers.get('Cookie') || ''
        }
      }).then(res => res.json()),
      
      // 获取记录列表 - 使用原有API
      fetch(`${request.nextUrl.origin}/api/history/records?${new URLSearchParams({
        type: analysisType || '',
        favorite: isFavorite.toString(),
        search: searchQuery || '',
        sortBy,
        sortOrder,
        limit: limit.toString(),
        offset: offset.toString()
      })}`, {
        headers: {
          'Cookie': request.headers.get('Cookie') || ''
        }
      }).then(res => res.json())
    ])

    if (!statsResult.success) {
      console.error('Stats query error:', statsResult.error)
      return NextResponse.json({
        success: false,
        error: '获取统计信息失败'
      }, { status: 500 })
    }

    if (!recordsResult.success) {
      console.error('Records query error:', recordsResult.error)
      return NextResponse.json({
        success: false,
        error: '获取历史记录失败'
      }, { status: 500 })
    }

    const stats = statsResult.data || {
      totalCount: 0,
      totalPoints: 0,
      typeCounts: {},
      mostUsedType: null
    }

    const records = recordsResult.data || []

    // 计算收藏数量
    const favoriteCount = records.filter((record: any) => record.is_favorite).length

    // 格式化响应数据
    const response = {
      success: true,
      data: {
        stats: {
          totalCount: stats.totalCount,
          totalPoints: stats.totalPoints,
          favoriteCount: favoriteCount,
          typeCounts: stats.typeCounts,
          mostUsedType: stats.mostUsedType,
          averagePointsPerRecord: stats.totalCount > 0 
            ? Math.round(stats.totalPoints / stats.totalCount) 
            : 0
        },
        records: records,
        pagination: {
          limit,
          offset,
          hasMore: records.length === limit,
          total: stats.totalCount
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Optimized history API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取历史记录失败'
    }, { status: 500 })
  }
}

// 批量操作历史记录
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, recordIds, data: updateData } = body

    if (!action || !recordIds || !Array.isArray(recordIds)) {
      return NextResponse.json(
        { error: '请提供操作类型和记录ID列表' },
        { status: 400 }
      )
    }

    let results = []

    switch (action) {
      case 'toggle_favorite':
        // 批量切换收藏状态 - 使用user_favorites表
        for (const recordInfo of recordIds) {
          const { id, analysis_type, is_favorite } = recordInfo
          
          if (is_favorite) {
            // 移除收藏
            const { error } = await supabase
              .from('user_favorites')
              .delete()
              .eq('user_id', user.id)
              .eq('analysis_type', analysis_type)
              .eq('analysis_id', id)
              
            results.push({ id, success: !error, error: error?.message })
          } else {
            // 添加收藏
            const { error } = await supabase
              .from('user_favorites')
              .insert({
                user_id: user.id,
                analysis_type: analysis_type,
                analysis_id: id,
                title: `${analysis_type}分析记录`
              })
              
            results.push({ id, success: !error, error: error?.message })
          }
        }
        break

      case 'batch_delete':
        // 批量删除记录
        const deletePromises = recordIds.map(async (recordInfo: any) => {
          const { id, analysis_type } = recordInfo
          const tableName = getTableName(analysis_type)
          
          if (!tableName) {
            return { id, success: false, error: 'Invalid analysis type' }
          }

          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

          return { id, success: !error, error: error?.message }
        })

        results = await Promise.all(deletePromises)
        break

      default:
        return NextResponse.json(
          { error: '不支持的操作类型' },
          { status: 400 }
        )
    }

    const successCount = results.filter(r => r.success).length
    
    return NextResponse.json({
      success: true,
      message: `成功处理 ${successCount}/${results.length} 条记录`,
      results
    })

  } catch (error) {
    console.error('Batch operation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '批量操作失败'
    }, { status: 500 })
  }
}

// 获取表名的辅助函数
function getTableName(analysisType: string): string | null {
  const tableMap: Record<string, string> = {
    'bazi': 'bazi_analyses',
    'hepan': 'hepan_analyses', 
    'bugua': 'bugua_divinations',
    'calendar': 'calendar_fortunes',
    'name': 'name_analyses',
    'dream': 'dream_interpretations'
  }
  
  return tableMap[analysisType] || null
}