import { NextRequest, NextResponse } from 'next/server'
import { generateMonthlyGeneralFortune } from '@/lib/fortune-calendar/general-fortune'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')
    
    // 获取年月参数，默认为当前月
    const today = new Date()
    const year = yearParam ? parseInt(yearParam) : today.getFullYear()
    const month = monthParam ? parseInt(monthParam) : today.getMonth() + 1
    
    // 参数验证
    if (year < 1900 || year > 2100) {
      return NextResponse.json(
        { error: '年份参数无效' },
        { status: 400 }
      )
    }
    
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: '月份参数无效' },
        { status: 400 }
      )
    }
    
    // 生成通用运势数据
    const dailyFortunes = generateMonthlyGeneralFortune(year, month)
    
    return NextResponse.json({
      success: true,
      data: {
        year,
        month,
        days: dailyFortunes
      }
    })
    
  } catch (error) {
    console.error('Generate general fortune error:', error)
    return NextResponse.json(
      { error: '生成通用运势失败' },
      { status: 500 }
    )
  }
}