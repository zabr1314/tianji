'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Search, 
  Filter, 
  Calendar, 
  Star, 
  StarOff, 
  Share2, 
  Trash2, 
  Eye, 
  RefreshCw,
  History,
  Users,
  Brain,
  Heart,
  User,
  Moon,
  Sparkles,
  Clock,
  TrendingUp,
  MoreVertical,
  ChevronLeft,
  ChevronRight
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

interface FilterParams {
  analysisType: string
  isFavorite: boolean
  searchQuery: string
  sortBy: 'created_at' | 'points_cost'
  sortOrder: 'asc' | 'desc'
}

export default function HistoryPage() {
  const [records, setRecords] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  
  const [filters, setFilters] = useState<FilterParams>({
    analysisType: 'all',
    isFavorite: false,
    searchQuery: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const [stats, setStats] = useState({
    totalCount: 0,
    totalPoints: 0,
    typeCounts: {} as Record<string, number>
  })

  // 模拟数据加载
  useEffect(() => {
    loadRecords()
    loadStats()
  }, [filters])

  const loadRecords = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        type: filters.analysisType === 'all' ? '' : filters.analysisType,
        favorite: filters.isFavorite.toString(),
        search: filters.searchQuery,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        limit: '20',
        offset: '0'
      })

      const response = await fetch(`/api/history/records?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        setRecords(data.data || [])
      } else {
        console.error('Failed to load records:', data.error)
        setRecords([])
      }
    } catch (error) {
      console.error('Error loading records:', error)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/history/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        console.error('Failed to load stats:', data.error)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleToggleFavorite = async (id: string) => {
    const record = records.find(r => r.id === id)
    if (!record) return

    try {
      const response = await fetch(`/api/history/records/${id}`, {
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
        setRecords(prev => prev.map(r => 
          r.id === id ? { ...r, is_favorite: !r.is_favorite } : r
        ))
      } else {
        console.error('Failed to toggle favorite:', data.error)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？此操作不可撤销。')) return
    
    try {
      const response = await fetch(`/api/history/records/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setRecords(prev => prev.filter(r => r.id !== id))
        // 重新加载统计信息
        loadStats()
      } else {
        console.error('Failed to delete record:', data.error)
        alert('删除记录失败，请稍后重试')
      }
    } catch (error) {
      console.error('Error deleting record:', error)
      alert('删除记录失败，请稍后重试')
    }
  }

  const handleViewDetail = (record: AnalysisRecord) => {
    setSelectedRecord(record)
    setShowDetailDialog(true)
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

  const filteredRecords = records.filter(record => {
    if (filters.analysisType !== 'all' && record.analysis_type !== filters.analysisType) {
      return false
    }
    if (filters.isFavorite && !record.is_favorite) {
      return false
    }
    if (filters.searchQuery && !record.title.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false
    }
    return true
  }).sort((a, b) => {
    const sortMultiplier = filters.sortOrder === 'asc' ? 1 : -1
    if (filters.sortBy === 'created_at') {
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * sortMultiplier
    } else {
      return (a.points_cost - b.points_cost) * sortMultiplier
    }
  })

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
          {/* 页面标题 */}
          <section className="text-center mb-8">
            <h2 className="text-4xl font-serif font-bold mb-4 text-slate-800 dark:text-slate-200">
              历史记录
            </h2>
            <div className="w-24 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-4"></div>
            <p className="text-lg font-serif text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
              查看您的分析历史，管理收藏记录，重温命理智慧
            </p>
          </section>

          {/* 统计信息 */}
          <section className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <History className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-sm font-serif text-slate-600 dark:text-slate-400">总记录</span>
                </div>
                <div className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200">
                  {stats.totalCount}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Sparkles className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-sm font-serif text-slate-600 dark:text-slate-400">消耗点数</span>
                </div>
                <div className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200">
                  {stats.totalPoints}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-sm font-serif text-slate-600 dark:text-slate-400">收藏记录</span>
                </div>
                <div className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200">
                  {records.filter(r => r.is_favorite).length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-sm font-serif text-slate-600 dark:text-slate-400">最常用</span>
                </div>
                <div className="text-sm font-serif font-bold text-slate-800 dark:text-slate-200">
                  {Object.entries(stats.typeCounts).reduce((max, [type, count]) => 
                    count > max.count ? { type, count } : max, 
                    { type: '', count: 0 }
                  ).type && ANALYSIS_TYPES[Object.entries(stats.typeCounts).reduce((max, [type, count]) => 
                    count > max.count ? { type, count } : max, 
                    { type: 'bazi', count: 0 }
                  ).type as keyof typeof ANALYSIS_TYPES]?.name}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 筛选和搜索 */}
          <section className="mb-8">
            <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 搜索框 */}
                  <div>
                    <Label htmlFor="search" className="text-sm font-serif mb-2">搜索记录</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="search"
                        placeholder="输入关键词搜索..."
                        value={filters.searchQuery}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* 类型筛选 */}
                  <div>
                    <Label className="text-sm font-serif mb-2">分析类型</Label>
                    <Select 
                      value={filters.analysisType} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, analysisType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部类型</SelectItem>
                        {Object.entries(ANALYSIS_TYPES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 排序选择 */}
                  <div>
                    <Label className="text-sm font-serif mb-2">排序方式</Label>
                    <Select 
                      value={`${filters.sortBy}-${filters.sortOrder}`} 
                      onValueChange={(value) => {
                        const [sortBy, sortOrder] = value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder]
                        setFilters(prev => ({ ...prev, sortBy, sortOrder }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at-desc">最新优先</SelectItem>
                        <SelectItem value="created_at-asc">最早优先</SelectItem>
                        <SelectItem value="points_cost-desc">高消耗优先</SelectItem>
                        <SelectItem value="points_cost-asc">低消耗优先</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 快捷筛选 */}
                  <div className="flex items-end space-x-2">
                    <Button
                      variant={filters.isFavorite ? "default" : "outline"}
                      onClick={() => setFilters(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                      className="font-serif"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      收藏
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
                      className="font-serif"
                    >
                      {isMultiSelectMode ? '退出' : '批选'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 记录列表 */}
          <section>
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse bg-white/90 dark:bg-slate-900/90">
                    <CardContent className="p-6">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredRecords.length === 0 ? (
              <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
                <CardContent className="p-12 text-center">
                  <History className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-serif font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    暂无历史记录
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 font-serif mb-6">
                    开始使用天机AI的各项分析功能，创建您的第一条记录吧
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {Object.entries(ANALYSIS_TYPES).slice(0, 3).map(([key, config]) => (
                      <Link key={key} href={config.path}>
                        <Button variant="outline" className="font-serif">
                          <config.icon className="h-4 w-4 mr-2" />
                          {config.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecords.map((record) => {
                  const typeConfig = ANALYSIS_TYPES[record.analysis_type]
                  return (
                    <Card key={record.id} className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        {/* 记录头部 */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 ${typeConfig.color} rounded-lg flex items-center justify-center`}>
                              {(() => {
                                const IconComponent = typeConfig.icon;
                                return <IconComponent className="h-5 w-5 text-white" />;
                              })()}
                            </div>
                            <div>
                              <Badge variant="secondary" className="text-xs font-serif mb-1">
                                {typeConfig.name}
                              </Badge>
                              <h4 className="font-serif font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                {record.title}
                              </h4>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isMultiSelectMode && (
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(record.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedIds([...selectedIds, record.id])
                                  } else {
                                    setSelectedIds(selectedIds.filter(id => id !== record.id))
                                  }
                                }}
                                className="w-4 h-4 text-amber-600 rounded"
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFavorite(record.id)}
                              className="text-amber-600 hover:text-amber-700"
                            >
                              {record.is_favorite ? (
                                <Star className="h-4 w-4 fill-current" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* 记录摘要 */}
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-serif leading-relaxed mb-4 line-clamp-2">
                          {record.summary}
                        </p>

                        {/* 标签 */}
                        {record.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {record.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs font-serif">
                                {tag}
                              </Badge>
                            ))}
                            {record.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs font-serif">
                                +{record.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* 记录底部 */}
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-serif mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(record.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Sparkles className="h-3 w-3" />
                            <span>{record.points_cost}点</span>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(record)}
                            className="flex-1 font-serif"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            查看详情
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-serif"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            重新分析
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>

          {/* 分页或加载更多 */}
          {filteredRecords.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="outline" className="font-serif">
                加载更多记录
              </Button>
            </div>
          )}
        </main>

        {/* 详情对话框 */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {selectedRecord?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${ANALYSIS_TYPES[selectedRecord.analysis_type].color} rounded-lg flex items-center justify-center`}>
                    {(() => {
                      const IconComponent = ANALYSIS_TYPES[selectedRecord.analysis_type].icon;
                      return <IconComponent className="h-6 w-6 text-white" />;
                    })()}
                  </div>
                  <div>
                    <Badge className="mb-2">
                      {ANALYSIS_TYPES[selectedRecord.analysis_type].name}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      创建于 {formatDate(selectedRecord.created_at)} • 消耗 {selectedRecord.points_cost} 天机点
                    </p>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-serif font-semibold mb-2">分析摘要</h4>
                  <p className="text-slate-700 dark:text-slate-300 font-serif">
                    {selectedRecord.summary}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button className="font-serif">
                    <Eye className="h-4 w-4 mr-2" />
                    查看完整结果
                  </Button>
                  <Button variant="outline" className="font-serif">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新分析
                  </Button>
                  <Button variant="outline" className="font-serif">
                    <Share2 className="h-4 w-4 mr-2" />
                    分享结果
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm mt-16 relative">
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