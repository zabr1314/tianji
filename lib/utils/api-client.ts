/**
 * 安全的 API 调用工具函数
 * 处理 JSON 解析错误和响应类型检查
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  debug?: string
}

export class ApiError extends Error {
  constructor(
    message: string, 
    public status?: number, 
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function safeJsonParse<T = any>(response: Response): Promise<T> {
  // 检查响应类型
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text()
    console.error('Expected JSON response but got:', contentType)
    console.error('Response text:', text.substring(0, 200))
    throw new ApiError('服务器响应格式错误', response.status, response)
  }

  try {
    return await response.json()
  } catch (jsonError) {
    console.error('Failed to parse JSON response:', jsonError)
    const text = await response.text().catch(() => 'Unable to read response text')
    console.error('Response text:', text.substring(0, 200))
    throw new ApiError('解析服务器响应失败', response.status, response)
  }
}

export async function apiCall<T = any>(
  url: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      let errorData: any
      try {
        errorData = await safeJsonParse(response)
      } catch (parseError) {
        throw new ApiError(`服务器错误: ${response.status}`, response.status, response)
      }
      
      throw new ApiError(
        errorData.error || `请求失败: ${response.status}`,
        response.status,
        response
      )
    }

    const result = await safeJsonParse<ApiResponse<T>>(response)
    return result
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    console.error('API call failed:', error)
    throw new ApiError(
      error instanceof Error ? error.message : '网络请求失败'
    )
  }
}

export function handleApiError(error: unknown, fallbackMessage = '操作失败') {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      alert('请先登录后再进行操作')
      window.location.href = '/auth/login'
      return
    }
    
    if (error.status === 402) {
      alert('天机点余额不足，请前往充值页面购买天机点')
      window.location.href = '/points'
      return
    }
    
    alert(error.message)
  } else {
    console.error('Unexpected error:', error)
    alert(fallbackMessage)
  }
}