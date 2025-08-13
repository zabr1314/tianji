import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AnalysisRecordsService } from '@/lib/database/services'

// 从所有表中聚合历史记录
async function getAggregatedRecords(params: {
  userId: string
  analysisType?: string
  limit: number
  offset: number
  sortBy: 'created_at' | 'points_cost'
  sortOrder: 'asc' | 'desc'
}) {
  const supabase = await createClient()
  const allRecords = []

  // 定义所有可能的历史记录表和对应的分析类型
  const tableConfigs = [
    { table: 'bazi_analyses', type: 'bazi', pointsCost: 200 },
    { table: 'hepan_analyses', type: 'hepan', pointsCost: 300 },
    { table: 'bugua_divinations', type: 'bugua', pointsCost: 150 },
    { table: 'calendar_fortunes', type: 'calendar', pointsCost: 100 },
    { table: 'name_analyses', type: 'name', pointsCost: 120 },
    { table: 'dream_interpretations', type: 'dream', pointsCost: 80 }
  ]

  for (const config of tableConfigs) {
    // 如果指定了分析类型，只查询匹配的表
    if (params.analysisType && params.analysisType !== config.type) {
      continue
    }

    try {
      const { data, error } = await supabase
        .from(config.table)
        .select('*')
        .eq('user_id', params.userId)
        .order('created_at', { ascending: params.sortOrder === 'asc' })

      if (!error && data && data.length > 0) {
        const formattedRecords = data.map(record => ({
          id: record.id,
          user_id: record.user_id,
          analysis_type: config.type,
          title: getRecordTitle(record, config.type),
          summary: getRecordSummary(record, config.type),
          input_data: getInputData(record, config.type),
          output_data: getOutputData(record, config.type),
          points_cost: config.pointsCost,
          created_at: record.created_at,
          updated_at: record.updated_at,
          is_favorite: record.is_favorite || false,
          tags: record.tags || []
        }))
        
        allRecords.push(...formattedRecords)
      }
    } catch (error) {
      console.error(`Error fetching from ${config.table}:`, error)
      // 继续查询其他表，不要因为一个表出错就停止
    }
  }

  // 排序所有记录
  allRecords.sort((a, b) => {
    const aTime = new Date(a.created_at).getTime()
    const bTime = new Date(b.created_at).getTime()
    return params.sortOrder === 'asc' ? aTime - bTime : bTime - aTime
  })

  // 应用分页
  const startIndex = params.offset
  const endIndex = startIndex + params.limit
  return allRecords.slice(startIndex, endIndex)
}

// 根据记录类型生成标题
function getRecordTitle(record: any, type: string): string {
  switch (type) {
    case 'bazi':
      return `八字分析 - ${record.person_name || '未知'}`
    case 'hepan':
      return `合盘配对 - ${record.person1_name} & ${record.person2_name}`
    case 'bugua':
      return `卜卦占卜 - ${record.question?.substring(0, 20) || '未知问题'}`
    case 'calendar':
      return `运势分析 - ${record.person_name} (${record.target_date})`
    case 'name':
      return `姓名分析 - ${record.name}`
    case 'dream':
      return `解梦 - ${record.dream_content?.substring(0, 20) || '未知梦境'}${record.dream_content?.length > 20 ? '...' : ''}`
    default:
      return '未知分析'
  }
}

// 根据记录类型生成摘要
function getRecordSummary(record: any, type: string): string {
  let result = ''
  
  // 根据不同类型获取摘要
  switch (type) {
    case 'dream':
      // 对于梦境解析，优先使用AI分析的前100字符作为摘要
      result = record.ai_analysis || record.interpretation_result || ''
      break
    default:
      result = record.analysis_result || record.interpretation_result || record.divination_result || record.fortune_result || ''
  }
  
  if (typeof result === 'string' && result.trim()) {
    // 只在内容被截断时添加省略号
    return result.length > 100 ? result.substring(0, 100) + '...' : result
  }
  return ''
}

// 获取输入数据
function getInputData(record: any, type: string): any {
  switch (type) {
    case 'bazi':
      return {
        person_name: record.person_name,
        birth_date: record.birth_date,
        birth_time: record.birth_time,
        birth_location: record.birth_location
      }
    case 'hepan':
      return {
        person1_name: record.person1_name,
        person1_birth_date: record.person1_birth_date,
        person2_name: record.person2_name,
        person2_birth_date: record.person2_birth_date
      }
    case 'bugua':
      return {
        question: record.question,
        hexagram_primary: record.hexagram_primary,
        hexagram_changed: record.hexagram_changed
      }
    case 'calendar':
      return {
        person_name: record.person_name,
        target_date: record.target_date
      }
    case 'name':
      return {
        name: record.name,
        gender: record.gender
      }
    case 'dream':
      return {
        dream_content: record.dream_content
      }
    default:
      return {}
  }
}

// 获取输出数据
function getOutputData(record: any, type: string): any {
  let result = ''
  let ai_analysis = ''
  
  // 根据不同类型获取结果字段
  switch (type) {
    case 'dream':
      // 对于梦境解析，分别获取AI分析和整体结果
      // 确保ai_analysis是字符串类型
      ai_analysis = typeof record.ai_analysis === 'string' ? record.ai_analysis : 
        (typeof record.ai_analysis === 'object' && record.ai_analysis ? JSON.stringify(record.ai_analysis) : '')
      result = record.interpretation_result || ai_analysis || ''
      break
    default:
      result = record.analysis_result || record.interpretation_result || record.divination_result || record.fortune_result || ''
  }
  
  return {
    result,
    ai_analysis, // 专门为梦境解析添加ai_analysis字段
    created_at: record.created_at
  }
}

// 获取用户的历史记录列表
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

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const analysisType = searchParams.get('type') || undefined
    const isFavorite = searchParams.get('favorite') === 'true'
    const searchQuery = searchParams.get('search') || undefined
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = (searchParams.get('sortBy') as 'created_at' | 'points_cost') || 'created_at'
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'

    // 获取记录列表 - 从所有可能的表中聚合数据
    const records = await getAggregatedRecords({
      userId: user.id,
      analysisType,
      limit,
      offset,
      sortBy,
      sortOrder
    })

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        limit,
        offset,
        hasMore: records.length === limit
      }
    })

  } catch (error) {
    console.error('History records API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '获取历史记录失败' 
      },
      { status: 500 }
    )
  }
}

// 批量删除历史记录
export async function DELETE(request: NextRequest) {
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

    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '请提供要删除的记录ID列表' },
        { status: 400 }
      )
    }

    // 批量删除记录
    const success = await AnalysisRecordsService.deleteRecords(ids, user.id)

    if (!success) {
      return NextResponse.json(
        { error: '删除记录失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `成功删除 ${ids.length} 条记录`
    })

  } catch (error) {
    console.error('Batch delete records API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '批量删除记录失败' 
      },
      { status: 500 }
    )
  }
}