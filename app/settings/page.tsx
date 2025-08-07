'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Loader2,
  Mail,
  Smartphone
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    analysisReminders: true,
    privacyMode: false,
    language: 'zh-CN'
  })
  
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          window.location.href = '/auth/login'
          return
        }

        setUser(user)
        // 加载用户设置（如果有的话）
        loadUserSettings(user.id)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const loadUserSettings = async (userId: string) => {
    try {
      // 这里可以从数据库加载用户的个性化设置
      // 暂时使用默认设置
      console.log('Loading settings for user:', userId)
    } catch (error) {
      console.error('Error loading user settings:', error)
    }
  }

  const handleSaveSettings = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // 这里可以将设置保存到数据库
      // 暂时只显示成功消息
      await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
      
      alert('设置保存成功！')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('保存失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3 text-amber-600" />
            设置
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            管理您的账户设置和个人偏好
          </p>
        </div>

        <div className="space-y-6">
          {/* 外观设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center">
                <Palette className="h-5 w-5 mr-2 text-amber-600" />
                外观设置
              </CardTitle>
              <CardDescription>
                自定义界面主题和显示偏好
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-serif">主题模式</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    选择您偏好的界面主题
                  </p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Sun className="h-4 w-4 mr-2" />
                        浅色
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Moon className="h-4 w-4 mr-2" />
                        深色
                      </div>
                    </SelectItem>
                    <SelectItem value="system">系统</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-serif">语言设置</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    选择界面显示语言
                  </p>
                </div>
                <Select 
                  value={settings.language} 
                  onValueChange={(value) => handleSettingChange('language', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="zh-TW">繁体中文</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 通知设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center">
                <Bell className="h-5 w-5 mr-2 text-amber-600" />
                通知设置
              </CardTitle>
              <CardDescription>
                管理您接收通知的方式和频率
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-serif flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    邮件通知
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    接收重要更新和活动提醒
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-serif flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    推送通知
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    接收浏览器推送通知
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-serif">分析提醒</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    定期提醒进行运势分析
                  </p>
                </div>
                <Switch
                  checked={settings.analysisReminders}
                  onCheckedChange={(checked) => handleSettingChange('analysisReminders', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 隐私设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center">
                <Shield className="h-5 w-5 mr-2 text-amber-600" />
                隐私设置
              </CardTitle>
              <CardDescription>
                控制您的数据隐私和安全设置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-serif">隐私模式</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    启用后将限制数据收集和分析历史保存
                  </p>
                </div>
                <Switch
                  checked={settings.privacyMode}
                  onCheckedChange={(checked) => handleSettingChange('privacyMode', checked)}
                />
              </div>

              <Separator />

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <h4 className="font-serif font-medium text-amber-800 dark:text-amber-200 mb-2">
                  数据管理
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  您可以导出或删除您的个人数据
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="font-serif">
                    导出我的数据
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 font-serif">
                    删除我的账户
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 账户信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">账户信息</CardTitle>
              <CardDescription>
                查看您的账户基本信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-serif">用户ID</Label>
                  <Input
                    value={user?.id || ''}
                    disabled
                    className="font-mono text-sm bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-serif">注册时间</Label>
                  <Input
                    value={new Date(user?.created_at).toLocaleString('zh-CN')}
                    disabled
                    className="font-serif bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 保存按钮 */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-amber-600 hover:bg-amber-700 font-serif"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存设置
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}