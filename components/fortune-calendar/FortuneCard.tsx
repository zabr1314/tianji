'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, TrendingDown, Minus, Heart, Briefcase, Wallet, Activity } from 'lucide-react'
import { FORTUNE_LEVELS, type DailyFortune } from '@/lib/types/fortune-calendar'

interface FortuneCardProps {
  fortune: DailyFortune | null
  selectedDate: string
}

export function FortuneCard({ fortune, selectedDate }: FortuneCardProps) {
  if (!fortune) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('zh-CN', {
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>暂无运势数据</p>
            <p className="text-sm mt-2">请选择其他日期查看</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const fortuneLevel = FORTUNE_LEVELS[fortune.level]
  
  const getScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (score >= 40) return <Minus className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className={`w-full ${fortuneLevel.bgColor} ${fortuneLevel.borderColor} border-2`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('zh-CN', {
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{fortuneLevel.emoji}</span>
            <Badge className={`${fortuneLevel.color} text-white border-0`}>
              {fortuneLevel.label}
            </Badge>
          </div>
        </div>
        
        {/* 总分显示 */}
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${fortuneLevel.textColor}`}>
              {fortune.score}
            </div>
            <div className="text-sm text-muted-foreground">总分</div>
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground">{fortune.summary}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 各项运势评分 */}
        <div>
          <h4 className="font-semibold mb-3 text-sm">运势详情</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4 text-green-600" />
                <span className="text-sm">财运</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`font-semibold ${getScoreColor(fortune.categories.wealth)}`}>
                  {fortune.categories.wealth}
                </span>
                {getScoreIcon(fortune.categories.wealth)}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-pink-600" />
                <span className="text-sm">感情</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`font-semibold ${getScoreColor(fortune.categories.love)}`}>
                  {fortune.categories.love}
                </span>
                {getScoreIcon(fortune.categories.love)}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <span className="text-sm">事业</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`font-semibold ${getScoreColor(fortune.categories.career)}`}>
                  {fortune.categories.career}
                </span>
                {getScoreIcon(fortune.categories.career)}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-orange-600" />
                <span className="text-sm">健康</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`font-semibold ${getScoreColor(fortune.categories.health)}`}>
                  {fortune.categories.health}
                </span>
                {getScoreIcon(fortune.categories.health)}
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* 幸运要素 */}
        <div>
          <h4 className="font-semibold mb-3 text-sm">幸运要素</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">幸运颜色</div>
              <Badge variant="outline" className="text-sm">
                {fortune.luckyColor}
              </Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">幸运数字</div>
              <Badge variant="outline" className="text-sm">
                {fortune.luckyNumber}
              </Badge>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* 活动建议 */}
        <div>
          <h4 className="font-semibold mb-3 text-sm">活动建议</h4>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-2">✅ 适宜活动</div>
              <div className="flex flex-wrap gap-2">
                {fortune.suitableActivities.map((activity, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                  >
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>
            
            {fortune.avoidActivities.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">❌ 避免活动</div>
                <div className="flex flex-wrap gap-2">
                  {fortune.avoidActivities.map((activity, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                    >
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Separator />
        
        {/* 详细建议 */}
        <div>
          <h4 className="font-semibold mb-3 text-sm">今日建议</h4>
          <div className="text-sm text-muted-foreground leading-relaxed bg-background/30 p-3 rounded-lg">
            {fortune.advice}
          </div>
        </div>
        
        {fortune.avoid && (
          <div>
            <h4 className="font-semibold mb-3 text-sm text-red-600">注意事项</h4>
            <div className="text-sm text-red-600 leading-relaxed bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {fortune.avoid}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}