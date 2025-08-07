import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BaziCalculator } from '@/lib/bazi/calculator'
import { BaziAnalysisService, TianjiPointsService } from '@/lib/database/services'
import OpenAI from 'openai'

// DeepSeek AI client
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY!
})

interface BaziAnalyzeRequest {
  name: string
  birth_date: string
  birth_time: string
  birth_city: string
  gender?: 'male' | 'female'
  longitude?: number
  latitude?: number
}

export async function POST(request: NextRequest) {
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

    // 解析请求体
    const body: BaziAnalyzeRequest = await request.json()
    
    // 验证必要字段
    const requiredFields: Array<keyof BaziAnalyzeRequest> = ['name', 'birth_date', 'birth_time', 'birth_city']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `缺少必要字段: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // 验证日期格式
    const birthDate = new Date(body.birth_date)
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: '日期格式无效' },
        { status: 400 }
      )
    }

    // 验证时间格式
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(body.birth_time)) {
      return NextResponse.json(
        { error: '时间格式无效，请使用 HH:MM 格式' },
        { status: 400 }
      )
    }

    // 检查用户天机点余额
    const serviceCost = 200 // 八字分析消耗200天机点
    const hasEnoughPoints = await TianjiPointsService.hasEnoughPoints(user.id, serviceCost)
    
    if (!hasEnoughPoints) {
      return NextResponse.json(
        { 
          error: '天机点余额不足',
          required_points: serviceCost,
          service_type: 'bazi'
        },
        { status: 402 }
      )
    }

    // 构建完整的出生时间
    const [hours, minutes] = body.birth_time.split(':').map(Number)
    const fullBirthTime = new Date(birthDate)
    fullBirthTime.setHours(hours, minutes, 0, 0)

    // 使用默认经纬度如果未提供（北京）
    const longitude = body.longitude || 116.4074
    // const latitude = body.latitude || 39.9042 // 暂时未使用，保留用于将来扩展

    // 计算真太阳时
    const solarTime = BaziCalculator.calculateSolarTime(fullBirthTime, longitude)
    
    // 生成八字
    const baziChart = BaziCalculator.generateBazi(solarTime)
    
    // 分析五行
    const wuxingAnalysis = BaziCalculator.analyzeWuXing(baziChart)
    
    // 计算大运
    const gender = body.gender || 'male'
    const dayunPeriods = BaziCalculator.calculateDayun(baziChart, birthDate, gender)
    
    // 确定用神
    const yongshen = BaziCalculator.determinYongshen(wuxingAnalysis, baziChart.day_ganzhi[0])

    // AI分析 - 使用增强版提示词
    let aiAnalysis
    try {
      const prompt = `
你是一位精通传统八字命理学的资深大师，拥有30年丰富实践经验。请为以下八字进行全面深入的专业分析：

【命主信息】
姓名：${body.name}
性别：${gender === 'male' ? '男' : '女'}
出生时间：${body.birth_date} ${body.birth_time}（阳历）
出生地点：${body.birth_city}
真太阳时：${solarTime.toISOString()}

【八字四柱】
年柱（祖辈宫）：${baziChart.year_ganzhi}
月柱（父母宫）：${baziChart.month_ganzhi}  
日柱（自身宫）：${baziChart.day_ganzhi} [日主]
时柱（子女宫）：${baziChart.hour_ganzhi}

【五行力量分布】
木：${wuxingAnalysis.wood}个 (${((wuxingAnalysis.wood/8)*100).toFixed(1)}%)
火：${wuxingAnalysis.fire}个 (${((wuxingAnalysis.fire/8)*100).toFixed(1)}%)
土：${wuxingAnalysis.earth}个 (${((wuxingAnalysis.earth/8)*100).toFixed(1)}%)
金：${wuxingAnalysis.metal}个 (${((wuxingAnalysis.metal/8)*100).toFixed(1)}%)
水：${wuxingAnalysis.water}个 (${((wuxingAnalysis.water/8)*100).toFixed(1)}%)

五行格局：最强为${wuxingAnalysis.strongest}，最弱为${wuxingAnalysis.weakest}
用神喜忌：用神为${yongshen}

【分析要求】
请按照以下12个专业维度进行详细分析，每个维度300-500字，要求专业、深入、实用：

1. 【命格总论】- 分析日主强弱、格局高低、命运层次
2. 【性格特质】- 基于日主和月令分析深层性格特征
3. 【天赋才华】- 挖掘命主的天生优势和特殊能力
4. 【事业发展】- 职业方向、创业时机、事业高峰期
5. 【财运分析】- 财运来源、求财方式、投资理财建议
6. 【感情婚姻】- 感情特质、配偶特征、最佳婚期
7. 【健康养生】- 体质特点、易患疾病、养生建议
8. 【人际关系】- 社交特点、贵人运、人际处理方式
9. 【大运流年】- 当前大运分析、近5年运势走向
10. 【子女缘分】- 子女运势、教育方式、亲子关系
11. 【开运指南】- 幸运色彩方位、改运方法、风水建议
12. 【人生建议】- 综合性的人生规划和修养建议

【分析原则】
- 基于正统八字理论，结合现代生活实际
- 语言专业但通俗易懂，避免过于玄虚
- 重在指导和建设性建议，避免消极预测
- 每个维度都要有具体可行的建议
- 体现出资深命理师的专业水准

请以详细的文本格式返回分析结果，每个维度单独成段，用【】标注维度标题。
`

      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 6000
      })

      const aiResponse = completion.choices[0]?.message?.content
      if (aiResponse) {
        // 直接使用AI响应文本，不尝试解析JSON
        // 新的增强分析格式使用【】标记，由前端组件解析
        aiAnalysis = aiResponse.trim()
      }
    } catch (aiError) {
      console.error('AI analysis failed:', aiError)
      return NextResponse.json(
        { error: 'AI服务暂时不可用，请稍后再试' },
        { status: 503 }
      )
    }

    // 先扣除天机点
    const pointsDeducted = await TianjiPointsService.spendPoints(
      user.id, 
      serviceCost, 
      'bazi', 
      `八字分析：${body.name}`
    )
    
    if (!pointsDeducted) {
      return NextResponse.json(
        { error: '天机点扣除失败' },
        { status: 402 }
      )
    }

    // 构建分析结果数据
    const analysisData = {
      bazi_chart: baziChart,
      wuxing_analysis: wuxingAnalysis,
      dayun_periods: dayunPeriods,
      yongshen: yongshen,
      solar_time: solarTime.toISOString()
    }

    // 保存八字分析到数据库
    const savedAnalysis = await BaziAnalysisService.saveAnalysis({
      user_id: user.id,
      person_name: body.name,
      birth_date: body.birth_date,
      birth_time: body.birth_time,
      birth_city: body.birth_city,
      gender: gender,
      bazi_result: analysisData,
      ai_analysis: JSON.stringify(aiAnalysis),
      points_cost: serviceCost
    })

    if (!savedAnalysis) {
      console.error('Failed to save bazi analysis')
      // 这里可以考虑回退天机点，但为了简化先跳过
    }

    // 返回分析结果
    return NextResponse.json({
      success: true,
      analysis_id: savedAnalysis?.id,
      bazi: baziChart,
      wuxing_analysis: wuxingAnalysis,
      dayun: dayunPeriods,
      yongshen: yongshen,
      ai_analysis: aiAnalysis,
      cost: serviceCost,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Bazi analysis error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}