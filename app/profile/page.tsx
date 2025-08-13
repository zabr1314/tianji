'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Calendar, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
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
        setEmail(user.email || '')
        setFullName(user.user_metadata?.full_name || '')
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [supabase.auth])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName
        }
      })

      if (error) {
        throw error
      }

      // 更新本地用户状态
      setUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          full_name: fullName
        }
      })

      alert('个人资料保存成功！')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('保存失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
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

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '用户'
  const userInitials = userDisplayName.charAt(0).toUpperCase()
  const joinDate = new Date(user?.created_at).toLocaleDateString('zh-CN')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-2">
            个人资料
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            管理您的个人信息和账户设置
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* 用户信息概览 */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-amber-100 text-amber-800 font-serif text-2xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="font-serif">{userDisplayName}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>邮箱已验证</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>加入于 {joinDate}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <User className="h-4 w-4 mr-2" />
                    <span>普通用户</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 资料编辑 */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">基本信息</CardTitle>
                <CardDescription>
                  更新您的基本信息，这些信息将在您的个人资料中显示
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-serif">姓名</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="请输入您的姓名"
                      className="font-serif"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      这将作为您在平台上的显示名称
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-serif">邮箱</Label>
                    <Input
                      id="email"
                      value={email}
                      disabled
                      className="font-serif bg-slate-50 dark:bg-slate-800"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      邮箱地址无法修改，如需更改请联系客服
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSave}
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
                        保存修改
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}