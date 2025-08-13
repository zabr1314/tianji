'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // 创建单例supabase客户端
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let mounted = true

    async function getUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (mounted) {
          setUser(user)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    getUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setUser(session?.user || null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const services = [
    {
      title: '个人八字命盘',
      description: '生辰八字解析，窥探命理奥秘',
      cost: '200 天机点',
      path: '/bazi',
      category: '命理分析',
      theme: 'slate'
    },
    {
      title: '八字合盘',
      description: '两人配对分析，情缘深浅可测',
      cost: '300 天机点',
      path: '/hepan',
      category: '感情分析',
      theme: 'amber'
    },
    {
      title: '日常卜卦',
      description: '周易卜算，针对问题指点迷津',
      cost: '150 天机点',
      path: '/bugua',
      category: '卜卦占卜',
      theme: 'slate'
    },
    {
      title: '个人运势日历',
      description: '每日吉凶，时机把握在胸',
      cost: '100 天机点',
      path: '/calendar',
      category: '运势预测',
      theme: 'amber'
    },
    {
      title: '姓名学分析',
      description: '姓名五行，运势配置解读',
      cost: '120 天机点',
      path: '/name',
      category: '姓名学',
      theme: 'slate'
    },
    {
      title: 'AI解梦',
      description: '梦境深析，潜意识的智慧解读',
      cost: '80 天机点',
      path: '/dream',
      category: '梦境分析',
      theme: 'amber'
    }
  ]

  const features = [
    {
      title: '传统智慧',
      description: '承袭千年易学传统，遵循古法精髓，确保分析的准确性与权威性',
      details: ['正统天干地支算法', '古典命理体系', '传统文化传承'],
      icon: '古',
      theme: 'amber'
    },
    {
      title: 'AI加持', 
      description: '结合DeepSeek大模型，提供更深入、更全面的命理解读与人生指导',
      details: ['智能分析引擎', '多维度解读', '个性化建议'],
      icon: '智',
      theme: 'slate'
    },
    {
      title: '专业服务',
      description: '涵盖人生各个方面，从命理到运势，从感情到事业的全方位咨询',
      details: ['全生命周期覆盖', '多领域专业分析', '精准预测指导'],
      icon: '专',
      theme: 'amber'
    }
  ]

  // 宋代美学色彩映射 - 只使用slate灰色系 + amber琥珀金
  const getThemeColors = (theme: string) => {
    const themes = {
      amber: {
        bg: 'bg-amber-50/50 dark:bg-amber-950/10',
        border: 'border-amber-200 dark:border-amber-800/50',
        text: 'text-amber-700 dark:text-amber-300',
        button: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800',
        accent: 'bg-amber-600'
      },
      slate: {
        bg: 'bg-slate-100/50 dark:bg-slate-800/30',
        border: 'border-slate-300 dark:border-slate-600',
        text: 'text-slate-700 dark:text-slate-300',
        button: 'bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-800',
        accent: 'bg-slate-600'
      }
    }
    return themes[theme as keyof typeof themes] || themes.slate
  }

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-slate-900 relative overflow-hidden" style={{
      background: `linear-gradient(45deg, 
        #fef7ed 0%, 
        #fef3e2 25%, 
        #fdf2f8 50%, 
        #fef7ed 75%, 
        #fef3e2 100%)`
    }}>
      {/* 宋代美学背景装饰 - 增强版 */}
      <div className="absolute inset-0 opacity-60 dark:opacity-40">
        {/* 大型装饰圆圈 */}
        <div className="absolute top-20 left-20 w-40 h-40 border-2 border-slate-300 dark:border-slate-600 rounded-full opacity-60"></div>
        <div className="absolute top-60 right-32 w-32 h-32 border-2 border-slate-400 dark:border-slate-500 rounded-full opacity-50"></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 border border-slate-400 dark:border-slate-500 rounded-full opacity-70"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 border border-slate-300 dark:border-slate-600 rounded-full opacity-45"></div>
        
        {/* 小装饰圆点 */}
        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full opacity-60"></div>
        <div className="absolute top-1/2 left-1/5 w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full opacity-70"></div>
        <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded-full opacity-50"></div>
        
        {/* 几何线条 */}
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-400 dark:via-slate-500 to-transparent opacity-60"></div>
        <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-400 dark:via-slate-500 to-transparent opacity-50"></div>
        
        {/* 垂直装饰线 */}
        <div className="absolute left-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent opacity-40"></div>
        <div className="absolute right-1/5 top-0 w-px h-full bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent opacity-30"></div>
      </div>
      
      {/* 主要内容层 */}
      <div className="relative z-10">
      <div className="container mx-auto px-4 py-12">
        {/* 宋代美学 Hero Section */}
        <section className="text-center py-20 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-6">
                传统智慧
              </h2>
              <div className="w-32 h-px bg-slate-400 dark:bg-slate-600 mx-auto mb-6"></div>
              <h3 className="text-3xl md:text-4xl font-serif text-slate-600 dark:text-slate-400 mb-8">
                遇见现代AI
              </h3>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              承袭千年易学精髓，结合先进人工智能技术<br />
              为您提供准确深入的命理分析与人生指导<br />
              古法新用，传统与现代的完美融合
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <Badge className="bg-amber-600 text-white px-4 py-2 font-medium border-0">
                传统算法
              </Badge>
              <Badge className="bg-slate-600 text-white px-4 py-2 font-medium border-0">
                AI加持
              </Badge>
              <Badge className="bg-amber-700 text-white px-4 py-2 font-medium border-0">
                专业解读
              </Badge>
            </div>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center mb-16">
              <Link href="/bazi">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3">
                  开始八字分析
                </Button>
              </Link>
              {!loading && (
                user ? (
                  <Link href="/history">
                    <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/20 px-8 py-3">
                      查看历史记录
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/sign-up">
                    <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/20 px-8 py-3">
                      免费注册体验
                    </Button>
                  </Link>
                )
              )}
            </div>
            
            {/* 服务统计数据 - 宋代美学风格 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center relative">
                  <div className="absolute inset-2 border border-amber-300 dark:border-amber-700 rounded-full opacity-40"></div>
                  <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">12k+</span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">服务用户</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-800/50 rounded-full border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center relative">
                  <div className="absolute inset-2 border border-slate-300 dark:border-slate-500 rounded-full opacity-40"></div>
                  <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">95%</span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">准确率</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center relative">
                  <div className="absolute inset-2 border border-amber-300 dark:border-amber-700 rounded-full opacity-40"></div>
                  <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">30万+</span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">分析次数</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-800/50 rounded-full border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center relative">
                  <div className="absolute inset-2 border border-slate-300 dark:border-slate-500 rounded-full opacity-40"></div>
                  <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">24/7</span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">智能服务</p>
              </div>
            </div>
          </div>
        </section>

        {/* 服务介绍 - 宋代美学风格 */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-4">
              专业服务
            </h3>
            <div className="w-20 h-px bg-slate-400 dark:bg-slate-600 mx-auto mb-6"></div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              涵盖人生各个方面的易学咨询服务，助您洞察先机，把握命运
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const colors = getThemeColors(service.theme)
              return (
                <Card key={index} className={`${colors.bg} ${colors.border} border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 group relative overflow-hidden`}>
                  {/* 卡片装饰 */}
                  <div className="absolute top-2 right-2 w-6 h-6 border border-slate-200 dark:border-slate-600 rounded-full opacity-10"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border border-slate-200 dark:border-slate-600 rounded-full opacity-15"></div>
                  
                  <CardHeader className="pb-4 relative">
                    <div className="mb-4">
                      <Badge className={`${colors.accent} text-white text-xs px-3 py-1 border-0`}>
                        {service.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-serif font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      {service.title}
                    </CardTitle>
                    <div className={`w-12 h-px ${colors.accent} mb-3`}></div>
                    <CardDescription className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`${colors.border} text-slate-700 dark:text-slate-300`}>
                        {service.cost}
                      </Badge>
                      <Link href={service.path}>
                        <Button size="sm" className={`${colors.button} text-white border-0`}>
                          立即体验 →
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* 用户评价 - 古典诗词风格 */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-4">
              用户心声
            </h3>
            <div className="w-20 h-px bg-slate-400 dark:bg-slate-600 mx-auto mb-6"></div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              千古智慧，今朝验证
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                content: "八字详解如镜照，命理分析甚精妙。AI智慧融古法，人生指引不迷茫。",
                author: "李**",
                service: "八字命盘",
                rating: "★★★★★"
              },
              {
                content: "合盘之术见真章，情缘深浅自明了。传统与现代并融，缘分天定人可知。",
                author: "王**",
                service: "合盘分析", 
                rating: "★★★★★"
              },
              {
                content: "卜卦问事求指引，古法新用显神通。疑难困顿得明路，智慧之光照前程。",
                author: "张**",
                service: "日常卜卦",
                rating: "★★★★☆"
              }
            ].map((review, index) => (
              <Card key={index} className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                {/* 古典装饰 */}
                <div className="absolute top-2 right-2 w-6 h-6 border border-slate-200 dark:border-slate-600 rounded-full opacity-10"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border border-slate-200 dark:border-slate-600 rounded-full opacity-15"></div>
                
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-4">
                      <span className="text-amber-600 dark:text-amber-400 text-lg">"{'"'}</span>
                    </div>
                  </div>
                  
                  <blockquote className="text-slate-700 dark:text-slate-300 text-center mb-6 font-serif leading-relaxed">
                    {review.content}
                  </blockquote>
                  
                  <div className="text-center">
                    <div className="text-amber-500 mb-2 text-lg">
                      {review.rating}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">{review.author}</span>
                      <span className="mx-2">·</span>
                      <span>{review.service}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 核心优势 - 宋代美学风格 */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-4">
              核心优势
            </h3>
            <div className="w-20 h-px bg-slate-400 dark:bg-slate-600 mx-auto mb-6"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => {
              const colors = getThemeColors(feature.theme)
              return (
                <div key={index} className="text-center">
                  <Card className={`${colors.bg} ${colors.border} border-2 p-8 h-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden`}>
                    {/* 特色卡片装饰 */}
                    <div className="absolute top-4 right-4 w-5 h-5 border border-slate-200 dark:border-slate-600 rounded-full opacity-10"></div>
                    <div className="absolute bottom-6 left-4 w-3 h-3 border border-slate-200 dark:border-slate-600 rounded-full opacity-20"></div>
                    <CardHeader className="pb-6">
                      <div className={`w-16 h-16 ${colors.accent} rounded-lg flex items-center justify-center mx-auto mb-6`}>
                        <span className="text-white text-lg font-serif font-bold">
                          {feature.icon}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-serif font-semibold text-slate-800 dark:text-slate-200 mb-3">
                        {feature.title}
                      </CardTitle>
                      <div className={`w-12 h-px ${colors.accent} mx-auto mb-4`}></div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                        {feature.description}
                      </p>
                      <div className="space-y-2">
                        {feature.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center justify-center text-xs text-slate-600 dark:text-slate-400">
                            <span className={`w-1 h-1 ${colors.accent} rounded-full mr-2`}></span>
                            {detail}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </section>

        {/* 分析样本预览 - 古书风格 */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-4">
              分析样本
            </h3>
            <div className="w-20 h-px bg-slate-400 dark:bg-slate-600 mx-auto mb-6"></div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              一窥天机深度，感受分析品质
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* 八字分析样本 */}
            <Card className="bg-amber-50/80 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4 w-8 h-8 border border-amber-300 dark:border-amber-700 rounded-full opacity-20"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-amber-600 text-white px-3 py-1">八字命盘</Badge>
                  <span className="text-xs text-amber-600 dark:text-amber-400">样本预览</span>
                </div>
                <CardTitle className="text-xl font-serif text-slate-800 dark:text-slate-200">
                  个人命理分析报告
                </CardTitle>
                <div className="w-16 h-px bg-amber-600 mb-3"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-amber-100 dark:border-amber-900">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">基本信息</h4>
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <p>• 生辰：1990年8月15日 上午9:30</p>
                    <p>• 八字：庚午年 甲申月 乙卯日 辛巳时</p>
                    <p>• 五行：金2 木2 水0 火2 土2</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-amber-100 dark:border-amber-900">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">性格特质</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    日主乙木，性格温和坚韧，富有创造力。申金克制日主，做事谨慎细致...
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-amber-100 dark:border-amber-900">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">事业财运</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    财星透干，财运稳定。适宜从事创意、文化类工作...
                  </p>
                </div>
                <div className="text-center pt-4">
                  <Link href="/bazi">
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                      获取完整分析 →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 合盘分析样本 */}
            <Card className="bg-slate-50/80 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4 w-8 h-8 border border-slate-300 dark:border-slate-500 rounded-full opacity-20"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-slate-600 text-white px-3 py-1">合盘分析</Badge>
                  <span className="text-xs text-slate-600 dark:text-slate-400">样本预览</span>
                </div>
                <CardTitle className="text-xl font-serif text-slate-800 dark:text-slate-200">
                  情缘配对分析报告
                </CardTitle>
                <div className="w-16 h-px bg-slate-600 mb-3"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white dark:bg-slate-800/30 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">匹配度评分</h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                      <div className="bg-amber-500 h-3 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">85%</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800/30 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">相处模式</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    男方庚金女方乙木，金木相配，互补性强。男方决断力强，女方温柔体贴...
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800/30 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">发展建议</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    建议在沟通方面多加注意，彼此包容理解...
                  </p>
                </div>
                <div className="text-center pt-4">
                  <Link href="/hepan">
                    <Button size="sm" className="bg-slate-600 hover:bg-slate-700 text-white">
                      获取完整分析 →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 立即开始 - 宋代美学 */}
        <section className="mb-16">
          <Card className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-center p-12 shadow-lg relative overflow-hidden">
            {/* 装饰元素 */}
            <div className="absolute top-4 left-4 w-8 h-8 border border-slate-300 dark:border-slate-600 rounded-full opacity-20"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border border-slate-300 dark:border-slate-600 rounded-full opacity-30"></div>
            
            <CardContent className="relative">
              <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-4">
                {user ? '继续您的命理智慧之旅' : '开启您的命理智慧之旅'}
              </h3>
              <div className="w-24 h-px bg-slate-400 dark:bg-slate-500 mx-auto mb-6"></div>
              <p className="text-slate-700 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                {user ? (
                  <>
                    探索更多命理分析服务，深入了解您的命运轨迹<br />
                    让古老智慧继续为您的人生决策提供指引
                  </>
                ) : (
                  <>
                    注册即可获得300天机点，足够进行一次完整的八字分析<br />
                    让古老智慧为您的人生决策提供指引
                  </>
                )}
              </p>
              {!loading && (
                <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                  {user ? (
                    <>
                      <Link href="/calendar">
                        <Button size="lg" className="bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-8 py-3">
                          查看今日运势
                        </Button>
                      </Link>
                      <Link href="/bazi">
                        <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 px-8 py-3">
                          重新分析
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/sign-up">
                        <Button size="lg" className="bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-8 py-3">
                          免费注册
                        </Button>
                      </Link>
                      <Link href="/bazi">
                        <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 px-8 py-3">
                          立即分析
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* 宋代美学 Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm py-12 relative">
        {/* Footer 装饰 */}
        <div className="absolute top-4 left-1/4 w-4 h-4 border border-slate-300 dark:border-slate-600 rounded-full opacity-20"></div>
        <div className="absolute bottom-4 right-1/3 w-3 h-3 border border-slate-300 dark:border-slate-600 rounded-full opacity-25"></div>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-amber-600 dark:bg-amber-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-serif font-bold">天</span>
              </div>
              <div>
                <h4 className="text-lg font-serif font-bold text-slate-800 dark:text-slate-200">天机AI</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">传统易学 · 智能分析</p>
              </div>
            </div>
            <Separator className="my-6 bg-slate-300 dark:bg-slate-600" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2024 天机AI. 承古法精髓，展现代智慧
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              本平台仅供参考娱乐，请理性看待命理分析结果
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}