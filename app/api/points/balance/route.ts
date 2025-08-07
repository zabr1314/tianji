import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TianjiPointsService } from '@/lib/database/services'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 获取用户天机点余额
    const balance = await TianjiPointsService.getBalance(user.id)
    
    return NextResponse.json({
      points: balance,
      user_id: user.id
    })
  } catch (error) {
    console.error('获取天机点余额失败:', error)
    return NextResponse.json(
      { error: '获取余额失败' },
      { status: 500 }
    )
  }
}