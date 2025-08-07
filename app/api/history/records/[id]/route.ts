import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AnalysisRecordsService } from '@/lib/database/services'

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
    const record = await AnalysisRecordsService.getRecord(id, user.id)

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