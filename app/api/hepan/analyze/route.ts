import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { HepanCalculator, HepanPerson } from '@/lib/hepan/calculator'
import { HepanAnalysisService, TianjiPointsService, AnalysisRecordsService } from '@/lib/database/services'
import OpenAI from 'openai'

// 初始化DeepSeek客户端
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
})

interface HepanAnalyzeRequest {
  person1: {
    name: string
    birth_date: string
    birth_time: string
    birth_city: string
    gender: 'male' | 'female'
  }
  person2: {
    name: string
    birth_date: string
    birth_time: string
    birth_city: string
    gender: 'male' | 'female'
  }
  relationship_type?: 'couple' | 'friends' | 'colleagues' | 'family' | 'other'
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

    const body = await request.json() as HepanAnalyzeRequest

    // 验证必填字段
    const requiredFields = ['person1', 'person2'] as Array<keyof HepanAnalyzeRequest>
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        )
      }
    }

    // 验证每个人的信息
    for (const person of [body.person1, body.person2]) {
      const personFields = ['name', 'birth_date', 'birth_time', 'birth_city', 'gender']
      for (const field of personFields) {
        if (!person[field as keyof typeof person]) {
          return NextResponse.json(
            { error: `缺少必填字段: ${field}` },
            { status: 400 }
          )
        }
      }
    }

    // 转换数据格式
    const person1: HepanPerson = {
      name: body.person1.name,
      birthDate: new Date(`${body.person1.birth_date}T${body.person1.birth_time}`),
      birthTime: body.person1.birth_time,
      birthCity: body.person1.birth_city,
      gender: body.person1.gender
    }

    const person2: HepanPerson = {
      name: body.person2.name,
      birthDate: new Date(`${body.person2.birth_date}T${body.person2.birth_time}`),
      birthTime: body.person2.birth_time,
      birthCity: body.person2.birth_city,
      gender: body.person2.gender
    }

    // 检查用户天机点余额
    const serviceCost = 300 // 合盘分析消耗300天机点
    const hasEnoughPoints = await TianjiPointsService.hasEnoughPoints(user.id, serviceCost)
    
    if (!hasEnoughPoints) {
      return NextResponse.json(
        { 
          error: '天机点余额不足',
          required_points: serviceCost,
          service_type: 'hepan'
        },
        { status: 402 }
      )
    }

    // 计算八字合盘
    const hepanResult = HepanCalculator.calculateHepan(person1, person2)

    // 生成AI分析
    const aiAnalysis = await generateAIAnalysis(person1, person2, hepanResult)

    // 先扣除天机点
    const pointsDeducted = await TianjiPointsService.spendPoints(
      user.id, 
      serviceCost, 
      'hepan', 
      `合盘分析：${person1.name} & ${person2.name}`
    )
    
    if (!pointsDeducted) {
      return NextResponse.json(
        { error: '天机点扣除失败' },
        { status: 402 }
      )
    }

    // 保存合盘分析到数据库
    const savedAnalysis = await HepanAnalysisService.saveAnalysis({
      user_id: user.id,
      person1_name: body.person1.name,
      person1_birth_date: body.person1.birth_date,
      person1_birth_time: body.person1.birth_time,
      person1_birth_city: body.person1.birth_city,
      person1_gender: body.person1.gender,
      person2_name: body.person2.name,
      person2_birth_date: body.person2.birth_date,
      person2_birth_time: body.person2.birth_time,
      person2_birth_city: body.person2.birth_city,
      person2_gender: body.person2.gender,
      compatibility_result: hepanResult,
      ai_analysis: aiAnalysis,
      points_cost: serviceCost
    })

    // 同时保存到历史记录表
    const relationshipMap = {
      'couple': '情侣',
      'friends': '朋友',
      'colleagues': '合作',
      'family': '亲属',
      'other': '其他'
    }
    
    const relationshipText = body.relationship_type ? relationshipMap[body.relationship_type] : '情侣'
    const title = `${body.person1.name}与${body.person2.name}的${relationshipText}合盘`
    const summary = `配对度${hepanResult.compatibility.overall_score}分。${hepanResult.analysis.strengths[0] || '相配程度良好'}，建议${hepanResult.analysis.suggestions[0] || '保持良好沟通'}。`

    await AnalysisRecordsService.saveRecord({
      userId: user.id,
      analysisType: 'hepan',
      title,
      summary,
      inputData: {
        person1: body.person1,
        person2: body.person2,
        relationship_type: body.relationship_type || 'couple'
      },
      outputData: {
        success: true,
        person1: {
          name: hepanResult.person1.name,
          bazi: hepanResult.person1.bazi,
          wuxing_analysis: hepanResult.person1.wuxing
        },
        person2: {
          name: hepanResult.person2.name,
          bazi: hepanResult.person2.bazi,
          wuxing_analysis: hepanResult.person2.wuxing
        },
        compatibility: hepanResult.compatibility,
        analysis: hepanResult.analysis,
        detailed_scores: hepanResult.detailed_scores,
        ai_analysis: aiAnalysis,
        cost: serviceCost
      },
      pointsCost: serviceCost
    })

    const response = {
      success: true,
      analysis_id: savedAnalysis?.id,
      person1: {
        name: hepanResult.person1.name,
        bazi: hepanResult.person1.bazi,
        wuxing_analysis: hepanResult.person1.wuxing
      },
      person2: {
        name: hepanResult.person2.name,
        bazi: hepanResult.person2.bazi,
        wuxing_analysis: hepanResult.person2.wuxing
      },
      compatibility: hepanResult.compatibility,
      analysis: hepanResult.analysis,
      detailed_scores: hepanResult.detailed_scores,
      ai_analysis: aiAnalysis,
      cost: serviceCost,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Hepan analysis error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '分析失败，请稍后重试' 
      },
      { status: 500 }
    )
  }
}

