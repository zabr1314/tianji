'use client'

import { useState, useEffect } from 'react'
import { BaziInputForm } from '@/components/forms/BaziInputForm'
import { BaziResult } from '@/components/modules/BaziResult'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calculator, Sparkles, ArrowLeft, RefreshCw, Download, Share2, Copy, Check, Calendar, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
// PDF和Canvas库将动态导入以优化性能

interface BaziAnalysisResponse {
  success?: boolean
  bazi: {
    year_ganzhi: string
    month_ganzhi: string
    day_ganzhi: string
    hour_ganzhi: string
  }
  wuxing_analysis: {
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
  dayun?: any[]
  ai_analysis: string
  yongshen: string
  cost: number
  error?: string
}

export default function BaziPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BaziAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<BaziAnalysisResponse[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null)
  const [showShareImage, setShowShareImage] = useState(false)

  // 检查URL参数，如果有recordId则加载历史记录
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const recordId = urlParams.get('recordId')
    
    if (recordId) {
      loadHistoryRecord(recordId)
    }
  }, [])

  const loadHistoryRecord = async (recordId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/history/records/${recordId}`)
      
      // 检查响应状态和内容类型
      if (!response.ok) {
        setError(`加载历史记录失败: ${response.status} ${response.statusText}`)
        return
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Expected JSON response but got:', contentType)
        setError('服务器响应格式错误')
        return
      }

      const data = await response.json()

      if (data.success && data.data) {
        const record = data.data
        // 将历史记录数据转换为分析结果格式
        if (record.analysis_type === 'bazi' && record.output_data) {
          setResult(record.output_data as BaziAnalysisResponse)
        }
      } else {
        setError('加载历史记录失败')
        console.error('Failed to load history record:', data.error)
      }
    } catch (error) {
      console.error('Error loading history record:', error)
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        setError('服务器返回了无效的数据格式')
      } else {
        setError('加载历史记录时发生网络错误')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAnalysisComplete = (data: BaziAnalysisResponse) => {
    setResult(data)
    setLoading(false)
    setError(null)
    
    // 添加到历史记录
    setAnalysisHistory(prev => [data, ...prev.slice(0, 4)]) // 保留最近5次记录
  }

  const handleAnalysisStart = () => {
    setLoading(true)
    setError(null)
    setResult(null)
  }

  const handleNewAnalysis = () => {
    setResult(null)
    setError(null)
    setLoading(false)
  }

  const handleSaveReport = async () => {
    if (!result) return
    
    setIsSaving(true)
    try {
      // 默认生成PDF报告
      await generatePDFReport(result)
    } catch (error) {
      console.error('保存报告失败:', error)
      alert('保存报告失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTextReport = async () => {
    if (!result) return
    
    setIsSaving(true)
    try {
      // 创建文本报告内容
      const reportContent = generateReportContent(result)
      
      // 创建并下载文件
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `八字分析报告_${new Date().toLocaleDateString()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('保存文本报告失败:', error)
      alert('保存文本报告失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleShareResult = async () => {
    if (!result) return
    
    setIsSharing(true)
    try {
      // 生成分享图片
      const shareImageBlob = await generateShareImage(result)
      
      if (shareImageBlob) {
        // 创建图片URL用于页面显示
        const imageUrl = URL.createObjectURL(shareImageBlob)
        setShareImageUrl(imageUrl)
        setShowShareImage(true)
      } else {
        alert('生成分享图片失败，请稍后重试')
      }
    } catch (error) {
      console.error('生成分享图片失败:', error)
      alert('生成分享图片失败，请稍后重试')
    } finally {
      setIsSharing(false)
    }
  }

  const handleDownloadImage = () => {
    if (shareImageUrl) {
      const a = document.createElement('a')
      a.href = shareImageUrl
      a.download = `天机AI八字分析_${new Date().toLocaleDateString().replace(/\//g, '')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleCloseShareImage = () => {
    if (shareImageUrl) {
      URL.revokeObjectURL(shareImageUrl)
      setShareImageUrl(null)
    }
    setShowShareImage(false)
  }

  const generateShareImage = async (data: BaziAnalysisResponse): Promise<Blob | null> => {
    try {
      // 创建适合小红书的分享卡片 - 9:16比例
      const shareElement = document.createElement('div')
      shareElement.style.width = '450px'
      shareElement.style.height = '800px'
      shareElement.style.fontFamily = 'Arial, SimSun, serif'
      shareElement.style.backgroundColor = '#0f172a'
      shareElement.style.color = '#ffffff'
      shareElement.style.position = 'relative'
      shareElement.style.overflow = 'hidden'
      shareElement.style.boxSizing = 'border-box'
      
      // 从AI分析中提取命格总论
      const extractMingGeOverview = (aiAnalysis: string) => {
        // 查找命格总论内容
        const minggeMatch = aiAnalysis.match(/【命格总论】([^【]*)/i) || aiAnalysis.match(/命格总论[：:](.*?)(?=【|$)/i)
        if (minggeMatch && minggeMatch[1]) {
          let content = minggeMatch[1].trim()
          // 清理内容，移除多余的换行和标点
          content = content.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim()
          // 如果内容过长，截取前150个字符
          if (content.length > 150) {
            content = content.substring(0, 150) + '...'
          }
          return content
        }
        
        // 如果没找到命格总论，尝试提取开头的概括性内容
        const firstParagraph = aiAnalysis.split(/[【\n]/)[0].trim()
        if (firstParagraph.length > 20) {
          let content = firstParagraph.substring(0, 150)
          if (firstParagraph.length > 150) content += '...'
          return content
        }
        
        return '您拥有独特的个性魅力，在人生道路上展现出与众不同的特质和潜力。'
      }

      // 从AI分析中提取事业财运信息
      const getCareerFinanceInfo = (aiAnalysis: string) => {
        const info = { career: '', finance: '' }
        
        // 提取事业相关信息
        const careerMatch = aiAnalysis.match(/【事业发展】([^【]*)/i) || aiAnalysis.match(/事业[发展]?[：:](.*?)(?=【|\n|。)/i)
        if (careerMatch && careerMatch[1]) {
          info.career = careerMatch[1].trim().substring(0, 50).replace(/[\n\r]+/g, ' ') + '...'
        } else if (aiAnalysis.includes('适合') && (aiAnalysis.includes('管理') || aiAnalysis.includes('领导'))) {
          info.career = '适合管理或领导岗位发展'
        } else if (aiAnalysis.includes('创造') || aiAnalysis.includes('艺术')) {
          info.career = '在创意艺术领域有发展潜力'
        } else {
          info.career = '事业发展稳健，前景可期'
        }
        
        // 提取财运相关信息
        const financeMatch = aiAnalysis.match(/【财运分析】([^【]*)/i) || aiAnalysis.match(/财运[分析]?[：:](.*?)(?=【|\n\n)/i)
        if (financeMatch && financeMatch[1]) {
          let content = financeMatch[1].trim().replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ')
          // 扩大财运分析的内容长度到120字符
          info.finance = content.length > 120 ? content.substring(0, 120) + '...' : content
        } else if (aiAnalysis.includes('财运') && aiAnalysis.includes('旺')) {
          info.finance = '您的财运较为旺盛，天生具备良好的理财天赋，善于发现商机和投资机会。建议多关注稳健型投资，避免过度冒险。'
        } else if (aiAnalysis.includes('稳健')) {
          info.finance = '您的财务管理能力稳健，收入相对稳定，适合长期投资和理财规划。建议建立多元化的投资组合。'
        } else {
          info.finance = '您具备不错的理财能力，财富会逐步积累。建议合理规划支出，适度投资，注重开源节流的平衡发展。'
        }
        
        return info
      }

      // 从AI分析中提取关键特质
      const getPersonalityTraits = (aiAnalysis: string) => {
        const traits = []
        if (aiAnalysis.includes('创造') || aiAnalysis.includes('艺术')) traits.push('🎨 富有创造力')
        if (aiAnalysis.includes('领导') || aiAnalysis.includes('管理')) traits.push('👑 天生领导者')
        if (aiAnalysis.includes('聪明') || aiAnalysis.includes('智慧')) traits.push('🧠 聪明机智')
        if (aiAnalysis.includes('善良') || aiAnalysis.includes('仁慈')) traits.push('💖 心地善良')
        if (aiAnalysis.includes('坚强') || aiAnalysis.includes('坚韧')) traits.push('💪 意志坚强')
        if (aiAnalysis.includes('乐观') || aiAnalysis.includes('积极')) traits.push('☀️ 乐观积极')
        if (aiAnalysis.includes('细心') || aiAnalysis.includes('谨慎')) traits.push('🔍 做事细心')
        if (aiAnalysis.includes('热情') || aiAnalysis.includes('外向')) traits.push('🔥 热情开朗')
        
        // 如果没有匹配到特质，使用默认的
        if (traits.length === 0) {
          traits.push('✨ 独特魅力', '🌟 潜力无限', '💎 珍贵品质')
        }
        
        return traits.slice(0, 3) // 最多显示3个特质
      }

      const aiAnalysisText = typeof data.ai_analysis === 'string' ? data.ai_analysis : JSON.stringify(data.ai_analysis)
      const personalityTraits = getPersonalityTraits(aiAnalysisText)
      const minggeOverview = extractMingGeOverview(aiAnalysisText)
      const careerFinanceInfo = getCareerFinanceInfo(aiAnalysisText)
      
      // 五行英文转中文
      const getWuxingChinese = (wuxing: string) => {
        const wuxingMap: Record<string, string> = {
          'wood': '木',
          'fire': '火', 
          'earth': '土',
          'metal': '金',
          'water': '水'
        }
        return wuxingMap[wuxing.toLowerCase()] || wuxing
      }
      
      shareElement.innerHTML = `
        <div style="
          width: 450px;
          height: 800px;
          background: linear-gradient(180deg, #fef7ed 0%, #f0f9ff 100%);
          color: #1f2937;
          font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
          padding: 20px;
          box-sizing: border-box;
          position: relative;
        ">
          <!-- 宋代美学装饰 -->
          <div style="position: absolute; top: 15px; right: 15px; width: 40px; height: 40px; border: 1px solid rgba(180,123,56,0.3); border-radius: 50%; background: radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%);"></div>
          <div style="position: absolute; top: 80px; left: 15px; width: 25px; height: 25px; border: 1px solid rgba(139,116,88,0.3); border-radius: 50%; background: radial-gradient(circle, rgba(160,138,110,0.1) 0%, transparent 70%);"></div>
          
          <!-- 标题 - 宋代印章风格 -->
          <div style="text-align: center; margin-bottom: 16px;">
            <div style="
              background: linear-gradient(135deg, #8b4513, #b8860b);
              color: #fef7ed;
              padding: 12px 20px;
              border: 2px solid rgba(180,123,56,0.4);
              border-radius: 10px;
              display: inline-block;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 6px;
              box-shadow: 0 3px 10px rgba(139,69,19,0.2);
              letter-spacing: 1px;
            ">天机AI·性格命盘</div>
            <div style="color: #8b7458; font-size: 11px; font-style: italic;">承古法之精髓 · 融今世之智慧</div>
          </div>
          
          <!-- 性格特质 & 命理格局 - 合并一行 -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <!-- 性格特质 -->
            <div style="
              background: rgba(255,255,255,0.9);
              border: 2px solid rgba(180,123,56,0.2);
              border-radius: 12px;
              padding: 12px;
              box-shadow: 0 3px 12px rgba(139,116,88,0.1);
            ">
              <h3 style="text-align: center; color: #8b4513; font-size: 13px; margin: 0 0 10px 0; font-weight: bold; letter-spacing: 1px;">✨ 性格特质</h3>
              <div style="display: grid; grid-template-columns: 1fr; gap: 6px;">
                ${personalityTraits.map(trait => `
                  <div style="
                    padding: 6px 8px;
                    background: linear-gradient(135deg, #fef7ed, #f9f1e6);
                    border-radius: 6px;
                    border-left: 2px solid #b8860b;
                    font-size: 11px;
                    color: #8b4513;
                    font-weight: 600;
                    text-align: center;
                  ">${trait}</div>
                `).join('')}
              </div>
            </div>
            
            <!-- 命理格局 -->
            <div style="
              background: rgba(255,255,255,0.9);
              border: 2px solid rgba(180,123,56,0.2);
              border-radius: 12px;
              padding: 12px;
              text-align: center;
              box-shadow: 0 3px 12px rgba(139,116,88,0.1);
            ">
              <h3 style="color: #8b4513; font-size: 13px; margin: 0 0 10px 0; font-weight: bold; letter-spacing: 1px;">🔮 命理格局</h3>
              <div style="
                background: linear-gradient(135deg, #fef7ed, #f9f1e6);
                border-radius: 8px;
                padding: 8px;
                margin-bottom: 8px;
                border: 1px solid rgba(180,123,56,0.3);
              ">
                <div style="font-size: 14px; font-weight: bold; color: #8b4513; margin-bottom: 3px;">
                  ${data.bazi.day_ganzhi[0]} 命格
                </div>
                <div style="font-size: 10px; color: #8b7458;">
                  ${data.bazi.year_ganzhi}年 ${data.bazi.month_ganzhi}月 ${data.bazi.day_ganzhi}日 ${data.bazi.hour_ganzhi}时
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
                <div style="background: rgba(139,116,88,0.1); padding: 6px; border-radius: 4px; font-size: 10px;">
                  <div style="color: #8b4513; font-weight: bold;">优势</div>
                  <div style="color: #704214;">${getWuxingChinese(data.wuxing_analysis.strongest)}性</div>
                </div>
                <div style="background: rgba(180,123,56,0.1); padding: 6px; border-radius: 4px; font-size: 10px;">
                  <div style="color: #8b4513; font-weight: bold;">待补</div>
                  <div style="color: #704214;">${getWuxingChinese(data.wuxing_analysis.weakest)}性</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 命格总论 - 宋代美学 -->
          <div style="
            background: rgba(255,255,255,0.9);
            border: 2px solid rgba(180,123,56,0.2);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 14px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(139,116,88,0.1);
          ">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
              <div style="font-size: 17px; margin-right: 6px;">📜</div>
              <h3 style="color: #8b4513; font-size: 15px; margin: 0; font-weight: bold; letter-spacing: 1px;">命格总论</h3>
            </div>
            <div style="
              background: linear-gradient(135deg, #fef7ed, #f9f1e6);
              border-radius: 10px;
              padding: 12px;
              color: #704214;
              font-size: 12px;
              line-height: 1.5;
              text-align: left;
              font-weight: 500;
              border: 1px solid rgba(180,123,56,0.3);
              min-height: 60px;
            ">
              ${minggeOverview}
            </div>
          </div>

          <!-- 财运分析 - 宋代美学 -->
          <div style="
            background: rgba(255,255,255,0.9);
            border: 2px solid rgba(180,123,56,0.2);
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 16px;
            box-shadow: 0 4px 15px rgba(139,116,88,0.1);
            min-height: 140px;
          ">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <div style="font-size: 20px; margin-right: 8px;">💰</div>
              <h3 style="color: #8b4513; font-size: 17px; margin: 0; font-weight: bold; letter-spacing: 1px;">财运分析</h3>
            </div>
            <div style="
              background: linear-gradient(135deg, #fef7ed, #f9f1e6);
              border-radius: 10px;
              padding: 16px;
              border: 1px solid rgba(180,123,56,0.3);
              box-shadow: inset 0 1px 3px rgba(139,116,88,0.1);
              min-height: 80px;
              display: flex;
              align-items: center;
            ">
              <div style="
                color: #704214; 
                font-size: 12px; 
                line-height: 1.6; 
                text-align: left; 
                font-weight: 500;
                width: 100%;
                word-wrap: break-word;
                overflow-wrap: break-word;
              ">
                ${careerFinanceInfo.finance}
              </div>
            </div>
          </div>
        </div>
      `
      
      // 临时添加到DOM中进行渲染
      shareElement.style.position = 'absolute'
      shareElement.style.left = '-9999px'
      document.body.appendChild(shareElement)
      
      // 动态导入html2canvas以优化性能
      const html2canvas = (await import('html2canvas')).default
      
      // 使用html2canvas生成canvas - 优化配置确保完整显示
      const canvas = await html2canvas(shareElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#fef7ed',
        width: 450,
        height: 800,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 450,
        windowHeight: 800
      })
      
      // 移除临时元素
      document.body.removeChild(shareElement)
      
      // 将canvas转换为Blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/png', 0.9)
      })
      
    } catch (error) {
      console.error('生成分享图片失败:', error)
      return null
    }
  }

  const generatePDFReport = async (data: BaziAnalysisResponse) => {
    try {
      // 检查数据完整性
      if (!data.bazi || !data.bazi.year_ganzhi) {
        console.error('八字数据不完整:', data.bazi)
        throw new Error('八字数据不完整，无法生成PDF')
      }

      if (!data.wuxing_analysis) {
        console.error('五行数据不完整:', data.wuxing_analysis)
        throw new Error('五行数据不完整，无法生成PDF')
      }

      const aiAnalysisText = typeof data.ai_analysis === 'string' ? data.ai_analysis : JSON.stringify(data.ai_analysis, null, 2)
      
      // 方案：先生成一个简单的测试页面，验证html2canvas是否工作
      console.log('开始生成PDF测试...')
      
      const testElement = document.createElement('div')
      testElement.style.width = '800px'
      testElement.style.height = '1400px'
      testElement.style.backgroundColor = '#fef7ed'
      testElement.style.color = '#333'
      testElement.style.fontFamily = 'Arial, sans-serif'
      testElement.style.padding = '20px'
      testElement.style.position = 'absolute'
      testElement.style.left = '-9999px'
      testElement.innerHTML = `
        <div style="text-align: center; padding: 20px; background: #fff; border-radius: 8px; margin-bottom: 25px;">
          <h1 style="color: #8b4513; font-size: 24px; margin-bottom: 10px;">天机AI八字命盘分析报告</h1>
          <p style="color: #666; font-size: 14px;">生成时间：${new Date().toLocaleDateString('zh-CN')}</p>
        </div>
        
        <div style="background: #fff; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #8b4513; font-size: 18px; margin-bottom: 20px; text-align: center;">八字四柱</h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            <div style="text-align: center; padding: 18px; background: #f9f1e6; border-radius: 6px;">
              <div style="font-size: 12px; color: #8b4513; margin-bottom: 8px;">年柱</div>
              <div style="font-size: 20px; font-weight: bold; color: #704214;">${data.bazi.year_ganzhi}</div>
            </div>
            <div style="text-align: center; padding: 18px; background: #f9f1e6; border-radius: 6px;">
              <div style="font-size: 12px; color: #8b4513; margin-bottom: 8px;">月柱</div>
              <div style="font-size: 20px; font-weight: bold; color: #704214;">${data.bazi.month_ganzhi}</div>
            </div>
            <div style="text-align: center; padding: 18px; background: #fef7ed; border: 2px solid #b8860b; border-radius: 6px;">
              <div style="font-size: 12px; color: #8b4513; margin-bottom: 8px;">日柱（日主）</div>
              <div style="font-size: 20px; font-weight: bold; color: #704214;">${data.bazi.day_ganzhi}</div>
            </div>
            <div style="text-align: center; padding: 18px; background: #f9f1e6; border-radius: 6px;">
              <div style="font-size: 12px; color: #8b4513; margin-bottom: 8px;">时柱</div>
              <div style="font-size: 20px; font-weight: bold; color: #704214;">${data.bazi.hour_ganzhi}</div>
            </div>
          </div>
        </div>
        
        <div style="background: #fff; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #8b4513; font-size: 18px; margin-bottom: 20px; text-align: center;">五行分析</h2>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px;">
            <div style="text-align: center; padding: 15px; background: rgba(46, 125, 50, 0.1); border-radius: 6px;">
              <div style="font-size: 12px; color: #2e7d32; font-weight: bold; margin-bottom: 5px;">木</div>
              <div style="font-size: 18px; color: #1b5e20; font-weight: bold;">${data.wuxing_analysis.wood}</div>
            </div>
            <div style="text-align: center; padding: 15px; background: rgba(211, 47, 47, 0.1); border-radius: 6px;">
              <div style="font-size: 12px; color: #d32f2f; font-weight: bold; margin-bottom: 5px;">火</div>
              <div style="font-size: 18px; color: #b71c1c; font-weight: bold;">${data.wuxing_analysis.fire}</div>
            </div>
            <div style="text-align: center; padding: 15px; background: rgba(180, 123, 56, 0.1); border-radius: 6px;">
              <div style="font-size: 12px; color: #8b4513; font-weight: bold; margin-bottom: 5px;">土</div>
              <div style="font-size: 18px; color: #704214; font-weight: bold;">${data.wuxing_analysis.earth}</div>
            </div>
            <div style="text-align: center; padding: 15px; background: rgba(158, 158, 158, 0.1); border-radius: 6px;">
              <div style="font-size: 12px; color: #616161; font-weight: bold; margin-bottom: 5px;">金</div>
              <div style="font-size: 18px; color: #424242; font-weight: bold;">${data.wuxing_analysis.metal}</div>
            </div>
            <div style="text-align: center; padding: 15px; background: rgba(25, 118, 210, 0.1); border-radius: 6px;">
              <div style="font-size: 12px; color: #1976d2; font-weight: bold; margin-bottom: 5px;">水</div>
              <div style="font-size: 18px; color: #0d47a1; font-weight: bold;">${data.wuxing_analysis.water}</div>
            </div>
          </div>
          <div style="text-align: center; font-size: 15px; color: #666; line-height: 1.6;">
            最旺：<strong style="color: #2e7d32;">${data.wuxing_analysis.strongest}</strong> | 
            最弱：<strong style="color: #d32f2f;">${data.wuxing_analysis.weakest}</strong> | 
            用神：<strong style="color: #8b4513;">${data.yongshen}</strong>
          </div>
        </div>

        <!-- 添加AI分析预览部分到第一页 -->
        <div style="background: #fff; padding: 25px; border-radius: 8px;">
          <h2 style="color: #8b4513; font-size: 18px; margin-bottom: 15px; text-align: center;">AI智能解析要点</h2>
          <div style="font-size: 14px; color: #4a5568; line-height: 1.8; text-align: justify;">
            ${aiAnalysisText.substring(0, 300)}...
          </div>
          <div style="text-align: center; margin-top: 15px; font-size: 13px; color: #8b7458; font-style: italic;">
            详细分析内容请见第二页
          </div>
        </div>
      `
      
      document.body.appendChild(testElement)
      
      try {
        console.log('开始渲染canvas...')
        // 动态导入html2canvas
        const html2canvas = (await import('html2canvas')).default
        const canvas = await html2canvas(testElement, {
          scale: 2,
          useCORS: true,
          logging: true, // 开启日志以便调试
          backgroundColor: '#fef7ed',
          scrollX: 0,
          scrollY: 0,
          allowTaint: true,
          onclone: function(clonedDoc) {
            console.log('Clone document created')
          }
        })
        
        console.log('Canvas rendered successfully:', canvas.width, 'x', canvas.height)
        document.body.removeChild(testElement)
        
        // 检查canvas是否为空
        const imgData = canvas.toDataURL('image/png')
        if (imgData === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==') {
          throw new Error('Canvas is empty')
        }
        
        console.log('Image data length:', imgData.length)
        
        // 动态导入jsPDF
        const { jsPDF } = await import('jspdf')
        
        // 创建PDF
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pageWidth = 210
        const pageHeight = 297
        
        // 添加第一页
        const imgWidth = pageWidth
        const imgHeight = (canvas.height * pageWidth) / canvas.width
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight))
        
        // 如果AI分析文本很长，添加第二页
        if (aiAnalysisText.length > 500) {
          // 将AI文本分段，每段不超过300字符（大幅减少每页内容）
          const textChunks = []
          const maxChunkSize = 300
          let remainingText = aiAnalysisText.substring(300) // 跳过第一页预览的部分
          
          while (remainingText.length > 0) {
            if (remainingText.length <= maxChunkSize) {
              textChunks.push(remainingText)
              break
            }
            
            // 寻找合适的断点
            let breakPoint = maxChunkSize
            for (let i = maxChunkSize; i > maxChunkSize * 0.7; i--) {
              if (remainingText[i] === '。' || remainingText[i] === '\n' || remainingText[i] === '！' || remainingText[i] === '？') {
                breakPoint = i + 1
                break
              }
            }
            
            textChunks.push(remainingText.substring(0, breakPoint))
            remainingText = remainingText.substring(breakPoint)
          }
          
          // 为每个文本块创建一页
          for (let chunkIndex = 0; chunkIndex < textChunks.length; chunkIndex++) {
            pdf.addPage()
            
            const isLastChunk = chunkIndex === textChunks.length - 1
            const currentChunk = textChunks[chunkIndex]
            
            // 格式化文本 - 将内容分成独立的段落框
            const paragraphs = currentChunk
              .split('\n\n')
              .map(paragraph => paragraph.trim())
              .filter(paragraph => paragraph.length > 0)
            
            const aiElement = document.createElement('div')
            aiElement.style.width = '800px'
            aiElement.style.minHeight = '1200px'
            aiElement.style.backgroundColor = '#fef7ed'
            aiElement.style.color = '#333'
            aiElement.style.fontFamily = 'Arial, sans-serif'
            aiElement.style.padding = '35px'
            aiElement.style.position = 'absolute'
            aiElement.style.left = '-9999px'
            aiElement.innerHTML = `
              <div style="text-align: center; padding: 20px; background: #fff; border-radius: 8px; margin-bottom: 35px;">
                <h2 style="color: #8b4513; font-size: 20px; margin: 0; letter-spacing: 2px;">
                  ${chunkIndex === 0 ? 'AI智能解析详述' : `AI智能解析（第${chunkIndex + 1}部分）`}
                </h2>
                <div style="width: 50px; height: 2px; background: #8b4513; margin: 12px auto 0;"></div>
              </div>
              
              ${paragraphs.map(paragraph => `
                <div style="
                  background: #fff; 
                  padding: 40px 45px; 
                  border-radius: 12px; 
                  margin-bottom: 40px; 
                  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                  border-left: 5px solid rgba(180, 123, 56, 0.4);
                ">
                  <div style="
                    font-size: 19px; 
                    color: #4a5568; 
                    line-height: 3.2;
                    text-align: justify;
                    letter-spacing: 1.5px;
                    word-spacing: 2px;
                    text-indent: ${paragraph.startsWith('【') ? '0' : '2em'};
                    margin: 0;
                    padding: 10px 0;
                  ">${paragraph}</div>
                </div>
              `).join('')}
              
              ${isLastChunk ? `
              <div style="text-align: center; padding: 25px; background: rgba(255,255,255,0.9); border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="color: #8b4513; font-size: 18px; font-weight: bold; margin-bottom: 12px;">天机AI</div>
                <div style="color: #666; font-size: 14px; margin-bottom: 10px;">传统智慧 × 现代科技</div>
                <div style="width: 40px; height: 2px; background: #8b4513; margin: 10px auto;"></div>
                <div style="color: #8b7458; font-size: 13px; margin-bottom: 8px;">专业命理分析平台</div>
                <div style="color: #b8860b; font-size: 14px; font-weight: bold;">本次分析消耗：${data.cost} 天机点</div>
              </div>
              ` : ''}
            `
            
            document.body.appendChild(aiElement)
            
            // 重用之前的html2canvas导入或重新导入
            const html2canvas = (await import('html2canvas')).default
            const aiCanvas = await html2canvas(aiElement, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#fef7ed',
              scrollX: 0,
              scrollY: 0,
              allowTaint: true
            })
            
            document.body.removeChild(aiElement)
            
            const aiImgData = aiCanvas.toDataURL('image/png')
            const aiImgHeight = (aiCanvas.height * pageWidth) / aiCanvas.width
            
            pdf.addImage(aiImgData, 'PNG', 0, 0, pageWidth, Math.min(aiImgHeight, pageHeight))
          }
        }
        
        // 下载PDF
        const fileName = `天机AI八字分析_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.pdf`
        console.log('开始下载PDF：', fileName)
        pdf.save(fileName)
        
      } catch (canvasError) {
        console.error('Canvas rendering failed:', canvasError)
        document.body.removeChild(testElement)
        
        // 如果html2canvas失败，使用纯jsPDF方案
        console.log('Fallback to pure jsPDF...')
        await generatePurePDF(data, aiAnalysisText)
      }
      
    } catch (error) {
      console.error('PDF generation failed:', error)
      throw error
    }
  }
  
  // 备用方案：纯jsPDF生成
  const generatePurePDF = async (data: BaziAnalysisResponse, aiAnalysisText: string) => {
    // 动态导入jsPDF
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297
    const margin = 20
    let yPos = margin
    
    // 标题
    pdf.setFontSize(20)
    pdf.text('Tianji AI - Bazi Analysis Report', margin, yPos)
    yPos += 15
    
    pdf.setFontSize(12)
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos)
    yPos += 20
    
    // 八字信息
    pdf.setFontSize(16)
    pdf.text('Bazi Four Pillars:', margin, yPos)
    yPos += 15
    
    pdf.setFontSize(14)
    pdf.text(`Year: ${data.bazi.year_ganzhi}`, margin, yPos)
    yPos += 8
    pdf.text(`Month: ${data.bazi.month_ganzhi}`, margin, yPos)
    yPos += 8  
    pdf.text(`Day: ${data.bazi.day_ganzhi} (Day Master)`, margin, yPos)
    yPos += 8
    pdf.text(`Hour: ${data.bazi.hour_ganzhi}`, margin, yPos)
    yPos += 20
    
    // 五行分析
    pdf.setFontSize(16)
    pdf.text('Five Elements Analysis:', margin, yPos)
    yPos += 15
    
    pdf.setFontSize(12)
    pdf.text(`Wood: ${data.wuxing_analysis.wood}`, margin, yPos)
    yPos += 6
    pdf.text(`Fire: ${data.wuxing_analysis.fire}`, margin, yPos)
    yPos += 6
    pdf.text(`Earth: ${data.wuxing_analysis.earth}`, margin, yPos)
    yPos += 6
    pdf.text(`Metal: ${data.wuxing_analysis.metal}`, margin, yPos)
    yPos += 6
    pdf.text(`Water: ${data.wuxing_analysis.water}`, margin, yPos)
    yPos += 12
    
    pdf.text(`Strongest: ${data.wuxing_analysis.strongest}`, margin, yPos)
    yPos += 6
    pdf.text(`Weakest: ${data.wuxing_analysis.weakest}`, margin, yPos)
    yPos += 6
    pdf.text(`Useful God: ${data.yongshen}`, margin, yPos)
    yPos += 20
    
    // AI分析
    pdf.setFontSize(16)
    pdf.text('AI Analysis:', margin, yPos)
    yPos += 15
    
    pdf.setFontSize(10)
    const lines = pdf.splitTextToSize(aiAnalysisText, pageWidth - 2 * margin)
    
    for (const line of lines) {
      if (yPos > pageHeight - margin) {
        pdf.addPage()
        yPos = margin
      }
      pdf.text(line, margin, yPos)
      yPos += 5
    }
    
    // 底部信息
    if (yPos > pageHeight - 40) {
      pdf.addPage()
      yPos = margin
    }
    
    yPos += 20
    pdf.setFontSize(12)
    pdf.text('Tianji AI - Traditional Wisdom x Modern Technology', margin, yPos)
    yPos += 8
    pdf.text(`Analysis Cost: ${data.cost} Tianji Points`, margin, yPos)
    
    const fileName = `TianjiAI_BaziAnalysis_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.pdf`
    pdf.save(fileName)
  }

  const generateReportContent = (data: BaziAnalysisResponse): string => {
    const date = new Date().toLocaleDateString('zh-CN')
    return `
==============================
天机AI - 八字命盘分析报告
生成时间：${date}
==============================

【八字四柱】
年柱：${data.bazi.year_ganzhi}
月柱：${data.bazi.month_ganzhi}  
日柱：${data.bazi.day_ganzhi} [日主]
时柱：${data.bazi.hour_ganzhi}

【五行分析】
木：${data.wuxing_analysis.wood}个 (${data.wuxing_analysis.percentages?.wood?.toFixed(1) || 0}%)
火：${data.wuxing_analysis.fire}个 (${data.wuxing_analysis.percentages?.fire?.toFixed(1) || 0}%)
土：${data.wuxing_analysis.earth}个 (${data.wuxing_analysis.percentages?.earth?.toFixed(1) || 0}%)
金：${data.wuxing_analysis.metal}个 (${data.wuxing_analysis.percentages?.metal?.toFixed(1) || 0}%)
水：${data.wuxing_analysis.water}个 (${data.wuxing_analysis.percentages?.water?.toFixed(1) || 0}%)

最强五行：${data.wuxing_analysis.strongest}
最弱五行：${data.wuxing_analysis.weakest}
用神：${data.yongshen}

【AI智能分析】
${typeof data.ai_analysis === 'string' ? data.ai_analysis : JSON.stringify(data.ai_analysis, null, 2)}

==============================
本次分析消耗：${data.cost} 天机点
报告由天机AI生成 - 仅供参考
==============================
    `
  }

  const generateShareContent = (data: BaziAnalysisResponse): string => {
    return `🔮 我在天机AI完成了八字分析！

📊 八字：${data.bazi.year_ganzhi} ${data.bazi.month_ganzhi} ${data.bazi.day_ganzhi} ${data.bazi.hour_ganzhi}
⚖️ 用神：${data.yongshen}
🌟 获得了专业的12维度深度解读

想了解自己的命理吗？来试试天机AI吧！
#八字分析 #命理 #天机AI`
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: `linear-gradient(45deg, 
        #f0fdfa 0%, 
        #ecfdf5 25%, 
        #f0fdf4 50%, 
        #ecfccb 75%, 
        #f0fdfa 100%)`
    }}>
      {/* 宋代美学背景装饰 */}
      <div className="absolute inset-0 opacity-40 dark:opacity-20">
        <div className="absolute top-32 left-32 w-32 h-32 border-2 border-teal-300 dark:border-teal-600 rounded-full opacity-50"></div>
        <div className="absolute bottom-40 right-32 w-24 h-24 border border-emerald-400 dark:border-emerald-500 rounded-full opacity-60"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-teal-300 dark:bg-teal-600 rounded-full opacity-40"></div>
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-emerald-400 dark:bg-emerald-600 rounded-full opacity-50"></div>
      </div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
          
          {!result && !loading && (
            <>
              {/* 页面介绍 - 宋代美学风格 */}
              <section className="text-center mb-12">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-5xl font-serif font-bold mb-6 text-teal-800 dark:text-teal-200">
                    八字命盘分析
                  </h2>
                  <div className="w-24 h-px bg-teal-300 dark:bg-teal-600 mx-auto mb-6"></div>
                  <p className="text-xl font-serif leading-relaxed text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-8">
                    基于传统天干地支理论，结合现代AI智能技术，为您提供专业深入的命理分析。
                    涵盖八字排盘、五行配置、大运推算、用神判断等传统命理精要。
                  </p>
                  <div className="flex justify-center items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4" />
                      <span>精准排盘算法</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>AI智能解读</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>实时分析</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 输入表单 - 宋代美学风格 */}
              <section className="mb-12">
                <Card className="max-w-4xl mx-auto shadow-lg border border-teal-200 dark:border-teal-700 bg-white/90 dark:bg-slate-900/90">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-serif font-bold text-teal-700 dark:text-teal-300 mb-2">
                      生辰八字信息
                    </CardTitle>
                    <div className="w-16 h-px bg-teal-300 dark:bg-teal-600 mx-auto mb-2"></div>
                    <CardDescription className="text-base font-serif text-teal-600 dark:text-teal-400">
                      请填写准确的出生信息，AI将为您排出精准的八字命盘
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BaziInputForm 
                      onAnalysisStart={handleAnalysisStart}
                      onAnalysisComplete={handleAnalysisComplete}
                      loading={loading}
                    />
                  </CardContent>
                </Card>
              </section>

              {/* 历史记录 - 宋代美学风格 */}
              {analysisHistory.length > 0 && (
                <section>
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-serif font-bold text-teal-700 dark:text-teal-300 mb-4">最近分析记录</h3>
                    <div className="w-24 h-px bg-teal-300 dark:bg-teal-600 mx-auto"></div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analysisHistory.map((history, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow border border-teal-200 dark:border-teal-700 bg-white/90 dark:bg-slate-900/90">
                        <CardHeader>
                          <CardTitle className="text-lg font-serif text-teal-700 dark:text-teal-300">分析记录 #{analysisHistory.length - index}</CardTitle>
                          <CardDescription className="font-serif">
                            八字：{history.bazi?.year_ganzhi} {history.bazi?.month_ganzhi} {history.bazi?.day_ganzhi} {history.bazi?.hour_ganzhi}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 font-serif">用神：{history.yongshen}</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="font-serif text-teal-700 dark:text-teal-300 cursor-pointer" 
                              onClick={(e) => {
                                e.stopPropagation()
                                setResult(history)
                              }}
                            >
                              查看详情
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* 分析中状态 */}
          {loading && (
            <section className="text-center py-16">
              <Card className="max-w-2xl mx-auto">
                <CardContent className="pt-12 pb-12">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
                      <Calculator className="absolute inset-0 m-auto h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">正在进行八字分析...</h3>
                      <p className="text-muted-foreground mb-4">
                        AI正在为您计算真太阳时、排列四柱、分析五行格局
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="secondary">计算真太阳时</Badge>
                        <Badge variant="secondary">排列年月日时四柱</Badge>
                        <Badge variant="secondary">分析五行强弱</Badge>
                        <Badge variant="secondary">推算十年大运</Badge>
                        <Badge variant="secondary">判断格局用神</Badge>
                        <Badge variant="secondary">AI智能解读</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* 错误显示 */}
          {error && (
            <section className="text-center py-8">
              <Card className="max-w-2xl mx-auto border-red-200">
                <CardContent className="pt-6">
                  <div className="text-center text-red-600 mb-4">
                    <p className="text-lg font-semibold">{error}</p>
                  </div>
                  <Button onClick={handleNewAnalysis} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新分析
                  </Button>
                </CardContent>
              </Card>
            </section>
          )}

          {/* 分析结果 - 宋代美学风格 */}
          {result && (
            <section>
              <div className="text-center mb-8">
                <h3 className="text-3xl font-serif font-bold text-teal-700 dark:text-teal-300 mb-4">八字命盘分析结果</h3>
                <div className="w-24 h-px bg-teal-300 dark:bg-teal-600 mx-auto mb-6"></div>
                <Button onClick={handleNewAnalysis} variant="outline" className="font-serif border-teal-300 dark:border-teal-600">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新分析
                </Button>
              </div>
              
              <div className="bg-teal-50/50 dark:bg-teal-800/50 rounded-lg p-6 border border-teal-200 dark:border-teal-700">
                <BaziResult 
                  bazi={result.bazi}
                  wuxingAnalysis={result.wuxing_analysis}
                  yongshen={result.yongshen}
                  aiAnalysis={result.ai_analysis}
                  cost={result.cost}
                />
              </div>

              {/* 操作按钮 - 宋代美学风格 */}
              <div className="mt-8 text-center space-x-4">
                <Button onClick={handleNewAnalysis} className="bg-teal-700 dark:bg-teal-600 hover:bg-teal-800 dark:hover:bg-teal-700 text-white font-serif">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新分析
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 font-serif"
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? '保存中...' : '保存报告'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleShareResult}
                  disabled={isSharing}
                  className="border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 font-serif"
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-2 text-emerald-500" />
                  ) : isSharing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Share2 className="h-4 w-4 mr-2" />
                  )}
                  {copied ? '已复制' : isSharing ? '分享中...' : '分享结果'}
                </Button>
              </div>

              {/* 分享图片显示区域 - 宋代美学风格 */}
              {showShareImage && shareImageUrl && (
                <div className="mt-8">
                  <Card className="bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-serif font-bold text-amber-800 dark:text-amber-200">
                          🎯 分享图片已生成
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCloseShareImage}
                          className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="w-24 h-px bg-amber-300 dark:bg-amber-600"></div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-amber-700 dark:text-amber-300 font-serif mb-6">
                          您的八字分析图片已按照宋代美学风格生成，适合分享到小红书等社交平台
                        </p>
                        
                        {/* 分享图片预览 */}
                        <div className="mb-6 flex justify-center">
                          <div className="relative max-w-md w-full">
                            <Image 
                              src={shareImageUrl} 
                              alt="八字分析分享图片" 
                              width={450}
                              height={800}
                              className="w-full h-auto rounded-lg shadow-lg border border-amber-200 dark:border-amber-700"
                              style={{ maxHeight: '80vh', objectFit: 'contain' }}
                            />
                            <div className="absolute -top-3 -right-3 bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                              ✨
                            </div>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                          <Button 
                            onClick={handleDownloadImage}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-serif px-6 py-2"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            下载图片
                          </Button>
                          <p className="text-sm text-amber-600 dark:text-amber-400 font-serif">
                            建议保存到相册后分享到社交平台
                          </p>
                        </div>

                        {/* 使用提示 */}
                        <div className="mt-6 p-4 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg border border-amber-200/50 dark:border-amber-700/30">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">💡</span>
                            </div>
                            <div className="text-left">
                              <h4 className="font-serif font-semibold text-amber-800 dark:text-amber-200 text-sm mb-1">分享建议</h4>
                              <p className="text-amber-700 dark:text-amber-300 text-xs leading-relaxed font-serif">
                                • 图片采用9:16比例，完美适配小红书、抖音等竖屏平台<br/>
                                • 宋代美学设计，传统与现代完美结合<br/>
                                • 高清输出，确保分享时清晰度最佳
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 历史记录提示 - 宋代美学风格 */}
              <div className="mt-8">
                <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                        <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-serif font-semibold text-emerald-800 dark:text-emerald-200">
                        分析已保存
                      </h3>
                    </div>
                    <p className="text-emerald-700 dark:text-emerald-300 font-serif mb-4">
                      本次八字分析结果已自动保存到您的历史记录中，您可以随时查看和回顾所有分析结果。
                    </p>
                    <Link href="/history">
                      <Button variant="outline" className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 font-serif">
                        <Calendar className="h-4 w-4 mr-2" />
                        查看历史记录
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Footer - 宋代美学风格 */}
      <footer className="border-t border-teal-200 dark:border-teal-700 bg-teal-50/90 dark:bg-slate-900/90 backdrop-blur-sm mt-16 relative">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-teal-600 dark:text-teal-400">
            <p className="font-serif">&copy; 2024 天机AI. 传统智慧，现代科技</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}