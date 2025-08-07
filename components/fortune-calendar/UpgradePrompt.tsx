'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Crown, TrendingUp, Calendar, User, Zap } from 'lucide-react'

interface UpgradePromptProps {
  onGetPersonalized: () => void
  isLoggedIn?: boolean
}

export function UpgradePrompt({ onGetPersonalized, isLoggedIn = false }: UpgradePromptProps) {
  const benefits = [
    {
      icon: <TrendingUp className="h-5 w-5 text-amber-600" />,
      title: '精准分析',
      description: '基于您的生辰八字，提供专属运势分析'
    },
    {
      icon: <Calendar className="h-5 w-5 text-amber-600" />,
      title: '全年日历',
      description: '查看全年每天的详细运势变化趋势'
    },
    {
      icon: <Crown className="h-5 w-5 text-amber-600" />,
      title: '专业解读',
      description: 'AI结合传统命理，给出个性化建议'
    },
    {
      icon: <Zap className="h-5 w-5 text-amber-600" />,
      title: '实时更新',
      description: '运势数据实时计算，确保准确及时'
    }
  ]

  return (
    <Card className="w-full bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-2 border-amber-200 dark:border-amber-800 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
          升级到专属运势
        </CardTitle>
        <p className="text-muted-foreground mt-2">
          当前显示的是通用版运势，填写生辰信息获得更精准的个性化分析
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 对比说明 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                当前：通用版
              </Badge>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 基础运势参考</li>
              <li>• 通用化建议</li>
              <li>• 限制查看范围</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                升级：专属版
              </Badge>
            </div>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>• 基于个人八字精准分析</li>
              <li>• 个性化运势指导</li>
              <li>• 全年运势日历</li>
              <li>• 详细五行分析</li>
            </ul>
          </div>
        </div>
        
        {/* 核心优势 */}
        <div>
          <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-4 text-center">
            专属版独有功能
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-amber-950/30 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {benefit.icon}
                </div>
                <div>
                  <h5 className="font-medium text-sm text-amber-800 dark:text-amber-200">
                    {benefit.title}
                  </h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 立即体验 */}
        <div className="text-center space-y-4 pt-2">
          {isLoggedIn ? (
            <Button
              onClick={onGetPersonalized}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-6 sm:px-8 shadow-lg w-full sm:w-auto"
            >
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">填写个人信息，</span>获取专属运势
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 justify-center">
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-6 sm:px-8 shadow-lg w-full sm:w-auto"
                >
                  <User className="h-4 w-4 mr-2" />
                  注册获取专属运势
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/20 w-full sm:w-auto"
                >
                  已有账号？立即登录
                </Button>
              </Link>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            {isLoggedIn 
              ? '填写信息后将消耗 100 天机点生成专属运势' 
              : '注册即送 100 天机点，足够生成一次专属运势'
            }
          </p>
        </div>
        
        {/* 用户评价 */}
        <div className="bg-amber-100/50 dark:bg-amber-900/20 p-4 rounded-lg">
          <div className="text-center">
            <div className="flex justify-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">⭐</span>
              ))}
            </div>
            <p className="text-sm italic text-amber-700 dark:text-amber-300">
              "个性化运势分析真的很准，每天的建议都很实用！"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              - 来自真实用户反馈
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}