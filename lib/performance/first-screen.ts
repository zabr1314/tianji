// 首屏加载优化工具
import { useEffect, useState, useCallback } from 'react'

// 预加载关键资源
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  // Next.js 会自动处理 CSS 和字体优化，无需手动预加载
  // 这里可以预加载其他关键资源，如图片或图标
  
  // 预加载关键图标字体（如果使用）
  const criticalResources: string[] = [
    // 可以在这里添加关键的外部资源
    // 例如: '/images/logo.png'
  ]

  criticalResources.forEach(href => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = href.endsWith('.png') || href.endsWith('.jpg') || href.endsWith('.webp') ? 'image' : 'fetch'
    link.href = href
    document.head.appendChild(link)
  })
}

// 预取下一页资源
export function prefetchNextPage(href: string) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

// 页面可见性检测 Hook
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return isVisible
}

// 网络状态检测 Hook
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<{
    online: boolean
    effectiveType?: string
    downlink?: number
    rtt?: number
  }>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true
  })

  useEffect(() => {
    if (typeof navigator === 'undefined') return

    const updateOnlineStatus = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      setNetworkStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt
      })
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // 监听网络变化
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateOnlineStatus)
    }

    // 初始化
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', updateOnlineStatus)
      }
    }
  }, [])

  return networkStatus
}

// 首屏渲染时间监控
export function useFirstContentfulPaint() {
  const [fcp, setFCP] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
      
      if (fcpEntry) {
        setFCP(fcpEntry.startTime)
        observer.disconnect()
      }
    })

    observer.observe({ entryTypes: ['paint'] })

    return () => observer.disconnect()
  }, [])

  return fcp
}

// 最大内容绘制监控
export function useLargestContentfulPaint() {
  const [lcp, setLCP] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lcpEntry = entries[entries.length - 1] // 取最后一个（最大的）
      
      if (lcpEntry) {
        setLCP(lcpEntry.startTime)
      }
    })

    observer.observe({ entryTypes: ['largest-contentful-paint'] })

    return () => observer.disconnect()
  }, [])

  return lcp
}

// 首次输入延迟监控
export function useFirstInputDelay() {
  const [fid, setFID] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fidEntry = entries[0] as any
      
      if (fidEntry && fidEntry.processingStart) {
        setFID(fidEntry.processingStart - fidEntry.startTime)
        observer.disconnect()
      }
    })

    observer.observe({ entryTypes: ['first-input'] })

    return () => observer.disconnect()
  }, [])

  return fid
}

// 累积布局偏移监控
export function useCumulativeLayoutShift() {
  const [cls, setCLS] = useState<number>(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let clsValue = 0

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          setCLS(clsValue)
        }
      })
    })

    observer.observe({ entryTypes: ['layout-shift'] })

    return () => observer.disconnect()
  }, [])

  return cls
}

// 关键资源加载优化
export class ResourceOptimizer {
  private static loadedResources = new Set<string>()
  private static loadingPromises = new Map<string, Promise<any>>()

  static async loadScript(src: string): Promise<void> {
    if (this.loadedResources.has(src)) {
      return Promise.resolve()
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!
    }

    const promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      
      script.onload = () => {
        this.loadedResources.add(src)
        resolve()
      }
      
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
      
      document.head.appendChild(script)
    })

    this.loadingPromises.set(src, promise)
    
    try {
      await promise
    } finally {
      this.loadingPromises.delete(src)
    }
  }

  static async loadStyle(href: string): Promise<void> {
    if (this.loadedResources.has(href)) {
      return Promise.resolve()
    }

    if (this.loadingPromises.has(href)) {
      return this.loadingPromises.get(href)!
    }

    const promise = new Promise<void>((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      
      link.onload = () => {
        this.loadedResources.add(href)
        resolve()
      }
      
      link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`))
      
      document.head.appendChild(link)
    })

    this.loadingPromises.set(href, promise)
    
    try {
      await promise
    } finally {
      this.loadingPromises.delete(href)
    }
  }

  static preconnect(domain: string) {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    document.head.appendChild(link)
  }

  static dnsPrefetch(domain: string) {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    document.head.appendChild(link)
  }
}

// 首屏优化配置
export const FIRST_SCREEN_CONFIG = {
  // 关键资源预连接
  preconnectDomains: [
    'https://api.deepseek.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ],
  
  // DNS 预解析
  dnsPrefetchDomains: [
    'https://api.deepseek.com'
  ],
  
  // 关键页面预取
  prefetchPages: [
    '/bazi',
    '/hepan', 
    '/bugua',
    '/calendar',
    '/name',
    '/dream',
    '/history'
  ]
}

// 首屏优化初始化
export function initFirstScreenOptimization() {
  if (typeof window === 'undefined') return

  // 预连接关键域名
  FIRST_SCREEN_CONFIG.preconnectDomains.forEach(domain => {
    ResourceOptimizer.preconnect(domain)
  })

  // DNS 预解析
  FIRST_SCREEN_CONFIG.dnsPrefetchDomains.forEach(domain => {
    ResourceOptimizer.dnsPrefetch(domain)
  })

  // 预加载关键资源
  preloadCriticalResources()

  // 在空闲时预取关键页面
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      FIRST_SCREEN_CONFIG.prefetchPages.forEach(page => {
        prefetchNextPage(page)
      })
    })
  } else {
    // 兜底方案
    setTimeout(() => {
      FIRST_SCREEN_CONFIG.prefetchPages.forEach(page => {
        prefetchNextPage(page)
      })
    }, 2000)
  }
}