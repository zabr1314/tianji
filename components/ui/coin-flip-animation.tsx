'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CoinFlipAnimationProps {
  isFlipping: boolean
  coinResults: number[]
  currentThrow: number
  onFlipComplete: (result: number) => void
  shouldReset?: boolean // 添加重置标记
}

interface Coin {
  id: number
  result: 'heads' | 'tails'
  delay: number
}

export function CoinFlipAnimation({ 
  isFlipping, 
  coinResults, 
  currentThrow,
  onFlipComplete,
  shouldReset = false 
}: CoinFlipAnimationProps) {
  const [coins, setCoins] = useState<Coin[]>([])
  const [showResult, setShowResult] = useState(false)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)

  // 重置状态
  useEffect(() => {
    if (shouldReset) {
      setCoins([])
      setShowResult(false)
      setIsAnimationComplete(false)
    }
  }, [shouldReset])

  useEffect(() => {
    if (isFlipping && currentThrow < 6) {
      setShowResult(false)
      setIsAnimationComplete(false)
      
      // 生成3枚硬币的结果
      const newCoins: Coin[] = Array.from({ length: 3 }, (_, i) => ({
        id: i,
        result: Math.random() > 0.5 ? 'heads' : 'tails',
        delay: i * 200
      }))
      
      setCoins(newCoins)
      
      // 计算结果并在动画结束后回调
      setTimeout(() => {
        const headsCount = newCoins.filter(coin => coin.result === 'heads').length
        setShowResult(true)
        setIsAnimationComplete(true) // 标记动画完成
        
        setTimeout(() => {
          onFlipComplete(headsCount)
        }, 500) // 显示结果0.5秒后完成回调
      }, 2000) // 翻转动画持续2秒
    }
  }, [isFlipping, currentThrow, onFlipComplete])

  return (
    <div className="flex flex-col items-center space-y-8 py-8">
      {/* 3D硬币翻转动画 */}
      <div className="flex justify-center space-x-6">
        <AnimatePresence>
          {coins.length > 0 && coins.map((coin) => (
            <motion.div
              key={`${currentThrow}-${coin.id}`}
              initial={{ 
                opacity: 1, 
                scale: 1, 
                rotateX: 0,
                y: 80 // 硬币初始在底部
              }}
              animate={{ 
                opacity: 1, 
                scale: isFlipping ? [1, 1.3, 1] : 1,
                rotateX: isFlipping ? 1800 : (isAnimationComplete ? (coin.result === 'heads' ? 0 : 180) : 0),
                y: isFlipping ? [80, -80, 0] : (isAnimationComplete ? 0 : 80) // 抛起轨迹：底部 → 顶部 → 中心停留
              }}
              // 不让硬币退出，保持显示结果
              transition={{
                duration: 2,
                delay: coin.delay / 1000,
                ease: "easeInOut",
                rotateX: {
                  duration: 2,
                  ease: "easeOut"
                },
                y: {
                  duration: isFlipping ? 2 : 0.5,
                  ease: isFlipping ? [0.25, 0.46, 0.45, 0.94] : "easeOut" // 翻转时用重力曲线，停留时平滑过渡
                },
                scale: {
                  duration: 2,
                  ease: "easeInOut"
                }
              }}
              className="relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="w-16 h-16 relative">
                {/* 硬币正面 */}
                <div
                  className={`absolute inset-0 w-16 h-16 rounded-full border-4 border-amber-400 bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg transition-opacity duration-300 ${
                    isAnimationComplete && coin.result === 'heads' ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <span className="text-amber-800 font-bold text-xl">正</span>
                </div>
                
                {/* 硬币反面 */}
                <div
                  className={`absolute inset-0 w-16 h-16 rounded-full border-4 border-slate-400 bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center shadow-lg transition-opacity duration-300 ${
                    isAnimationComplete && coin.result === 'tails' ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <span className="text-slate-800 font-bold text-xl">反</span>
                </div>
                
                {/* 翻转中的动画效果 */}
                {isFlipping && !showResult && (
                  <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 animate-pulse shadow-xl">
                    <div className="absolute inset-2 rounded-full bg-gradient-to-r from-amber-200 to-yellow-200 animate-spin"></div>
                  </div>
                )}
              </div>
              
              {/* 地面阴影 - 硬币越高阴影越小越淡 */}
              <motion.div 
                className="absolute top-[140px] left-1/2 transform -translate-x-1/2 rounded-full blur-sm bg-black/20"
                animate={{
                  width: isFlipping ? [48, 16, 48] : (showResult ? 48 : 48),
                  height: isFlipping ? [12, 3, 12] : (showResult ? 12 : 12),
                  opacity: isFlipping ? [0.4, 0.1, 0.3] : (showResult ? 0.3 : 0.2)
                }}
                transition={{
                  duration: isFlipping ? 2 : 0.5,
                  delay: coin.delay / 1000,
                  ease: isFlipping ? [0.25, 0.46, 0.45, 0.94] : "easeOut"
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 投币结果统计 - 始终显示如果有硬币结果 */}
      {coins.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200 dark:border-amber-700 shadow-lg"
        >
          <div className="text-center space-y-2">
            <h4 className="text-lg font-serif font-semibold text-amber-800 dark:text-amber-200">
              第 {currentThrow + 1} 次投币结果
            </h4>
            <div className="flex justify-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {coins.filter(coin => coin.result === 'heads').length}
                </div>
                <div className="text-xs text-muted-foreground">正面</div>
              </div>
              <div className="w-px h-8 bg-amber-300 dark:bg-amber-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-600">
                  {coins.filter(coin => coin.result === 'tails').length}
                </div>
                <div className="text-xs text-muted-foreground">反面</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 粒子效果 - 从底部发散 */}
      {isFlipping && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 15 }, (_, i) => (
            <motion.div
              key={`particle-${currentThrow}-${i}`}
              className="absolute w-1 h-1 bg-amber-400 rounded-full"
              initial={{
                x: '50%',
                y: '80%', // 从底部开始
                opacity: 1,
                scale: 0
              }}
              animate={{
                x: (50 + (Math.random() - 0.5) * 60) + '%', // 左右散开
                y: (20 + Math.random() * 40) + '%', // 向上散开
                opacity: 0,
                scale: 1
              }}
              transition={{
                duration: 1.2,
                delay: Math.random() * 0.3,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// 简化版硬币显示组件
export function SimpleCoin({ 
  result, 
  isActive = false 
}: { 
  result?: number
  isActive?: boolean 
}) {
  return (
    <motion.div
      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all ${
        isActive
          ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-lg scale-105'
          : result !== undefined
          ? 'bg-amber-50 border-amber-300 text-amber-700'
          : 'bg-gray-100 border-gray-300 text-gray-400'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {result !== undefined ? result : '?'}
    </motion.div>
  )
}