async function generateAIAnalysis(person1: HepanPerson, person2: HepanPerson, hepanResult: any): Promise<string> {
  try {
    const prompt = `作为一位专业的命理大师，请为以下两人的八字合盘提供详细分析：

【基本信息】
${person1.name}（${person1.gender === 'male' ? '男' : '女'}）：${person1.birthDate.getFullYear()}年${person1.birthDate.getMonth() + 1}月${person1.birthDate.getDate()}日 ${person1.birthTime} 于${person1.birthCity}
八字：${hepanResult.person1.bazi.year_ganzhi} ${hepanResult.person1.bazi.month_ganzhi} ${hepanResult.person1.bazi.day_ganzhi} ${hepanResult.person1.bazi.hour_ganzhi}

${person2.name}（${person2.gender === 'male' ? '男' : '女'}）：${person2.birthDate.getFullYear()}年${person2.birthDate.getMonth() + 1}月${person2.birthDate.getDate()}日 ${person2.birthTime} 于${person2.birthCity}
八字：${hepanResult.person2.bazi.year_ganzhi} ${hepanResult.person2.bazi.month_ganzhi} ${hepanResult.person2.bazi.day_ganzhi} ${hepanResult.person2.bazi.hour_ganzhi}

【合盘结果】
综合匹配度：${hepanResult.compatibility.overall_score}分
五行相合度：${hepanResult.compatibility.wuxing_compatibility}分
干支相合度：${hepanResult.compatibility.ganzhi_compatibility}分
用神相合度：${hepanResult.compatibility.yongshen_compatibility}分
大运相合度：${hepanResult.compatibility.dayun_compatibility}分

【详细评分】
感情和谐度：${hepanResult.detailed_scores.love_score}分
事业配合度：${hepanResult.detailed_scores.career_score}分
财运互补度：${hepanResult.detailed_scores.wealth_score}分
健康相助度：${hepanResult.detailed_scores.health_score}分
家庭和睦度：${hepanResult.detailed_scores.family_score}分

请从以下角度提供专业分析：
1. 【性格配对】：分析两人性格特点及互补性
2. 【感情运势】：预测感情发展趋势和注意事项
3. 【事业财运】：分析合作创业或共同理财的前景
4. 【婚姻家庭】：评估婚姻稳定性和家庭和谐度
5. 【改善建议】：提供具体的相处和改善建议

分析要求：
- 基于传统命理学理论，结合现代心理学观点
- 语言温和正面，避免绝对化表述
- 重点突出相处之道和改善方法
- 字数控制在800-1200字
- 语言流畅，条理清晰`

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "你是一位经验丰富的命理分析师，擅长八字合盘分析。你的分析客观准确，既指出优势也提醒挑战，重点是给出建设性的建议帮助改善关系。"
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 2000
    })

    return completion.choices[0]?.message?.content || '分析生成失败，请稍后重试'

  } catch (error) {
    console.error('AI analysis error:', error)
    return '系统分析：根据八字合盘计算，两人整体匹配度较好。建议在日常相处中保持良好沟通，相互理解包容，共同创造和谐美满的关系。'
  }
}