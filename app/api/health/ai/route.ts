import { NextResponse } from 'next/server'
import { validateEnvironment } from '@/lib/api/error-handler'
import OpenAI from 'openai'

export async function GET() {
  try {
    // 检查环境变量
    if (!validateEnvironment()) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing required environment variables',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    // 测试 DeepSeek API 连接
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY!
    })

    const testCompletion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Hello, respond with "OK" if you can hear me.' }],
      max_tokens: 10,
      temperature: 0
    })

    const response = testCompletion.choices[0]?.message?.content || 'No response'

    return NextResponse.json({
      status: 'healthy',
      message: 'AI service is working',
      ai_response: response,
      timestamp: new Date().toISOString(),
      environment: {
        has_deepseek_key: !!process.env.DEEPSEEK_API_KEY,
        node_env: process.env.NODE_ENV
      }
    })

  } catch (error) {
    console.error('AI health check failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json({
      status: 'unhealthy',
      message: 'AI service check failed',
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}