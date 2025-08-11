import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AnalysisRecordsService } from '@/lib/database/services'

// 从所有表中查找单个记录
async function findRecordById(userId: string, recordId: string) {
  const supabase = await createClient()

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
    try {
      const { data, error } = await supabase
        .from(config.table)
        .select('*')
        .eq('user_id', userId)
        .eq('id', recordId)
        .single()

      if (!error && data) {
        return {
          id: data.id,
          user_id: data.user_id,
          analysis_type: config.type,
          title: getRecordTitle(data, config.type),
          summary: getRecordSummary(data, config.type),
          input_data: getInputData(data, config.type),
          output_data: getOutputData(data, config.type),
          points_cost: config.pointsCost,
          created_at: data.created_at,
          updated_at: data.updated_at,
          is_favorite: data.is_favorite || false,
          tags: data.tags || []
        }
      }
    } catch (error) {
      console.error(`Error fetching from ${config.table}:`, error)
      // 继续查询其他表
    }
  }

  return null
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
      return `解梦 - ${record.dream_content?.substring(0, 20) || '未知梦境'}`
    default:
      return '未知分析'
  }
}

// 根据记录类型生成摘要
function getRecordSummary(record: any, type: string): string {
  const result = record.analysis_result || record.interpretation_result || record.divination_result || record.fortune_result || ''
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
  switch (type) {
    case 'bazi':
      // 确保八字分析的数据格式正确
      const baziResult = record.bazi_result || {}
      
      return {
        success: true,
        bazi: baziResult.bazi_chart || {
          year_ganzhi: '',
          month_ganzhi: '',
          day_ganzhi: '',
          hour_ganzhi: ''
        },
        wuxing_analysis: baziResult.wuxing_analysis || {
          wood: 0,
          fire: 0,
          earth: 0,
          metal: 0,
          water: 0,
          strongest: '未知',
          weakest: '未知',
          percentages: {
            wood: 0,
            fire: 0,
            earth: 0,
            metal: 0,
            water: 0
          }
        },
        dayun: baziResult.dayun_periods || [],
        ai_analysis: (() => {
          let aiText = record.ai_analysis || '';
          // 如果ai_analysis是JSON字符串，需要解析
          if (aiText.startsWith('"') && aiText.endsWith('"')) {
            try {
              aiText = JSON.parse(aiText);
            } catch (e) {
              console.log('Failed to parse ai_analysis JSON:', e);
            }
          }
          return aiText;
        })(),
        yongshen: baziResult.yongshen || '未知',
        cost: record.points_cost || 200
      }
    case 'hepan':
      // 确保合盘分析的数据格式正确，兼容新旧数据结构
      const hepanResult = record.hepan_result || record.compatibility_result || {}
      
      // 如果已经有完整的新格式数据，直接返回
      if (hepanResult.person1 && hepanResult.person2) {
        return {
          success: true,
          ...hepanResult
        }
      }
      
      // 兼容旧格式数据，构建标准格式
      return {
        success: true,
        person1: {
          name: record.person1_name || '未知',
          bazi: hepanResult.person1_bazi || {},
          wuxing_analysis: hepanResult.person1_wuxing || {}
        },
        person2: {
          name: record.person2_name || '未知', 
          bazi: hepanResult.person2_bazi || {},
          wuxing_analysis: hepanResult.person2_wuxing || {}
        },
        compatibility: hepanResult.compatibility || {
          overall_score: 0,
          wuxing_compatibility: 0,
          ganzhi_compatibility: 0,
          yongshen_compatibility: 0,
          dayun_compatibility: 0
        },
        analysis: hepanResult.analysis || {
          strengths: ['暂无分析'],
          challenges: ['暂无分析'],
          suggestions: ['暂无分析']
        },
        detailed_scores: hepanResult.detailed_scores || {
          love_score: 0,
          career_score: 0,
          wealth_score: 0,
          health_score: 0,
          family_score: 0
        },
        ai_analysis: (() => {
          // 尝试多个可能的数据源
          let aiText = record.ai_analysis || hepanResult.ai_analysis || record.analysis_result || '';
          
          // 如果ai_analysis是JSON字符串，需要解析
          if (typeof aiText === 'string' && aiText.startsWith('"') && aiText.endsWith('"')) {
            try {
              aiText = JSON.parse(aiText);
            } catch (e) {
              console.log('Failed to parse ai_analysis JSON:', e);
            }
          }
          
          console.log('Hepan AI Analysis Debug:', {
            record_ai_analysis: record.ai_analysis,
            hepan_result_ai_analysis: hepanResult.ai_analysis,
            record_analysis_result: record.analysis_result,
            final_ai_text: aiText
          });
          
          return aiText || '';
        })(),
        cost: hepanResult.cost || record.points_cost || 300
      }
    default:
      return {
        ...record,
        result: record.analysis_result || record.interpretation_result || record.divination_result || record.fortune_result || '',
        ai_analysis: record.analysis_result || record.interpretation_result || record.divination_result || record.fortune_result || '',
        created_at: record.created_at
      }
  }
}

// 获取单个历史记录详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // 获取记录详情
    const record = await findRecordById(user.id, id)

    if (!record) {
      return NextResponse.json(
        { error: '记录不存在或无权访问' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: record
    })

  } catch (error) {
    console.error('Get record API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '获取记录详情失败' 
      },
      { status: 500 }
    )
  }
}

// 更新历史记录（收藏、标签等）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { is_favorite, tags, summary } = body

    // 构建更新数据
    const updates: {
      isFavorite?: boolean
      tags?: string[]
      summary?: string
    } = {}

    if (typeof is_favorite === 'boolean') {
      updates.isFavorite = is_favorite
    }
    if (Array.isArray(tags)) {
      updates.tags = tags
    }
    if (typeof summary === 'string') {
      updates.summary = summary
    }

    // 更新记录
    const updatedRecord = await AnalysisRecordsService.updateRecord(id, user.id, updates)

    if (!updatedRecord) {
      return NextResponse.json(
        { error: '记录不存在或更新失败' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedRecord
    })

  } catch (error) {
    console.error('Update record API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '更新记录失败' 
      },
      { status: 500 }
    )
  }
}

// 删除单个历史记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // 删除记录
    const success = await AnalysisRecordsService.deleteRecord(id, user.id)

    if (!success) {
      return NextResponse.json(
        { error: '记录不存在或删除失败' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '记录删除成功'
    })

  } catch (error) {
    console.error('Delete record API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '删除记录失败' 
      },
      { status: 500 }
    )
  }
}