import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 优化后的历史记录API - 合并stats和records，使用RPC函数
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
    const analysisType = searchParams.get('type') || null
    const isFavorite = searchParams.get('favorite') === 'true' ? true : null
    const searchQuery = searchParams.get('search') || null
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 并行执行统计查询和记录查询
    const [statsResult, recordsResult] = await Promise.all([
      // 获取统计信息
      supabase.rpc('get_user_history_stats', {
        p_user_id: user.id
      }),
      
      // 获取记录列表
      supabase.rpc('get_user_history', {
        p_user_id: user.id,
        p_analysis_type: analysisType,
        p_is_favorite: isFavorite,
        p_search_query: searchQuery,
        p_limit: limit,
        p_offset: offset,
        p_sort_by: sortBy,
        p_sort_order: sortOrder
      })
    ])

    if (statsResult.error) {
      console.error('Stats query error:', statsResult.error)
      return NextResponse.json({
        success: false,
        error: '获取统计信息失败'
      }, { status: 500 })
    }

    if (recordsResult.error) {
      console.error('Records query error:', recordsResult.error)
      return NextResponse.json({
        success: false,
        error: '获取历史记录失败'
      }, { status: 500 })
    }

    const stats = statsResult.data?.[0] || {
      total_count: 0,
      total_points: 0,
      favorite_count: 0,
      type_counts: {},
      most_used_type: null,
      average_points_per_record: 0
    }

    const records = recordsResult.data || []

    // 格式化响应数据
    const response = {
      success: true,
      data: {
        stats: {
          totalCount: Number(stats.total_count),
          totalPoints: Number(stats.total_points),
          favoriteCount: Number(stats.favorite_count),
          typeCounts: stats.type_counts || {},
          mostUsedType: stats.most_used_type,
          averagePointsPerRecord: Number(stats.average_points_per_record)
        },
        records: records.map((record: any) => ({
          id: record.id,
          analysis_type: record.analysis_type,
          title: record.title,
          summary: record.summary,
          input_data: record.input_data,
          output_data: record.output_data,
          points_cost: record.points_cost,
          is_favorite: record.is_favorite,
          tags: record.tags || [],
          created_at: record.created_at,
          updated_at: record.updated_at
        })),
        pagination: {
          limit,
          offset,
          hasMore: records.length === limit,
          total: Number(stats.total_count)
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
        // 批量切换收藏状态
        for (const recordInfo of recordIds) {
          const { id, analysis_type, is_favorite } = recordInfo
          const { data, error } = await supabase.rpc('update_record_favorite', {
            p_record_id: id,
            p_user_id: user.id,
            p_analysis_type: analysis_type,
            p_is_favorite: !is_favorite
          })
          
          if (error) {
            console.error(`Failed to update favorite for ${id}:`, error)
          } else {
            results.push({ id, success: true })
          }
        }
        break

      case 'batch_delete':
        // 批量删除记录 (需要根据分析类型删除)
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