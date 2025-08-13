'use client'

import { lazy } from 'react'
import { FormLoadingSpinner, CardLoadingSpinner } from '@/components/lazy-loading'

// 懒加载重型组件
export const BaziInputForm = lazy(() => 
  import('@/components/forms/BaziInputForm').then(module => ({
    default: module.BaziInputForm
  }))
)

export const BaziResult = lazy(() => 
  import('@/components/modules/BaziResult').then(module => ({
    default: module.BaziResult
  }))
)

// 专门的加载组件
export const BaziFormLoadingSpinner = () => (
  <FormLoadingSpinner text="八字输入表单加载中..." />
)

export const BaziResultLoadingSpinner = () => (
  <CardLoadingSpinner text="八字分析结果加载中..." />
)