'use client'

import React, { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// 通用加载组件
export const LoadingSpinner = ({ text = "加载中..." }: { text?: string }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-amber-600" />
      <p className="text-slate-600 dark:text-slate-400 font-serif">{text}</p>
    </div>
  </div>
)

// 页面级加载组件
export const PageLoadingSpinner = ({ text = "页面加载中..." }: { text?: string }) => (
  <div className="min-h-screen bg-amber-50/30 dark:bg-slate-900 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-600" />
      <p className="text-lg text-slate-700 dark:text-slate-300 font-serif">{text}</p>
    </div>
  </div>
)

// 表单加载组件
export const FormLoadingSpinner = ({ text = "表单加载中..." }: { text?: string }) => (
  <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-lg p-8">
    <div className="text-center">
      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-amber-600" />
      <p className="text-slate-600 dark:text-slate-400 font-serif">{text}</p>
    </div>
  </div>
)

// 卡片加载组件
export const CardLoadingSpinner = ({ text = "内容加载中..." }: { text?: string }) => (
  <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
    <div className="text-center">
      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-amber-600" />
      <p className="text-sm text-slate-600 dark:text-slate-400 font-serif">{text}</p>
    </div>
  </div>
)

// 高阶组件：为任何组件添加懒加载和错误边界
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    )
  }
}

// 错误边界组件
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyLoading ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400 font-serif mb-2">组件加载失败</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="text-sm text-red-500 hover:text-red-700 underline font-serif"
          >
            重新尝试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}