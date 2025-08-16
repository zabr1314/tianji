'use client'

import React, { useState, useEffect, useRef, useMemo, memo } from 'react'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

// 虚拟化列表组件 - 只渲染可见项目以提高性能
export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = ''
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2)
    
    return { startIndex, endIndex, visibleCount }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])
  
  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
  }, [items, visibleRange.startIndex, visibleRange.endIndex])
  
  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={visibleRange.startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 记忆化包装器
export const MemoizedVirtualizedList = memo(VirtualizedList) as typeof VirtualizedList