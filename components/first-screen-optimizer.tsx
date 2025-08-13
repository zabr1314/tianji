'use client'

import { useEffect } from 'react'
import { initFirstScreenOptimization } from '@/lib/performance/first-screen'

export function FirstScreenOptimizer() {
  useEffect(() => {
    // 在客户端初始化首屏优化
    initFirstScreenOptimization()
  }, [])

  // 这个组件不渲染任何内容，只是用来执行优化
  return null
}