import { NextRequest, NextResponse } from 'next/server'
import { FortuneCalendarCalculator, PersonalInfo } from '@/lib/calendar/calculator'
import OpenAI from 'openai'

// 初始化DeepSeek客户端
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
})

interface DailyFortuneRequest {
  name: string
  birth_date: string
  birth_time: string
  birth_city: string
  gender: 'male' | 'female'
  target_date: string // YYYY-MM-DD格式
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DailyFortuneRequest

    // 验证必填字段
    const requiredFields = ['name', 'birth_date', 'birth_time', 'birth_city', 'gender', 'target_date'] as Array<keyof DailyFortuneRequest>
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        )
      }
    }

    // 验证日期格式
    const targetDate = new Date(body.target_date + 'T00:00:00')
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: '目标日期格式错误，请使用YYYY-MM-DD格式' },
        { status: 400 }
      )
    }

    // 构建个人信息对象
    const personalInfo: PersonalInfo = {
      name: body.name,
      birthDate: new Date(`${body.birth_date}T${body.birth_time}`),
      birthTime: body.birth_time,
      birthCity: body.birth_city,
      gender: body.gender
    }

    // 计算当日运势
    const dailyFortune = FortuneCalendarCalculator.calculateDailyFortune(personalInfo, targetDate)

    // 生成AI个性化分析
    const aiAnalysis = await generateAIAnalysis(personalInfo, dailyFortune)

    // 计算服务费用（100天机点）
    const cost = 100

    const response = {
      success: true,
      person: {
        name: personalInfo.name,
        birth_info: `${body.birth_date} ${body.birth_time} ${body.birth_city}`
      },
      date: body.target_date,
      day_ganzhi: dailyFortune.dayGanzhi,
      overall_score: dailyFortune.overall_score,
      categories: dailyFortune.categories,
      lucky_elements: dailyFortune.lucky_elements,
      unlucky_elements: dailyFortune.unlucky_elements,
      lucky_directions: dailyFortune.lucky_directions,
      lucky_colors: dailyFortune.lucky_colors,
      lucky_numbers: dailyFortune.lucky_numbers,
      suitable_activities: dailyFortune.suitable_activities,
      avoid_activities: dailyFortune.avoid_activities,
      advice: dailyFortune.advice,
      warning: dailyFortune.warning,
      ai_analysis: aiAnalysis,
      cost,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Daily fortune analysis error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '运势分析失败，请稍后重试' 
      },
      { status: 500 }
    )
  }
}

async function generateAIAnalysis(person: PersonalInfo, dailyFortune: any): Promise<string> {
  try {
    const prompt = `作为一位专业的命理师，请为以下个人运势提供详细分析：

【个人信息】
姓名：${person.name}
性别：${person.gender === 'male' ? '男' : '女'}
出生：${person.birthDate.getFullYear()}年${person.birthDate.getMonth() + 1}月${person.birthDate.getDate()}日 ${person.birthTime} 于${person.birthCity}

【查询日期】
日期：${dailyFortune.date.getFullYear()}年${dailyFortune.date.getMonth() + 1}月${dailyFortune.date.getDate()}日
当日干支：${dailyFortune.dayGanzhi}

【运势评分】
综合运势：${dailyFortune.overall_score}分
事业运势：${dailyFortune.categories.career}分
财运指数：${dailyFortune.categories.wealth}分
感情运势：${dailyFortune.categories.love}分
健康状况：${dailyFortune.categories.health}分
学习运势：${dailyFortune.categories.study}分
出行运势：${dailyFortune.categories.travel}分

【运势要素】
有利五行：${dailyFortune.lucky_elements.join('、')}
不利五行：${dailyFortune.unlucky_elements.join('、') || '无'}
吉利方位：${dailyFortune.lucky_directions.join('、')}
幸运颜色：${dailyFortune.lucky_colors.join('、')}
幸运数字：${dailyFortune.lucky_numbers.join('、')}

【活动建议】
宜：${dailyFortune.suitable_activities.join('、')}
忌：${dailyFortune.avoid_activities.join('、')}

请从以下角度提供专业分析：
1. 【当日运势解读】：详细分析今日整体运势特点
2. 【各项运势指导】：针对事业、财运、感情等给出具体建议
3. 【时间规划建议】：建议最佳活动时间和需要避开的时段
4. 【开运方法】：结合有利五行和方位，提供实用的开运建议
5. 【注意事项】：基于不利因素，提醒需要特别注意的方面

分析要求：
- 基于传统命理学和现代生活实际
- 语言温和积极，给人信心和指导
- 提供具体可操作的建议
- 字数控制在500-800字
- 条理清晰，实用性强`

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "你是一位经验丰富的命理分析师，擅长个人运势分析和生活指导。你的分析准确实用，既有传统智慧又结合现代生活，帮助人们更好地安排日常活动。"
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 1200
    })

    return completion.choices[0]?.message?.content || '分析生成失败，请稍后重试'

  } catch (error) {
    console.error('AI analysis error:', error)
    return `系统分析：根据您的生辰八字和今日${dailyFortune.dayGanzhi}的干支配置，今日综合运势为${dailyFortune.overall_score}分。${dailyFortune.advice} ${dailyFortune.warning} 建议多关注${dailyFortune.lucky_elements.join('、')}相关的活动，选择${dailyFortune.lucky_directions.join('或')}方向行事，将有助于提升运势。`
  }
}