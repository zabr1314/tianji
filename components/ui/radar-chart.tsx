'use client'

import { useEffect, useRef } from 'react'

interface RadarChartProps {
  data: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      color: string
      fillColor: string
    }>
  }
  size?: number
  className?: string
}

export function RadarChart({ data, size = 300, className = "" }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = size / 2
    const centerY = size / 2
    const maxRadius = (size / 2) - 40

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw background grid
    drawGrid(ctx, centerX, centerY, maxRadius, data.labels)

    // Draw datasets
    data.datasets.forEach(dataset => {
      drawDataset(ctx, centerX, centerY, maxRadius, dataset, data.labels)
    })

    // Draw labels
    drawLabels(ctx, centerX, centerY, maxRadius, data.labels)
  }, [data, size])

  const drawGrid = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, maxRadius: number, labels: string[]) => {
    // Draw concentric circles
    for (let i = 1; i <= 5; i++) {
      const radius = (maxRadius / 5) * i
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.strokeStyle = i === 5 ? 'rgba(148, 163, 184, 0.4)' : 'rgba(203, 213, 225, 0.3)'
      ctx.lineWidth = i === 5 ? 2 : 1
      ctx.stroke()
    }

    // Draw radial lines
    const angleStep = (2 * Math.PI) / labels.length
    for (let i = 0; i < labels.length; i++) {
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + Math.cos(angle) * maxRadius
      const y = centerY + Math.sin(angle) * maxRadius

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw score circles (20, 40, 60, 80, 100)
    ctx.font = '12px "Noto Serif SC", serif'
    ctx.fillStyle = 'rgba(100, 116, 139, 0.7)'
    ctx.textAlign = 'center'
    for (let i = 1; i <= 5; i++) {
      const radius = (maxRadius / 5) * i
      const score = i * 20
      ctx.fillText(score.toString(), centerX + 8, centerY - radius + 4)
    }
  }

  const drawDataset = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, maxRadius: number, dataset: any, labels: string[]) => {
    const angleStep = (2 * Math.PI) / labels.length
    const points: Array<{x: number, y: number}> = []

    // Calculate points
    dataset.data.forEach((value: number, index: number) => {
      const angle = index * angleStep - Math.PI / 2
      const radius = (value / 100) * maxRadius
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      points.push({ x, y })
    })

    // Draw filled area
    ctx.beginPath()
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.closePath()
    ctx.fillStyle = dataset.fillColor
    ctx.fill()

    // Draw border
    ctx.strokeStyle = dataset.color
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw points
    points.forEach(point => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = dataset.color
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()
    })
  }

  const drawLabels = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, maxRadius: number, labels: string[]) => {
    const angleStep = (2 * Math.PI) / labels.length
    ctx.font = '14px "Noto Serif SC", serif'
    ctx.fillStyle = '#475569'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    labels.forEach((label, index) => {
      const angle = index * angleStep - Math.PI / 2
      const labelRadius = maxRadius + 25
      const x = centerX + Math.cos(angle) * labelRadius
      const y = centerY + Math.sin(angle) * labelRadius

      // Adjust text alignment based on position
      if (x < centerX - 10) {
        ctx.textAlign = 'right'
      } else if (x > centerX + 10) {
        ctx.textAlign = 'left'
      } else {
        ctx.textAlign = 'center'
      }

      ctx.fillText(label, x, y)
    })
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="max-w-full h-auto"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
      />
      
      {/* Legend */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-4">
        {data.datasets.map((dataset, index) => (
          <div key={index} className="flex items-center space-x-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: dataset.color }}
            />
            <span className="text-sm font-serif text-slate-700 dark:text-slate-300">{dataset.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}