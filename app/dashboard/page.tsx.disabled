'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Calculator, Heart, Calendar, User, Moon, Coins, History, LogOut } from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  display_name?: string
  username?: string
}

interface TianjiAccount {
  current_points: number
  total_earned: number
  total_spent: number
}

export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [account, setAccount] = useState<TianjiAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadUserData() {
      try {
        // Get user info
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        if (authError || !authUser) {
          redirect('/auth/login')
          return
        }

        setUser({
          id: authUser.id,
          display_name: authUser.user_metadata?.display_name,
          username: authUser.user_metadata?.username
        })

        // Get tianji account info
        const { data: accountData, error: accountError } = await supabase
          .from('tianji_accounts')
          .select('current_points, total_earned, total_spent')
          .eq('user_id', authUser.id)
          .single()

        if (!accountError && accountData) {
          setAccount(accountData)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    redirect('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const services = [
    {
      title: '八字命盘分析',
      description: '深度解析您的生辰八字',
      icon: Calculator,
      cost: 200,
      href: '/bazi',
      color: 'bg-blue-500'
    },
    {
      title: '八字合盘',
      description: '分析两人八字配对',
      icon: Heart,
      cost: 300,
      href: '/hepan',
      color: 'bg-pink-500'
    },
    {
      title: '日常卜卦',
      description: '针对具体问题进行卜算',
      icon: Sparkles,
      cost: 150,
      href: '/bugua',
      color: 'bg-purple-500'
    },
    {
      title: '运势日历',
      description: '每日运势预测',
      icon: Calendar,
      cost: 100,
      href: '/calendar',
      color: 'bg-green-500'
    },
    {
      title: '姓名分析',
      description: '姓名五行配置分析',
      icon: User,
      cost: 120,
      href: '/name',
      color: 'bg-orange-500'
    },
    {
      title: 'AI解梦',
      description: '人工智能梦境解析',
      icon: Moon,
      cost: 80,
      href: '/dream',
      color: 'bg-indigo-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              天机AI
            </h1>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              首页
            </Link>
            <Link href="/bazi" className="text-sm text-muted-foreground hover:text-foreground">
              八字分析
            </Link>
            <Link href="/hepan" className="text-sm text-muted-foreground hover:text-foreground">
              八字合盘
            </Link>
            <Link href="/bugua" className="text-sm text-muted-foreground hover:text-foreground">
              日常卜卦
            </Link>
            <Link href="/calendar" className="text-sm text-muted-foreground hover:text-foreground">
              运势日历
            </Link>
            <Link href="/name" className="text-sm text-muted-foreground hover:text-foreground">
              姓名分析
            </Link>
            <Link href="/dream" className="text-sm text-muted-foreground hover:text-foreground">
              AI解梦
            </Link>
            <Link href="/points" className="text-sm text-muted-foreground hover:text-foreground">
              充值天机点
            </Link>
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">
              欢迎回来，{user?.display_name || user?.username || '用户'}！
            </h2>
            <p className="text-muted-foreground">开始您的天机AI命理探索之旅</p>
          </div>

          {/* Account Info */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">当前天机点</p>
                    <p className="text-2xl font-bold">{account?.current_points || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">累计获得</p>
                    <p className="text-2xl font-bold">{account?.total_earned || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">累计消费</p>
                    <p className="text-2xl font-bold">{account?.total_spent || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Low Balance Warning */}
          {account && account.current_points < 200 && (
            <Card className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Coins className="h-6 w-6 text-amber-600" />
                    <div>
                      <h3 className="font-semibold text-amber-800 dark:text-amber-200">天机点余额不足</h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        您的天机点余额为 {account.current_points}，可能无法使用所有服务
                      </p>
                    </div>
                  </div>
                  <Link href="/points">
                    <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                      立即充值
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Services Grid */}
        <section className="mb-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">选择您需要的服务</h3>
            <p className="text-muted-foreground">
              点击下方服务卡片，开始您的命理分析之旅
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon
              const canAfford = account ? account.current_points >= service.cost : false
              
              return (
                <Card key={index} className={`hover:shadow-lg transition-all cursor-pointer group ${
                  !canAfford ? 'opacity-60' : ''
                }`}>
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant={canAfford ? "outline" : "destructive"}>
                        {service.cost} 天机点
                      </Badge>
                      <Link href={canAfford ? service.href : '/points'}>
                        <Button size="sm" variant={canAfford ? "default" : "outline"}>
                          {canAfford ? '开始分析' : '需要充值'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">快速操作</h3>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Link href="/points">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                <Coins className="h-4 w-4 mr-2" />
                充值天机点
              </Button>
            </Link>
            <Link href="/bazi">
              <Button variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
                立即体验八字分析
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 天机AI. 传统智慧，现代科技</p>
          </div>
        </div>
      </footer>
    </div>
  )
}