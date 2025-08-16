'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface PreloadContextType {
  preloadRoute: (route: string) => void
  preloadComponent: (componentImport: () => Promise<any>) => void
}

const PreloadContext = createContext<PreloadContextType | null>(null)

export function PreloadProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  
  const preloadRoute = (route: string) => {
    // 使用Next.js的router.prefetch预加载路由
    router.prefetch(route)
  }
  
  const preloadComponent = async (componentImport: () => Promise<any>) => {
    try {
      // 在空闲时间预加载组件
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          componentImport()
        })
      } else {
        // 降级到setTimeout
        setTimeout(() => {
          componentImport()
        }, 100)
      }
    } catch (error) {
      console.warn('Component preload failed:', error)
    }
  }
  
  useEffect(() => {
    // 预加载高频访问的路由
    const highPriorityRoutes = ['/bazi', '/hepan', '/dream', '/bugua']
    
    // 延迟预加载，避免影响初始页面性能
    const timer = setTimeout(() => {
      highPriorityRoutes.forEach(route => {
        router.prefetch(route)
      })
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [router])
  
  return (
    <PreloadContext.Provider value={{ preloadRoute, preloadComponent }}>
      {children}
    </PreloadContext.Provider>
  )
}

export function usePreload() {
  const context = useContext(PreloadContext)
  if (!context) {
    throw new Error('usePreload must be used within a PreloadProvider')
  }
  return context
}