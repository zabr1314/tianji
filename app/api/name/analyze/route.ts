import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { NameAnalysisCalculator } from '@/lib/name/calculator'
import { TianjiPointsService, AnalysisRecordsService, NameAnalysisService } from '@/lib/database/services'
import OpenAI from 'openai'

// 初始化DeepSeek客户端
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
})

interface NameAnalyzeRequest {
  name: string
  analysis_type: 'current' | 'suggestion' // 分析现有姓名或起名建议
  birth_date?: string // 可选：结合生辰八字分析
  birth_time?: string
  birth_city?: string
  gender?: 'male' | 'female'
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

    const body = await request.json() as NameAnalyzeRequest

    // 验证必填字段
    if (!body.name) {
      return NextResponse.json(
        { error: '请输入要分析的姓名' },
        { status: 400 }
      )
    }

    // 检查用户天机点余额
    const serviceCost = 120 // 姓名分析消耗120天机点
    const hasEnoughPoints = await TianjiPointsService.hasEnoughPoints(user.id, serviceCost)
    
    if (!hasEnoughPoints) {
      return NextResponse.json(
        { 
          error: '天机点余额不足',
          required_points: serviceCost,
          service_type: 'name'
        },
        { status: 402 }
      )
    }

    if (!body.analysis_type) {
      return NextResponse.json(
        { error: '请选择分析类型' },
        { status: 400 }
      )
    }

    // 验证姓名格式
    if (body.name.length < 2 || body.name.length > 4) {
      return NextResponse.json(
        { error: '姓名长度应为2-4个汉字' },
        { status: 400 }
      )
    }

    // 验证汉字
    const chineseRegex = /^[\u4e00-\u9fa5]+$/
    if (!chineseRegex.test(body.name)) {
      return NextResponse.json(
        { error: '请输入有效的中文姓名' },
        { status: 400 }
      )
    }

    // 执行姓名分析
    const nameAnalysis = NameAnalysisCalculator.analyzeChineseName(body.name)

    // 生成AI深度分析
    const aiAnalysis = await generateAIAnalysis(body, nameAnalysis)

    // 计算服务费用（120天机点）
    const cost = 120

    // 保存姓名分析结果到数据库
    const analysisData = {
      user_id: user.id,
      name_to_analyze: body.name,
      analysis_type: body.analysis_type,
      birth_date: body.birth_date || null,
      birth_time: body.birth_time || null,
      birth_city: body.birth_city || null,
      gender: body.gender || null,
      analysis_result: {
        ...nameAnalysis,
        scores: nameAnalysis.scores,
        ai_analysis: aiAnalysis
      },
      ai_analysis: aiAnalysis,
      points_cost: cost
    }

    // 保存到姓名分析表
    const savedAnalysis = await NameAnalysisService.saveAnalysis(analysisData)
    
    if (!savedAnalysis) {
      console.error('Failed to save name analysis to database')
      // 不影响返回结果，但记录错误
    }

    // 扣除天机点
    const pointsDeducted = await TianjiPointsService.spendPoints(
      user.id,
      cost,
      'name',
      `姓名分析：${body.name}`,
      savedAnalysis?.id
    )

    if (!pointsDeducted) {
      console.error('Failed to deduct tianji points')
      // 不影响返回结果，但记录错误
    }

    // 保存到统一历史记录表
    if (savedAnalysis) {
      const historyData = {
        userId: user.id,
        analysisType: 'name' as const,
        title: `姓名分析：${body.name}`,
        summary: body.analysis_type === 'current' ? '当前姓名分析' : '姓名建议分析',
        inputData: {
          name: body.name,
          analysis_type: body.analysis_type,
          birth_date: body.birth_date,
          birth_time: body.birth_time,
          birth_city: body.birth_city,
          gender: body.gender
        },
        outputData: {
          ...nameAnalysis,
          ai_analysis: aiAnalysis
        },
        pointsCost: cost
      }

      const historyRecord = await AnalysisRecordsService.saveRecord(historyData)
      
      if (!historyRecord) {
        console.error('Failed to save analysis to history records')
      }
    }

