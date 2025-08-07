'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DateSelector } from '@/components/ui/date-selector'

interface BaziInputData {
  name: string
  birthDate: string
  birthTime: string
  birthCity: string
  gender: 'male' | 'female'
  isTimeUncertain: boolean
}

interface BaziInputFormProps {
  onAnalysisStart?: () => void
  onAnalysisComplete?: (result: any) => void
  loading?: boolean
}

export function BaziInputForm({ onAnalysisStart, onAnalysisComplete, loading = false }: BaziInputFormProps) {
  const [formData, setFormData] = useState<BaziInputData>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthCity: '',
    gender: 'male',
    isTimeUncertain: false
  })

  // 常用城市列表
  const commonCities = [
    '北京市', '上海市', '广州市', '深圳市', '天津市', '重庆市', '成都市', '西安市',
    '南京市', '武汉市', '沈阳市', '长沙市', '哈尔滨市', '昆明市', '南宁市', '银川市',
    '太原市', '长春市', '福州市', '石家庄市', '苏州市', '佛山市', '东莞市', '无锡市',
    '烟台市', '兰州市', '贵阳市', '中山市', '常州市', '徐州市', '潍坊市', '温州市'
  ]

  // 十二时辰选项
  const timeOptions = [
    { value: '23:00', label: '子时 (23:00-01:00)', period: '子时' },
    { value: '01:00', label: '丑时 (01:00-03:00)', period: '丑时' },
    { value: '03:00', label: '寅时 (03:00-05:00)', period: '寅时' },
    { value: '05:00', label: '卯时 (05:00-07:00)', period: '卯时' },
    { value: '07:00', label: '辰时 (07:00-09:00)', period: '辰时' },
    { value: '09:00', label: '巳时 (09:00-11:00)', period: '巳时' },
    { value: '11:00', label: '午时 (11:00-13:00)', period: '午时' },
    { value: '13:00', label: '未时 (13:00-15:00)', period: '未时' },
    { value: '15:00', label: '申时 (15:00-17:00)', period: '申时' },
    { value: '17:00', label: '酉时 (17:00-19:00)', period: '酉时' },
    { value: '19:00', label: '戌时 (19:00-21:00)', period: '戌时' },
    { value: '21:00', label: '亥时 (21:00-23:00)', period: '亥时' }
  ]

  const [errors, setErrors] = useState<Partial<Record<keyof BaziInputData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BaziInputData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名'
    }

    if (!formData.birthDate) {
      newErrors.birthDate = '请选择出生日期'
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(formData.birthDate)) {
        newErrors.birthDate = '请选择完整的出生日期'
      } else {
        const [year, month, day] = formData.birthDate.split('-').map(Number)
        const date = new Date(year, month - 1, day)
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
          newErrors.birthDate = '请选择有效的日期'
        }
      }
    }

    if (!formData.birthTime) {
      newErrors.birthTime = '请选择出生时间'
    } else {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(formData.birthTime)) {
        newErrors.birthTime = '请输入有效的时间格式 (HH:MM)'
      }
    }

    if (!formData.birthCity.trim()) {
      newErrors.birthCity = '请输入出生城市'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onAnalysisStart?.()
      
      try {
        // 构建API请求数据
        const requestData = {
          name: formData.name,
          birth_date: formData.birthDate,
          birth_time: formData.birthTime,
          birth_city: formData.birthCity,
          gender: formData.gender
        }

        const response = await fetch('/api/bazi/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          
          if (response.status === 401) {
            alert('请先登录后再进行分析')
            window.location.href = '/auth/login'
            return
          }
          
          if (response.status === 402) {
            alert(`天机点余额不足！\n需要: ${errorData.required_points || 200} 天机点\n请前往充值页面购买天机点`)
            window.location.href = '/points'
            return
          }
          
          throw new Error(errorData.error || '分析请求失败')
        }

        const result = await response.json()
        onAnalysisComplete?.(result)
      } catch (error) {
        console.error('Analysis error:', error)
        if (error instanceof Error) {
          alert(`分析失败: ${error.message}`)
        } else {
          alert('分析失败，请稍后重试')
        }
      }
    }
  }

  const handleInputChange = (field: keyof BaziInputData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-primary">
          八字命盘分析
        </CardTitle>
        <p className="text-center text-muted-foreground">
          请填写准确的出生信息，我们将为您生成专业的八字分析报告
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 姓名和性别 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名 *</Label>
              <Input
                id="name"
                type="text"
                placeholder="请输入您的姓名"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">性别 *</Label>
              <Select value={formData.gender} onValueChange={(value: 'male' | 'female') => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 出生日期 */}
          <DateSelector
            label="出生日期"
            value={formData.birthDate}
            onChange={(value) => handleInputChange('birthDate', value)}
            error={errors.birthDate}
            required
          />

          {/* 出生时间 */}
          <div className="space-y-2">
            <Label htmlFor="birthTime">出生时间 *</Label>
            <Select value={formData.birthTime} onValueChange={(value) => handleInputChange('birthTime', value)}>
              <SelectTrigger className={errors.birthTime ? 'border-red-500' : ''}>
                <SelectValue placeholder="请选择出生时辰" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.birthTime && (
              <p className="text-sm text-red-500">{errors.birthTime}</p>
            )}
            <p className="text-xs text-muted-foreground">
              💡 如果不确定具体时间，可以选择最接近的时辰
            </p>
          </div>

          {/* 出生城市 */}
          <div className="space-y-2">
            <Label htmlFor="birthCity">出生城市 *</Label>
            <Select value={formData.birthCity} onValueChange={(value) => handleInputChange('birthCity', value)}>
              <SelectTrigger className={errors.birthCity ? 'border-red-500' : ''}>
                <SelectValue placeholder="请选择出生城市" />
              </SelectTrigger>
              <SelectContent>
                {commonCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.birthCity && (
              <p className="text-sm text-red-500">{errors.birthCity}</p>
            )}
            <p className="text-xs text-muted-foreground">
              📍 选择最接近的城市，用于精确的时区计算
            </p>
          </div>

          {/* 时辰不确定选项 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isTimeUncertain"
              checked={formData.isTimeUncertain}
              onCheckedChange={(checked) => 
                handleInputChange('isTimeUncertain', checked === true)
              }
            />
            <Label 
              htmlFor="isTimeUncertain" 
              className="text-sm font-normal cursor-pointer"
            >
              时辰不确定
            </Label>
          </div>

          {formData.isTimeUncertain && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ 时辰不确定会影响分析的准确性。如果您不确定具体出生时间，
                建议咨询家人或查看出生证明以获得更精确的分析结果。
              </p>
            </div>
          )}

          {/* 提交按钮 */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                分析中...
              </>
            ) : (
              '开始分析 (消耗 200 天机点)'
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>分析完成后将消耗 200 天机点</p>
            <p>首次注册用户赠送 300 天机点</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}