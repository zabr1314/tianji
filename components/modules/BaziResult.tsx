'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface BaziChart {
  year_ganzhi: string
  month_ganzhi: string
  day_ganzhi: string
  hour_ganzhi: string
}

interface WuXingAnalysis {
  wood: number
  fire: number
  earth: number
  metal: number
  water: number
  strongest: string
  weakest: string
  percentages?: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
}

interface AIAnalysis {
  core_traits?: string
  talents?: string
  career?: string
  relationship?: string
  health?: string
  wealth?: string
  suggestions?: string
}

// Enhanced AI Analysis format for new 12-dimension analysis
interface EnhancedAIAnalysis {
  命格总论?: string
  性格特质?: string
  天赋才华?: string
  事业发展?: string
  财运分析?: string
  感情婚姻?: string
  健康养生?: string
  人际关系?: string
  大运流年?: string
  子女缘分?: string
  开运指南?: string
  人生建议?: string
}

interface BaziResultProps {
  bazi?: BaziChart
  baziChart?: BaziChart
  wuxingAnalysis: WuXingAnalysis
  aiAnalysis: AIAnalysis | EnhancedAIAnalysis | string
  yongshen: string
  name?: string
  dayun?: unknown[]
  cost?: number
}

export function BaziResult({ 
  bazi,
  baziChart, 
  wuxingAnalysis, 
  aiAnalysis, 
  yongshen,
  name,
  // dayun - not used in current implementation
  cost
}: BaziResultProps) {
  // Use either bazi or baziChart prop for backward compatibility
  const chart = bazi || baziChart
  const wuxingColors = {
    wood: 'bg-green-500',
    fire: 'bg-red-500', 
    earth: 'bg-yellow-500',
    metal: 'bg-gray-500',
    water: 'bg-blue-500'
  }

  const wuxingNames = {
    wood: '木',
    fire: '火',
    earth: '土', 
    metal: '金',
    water: '水'
  }

  // 渲染环形图
  function renderCircularChart(percentages: Record<string, number>, radius = 80, center = 96, strokeWidth = 16) {
    const elements = Object.entries(percentages)
    let cumulativePercentage = 0
    const circumference = 2 * Math.PI * radius
    
    return elements.map(([element, percentage], index) => {
      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
      const strokeDashoffset = -cumulativePercentage / 100 * circumference
      const color = wuxingColors[element as keyof typeof wuxingColors]
      
      cumulativePercentage += percentage
      
      return (
        <circle
          key={element}
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={getColorValue(color)}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      )
    })
  }
  
  // 获取颜色值
  function getColorValue(colorClass: string): string {
    const colorMap: Record<string, string> = {
      'bg-green-500': '#22c55e',
      'bg-red-500': '#ef4444',
      'bg-yellow-500': '#eab308',
      'bg-gray-500': '#6b7280',
      'bg-blue-500': '#3b82f6'
    }
    return colorMap[colorClass] || '#6b7280'
  }
  
  // 计算平衡指数
  function calculateBalanceScore(wuxingAnalysis: WuXingAnalysis): number {
    const values = Object.values(wuxingAnalysis).slice(0, 5) as number[]
    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length
    const maxVariance = Math.pow(8, 2) // 最大可能方差（全部集中在一个元素）
    const balanceScore = Math.max(0, 100 - (variance / maxVariance * 100))
    return Math.round(balanceScore)
  }

  // 渲染宋代美学八字柱
  function renderTraditionalBaziPillar(title: string, ganzhi: string, palace: string, color: string, isDayPillar = false) {
    const [tiangan, dizhi] = ganzhi.split('')
    return (
      <div className="text-center relative">
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</div>
          <div className={`relative p-4 rounded-lg transition-all duration-200 ${
            isDayPillar 
              ? 'bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 shadow-sm' 
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
          }`}>
            {isDayPillar && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <Badge variant="secondary" className="bg-slate-700 text-white border-0 text-xs px-2 py-0.5">
                  日主
                </Badge>
              </div>
            )}
            <div className="space-y-2">
              <div className="text-2xl font-serif font-semibold text-slate-700 dark:text-slate-300">
                {tiangan}
              </div>
              <div className="w-6 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
              <div className="text-2xl font-serif font-semibold text-slate-700 dark:text-slate-300">
                {dizhi}
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{palace}</div>
        </div>
      </div>
    )
  }

  // 渲染干支元素（宋代美学）
  function renderGanzhiElement(char: string, type: 'tiangan' | 'dizhi', isDayMaster = false) {
    const wuxing = getCharWuxing(char)
    
    // 宋代美学配色：朴素雅致
    const wuxingTraditionalColors = {
      wood: 'bg-emerald-600 dark:bg-emerald-700',
      fire: 'bg-red-700 dark:bg-red-800', 
      earth: 'bg-amber-700 dark:bg-amber-800',
      metal: 'bg-slate-600 dark:bg-slate-700',
      water: 'bg-slate-800 dark:bg-slate-900'
    }
    
    const color = wuxingTraditionalColors[wuxing as keyof typeof wuxingTraditionalColors]
    
    return (
      <div className="text-center">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center text-white font-serif font-semibold text-sm shadow-sm border border-slate-300 dark:border-slate-600 ${isDayMaster ? 'ring-1 ring-slate-400' : ''}`}>
          {char}
        </div>
        {isDayMaster && (
          <div className="w-1 h-1 bg-slate-400 rounded-full mx-auto mt-1" />
        )}
        <div className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400 font-medium">
          {wuxingNames[wuxing as keyof typeof wuxingNames]}
        </div>
      </div>
    )
  }

  // 获取字符对应的五行
  function getCharWuxing(char: string): string {
    const charWuxingMap: Record<string, string> = {
      // 天干
      '甲': 'wood', '乙': 'wood',
      '丙': 'fire', '丁': 'fire',
      '戊': 'earth', '己': 'earth',
      '庚': 'metal', '辛': 'metal',
      '壬': 'water', '癸': 'water',
      // 地支
      '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
      '辰': 'earth', '巳': 'fire', '午': 'fire', '未': 'earth',
      '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water'
    }
    return charWuxingMap[char] || 'earth'
  }

  // 渲染AI分析部分
  function renderAISection(icon: string, title: string, content: string, gradientClass: string) {
    return (
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradientClass}`}></div>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${gradientClass} flex items-center justify-center text-white text-lg font-bold shadow-md`}>
            {icon}
          </div>
          <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h4>
        </div>
        <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 space-y-2">
          {content.split('\n').map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index} className="text-sm leading-relaxed">
                {paragraph.trim()}
              </p>
            )
          ))}
        </div>
      </div>
    )
  }

  // 渲染传统风格的AI内容（用于字符串类型的AI分析）
  function renderTraditionalAIContent(content: string) {
    // 解析【】标记的内容
    const sections = content.split(/【([^】]+)】/).filter(item => item.trim())
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
          {content.split('\n').map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index} className="text-sm leading-relaxed mb-4 text-slate-700 dark:text-slate-300">
                {paragraph.trim()}
              </p>
            )
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {sectionData.map((section, index) => renderTraditionalAIBlock(section.title, section.content))}
      </div>
    )
  }

  // 渲染传统风格的AI分析块
  function renderTraditionalAIBlock(title: string, content: string) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
        <div className="mb-4">
          <h4 className="text-base font-serif font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {title}
          </h4>
          <div className="w-12 h-px bg-slate-400 dark:bg-slate-500"></div>
        </div>
        <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
          {content.split('\n').map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index} className="text-sm leading-relaxed">
                {paragraph.trim()}
              </p>
            )
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 八字命盘 & 五行分析（合并大卡片） */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {name ? `${name} 的八字分析` : '八字命盘分析'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 左侧：八字命盘 */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-serif font-bold mb-4 text-slate-700 dark:text-slate-300">
                  八字四柱
                </h3>
                <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-4"></div>
              </div>
              
              {chart ? (
                <>
                  {/* 宋代美学四柱显示 */}
                  <div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-center mb-6">
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">命主四柱</div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {renderTraditionalBaziPillar('年柱', chart.year_ganzhi, '祖辈宫', '', false)}
                      {renderTraditionalBaziPillar('月柱', chart.month_ganzhi, '父母宫', '', false)}
                      {renderTraditionalBaziPillar('日柱', chart.day_ganzhi, '自身宫', '', true)}
                      {renderTraditionalBaziPillar('时柱', chart.hour_ganzhi, '子女宫', '', false)}
                    </div>
                  </div>
                  
                  {/* 天干地支分解 */}
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
                    <div className="text-center mb-5">
                      <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300">干支分析</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">天干</div>
                        <div className="flex justify-center space-x-3">
                          {renderGanzhiElement(chart.year_ganzhi[0], 'tiangan')}
                          {renderGanzhiElement(chart.month_ganzhi[0], 'tiangan')}
                          {renderGanzhiElement(chart.day_ganzhi[0], 'tiangan', true)}
                          {renderGanzhiElement(chart.hour_ganzhi[0], 'tiangan')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">地支</div>
                        <div className="flex justify-center space-x-3">
                          {renderGanzhiElement(chart.year_ganzhi[1], 'dizhi')}
                          {renderGanzhiElement(chart.month_ganzhi[1], 'dizhi')}
                          {renderGanzhiElement(chart.day_ganzhi[1], 'dizhi', true)}
                          {renderGanzhiElement(chart.hour_ganzhi[1], 'dizhi')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 命格分析 */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">命格要素</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">日主</div>
                        <div className="text-2xl font-serif font-bold text-slate-700 dark:text-slate-300">
                          {chart.day_ganzhi[0]}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {wuxingNames[getCharWuxing(chart.day_ganzhi[0]) as keyof typeof wuxingNames]}命
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">用神</div>
                        <div className="text-2xl font-serif font-bold text-slate-700 dark:text-slate-300">
                          {yongshen}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">喜用神</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground">八字数据不完整</p>
              )}
            </div>

            {/* 右侧：五行分析 */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-serif font-bold mb-4 text-slate-700 dark:text-slate-300">
                  五行分析
                </h3>
                <div className="w-16 h-px bg-slate-300 dark:bg-slate-600 mx-auto mb-4"></div>
              </div>
              
              {/* 五行环形图 - 宋代美学 */}
              <div className="flex justify-center">
                <div className="relative w-36 h-36 bg-slate-50/50 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700 p-4">
                  <div className="relative w-28 h-28">
                    <svg width="112" height="112" className="transform -rotate-90">
                      <circle
                        cx="56" cy="56" r="48"
                        fill="none" stroke="#cbd5e1" strokeWidth="8"
                      />
                      {wuxingAnalysis.percentages && renderCircularChart(wuxingAnalysis.percentages, 48, 56, 8)}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-serif font-bold text-slate-700 dark:text-slate-300">
                          {wuxingAnalysis.percentages ? Math.max(...Object.values(wuxingAnalysis.percentages)).toFixed(0) : '0'}%
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">最旺</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 五行能量条显示 - 宋代美学 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">五行分布</h4>
                <div className="space-y-4">
                  {wuxingAnalysis.percentages && Object.entries(wuxingAnalysis.percentages).map(([element, percentage]) => {
                    const isStrongest = element === wuxingAnalysis.strongest
                    const isWeakest = element === wuxingAnalysis.weakest
                    const count = (wuxingAnalysis as any)[element]
                    
                    // 宋代美学配色 - 朴素雅致
                    const traditionalColors = {
                      wood: 'bg-emerald-600',
                      fire: 'bg-red-700',
                      earth: 'bg-amber-700',
                      metal: 'bg-slate-600',
                      water: 'bg-slate-800'
                    }
                    
                    const colorClass = traditionalColors[element as keyof typeof traditionalColors]
                    
                    return (
                      <div key={element} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-sm ${colorClass}`} />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {wuxingNames[element as keyof typeof wuxingNames]}
                            </span>
                            {isStrongest && <Badge variant="secondary" className="bg-slate-700 text-white text-xs px-2 py-0.5">最旺</Badge>}
                            {isWeakest && <Badge variant="outline" className="border-slate-300 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5">最弱</Badge>}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {count}个 ({percentage.toFixed(1)}%)
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-sm h-1.5">
                            <div 
                              className={`h-1.5 rounded-sm transition-all duration-1000 ease-out ${colorClass}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  }) || <div className="text-center text-slate-500">五行分布数据不完整</div>}
                </div>
              </div>

              {/* 关键指标 - 宋代美学 */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">平衡指数</span>
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-serif font-bold text-slate-700 dark:text-slate-300">
                        {calculateBalanceScore(wuxingAnalysis)}
                      </div>
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-sm h-1.5">
                        <div 
                          className="bg-slate-600 dark:bg-slate-400 h-1.5 rounded-sm transition-all duration-1000"
                          style={{ width: `${calculateBalanceScore(wuxingAnalysis)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">喜用神</span>
                    <Badge variant="secondary" className="bg-slate-700 dark:bg-slate-600 text-white border-0 text-sm font-medium px-3 py-1">
                      {yongshen}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI分析结果 - 宋代美学风格 */}
      {aiAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-3 text-xl font-serif font-bold text-slate-700 dark:text-slate-300">
              <div className="w-8 h-8 bg-slate-700 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">智</span>
              </div>
              <div>AI智能分析</div>
            </CardTitle>
            <div className="text-center">
              <div className="w-24 h-px bg-slate-300 dark:bg-slate-600 mx-auto"></div>
            </div>
          </CardHeader>
          <CardContent>
            {typeof aiAnalysis === 'string' ? (
              <div className="space-y-6">
                {renderTraditionalAIContent(aiAnalysis)}
              </div>
            ) : (
              <div className="space-y-6">
                {(aiAnalysis as AIAnalysis).core_traits && renderTraditionalAIBlock('人格特质', (aiAnalysis as AIAnalysis).core_traits!)}
                {(aiAnalysis as AIAnalysis).talents && renderTraditionalAIBlock('天赋潜能', (aiAnalysis as AIAnalysis).talents!)}
                {(aiAnalysis as AIAnalysis).career && renderTraditionalAIBlock('事业发展', (aiAnalysis as AIAnalysis).career!)}
                {(aiAnalysis as AIAnalysis).relationship && renderTraditionalAIBlock('感情婚姻', (aiAnalysis as AIAnalysis).relationship!)}
                {(aiAnalysis as AIAnalysis).health && renderTraditionalAIBlock('健康养生', (aiAnalysis as AIAnalysis).health!)}
                {(aiAnalysis as AIAnalysis).wealth && renderTraditionalAIBlock('财运理财', (aiAnalysis as AIAnalysis).wealth!)}
                {(aiAnalysis as AIAnalysis).suggestions && renderTraditionalAIBlock('综合建议', (aiAnalysis as AIAnalysis).suggestions!)}
              </div>
            )}
          </CardContent>
          
          {/* 消费信息 - 宋代美学 */}
          {cost && (
            <CardContent className="pt-0">
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-center space-x-3 text-slate-700 dark:text-slate-300">
                    <div className="w-6 h-6 bg-slate-700 dark:bg-slate-600 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs">点</span>
                    </div>
                    <span className="text-sm font-medium">本次分析消费了</span>
                    <Badge variant="secondary" className="bg-slate-700 dark:bg-slate-600 text-white border-0 font-medium px-3 py-1">
                      {cost} 天机点
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}