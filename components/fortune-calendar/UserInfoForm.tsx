'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Calendar, Clock, MapPin } from 'lucide-react'
import { UserBirthInfo } from '@/lib/types/fortune-calendar'

interface UserInfoFormProps {
  onSubmit: (info: UserBirthInfo) => void
  onCancel: () => void
  isLoading?: boolean
}

export function UserInfoForm({ onSubmit, onCancel, isLoading = false }: UserInfoFormProps) {
  const [formData, setFormData] = useState<UserBirthInfo>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthCity: '',
    gender: 'male'
  })

  const [errors, setErrors] = useState<Partial<UserBirthInfo>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<UserBirthInfo> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名'
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = '请选择出生日期'
    }
    
    if (!formData.birthTime) {
      newErrors.birthTime = '请选择出生时间'
    }
    
    if (!formData.birthCity.trim()) {
      newErrors.birthCity = '请输入出生城市'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const updateFormData = (field: keyof UserBirthInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-amber-600 dark:bg-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl text-amber-800 dark:text-amber-200">
          获取专属运势
        </CardTitle>
        <p className="text-muted-foreground">
          填写您的出生信息，获得基于个人八字的精准运势分析
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 基本信息 */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>姓名 *</span>
            </Label>
            <Input
              id="name"
              placeholder="请输入您的姓名"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              className={errors.name ? 'border-red-300' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gender">性别 *</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value: 'male' | 'female') => updateFormData('gender', value)}
            >
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
        
        {/* 出生信息 */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="birth-date" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>出生日期 *</span>
            </Label>
            <Input
              id="birth-date"
              type="date"
              value={formData.birthDate}
              onChange={(e) => updateFormData('birthDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={errors.birthDate ? 'border-red-300' : ''}
            />
            {errors.birthDate && (
              <p className="text-sm text-red-600">{errors.birthDate}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="birth-time" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>出生时间 *</span>
            </Label>
            <Input
              id="birth-time"
              type="time"
              value={formData.birthTime}
              onChange={(e) => updateFormData('birthTime', e.target.value)}
              className={errors.birthTime ? 'border-red-300' : ''}
            />
            {errors.birthTime && (
              <p className="text-sm text-red-600">{errors.birthTime}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="birth-city" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>出生城市 *</span>
          </Label>
          <Input
            id="birth-city"
            placeholder="如：北京市、上海市、广州市"
            value={formData.birthCity}
            onChange={(e) => updateFormData('birthCity', e.target.value)}
            className={errors.birthCity ? 'border-red-300' : ''}
          />
          {errors.birthCity && (
            <p className="text-sm text-red-600">{errors.birthCity}</p>
          )}
          <p className="text-xs text-muted-foreground">
            出生地点用于计算准确的真太阳时，影响八字分析的精度
          </p>
        </div>
        
        {/* 隐私说明 */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            隐私保护说明
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• 您的个人信息仅用于运势计算，不会用于其他用途</li>
            <li>• 信息采用加密存储，确保数据安全</li>
            <li>• 您可随时在设置中修改或删除个人信息</li>
          </ul>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex space-x-4 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                处理中...
              </>
            ) : (
              '获取专属运势'
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
          >
            稍后填写
          </Button>
        </div>
        
        {/* 提示信息 */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            填写完成后将消耗 100 天机点生成专属运势日历
          </p>
        </div>
      </CardContent>
    </Card>
  )
}