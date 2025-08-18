import { NextResponse } from 'next/server'

export function handleApiError(error: unknown, context: string) {
  console.error(`${context} error:`, error)
  
  // 详细错误信息用于调试
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  console.error(`Detailed ${context} error:`, errorMessage)
  
  // 检查是否是网络错误或超时
  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'AI服务连接失败，请检查网络连接',
          debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 503 }
      )
    }
    
    if (error.message.includes('timeout')) {
      return NextResponse.json(
        { 
          error: 'AI服务响应超时，请稍后再试',
          debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 504 }
      )
    }
    
    if (error.message.includes('API key') || error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { 
          error: 'AI服务配置错误，请联系管理员',
          debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 503 }
      )
    }
  }
  
  // 默认错误响应
  return NextResponse.json(
    { 
      error: 'AI服务暂时不可用，请稍后再试',
      debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    },
    { status: 503 }
  )
}

export function validateEnvironment() {
  const required = ['DEEPSEEK_API_KEY']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing)
    return false
  }
  
  return true
}