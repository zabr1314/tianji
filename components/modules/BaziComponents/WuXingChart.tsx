'use client'

import React from 'react'

interface WuXingChartProps {
  percentages: Record<string, number>
  radius?: number
  center?: number
  strokeWidth?: number
}

export function WuXingChart({ 
  percentages, 
  radius = 80, 
  center = 96, 
  strokeWidth = 16 
}: WuXingChartProps) {
  function getColorValue(colorClass: string): string {
    const colorMap: Record<string, string> = {
      'text-green-600': '#16a34a',
      'text-red-600': '#dc2626',
      'text-yellow-600': '#ca8a04',
      'text-slate-600': '#475569',
      'text-blue-600': '#2563eb'
    }
    return colorMap[colorClass] || '#475569'
  }

  function renderCircularChart() {
    const elements = Object.entries(percentages)
    const circumference = 2 * Math.PI * radius
    let rotation = -90 // 从顶部开始

    return (
      <svg width={center * 2} height={center * 2} className="mx-auto">
        {elements.map(([element, percentage], index) => {
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
          const colors = ['text-green-600', 'text-red-600', 'text-yellow-600', 'text-slate-600', 'text-blue-600']
          const color = getColorValue(colors[index % colors.length])
          
          const circleElement = (
            <circle
              key={element}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset="0"
              transform={`rotate(${rotation} ${center} ${center})`}
              className="transition-all duration-300"
            />
          )
          
          rotation += (percentage / 100) * 360
          return circleElement
        })}
        
        {/* 中心文字 */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-serif font-medium fill-slate-700 dark:fill-slate-300"
        >
          五行分布
        </text>
      </svg>
    )
  }

  return (
    <div className="relative">
      {renderCircularChart()}
    </div>
  )
}