    const response = {
      success: true,
      name: nameAnalysis.name,
      analysis_type: body.analysis_type,
      basic_info: {
        surname: nameAnalysis.surname,
        given_name: nameAnalysis.given_name,
        total_strokes: nameAnalysis.total_strokes,
        surname_strokes: nameAnalysis.surname_strokes,
        given_strokes: nameAnalysis.given_strokes
      },
      wuxing_analysis: nameAnalysis.wuxing_analysis,
      numerology: nameAnalysis.numerology,
      phonetics: nameAnalysis.phonetics,
      meanings: nameAnalysis.meanings,
      scores: nameAnalysis.scores,
      suggestions: nameAnalysis.suggestions,
      ai_analysis: aiAnalysis,
      cost,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Name analysis error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '姓名分析失败，请稍后重试' 
      },
      { status: 500 }
    )
  }
}

async function generateAIAnalysis(request: NameAnalyzeRequest, analysis: any): Promise<string> {
  try {
    const analysisTypeText = request.analysis_type === 'current' ? '现有姓名分析' : '起名建议分析'

    const prompt = `作为一位专业的姓名学分析师，请为以下姓名提供深度分析：

【分析类型】
${analysisTypeText}

【姓名信息】
姓名：${analysis.name}
姓：${analysis.surname}（${analysis.surname_strokes}画）
名：${analysis.given_name}（${analysis.given_strokes}画）
总笔画：${analysis.total_strokes}画

【五行分析】
姓五行：${analysis.wuxing_analysis.surname_wuxing}
名五行：${analysis.wuxing_analysis.given_wuxing.join('、')}
整体五行：${analysis.wuxing_analysis.overall_wuxing}
五行配合：${analysis.wuxing_analysis.wuxing_compatibility}
五行分布：木${analysis.wuxing_analysis.wuxing_balance.wood} 火${analysis.wuxing_analysis.wuxing_balance.fire} 土${analysis.wuxing_analysis.wuxing_balance.earth} 金${analysis.wuxing_analysis.wuxing_balance.metal} 水${analysis.wuxing_analysis.wuxing_balance.water}

【数理分析】
天格：${analysis.numerology.tiange}（${analysis.numerology.tiange_fortune}）
人格：${analysis.numerology.renge}（${analysis.numerology.renge_fortune}）
地格：${analysis.numerology.dige}（${analysis.numerology.dige_fortune}）
外格：${analysis.numerology.waige}（${analysis.numerology.waige_fortune}）
总格：${analysis.numerology.zongge}（${analysis.numerology.zongge_fortune}）

【音韵特点】
声调组合：${analysis.phonetics.tones.join('-')}调
音调和谐度：${analysis.phonetics.tone_harmony}
发音难易度：${analysis.phonetics.pronunciation_difficulty}
韵律美感：${analysis.phonetics.rhyme_quality}

【评分情况】
五行评分：${analysis.scores.wuxing_score}分
数理评分：${analysis.scores.numerology_score}分
音韵评分：${analysis.scores.phonetic_score}分
寓意评分：${analysis.scores.meaning_score}分
综合评分：${analysis.scores.overall_score}分

【优势特点】
${analysis.suggestions.strengths.join('、')}

【不足之处】
${analysis.suggestions.weaknesses.join('、') || '暂无明显不足'}

请从以下角度提供专业分析：
1. 【姓名总评】：对这个姓名的整体评价和印象
2. 【五行命理】：详细分析五行配置对人生运势的影响
3. 【数理吉凶】：解读各格数理对性格和命运的作用
4. 【音韵美感】：评析姓名的音韵特点和给人的感受
5. 【实用建议】：${request.analysis_type === 'current' ? '针对现有姓名给出使用和改善建议' : '提供起名的优化方向和注意事项'}

分析要求：
- 基于传统姓名学理论，结合现代审美观念
- 语言专业准确，避免过于迷信的表述
- 重点给出实用性的建议和指导
- 字数控制在600-1000字
- 条理清晰，层次分明`

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "你是一位专业的姓名学分析师，精通中华传统姓名学理论，包括五行、数理、音韵等方面。你的分析客观准确，既有深厚的文化底蕴，又结合现代实际需求，为人们提供实用的姓名指导。"
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
    return `系统分析：根据姓名学理论，"${analysis.name}"这个名字的综合评分为${analysis.scores.overall_score}分。${analysis.wuxing_analysis.wuxing_compatibility}，数理格局${analysis.numerology.renge_fortune}。建议在日常使用中注意${analysis.suggestions.lucky_directions.join('或')}方位，从事${analysis.suggestions.suitable_careers.join('或')}相关行业较为有利。`
  }
}