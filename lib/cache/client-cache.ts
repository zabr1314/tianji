'use client'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class ClientCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly maxSize = 100
  
  set<T>(key: string, data: T, ttlSeconds = 300) {
    // 如果缓存满了，删除最旧的项目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    })
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  delete(key: string) {
    this.cache.delete(key)
  }
  
  clear() {
    this.cache.clear()
  }
  
  // 清理过期项目
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// 全局缓存实例
export const clientCache = new ClientCache()

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    clientCache.cleanup()
  }, 60000) // 每分钟清理一次
}

// 缓存装饰器
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttlSeconds = 300
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args)
    
    // 尝试从缓存获取
    const cached = clientCache.get(key)
    if (cached) {
      return cached
    }
    
    // 执行函数并缓存结果
    const result = await fn(...args)
    clientCache.set(key, result, ttlSeconds)
    
    return result
  }) as T
}