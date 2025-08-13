'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CoinFlipAnimation, SimpleCoin } from '@/components/ui/coin-flip-animation'

export default function TestCoinPage() {
  const [coinResults, setCoinResults] = useState<number[]>([])
  const [currentCoinThrow, setCurrentCoinThrow] = useState(0)
  const [isThrowingCoins, setIsThrowingCoins] = useState(false)

  const handleCoinThrow = () => {
    if (currentCoinThrow >= 6) return
    setIsThrowingCoins(true)
  }

  const handleFlipComplete = (result: number) => {
    const newResults = [...coinResults, result]
    setCoinResults(newResults)
    setCurrentCoinThrow(currentCoinThrow + 1)
    setIsThrowingCoins(false)
  }

  const resetCoins = () => {
    setCoinResults([])
    setCurrentCoinThrow(0)
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-amber-800">
          硬币翻转动画测试
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>3D硬币翻转动画</CardTitle>
            <CardDescription>测试硬币投掷动画效果</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-xl font-bold mb-4">
                第 {currentCoinThrow + 1} 次投币
                {currentCoinThrow >= 6 ? ' - 已完成' : ''}
              </div>
            </div>
            
            {/* 3D硬币翻转动画 */}
            <div className="min-h-[200px] relative bg-white/50 rounded-xl border border-amber-200">
              {isThrowingCoins ? (
                <CoinFlipAnimation 
                  isFlipping={isThrowingCoins}
                  coinResults={coinResults}
                  currentThrow={currentCoinThrow}
                  onFlipComplete={handleFlipComplete}
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-500">
                  {currentCoinThrow >= 6 ? '投币已完成' : '点击下方按钮开始投币'}
                </div>
              )}
            </div>
            
            {/* 操作按钮 */}
            <div className="text-center space-x-4">
              {currentCoinThrow < 6 ? (
                <Button
                  onClick={handleCoinThrow}
                  disabled={isThrowingCoins}
                  size="lg"
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {isThrowingCoins ? '投币中...' : '投掷 3 枚硬币'}
                </Button>
              ) : (
                <Button onClick={resetCoins} variant="outline">
                  重新开始
                </Button>
              )}
            </div>

            {/* 投币历史记录 */}
            {coinResults.length > 0 && (
              <div className="bg-white/70 rounded-xl p-4 border border-amber-200">
                <h4 className="text-center font-semibold mb-4">投币历史记录</h4>
                <div className="grid grid-cols-6 gap-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xs text-muted-foreground mb-2">
                        第{i + 1}次
                      </div>
                      <SimpleCoin 
                        result={i < coinResults.length ? coinResults[i] : undefined}
                        isActive={i === currentCoinThrow}
                      />
                      <div className="text-xs mt-1">
                        {i < coinResults.length ? `${coinResults[i]}正面` : '待投'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}