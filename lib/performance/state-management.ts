// 性能优化的状态管理工具
import { useCallback, useMemo, useRef, useState, useEffect } from 'react'

// 防抖 Hook - 优化版
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// 节流 Hook
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastUpdated = useRef<number>(Date.now())

  useEffect(() => {
    const now = Date.now()
    
    if (now >= lastUpdated.current + delay) {
      setThrottledValue(value)
      lastUpdated.current = now
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value)
        lastUpdated.current = Date.now()
      }, delay - (now - lastUpdated.current))
      
      return () => clearTimeout(timer)
    }
  }, [value, delay])

  return throttledValue
}

// 本地存储 Hook - 带性能优化
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: {
    serialize?: (value: T) => string
    deserialize?: (value: string) => T
  }
) {
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options ?? {}

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? deserialize(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serialize(valueToStore))
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, serialize, storedValue]
  )

  return [storedValue, setValue] as const
}

// 异步状态管理 Hook
export function useAsyncState<T, E = Error>(
  asyncFunction: () => Promise<T>
) {
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: E | null
  }>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const data = await asyncFunction()
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error as E }))
      throw error
    }
  }, [asyncFunction])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}

// 组件渲染优化 Hook
export function useRenderOptimization() {
  const renderCount = useRef(0)
  const lastRenderTime = useRef(Date.now())
  
  useEffect(() => {
    renderCount.current += 1
    const now = Date.now()
    const timeSinceLastRender = now - lastRenderTime.current
    lastRenderTime.current = now
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Component rendered ${renderCount.current} times. Time since last render: ${timeSinceLastRender}ms`)
    }
  })

  return {
    renderCount: renderCount.current,
    getLastRenderTime: () => lastRenderTime.current
  }
}

// 内存泄漏防护 Hook
export function useCleanup(cleanup: () => void, deps?: React.DependencyList) {
  const cleanupRef = useRef(cleanup)
  cleanupRef.current = cleanup

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// 批量状态更新优化
export function useBatchedState<T extends Record<string, any>>(
  initialState: T
) {
  const [state, setState] = useState<T>(initialState)
  const batchedUpdates = useRef<Partial<T>>({})
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const batchUpdate = useCallback((updates: Partial<T>) => {
    // 累积更新
    batchedUpdates.current = { ...batchedUpdates.current, ...updates }

    // 清除之前的超时
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // 批量应用更新
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, ...batchedUpdates.current }))
      batchedUpdates.current = {}
    }, 0)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [state, batchUpdate] as const
}

// API 请求缓存 Hook
const apiCache = new Map<string, {
  data: any
  timestamp: number
  ttl: number
}>()

export function useCachedAPI<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number // 缓存时间（毫秒）
    staleWhileRevalidate?: boolean
  } = {}
) {
  const { ttl = 5 * 60 * 1000, staleWhileRevalidate = true } = options
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: Error | null
  }>({ data: null, loading: false, error: null })

  const fetch = useCallback(async (force = false) => {
    const cached = apiCache.get(key)
    const now = Date.now()

    // 检查缓存
    if (!force && cached && (now - cached.timestamp) < cached.ttl) {
      setState({ data: cached.data, loading: false, error: null })
      return cached.data
    }

    // 如果有过期缓存且启用了 staleWhileRevalidate，先返回过期数据
    if (staleWhileRevalidate && cached) {
      setState({ data: cached.data, loading: true, error: null })
    } else {
      setState(prev => ({ ...prev, loading: true, error: null }))
    }

    try {
      const data = await fetcher()
      
      // 更新缓存
      apiCache.set(key, {
        data,
        timestamp: now,
        ttl
      })

      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error as Error }))
      throw error
    }
  }, [key, fetcher, ttl, staleWhileRevalidate])

  useEffect(() => {
    fetch(false)
  }, [fetch])

  const invalidate = useCallback(() => {
    apiCache.delete(key)
  }, [key])

  return {
    ...state,
    refetch: fetch,
    invalidate
  }
}

// 清理所有缓存的工具函数
export function clearAPICache() {
  apiCache.clear()
}