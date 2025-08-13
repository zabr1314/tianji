import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BuguaCalculator, BuguaQuestion } from '@/lib/bugua/calculator'
import { TianjiPointsService, AnalysisRecordsService } from '@/lib/database/services'
import OpenAI from 'openai'

// 初始化DeepSeek客户端
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
})

interface BuguaAnalyzeRequest {
  question: string
  category: 'career' | 'love' | 'wealth' | 'health' | 'study' | 'family' | 'travel' | 'other'
  urgency: 'high' | 'medium' | 'low'
  method: 'time' | 'coins'
  coin_results?: number[] // 如果是硬币法，提供6次投币结果
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

    const body = await request.json() as BuguaAnalyzeRequest

    // 验证必填字段
    const requiredFields = ['question', 'category', 'urgency', 'method'] as Array<keyof BuguaAnalyzeRequest>
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        )
      }
    }

    // 验证硬币法的投币结果
    if (body.method === 'coins') {
      if (!body.coin_results || body.coin_results.length !== 6) {
        return NextResponse.json(
          { error: '硬币占卜法需要6次投币结果' },
          { status: 400 }
        )
      }
      
      // 验证每次投币结果（0-3个正面）
      const isValidCoins = body.coin_results.every(result => 
        Number.isInteger(result) && result >= 0 && result <= 3
      )
      
      if (!isValidCoins) {
        return NextResponse.json(
          { error: '投币结果必须是0-3之间的整数' },
          { status: 400 }
        )
      }
    }

    // 检查用户天机点余额
    const serviceCost = 150 // 卜卦分析消耗150天机点
    const hasEnoughPoints = await TianjiPointsService.hasEnoughPoints(user.id, serviceCost)
    
    if (!hasEnoughPoints) {
      return NextResponse.json(
        { 
          error: '天机点余额不足',
          required_points: serviceCost,
          service_type: 'bugua'
        },
        { status: 402 }
      )
    }

    // 构建占卜问题对象
    const buguaQuestion: BuguaQuestion = {
      question: body.question,
      category: body.category,
      urgency: body.urgency
    }

    // 根据方法生成卦象
    let buguaResult
    if (body.method === 'coins' && body.coin_results) {
      buguaResult = BuguaCalculator.generateHexagramByCoins(buguaQuestion, body.coin_results)
    } else {
      buguaResult = BuguaCalculator.generateHexagram(buguaQuestion)
    }

    // 生成AI深度分析
    const aiAnalysis = await generateAIAnalysis(buguaQuestion, buguaResult)

    // 先扣除天机点
    const pointsDeducted = await TianjiPointsService.spendPoints(
      user.id, 
      serviceCost, 
      'bugua', 
      `卜卦占卜：${body.question}`
    )
    
    if (!pointsDeducted) {
      return NextResponse.json(
        { error: '天机点扣除失败' },
        { status: 402 }
      )
    }

    // 保存到历史记录
    const categoryMap = {
      'career': '事业工作',
      'love': '感情婚姻',
      'wealth': '财运投资', 
      'health': '健康身体',
      'study': '学习考试',
      'family': '家庭关系',
      'travel': '出行旅游',
      'other': '其他事务'
    }
    
    const title = `${categoryMap[body.category]} - ${body.question}`
    const summary = `${buguaResult.hexagram.name}，${buguaResult.hexagram.fortune}。综合评分${buguaResult.scores.overall_score}分。${buguaResult.interpretation.advice}`

    await AnalysisRecordsService.saveRecord({
      userId: user.id,
      analysisType: 'bugua',
      title,
      summary,
      inputData: {
        question: body.question,
        category: body.category,
        urgency: body.urgency,
        method: body.method,
        coin_results: body.coin_results
      },
      outputData: {
        hexagram: buguaResult.hexagram,
        interpretation: buguaResult.interpretation,
        details: buguaResult.details,
        scores: buguaResult.scores,
        timeframe: buguaResult.timeframe,
        ai_analysis: aiAnalysis
      },
      pointsCost: serviceCost
    })

    const response = {
      success: true,
      question: buguaResult.question,
      hexagram: buguaResult.hexagram,
      interpretation: buguaResult.interpretation,
      details: buguaResult.details,
      scores: buguaResult.scores,
      timeframe: buguaResult.timeframe,
      ai_analysis: aiAnalysis,
      cost: serviceCost,
      timestamp: new Date().toISOString(),
      method: body.method
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Bugua analysis error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '卜卦分析失败，请稍后重试' 
      },
      { status: 500 }
    )
  }
}

async function generateAIAnalysis(question: BuguaQuestion, result: any): Promise<string> {
  try {
    const categoryMap = {
      career: '事业工作',
      love: '感情婚姻',
      wealth: '财运投资', 
      health: '健康身体',
      study: '学习考试',
      family: '家庭关系',
      travel: '出行旅游',
      other: '其他事务'
    }

    const urgencyMap = {
      high: '紧急重要',
      medium: '一般重要', 
      low: '不太紧急'
    }

    const prompt = `作为一位精通易经卜卦的大师，请为以下卜卦提供深度分析：

【占卜信息】
问题：${question.question}
类别：${categoryMap[question.category]}
紧急程度：${urgencyMap[question.urgency]}

【卦象结果】
卦名：${result.hexagram.name}
上卦：${result.hexagram.upper} (${result.details.upper_gua_analysis})
下卦：${result.hexagram.lower} (${result.details.lower_gua_analysis})
卦辞：${result.hexagram.meaning}
吉凶：${result.hexagram.fortune}

【系统分析】
总体解释：${result.interpretation.overall}
建议：${result.interpretation.advice}
时机：${result.interpretation.timing}
注意事项：${result.interpretation.caution}

【评分情况】
成功概率：${result.scores.success_rate}分
风险等级：${result.scores.risk_level}分
时机评分：${result.scores.timing_score}分
综合评分：${result.scores.overall_score}分

请从以下角度提供专业分析：
1. 【卦象解读】：详细解释此卦在当前问题上的含义
2. 【行动指南】：基于卦象给出具体的行动建议
3. 【时机把握】：分析最佳行动时机和需要注意的时间节点
4. 【风险预警】：指出可能遇到的困难和规避方法
5. 【成功要素】：分析成功的关键因素和必要条件

分析要求：
- 基于传统易经理论，结合现代实际情况
- 语言准确专业，避免迷信色彩
- 重点给出实用的指导建议
- 字数控制在600-1000字
- 条理清晰，逻辑严密`

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "你是一位专业的易经卜卦分析师，精通六十四卦的含义和应用。你的分析基于传统易经智慧，同时结合现代实际情况，为咨询者提供实用的人生指导。"
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 1500
    })

    return completion.choices[0]?.message?.content || '分析生成失败，请稍后重试'

  } catch (error) {
    console.error('AI analysis error:', error)
    return `系统分析：根据${result.hexagram.name}的卦象，您的问题显示${result.hexagram.fortune}的趋势。建议${result.interpretation.advice}，注意${result.interpretation.caution}。时机方面${result.interpretation.timing}，整体而言需要保持谨慎乐观的态度，相信智慧和努力终将带来好的结果。`
  }
}