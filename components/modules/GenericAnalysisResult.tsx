'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface GenericAnalysisResultProps {
  title: string
  analysisType: string
  aiAnalysis?: string
  result?: string
  cost: number
  additionalData?: any
}

export function GenericAnalysisResult({ 
  title, 
  analysisType, 
  aiAnalysis, 
  result, 
  cost, 
  additionalData 
}: GenericAnalysisResultProps) {
  
  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'bugua':
        return '🔮'
      case 'calendar':
        return '📅'
      case 'name':
        return '📝'
      case 'dream':
        return '🌙'
      default:
        return '✨'
    }
  }

  const getAnalysisTitle = (type: string) => {
    switch (type) {
      case 'bugua':
        return '卜卦分析结果'
      case 'calendar':
        return '运势分析结果'
      case 'name':
        return '姓名分析结果'
      case 'dream':
        return '解梦分析结果'
      default:
        return '分析结果'
    }
  }

  // 渲染梦境解析的Markdown内容 - 与梦境解析页面完全一致
  function renderDreamContent(content: any) {
    if (!content) {
      return <div className="text-slate-500 dark:text-slate-400 text-sm">暂无解析内容</div>
    }
    
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    
    return (
      <div className="max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // 段落 - 统一格式
            p: ({children}) => (
              <p className="mb-6 text-base leading-7 text-slate-700 dark:text-slate-300 font-serif" 
                 style={{ textAlign: 'justify', lineHeight: '1.8' }}>
                {children}
              </p>
            ),
            // 标题系列 - 清晰层次
            h1: ({children}) => (
              <div className="mb-6 mt-8 first:mt-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-600 dark:bg-red-700 transform rotate-45 rounded-md opacity-10"></div>
                  <h1 className="relative text-2xl font-bold text-red-700 dark:text-red-400 px-4 py-3 font-serif tracking-wide">
                    {children}
                  </h1>
                </div>
              </div>
            ),
            h2: ({children}) => (
              <div className="mb-5 mt-7">
                <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 border-l-4 border-amber-400 pl-4 py-2 bg-amber-50 dark:bg-amber-900/20 font-serif">
                  {children}
                </h2>
              </div>
            ),
            h3: ({children}) => (
              <div className="mb-4 mt-6">
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400 border-l-3 border-amber-300 pl-3 py-1 font-serif">
                  {children}
                </h3>
              </div>
            ),
            // 强调和格式
            strong: ({children}) => (
              <strong className="text-orange-700 dark:text-orange-300 font-semibold px-1">
                {children}
              </strong>
            ),
            em: ({children}) => (
              <em className="text-amber-700 dark:text-amber-300 italic">
                {children}
              </em>
            ),
            // 引用块 - 重要信息突出
            blockquote: ({children}) => (
              <div className="my-6">
                <blockquote className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/15 dark:via-amber-900/15 dark:to-yellow-900/15 border-l-4 border-orange-400 p-5 rounded-r-lg shadow-sm">
                  <div className="text-orange-800 dark:text-orange-200 font-medium leading-relaxed">
                    {children}
                  </div>
                </blockquote>
              </div>
            ),
            // 有序列表 - 清晰编号
            ol: ({children}) => (
              <div className="my-6">
                <ol className="space-y-3 counter-reset-none">
                  {children}
                </ol>
              </div>
            ),
            // 无序列表
            ul: ({children}) => (
              <div className="my-6">
                <ul className="space-y-3">
                  {children}
                </ul>
              </div>
            ),
            // 列表项 - 统一格式
            li: ({children, ...props}) => {
              const isOrdered = (props as any).ordered;
              return (
                <li className={`${isOrdered ? 'list-decimal' : 'list-disc'} list-inside text-slate-700 dark:text-slate-300 leading-relaxed pl-2`}>
                  <span className="ml-2 font-serif">{children}</span>
                </li>
              )
            },
            // 代码
            code: ({children, ...props}) => {
              const inline = (props as any).inline;
              if (inline) {
                return (
                  <code className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                )
              }
              return (
                <code className="block bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {children}
                </code>
              )
            },
            pre: ({children}) => (
              <div className="my-6">
                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto border border-slate-200 dark:border-slate-700">
                  {children}
                </pre>
              </div>
            ),
            // 分隔线
            hr: () => (
              <div className="my-8">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-px bg-amber-300 dark:bg-amber-600"></div>
                  <div className="mx-4 w-2 h-2 bg-amber-400 dark:bg-amber-500 rounded-full"></div>
                  <div className="w-16 h-px bg-amber-300 dark:bg-amber-600"></div>
                </div>
              </div>
            )
          }}
        >
          {contentStr}
        </ReactMarkdown>
      </div>
    )
  }

  // 渲染传统风格的分析内容
  function renderTraditionalContent(content: any) {
    // 确保content是字符串类型
    if (!content) {
      return <div className="text-slate-500 dark:text-slate-400 text-sm">暂无分析内容</div>
    }
    
    // 将content转换为字符串
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    
    // 解析【】标记的内容
    const sections = contentStr.split(/【([^】]+)】/).filter(item => item.trim())
    const sectionData: Array<{title: string, content: string}> = []
    
    for (let i = 0; i < sections.length; i += 2) {
      if (i + 1 < sections.length) {
        const title = sections[i]
        const content = sections[i + 1]
        sectionData.push({ title, content })
      }
    }

    if (sectionData.length === 0) {
      // 如果没有找到【】标记，就作为普通文本处理
      return (
        <div className="prose prose-sm max-w-none">
          {contentStr.split('\n').map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index} className="text-sm leading-relaxed mb-4 text-slate-700 dark:text-slate-300 font-serif">
                {paragraph.trim()}
              </p>
            )
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {sectionData.map((section, index) => (
          <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
            <div className="mb-4">
              <h4 className="text-base font-serif font-semibold text-slate-800 dark:text-slate-200 mb-2">
                {section.title}
              </h4>
              <div className="w-12 h-px bg-slate-400 dark:bg-slate-500"></div>
            </div>
            <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3 font-serif">
              {section.content.split('\n').map((paragraph, pIndex) => (
                paragraph.trim() && (
                  <p key={pIndex} className="text-sm leading-relaxed">
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 获取五行颜色配置
  const getWuxingColor = (wuxing: string) => {
    const colors = {
      '木': 'bg-green-100 text-green-800',
      '火': 'bg-red-100 text-red-800',
      '土': 'bg-yellow-100 text-yellow-800',
      '金': 'bg-gray-100 text-gray-800',
      '水': 'bg-blue-100 text-blue-800'
    }
    return colors[wuxing as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  // 获取评分颜色
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  // 获取吉凶颜色
  const getFortuneColor = (fortune: string) => {
    if (fortune === '大吉') return 'text-green-600 bg-green-50'
    if (fortune === '吉') return 'text-blue-600 bg-blue-50'
    if (fortune === '半吉') return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  // 渲染姓名分析结果 - 与主页面保持完全一致的宋代美学风格
  function renderNameAnalysisResult(result: any) {
    if (!result) return null

    return (
      <>
        {/* 姓名展示与核心信息 - 宋代美学风格 */}
        <Card className="mb-6 shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
          <CardHeader className="text-center pb-3">
            <div className="text-sm font-serif text-slate-600 dark:text-slate-400 mb-1">
              {result.analysis_type === 'current' ? '现有姓名分析' : '起名建议分析'}
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-3">
              {result.name_to_analyze || result.name || title}
            </CardTitle>
            <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-4"></div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* 左侧：姓名结构分析 */}
              <div className="space-y-4">
                {/* 姓名拆解 */}
                <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-center mb-4">
                    <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300">姓名结构</h4>
                    <div className="w-12 h-px bg-slate-300 dark:bg-slate-600 mx-auto mt-2"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* 姓氏 */}
                    <div className="text-center">
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {result.basic_info?.surname || result.name_to_analyze?.charAt(0) || title?.charAt(0)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          姓氏 · {result.basic_info?.surname_strokes || '0'}画
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge className={getWuxingColor(result.wuxing_analysis?.surname_wuxing || '金')} variant="outline">
                          {result.wuxing_analysis?.surname_wuxing || '金'}
                        </Badge>
                      </div>
                    </div>
                    {/* 名字 */}
                    <div className="text-center">
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {result.basic_info?.given_name || result.name_to_analyze?.slice(1) || title?.slice(1)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          名字 · {result.basic_info?.given_strokes || '0'}画
                        </div>
                      </div>
                      <div className="mt-2 flex justify-center space-x-1">
                        {result.wuxing_analysis?.given_wuxing?.map((wuxing: string, index: number) => (
                          <Badge key={index} className={getWuxingColor(wuxing)} variant="outline">
                            {wuxing}
                          </Badge>
                        )) || (
                          <Badge className={getWuxingColor('木')} variant="outline">木</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* 总笔画 */}
                  <div className="mt-4 text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-base font-serif text-slate-600 dark:text-slate-400">
                      总笔画：<span className="font-bold text-slate-700 dark:text-slate-300">{result.basic_info?.total_strokes || '0'}</span>画
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      整体五行：<Badge className={getWuxingColor(result.wuxing_analysis?.overall_wuxing || '土')} variant="outline">
                        {result.wuxing_analysis?.overall_wuxing || '土'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧：综合评分与核心指标 */}
              <div className="space-y-4">
                {/* 综合评分 */}
                <div className="text-center bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-5xl font-serif font-bold mb-3">
                    <span className={`${getScoreColor(result.scores?.overall_score || 75)} drop-shadow-sm`}>
                      {result.scores?.overall_score || 75}
                    </span>
                    <span className="text-2xl font-serif text-slate-500 dark:text-slate-400">分</span>
                  </div>
                  <Badge variant="secondary" className="bg-slate-700 dark:bg-slate-600 text-white font-serif px-3 py-1">
                    综合评价
                  </Badge>
                  <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    五行配合：{result.wuxing_analysis?.wuxing_compatibility || '和谐'}
                  </div>
                </div>

                {/* 各项评分 */}
                <div className="space-y-3">
                  {result.scores && Object.entries(result.scores).filter(([key]) => key !== 'overall_score').map(([key, score]) => {
                    const labels = {
                      wuxing_score: '五行评分',
                      numerology_score: '数理评分',
                      phonetic_score: '音韵评分',
                      meaning_score: '寓意评分'
                    }
                    const icons = {
                      wuxing_score: '⚊',
                      numerology_score: '算',
                      phonetic_score: '音',
                      meaning_score: '意'
                    }
                    
                    return (
                      <div key={key} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                              <span className="text-xs font-serif font-bold text-slate-600 dark:text-slate-400">
                                {icons[key as keyof typeof icons]}
                              </span>
                            </div>
                            <span className="text-xs font-serif font-semibold text-slate-700 dark:text-slate-300">
                              {labels[key as keyof typeof labels]}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={`text-base font-serif font-bold ${getScoreColor(score as number)}`}>
                              {String(score)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 五行分析 - 宋代美学风格 */}
        {result.wuxing_analysis && (
          <Card className="mb-6 border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                五行配置分析
              </CardTitle>
              <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                {/* 左侧：五行分布 */}
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">五行分布</h4>
                    <div className="space-y-4">
                      {result.wuxing_analysis.wuxing_balance && Object.entries(result.wuxing_analysis.wuxing_balance).map(([element, count]) => {
                        const elementNames = {
                          wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
                        }
                        const elementColors = {
                          wood: 'bg-green-500',
                          fire: 'bg-red-500',
                          earth: 'bg-yellow-500',
                          metal: 'bg-gray-500',
                          water: 'bg-blue-500'
                        }
                        return (
                          <div key={element} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-6 h-6 rounded-full ${elementColors[element as keyof typeof elementColors]} border border-slate-300 dark:border-slate-600`}></div>
                              <span className="text-sm font-serif text-slate-700 dark:text-slate-300">
                                {elementNames[element as keyof typeof elementNames]}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${elementColors[element as keyof typeof elementColors]}`}
                                  style={{width: `${Math.min((count as number) * 20, 100)}%`}}
                                ></div>
                              </div>
                              <span className="text-sm font-serif font-bold text-slate-600 dark:text-slate-400 w-6">
                                {String(count)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">五行配合</h4>
                    <div className="text-center">
                      <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif px-4 py-2">
                        {result.wuxing_analysis.wuxing_compatibility}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 右侧：五行属性展示 */}
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">五行属性</h4>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">姓氏五行</div>
                        <Badge className={`${getWuxingColor(result.wuxing_analysis.surname_wuxing)} text-lg px-4 py-2`}>
                          {result.wuxing_analysis.surname_wuxing}
                        </Badge>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">名字五行</div>
                        <div className="flex justify-center space-x-2">
                          {result.wuxing_analysis.given_wuxing?.map((wuxing: string, index: number) => (
                            <Badge key={index} className={`${getWuxingColor(wuxing)} px-3 py-1`}>
                              {wuxing}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">整体五行</div>
                        <Badge className={`${getWuxingColor(result.wuxing_analysis.overall_wuxing)} text-lg px-4 py-2`}>
                          {result.wuxing_analysis.overall_wuxing}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 数理分析 - 宋代美学风格 */}
        {result.numerology && (
          <Card className="mb-6 border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                数理格局分析
              </CardTitle>
              <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-center mb-6">
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-serif">五格数理</div>
                </div>
                <div className="grid md:grid-cols-5 gap-6">
                  {Object.entries(result.numerology).filter(([key]) => !key.includes('_fortune')).map(([key, value]) => {
                    const labels = {
                      tiange: '天格',
                      dige: '地格',
                      renge: '人格',
                      waige: '外格',
                      zongge: '总格'
                    }
                    const descriptions = {
                      tiange: '祖运',
                      dige: '前运',
                      renge: '主运',
                      waige: '副运',
                      zongge: '后运'
                    }
                    const fortuneKey = `${key}_fortune` as keyof typeof result.numerology
                    const fortune = result.numerology[fortuneKey] as string
                    const isMainGe = key === 'renge' // 人格是主格
                    
                    return (
                      <div key={key} className="text-center relative">
                        <div className={`bg-white dark:bg-slate-900 p-4 rounded-lg border transition-all duration-200 ${
                          isMainGe 
                            ? 'border-2 border-slate-400 dark:border-slate-500 shadow-md' 
                            : 'border border-slate-200 dark:border-slate-700'
                        }`}>
                          {isMainGe && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                              <Badge variant="secondary" className="bg-slate-700 text-white border-0 text-xs px-2 py-0.5">
                                主格
                              </Badge>
                            </div>
                          )}
                          <div className="space-y-2">
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-serif">
                              {labels[key as keyof typeof labels]}
                            </div>
                            <div className="text-3xl font-serif font-bold text-slate-700 dark:text-slate-300">
                              {String(value)}
                            </div>
                            <div className="w-8 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
                            <Badge className={`${getFortuneColor(fortune)} text-xs px-2 py-1`}>
                              {fortune}
                            </Badge>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {descriptions[key as keyof typeof descriptions]}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 音韵分析 - 宋代美学风格 */}
        {result.phonetics && (
          <Card className="mb-6 border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                音韵特点分析
              </CardTitle>
              <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">声调组合</h4>
                    <div className="flex justify-center space-x-3">
                      {result.phonetics.tones?.map((tone: number, index: number) => (
                        <div key={index} className="text-center">
                          <div className="w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center">
                            <span className="text-lg font-serif font-bold text-slate-700 dark:text-slate-300">
                              {tone}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            {tone}调
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">音调和谐度</h4>
                    <div className="text-center">
                      <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif px-4 py-2">
                        {result.phonetics.tone_harmony}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">发音难易度</h4>
                    <div className="text-center">
                      <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif px-4 py-2">
                        {result.phonetics.pronunciation_difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">韵律美感</h4>
                    <div className="text-center">
                      <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif px-4 py-2">
                        {result.phonetics.rhyme_quality}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 寓意分析与改进建议 - 宋代美学风格 */}
        {(result.meanings || result.suggestions) && (
          <Card className="mb-6 border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                寓意分析与改进建议
              </CardTitle>
              <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* 左侧：优势特点 */}
                <div className="space-y-4">
                  {result.meanings?.positive_meanings && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">积极寓意</h4>
                      <ul className="space-y-2">
                        {result.meanings.positive_meanings.map((meaning: string, index: number) => (
                          <li key={index} className="flex items-start text-sm">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{meaning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.suggestions?.strengths && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">姓名优势</h4>
                      <ul className="space-y-2">
                        {result.suggestions.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start text-sm">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 右侧：改进建议 */}
                <div className="space-y-4">
                  {result.meanings?.potential_issues && result.meanings.potential_issues.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">注意事项</h4>
                      <ul className="space-y-2">
                        {result.meanings.potential_issues.map((issue: string, index: number) => (
                          <li key={index} className="flex items-start text-sm">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.suggestions?.weaknesses && result.suggestions.weaknesses.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">待改进方面</h4>
                      <ul className="space-y-2">
                        {result.suggestions.weaknesses.map((weakness: string, index: number) => (
                          <li key={index} className="flex items-start text-sm">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.suggestions?.improvement_suggestions && result.suggestions.improvement_suggestions.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">改进建议</h4>
                      <ul className="space-y-2">
                        {result.suggestions.improvement_suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start text-sm">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 人生指导 - 宋代美学风格 */}
        {result.suggestions && (result.suggestions.lucky_directions || result.suggestions.suitable_careers) && (
          <Card className="mb-6 border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                人生指导
              </CardTitle>
              <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {result.suggestions.lucky_directions && (
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">有利方位</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {result.suggestions.lucky_directions.map((direction: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif">
                          {direction}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {result.suggestions.suitable_careers && (
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">适合职业</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {result.suggestions.suitable_careers.map((career: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-serif">
                          {career}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 文化内涵 - 宋代美学风格 */}
        {result.meanings?.cultural_connotations && (
          <Card className="mb-6 border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-2">
                文化内涵
              </CardTitle>
              <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <ul className="space-y-3">
                  {result.meanings.cultural_connotations.map((connotation: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{connotation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* 分析标题 */}
      <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-4">
            <span className="text-4xl mr-3">{getAnalysisIcon(analysisType)}</span>
            {getAnalysisTitle(analysisType)}
          </CardTitle>
          <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-serif">
            {title}
          </p>
        </CardHeader>
      </Card>

      {/* 特殊数据显示（如卜卦的卦象等） */}
      {additionalData && (
        <>
          {/* 卜卦卦象显示 */}
          {analysisType === 'bugua' && additionalData.hexagram_primary && (
            <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90">
              <CardHeader>
                <CardTitle className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 text-center">
                  卦象解析
                </CardTitle>
                <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-lg font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3">本卦</h4>
                    <div className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-2">
                      {additionalData.hexagram_primary}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-serif">现在的情况</p>
                  </div>
                  {additionalData.hexagram_changed && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="text-lg font-serif font-semibold text-slate-700 dark:text-slate-300 mb-3">变卦</h4>
                      <div className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-2">
                        {additionalData.hexagram_changed}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-serif">发展趋势</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 姓名分析的完整展示 */}
          {analysisType === 'name' && additionalData && (
            <div className="space-y-6">
              {renderNameAnalysisResult(additionalData)}
            </div>
          )}
        </>
      )}

      {/* AI分析结果 - 梦境解析时使用相同的样式 */}
      {(aiAnalysis || result) && (
        <Card className={analysisType === 'dream' ? 
          "mb-8 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border-2 border-amber-300 dark:border-amber-600 shadow-2xl" : 
          "shadow-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90"
        }>
          <CardHeader className={analysisType === 'dream' ? "text-center relative" : ""}>
            {analysisType === 'dream' ? (
              <>
                {/* 古典装饰 */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-8 opacity-20">
                  <svg viewBox="0 0 64 32" className="w-full h-full text-amber-400">
                    <path d="M8,16 Q16,8 24,16 Q32,8 40,16 Q48,8 56,16 Q48,24 40,16 Q32,24 24,16 Q16,24 8,16 Z" fill="currentColor"/>
                  </svg>
                </div>
                
                {/* 传统印章式标题 */}
                <div className="relative inline-block mb-6 mt-4">
                  <div className="absolute inset-0 bg-red-600 dark:bg-red-700 transform rotate-45 rounded-lg opacity-15"></div>
                  <CardTitle className="relative text-3xl font-serif font-bold text-red-700 dark:text-red-400 px-6 py-3 tracking-wider">
                    AI智慧解读
                  </CardTitle>
                </div>
                
                {/* 装饰线 */}
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-px bg-amber-400 dark:bg-amber-600"></div>
                  <Sparkles className="h-5 w-5 mx-3 text-amber-500" />
                  <div className="w-12 h-px bg-amber-400 dark:bg-amber-600"></div>
                </div>
                
                <p className="text-lg font-serif text-amber-700 dark:text-amber-300 italic">
                  深度解析·智慧启迪·人生指引
                </p>
              </>
            ) : (
              <>
                <CardTitle className="flex items-center justify-center space-x-3 text-xl font-serif font-bold text-slate-700 dark:text-slate-300">
                  <div className="w-8 h-8 bg-slate-700 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">智</span>
                  </div>
                  <div>AI智能分析</div>
                </CardTitle>
                <div className="text-center">
                  <div className="w-24 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
                </div>
              </>
            )}
          </CardHeader>
          
          <CardContent className={analysisType === 'dream' ? "px-8 pb-8" : ""}>
            {analysisType === 'dream' ? (
              <div className="bg-white/90 dark:bg-slate-900/90 rounded-lg p-6 border border-amber-200 dark:border-amber-700 shadow-lg">
                {(() => {
                  // 优先使用AI分析内容，如果是字符串直接显示
                  if (aiAnalysis && typeof aiAnalysis === 'string' && aiAnalysis.trim()) {
                    return renderDreamContent(aiAnalysis)
                  }
                  
                  // 强制显示从系统分析重构的内容
                  if (additionalData?.interpretation_result) {
                    const analysis = additionalData.interpretation_result
                    const dreamContent = `# 梦境深度解析

## 梦境概述
${analysis.dream_summary || '这是一个需要深入解读的梦境。'}

## 心理状态分析
您当前的情绪状态：${analysis.psychological_analysis?.emotional_state || '需要关注内心状态'}

${analysis.psychological_analysis?.subconscious_themes?.length > 0 ? `### 潜意识主题
${analysis.psychological_analysis.subconscious_themes.map((theme: any) => `- ${theme}`).join('\n')}

` : ''}${analysis.life_guidance?.current_situation_insights?.length > 0 ? `## 生活洞察
${analysis.life_guidance.current_situation_insights.map((insight: any) => `- ${insight}`).join('\n')}

` : ''}${analysis.life_guidance?.recommended_actions?.length > 0 ? `## 建议行动
${analysis.life_guidance.recommended_actions.map((action: any) => `- ${action}`).join('\n')}

` : ''}${analysis.warnings_and_suggestions?.health_reminders?.length > 0 ? `## 健康提醒
${analysis.warnings_and_suggestions.health_reminders.map((reminder: any) => `- ${reminder}`).join('\n')}

` : ''}---
*基于系统分析重构的解读内容*`
                    
                    return renderDreamContent(dreamContent)
                  } else {
                    return (
                      <div className="text-center py-8">
                        <div className="mb-4">
                          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📖</span>
                          </div>
                          <h4 className="text-lg font-serif font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            暂无解析数据
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-serif">
                            请重新进行梦境解析
                          </p>
                        </div>
                      </div>
                    )
                  }
                })()}
                
                {/* 底部装饰 */}
                <div className="mt-8 pt-6 border-t border-amber-200 dark:border-amber-700">
                  <div className="flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <div className="w-8 h-px bg-amber-400 dark:bg-amber-600"></div>
                    <div className="mx-3 text-sm font-serif">✦ 智慧解读完毕 ✦</div>
                    <div className="w-8 h-px bg-amber-400 dark:bg-amber-600"></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {aiAnalysis ? renderTraditionalContent(aiAnalysis) : result ? renderTraditionalContent(result) : (
                  <p className="text-center text-slate-500 dark:text-slate-400 font-serif">暂无分析内容</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* 消费信息 */}
      <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3 text-slate-700 dark:text-slate-300">
            <div className="w-6 h-6 bg-slate-700 dark:bg-slate-600 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs">点</span>
            </div>
            <span className="text-sm font-medium font-serif">本次分析消费了</span>
            <Badge variant="secondary" className="bg-slate-700 dark:bg-slate-600 text-white border-0 font-medium px-3 py-1 font-serif">
              {cost} 天机点
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}