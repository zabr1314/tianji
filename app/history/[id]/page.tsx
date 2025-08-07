'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Star, 
  StarOff, 
  Share2, 
  RefreshCw, 
  Calendar,
  Sparkles,
  User,
  Heart,
  Brain,
  Moon,
  Users,
  Tag,
  Clock
} from 'lucide-react'
import Link from 'next/link'

// 分析类型配置
const ANALYSIS_TYPES = {
  bazi: { name: '八字分析', icon: User, color: 'bg-amber-500', path: '/bazi' },
  hepan: { name: '八字合盘', icon: Heart, color: 'bg-rose-500', path: '/hepan' },
  bugua: { name: '日常卜卦', icon: Sparkles, color: 'bg-purple-500', path: '/bugua' },
  calendar: { name: '运势日历', icon: Calendar, color: 'bg-blue-500', path: '/calendar' },
  name: { name: '姓名分析', icon: Users, color: 'bg-green-500', path: '/name' },
  dream: { name: 'AI解梦', icon: Moon, color: 'bg-indigo-500', path: '/dream' }
}

interface AnalysisRecord {
  id: string
  analysis_type: keyof typeof ANALYSIS_TYPES
  title: string
  summary: string
  input_data: any
  output_data: any
  points_cost: number
  is_favorite: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export default function RecordDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [record, setRecord] = useState<AnalysisRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      loadRecord(params.id as string)
    }
  }, [params.id])

  const loadRecord = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/history/records/${id}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setRecord(data.data)
      } else {
        setError(data.error || '记录不存在')
      }
    } catch (error) {
      console.error('Failed to load record:', error)
      setError('加载记录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!record) return
    
    try {
      const response = await fetch(`/api/history/records/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_favorite: !record.is_favorite
        })
      })

      const data = await response.json()

      if (data.success) {
        setRecord(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null)
      } else {
        console.error('Failed to toggle favorite:', data.error)
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleReanalyze = () => {
    if (!record) return
    
    // 跳转到对应的分析页面，并预填数据
    const typeConfig = ANALYSIS_TYPES[record.analysis_type]
    const queryParams = new URLSearchParams({
      reanalyze: 'true',
      data: JSON.stringify(record.input_data)
    })
    
    router.push(`${typeConfig.path}?${queryParams.toString()}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-serif">加载记录详情...</p>
        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-4">
            记录不存在
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-serif mb-6">
            {error || '未找到指定的分析记录'}
          </p>
          <Link href="/history">
            <Button className="font-serif">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回历史记录
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const typeConfig = ANALYSIS_TYPES[record.analysis_type]

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: `linear-gradient(45deg, 
        #fef7ed 0%, 
        #fef3e2 25%, 
        #fdf2f8 50%, 
        #fef7ed 75%, 
        #fef3e2 100%)`
    }}>
      {/* 宋代美学背景装饰 */}
      <div className="absolute inset-0 opacity-40 dark:opacity-20">
        <div className="absolute top-32 left-32 w-32 h-32 border-2 border-slate-300 dark:border-slate-600 rounded-full opacity-50"></div>
        <div className="absolute bottom-40 right-32 w-24 h-24 border border-slate-400 dark:border-slate-500 rounded-full opacity-60"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded-full opacity-40"></div>
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-amber-400 dark:bg-amber-600 rounded-full opacity-50"></div>
      </div>
      
      <div className="relative z-10">
        <main className="container mx-auto px-4 py-8">
          {/* 页面操作栏 */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/history">
              <Button variant="ghost" size="sm" className="font-serif">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回历史记录
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className="text-amber-600 hover:text-amber-700"
              >
                {record.is_favorite ? (
                  <Star className="h-4 w-4 fill-current mr-2" />
                ) : (
                  <StarOff className="h-4 w-4 mr-2" />
                )}
                {record.is_favorite ? '已收藏' : '收藏'}
              </Button>
              <Button variant="outline" size="sm" className="font-serif">
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </Button>
            </div>
          </div>
          {/* 记录头部信息 */}
          <section className="mb-8">
            <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 ${typeConfig.color} rounded-xl flex items-center justify-center`}>
                      <typeConfig.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <Badge className="mb-2 font-serif">
                        {typeConfig.name}
                      </Badge>
                      <h1 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-2">
                        {record.title}
                      </h1>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span className="font-serif">{formatDate(record.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Sparkles className="h-4 w-4" />
                          <span className="font-serif">{record.points_cost} 天机点</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleReanalyze} className="font-serif">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新分析
                  </Button>
                </div>

                {/* 标签 */}
                {record.tags.length > 0 && (
                  <div className="flex items-center space-x-2 mb-6">
                    <Tag className="h-4 w-4 text-slate-500" />
                    <div className="flex flex-wrap gap-2">
                      {record.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="font-serif">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 分析摘要 */}
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl">
                  <h3 className="text-lg font-serif font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    分析摘要
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                    {record.summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 详细分析结果 */}
          <section className="space-y-6">
            {/* 八字信息（仅八字分析显示） */}
            {record.analysis_type === 'bazi' && record.output_data.bazi && (
              <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="font-serif">八字排盘</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-serif mb-2">年柱</div>
                      <div className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200">
                        {record.output_data.bazi.year}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-serif mb-2">月柱</div>
                      <div className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200">
                        {record.output_data.bazi.month}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-serif mb-2">日柱</div>
                      <div className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200">
                        {record.output_data.bazi.day}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-serif mb-2">时柱</div>
                      <div className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200">
                        {record.output_data.bazi.hour}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 分析详情 */}
            <div className="grid md:grid-cols-2 gap-6">
              {record.output_data.personality && (
                <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center">
                      <User className="h-5 w-5 mr-2 text-amber-600" />
                      性格特点
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                      {record.output_data.personality}
                    </p>
                  </CardContent>
                </Card>
              )}

              {record.output_data.career && (
                <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-blue-600" />
                      事业运势
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                      {record.output_data.career}
                    </p>
                  </CardContent>
                </Card>
              )}

              {record.output_data.wealth && (
                <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-green-600" />
                      财运分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                      {record.output_data.wealth}
                    </p>
                  </CardContent>
                </Card>
              )}

              {record.output_data.health && (
                <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-600" />
                      健康建议
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                      {record.output_data.health}
                    </p>
                  </CardContent>
                </Card>
              )}

              {record.output_data.relationships && (
                <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center">
                      <Users className="h-5 w-5 mr-2 text-purple-600" />
                      感情运势
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                      {record.output_data.relationships}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 综合评分（如果有） */}
            {record.output_data.score && (
              <Card className="bg-slate-50/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-4">
                    综合评分
                  </h3>
                  <div className="text-6xl font-serif font-bold text-amber-600 dark:text-amber-400 mb-2">
                    {record.output_data.score}
                    <span className="text-2xl text-slate-500 dark:text-slate-400">分</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-serif">
                    基于传统命理学综合计算得出
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-slate-600 dark:text-slate-400">
              <p className="font-serif">&copy; 2024 天机AI. 传统智慧，现代科技</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}