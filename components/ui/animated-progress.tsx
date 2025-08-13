'use client'

import { useEffect, useState } from 'react'

interface AnimatedProgressProps {
  value: number
  maxValue?: number
  className?: string
  height?: string
  showLabel?: boolean
  animated?: boolean
}

export function AnimatedProgress({ 
  value, 
  maxValue = 100, 
  className = "",
  height = "h-2",
  showLabel = true,
  animated = true
}: AnimatedProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  
  const percentage = Math.min((value / maxValue) * 100, 100)

  useEffect(() => {
    if (!animated) {
      setAnimatedValue(percentage)
      return
    }

    const timer = setTimeout(() => {
      setAnimatedValue(percentage)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [percentage, animated])

  const getGradientColor = (val: number) => {
    if (val >= 80) return 'from-amber-400 to-amber-600'
    if (val >= 60) return 'from-yellow-400 to-yellow-600'  
    if (val >= 40) return 'from-orange-400 to-orange-600'
    return 'from-red-400 to-red-600'
  }

  const getGlowColor = (val: number) => {
    if (val >= 80) return 'rgba(245, 158, 11, 0.5)'
    if (val >= 60) return 'rgba(234, 179, 8, 0.5)'
    if (val >= 40) return 'rgba(249, 115, 22, 0.5)'
    return 'rgba(239, 68, 68, 0.5)'
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {showLabel && (
          <>
            <span className="text-sm font-serif text-slate-600 dark:text-slate-400">
              进度
            </span>
            <span className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300">
              {value}/{maxValue}
            </span>
          </>
        )}
      </div>
      
      <div className={`relative w-full bg-slate-200 dark:bg-slate-700 rounded-full ${height} overflow-hidden`}>
        {/* Background glow effect */}
        <div 
          className="absolute inset-0 opacity-20 blur-sm"
          style={{
            background: `linear-gradient(90deg, transparent, ${getGlowColor(percentage)})`
          }}
        />
        
        {/* Progress bar */}
        <div
          className={`${height} bg-gradient-to-r ${getGradientColor(percentage)} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
          style={{ 
            width: `${animatedValue}%`,
            boxShadow: `0 0 10px ${getGlowColor(percentage)}`
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          
          {/* Highlight effect */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-full" />
        </div>

        {/* Percentage indicator dot */}
        {animatedValue > 0 && (
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 w-1 h-4 bg-white rounded-full shadow-lg transition-all duration-1000 ease-out"
            style={{ 
              left: `${Math.max(animatedValue - 1, 0)}%`,
              filter: `drop-shadow(0 0 4px ${getGlowColor(percentage)})`
            }}
          />
        )}
      </div>

      {/* Value display */}
      {showLabel && (
        <div className="mt-2 text-center">
          <span className="text-xs font-serif text-slate-500 dark:text-slate-400">
            {percentage.toFixed(1)}% 完成度
          </span>
        </div>
      )}
    </div>
  )
}