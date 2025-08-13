'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  ChevronRight,
  Copy,
  Loader2
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

interface HistoryStats {
  totalCount: number
  totalPoints: number
  favoriteCount: number
  typeCounts: Record<string, number>
  mostUsedType?: string
  averagePointsPerRecord: number
}

interface FilterParams {
  analysisType: string
  isFavorite: boolean
  searchQuery: string
  sortBy: 'created_at' | 'points_cost'
  sortOrder: 'asc' | 'desc'
}

// 自定义Hook：防抖
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// 自定义Hook：缓存
function useCache<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const cached = localStorage.getItem(key)
      return cached ? JSON.parse(cached) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setCachedValue = useCallback((newValue: T) => {
    setValue(newValue)
    try {
      localStorage.setItem(key, JSON.stringify(newValue))
    } catch {
      // localStorage可能不可用，忽略错误
    }
  }, [key])

  return [value, setCachedValue] as const
}

export default function OptimizedHistoryPage() {
  // 状态管理
  const [records, setRecords] = useState<AnalysisRecord[]>([])
  const [stats, setStats] = useState<HistoryStats>({
    totalCount: 0,
    totalPoints: 0,
    favoriteCount: 0,
    typeCounts: {},
    mostUsedType: undefined,
    averagePointsPerRecord: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  // 使用状态存储筛选条件
  const [filters, setCachedFilters] = useState<FilterParams>({
    analysisType: 'all',
    isFavorite: false,
    searchQuery: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  // 防抖搜索
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 500)

  // 更新筛选条件
  const setFilters = useCallback((newFilters: Partial<FilterParams>) => {
    setCachedFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(0) // 重置页码
  }, [setCachedFilters])

  // 优化后的数据加载函数
  const loadData = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const queryParams = new URLSearchParams({
        type: filters.analysisType === 'all' ? '' : filters.analysisType,
        favorite: filters.isFavorite.toString(),
        search: debouncedSearchQuery,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        limit: '5',
        offset: (currentPage * 5).toString()
      })

      const response = await fetch(`/api/history/records?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        const newRecords = data.data || []
        
        // 如果是刷新或第一页，替换记录；否则追加
        if (refresh || currentPage === 0) {
          setRecords(newRecords)
        } else {
          setRecords(prev => [...prev, ...newRecords])
        }
        
        // 简单计算统计信息
        setStats({
          totalCount: newRecords.length,
          totalPoints: newRecords.reduce((sum: number, r: any) => sum + (r.points_cost || 0), 0),
          favoriteCount: newRecords.filter((r: any) => r.is_favorite).length,
          typeCounts: {},
          mostUsedType: undefined,
          averagePointsPerRecord: 0
        })
        setHasMore(newRecords.length === 5)
      } else {
        console.error('Failed to load data:', data.error)
        if (currentPage === 0) {
          setRecords([])
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      if (currentPage === 0) {
        setRecords([])
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters, debouncedSearchQuery, currentPage])

  // 初始加载和筛选变化时加载数据
  useEffect(() => {
    loadData()
  }, [loadData, filters.analysisType, filters.isFavorite, filters.sortBy, filters.sortOrder, debouncedSearchQuery])

  // 监听页码变化，触发加载更多数据
  useEffect(() => {
    if (currentPage > 0) {
      loadData()
    }
  }, [currentPage, loadData])

  // 分页加载
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setCurrentPage(prev => prev + 1)
    }
  }, [loading, hasMore])

  // 刷新数据
  const refreshData = useCallback(() => {
    setCurrentPage(0)
    loadData(true)
  }, [loadData])

  // 切换收藏状态（优化版）
  const handleToggleFavorite = useCallback(async (record: AnalysisRecord) => {
    const optimisticUpdate = (records: AnalysisRecord[]) =>
      records.map(r => 
        r.id === record.id ? { ...r, is_favorite: !r.is_favorite } : r
      )

    // 乐观更新UI
    setRecords(optimisticUpdate)
    
    // 暂时只做UI更新，不调用后端
    console.log('Toggle favorite for record:', record.id)
  }, [])

  // 删除记录（优化版）
  const handleDeleteRecord = useCallback(async (record: AnalysisRecord) => {
    if (!confirm('确定要删除这条记录吗？此操作不可撤销。')) return

    // 乐观更新UI
    setRecords(prev => prev.filter(r => r.id !== record.id))
    
    try {
      const response = await fetch('/api/history/optimized-simple', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch_delete',
          recordIds: [{
            id: record.id,
            analysis_type: record.analysis_type
          }]
        })
      })

      const data = await response.json()
      
      if (!data.success) {
        // 如果失败，恢复记录
        refreshData()
        alert('删除记录失败，请稍后重试')
      } else {
        // 更新统计信息
        setStats(prev => ({
          ...prev,
          totalCount: prev.totalCount - 1,
          totalPoints: prev.totalPoints - record.points_cost,
          favoriteCount: record.is_favorite ? prev.favoriteCount - 1 : prev.favoriteCount
        }))
      }
    } catch (error) {
      // 如果失败，恢复记录
      refreshData()
      console.error('Error deleting record:', error)
      alert('删除记录失败，请稍后重试')
    }
  }, [refreshData])

  // 查看详情
  const handleViewDetail = useCallback((record: AnalysisRecord) => {
    setSelectedRecord(record)
    setShowDetailDialog(true)
  }, [])

  // 查看完整结果
  const handleViewFullResult = useCallback((record: AnalysisRecord) => {
    // 使用 Next.js 路由导航到详情页面
    window.location.href = `/history/${record.id}`
  }, [])

  // 复制记录链接
  const handleCopyLink = useCallback(async (record: AnalysisRecord) => {
    try {
      const fullUrl = `${window.location.origin}/history/${record.id}`
      
      await navigator.clipboard.writeText(fullUrl)
      
      // 简单的提示，可以考虑使用 toast 组件
      const button = document.querySelector(`[data-record-id="${record.id}"]`) as HTMLElement
      if (button) {
        const originalText = button.textContent
        button.textContent = '已复制!'
        button.style.color = '#10b981'
        setTimeout(() => {
          button.textContent = originalText
          button.style.color = ''
        }, 2000)
      }
    } catch (error) {
      console.error('复制链接失败:', error)
      // 降级方案：手动选择文本
      const fullUrl = `${window.location.origin}/history/${record.id}`
      prompt('请手动复制以下链接:', fullUrl)
    }
  }, [])

  // 日期格式化（使用memoization）
  const formatDate = useMemo(() => 
    (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }, []
  )

  // 渲染统计卡片
  const StatCard = ({ icon: Icon, label, value, loading = false }: {
    icon: any
    label: string
    value: string | number
    loading?: boolean
  }) => (
    <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <Icon className="h-5 w-5 text-amber-600 mr-2" />
          <span className="text-sm font-serif text-slate-600 dark:text-slate-400">{label}</span>
        </div>
        <div className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          ) : (
            value
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: `linear-gradient(45deg, 
        #fef7ed 0%, 
        #fef3e2 25%, 
        #fdf2f8 50%, 
        #fef7ed 75%, 
        #fef3e2 100%)`
    }}>
      {/* 背景装饰 - 简化版本 */}
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
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-4xl font-serif font-bold text-slate-800 dark:text-slate-200">
                历史记录
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={refreshing}
                className="font-serif"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="w-24 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-4"></div>
            <p className="text-lg font-serif text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
              查看您的分析历史，管理收藏记录，重温命理智慧
            </p>
          </section>

          {/* 统计信息 */}
          <section className="grid md:grid-cols-4 gap-4 mb-8">
            <StatCard 
              icon={History} 
              label="总记录" 
              value={stats.totalCount} 
              loading={loading && currentPage === 0}
            />
            <StatCard 
              icon={Sparkles} 
              label="消耗点数" 
              value={stats.totalPoints} 
              loading={loading && currentPage === 0}
            />
            <StatCard 
              icon={Star} 
              label="收藏记录" 
              value={stats.favoriteCount} 
              loading={loading && currentPage === 0}
            />
            <StatCard 
              icon={TrendingUp} 
              label="最常用" 
              value={stats.mostUsedType ? ANALYSIS_TYPES[stats.mostUsedType as keyof typeof ANALYSIS_TYPES]?.name || '暂无' : '暂无'}
              loading={loading && currentPage === 0}
            />
          </section>

          {/* 筛选和搜索 */}
          <section className="mb-8">
            <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 搜索框 - 带防抖 */}
                  <div>
                    <Label htmlFor="search" className="text-sm font-serif mb-2">搜索记录</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="search"
                        placeholder="输入关键词搜索..."
                        value={filters.searchQuery}
                        onChange={(e) => setFilters({ searchQuery: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* 类型筛选 */}
                  <div>
                    <Label className="text-sm font-serif mb-2">分析类型</Label>
                    <Select 
                      value={filters.analysisType} 
                      onValueChange={(value) => setFilters({ analysisType: value })}
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
                        setFilters({ sortBy, sortOrder })
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
                      onClick={() => setFilters({ isFavorite: !filters.isFavorite })}
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
            {loading && currentPage === 0 ? (
              // 优化的骨架屏
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="animate-pulse bg-white/90 dark:bg-slate-900/90">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-3/4"></div>
                      <div className="flex space-x-2">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : records.length === 0 ? (
              // 空状态
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
                          {(() => {
                            const IconComponent = config.icon;
                            return <IconComponent className="h-4 w-4 mr-2" />;
                          })()}
                          {config.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* 记录网格 */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {records.map((record) => {
                    const typeConfig = ANALYSIS_TYPES[record.analysis_type]
                    return (
                      <Card 
                        key={record.id} 
                        className="bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200 group"
                      >
                        <CardContent className="p-6">
                          {/* 记录头部 */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className={`w-10 h-10 ${typeConfig.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                {(() => {
                                  const IconComponent = typeConfig.icon;
                                  return <IconComponent className="h-5 w-5 text-white" />;
                                })()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <Badge variant="secondary" className="text-xs font-serif mb-1">
                                  {typeConfig.name}
                                </Badge>
                                <h4 className="font-serif font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">
                                  {record.title}
                                </h4>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
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
                                onClick={() => handleToggleFavorite(record)}
                                className="text-amber-600 hover:text-amber-700 h-8 w-8 p-0"
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
                              onClick={() => handleViewFullResult(record)}
                              className="flex-1 font-serif"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              查看详情
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyLink(record)}
                              className="font-serif"
                              data-record-id={record.id}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              复制链接
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRecord(record)}
                              className="text-red-500 hover:text-red-600 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* 加载更多 */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <Button 
                      variant="outline" 
                      className="font-serif"
                      onClick={loadMore}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          加载中...
                        </>
                      ) : (
                        '加载更多记录'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        </main>

        {/* 详情对话框 - 延迟加载 */}
        {showDetailDialog && selectedRecord && (
          <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif">
                  {selectedRecord.title}
                </DialogTitle>
              </DialogHeader>
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
                  <Button 
                    className="font-serif"
                    onClick={() => handleViewFullResult(selectedRecord)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    查看完整结果
                  </Button>
                  <Button 
                    variant="outline" 
                    className="font-serif"
                    onClick={() => handleCopyLink(selectedRecord)}
                    data-record-id={selectedRecord.id}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    复制链接
                  </Button>
                  <Button variant="outline" className="font-serif">
                    <Share2 className="h-4 w-4 mr-2" />
                    分享结果
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

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