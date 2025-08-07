'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  History, 
  Sparkles, 
  Settings, 
  LogOut,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface UserMenuProps {
  user: any
  onSignOut: () => void
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [points, setPoints] = useState<number | null>(null)
  const [recordsCount, setRecordsCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    if (user) {
      loadUserStats()
    } else {
      // 重置状态
      setPoints(null)
      setRecordsCount(null)
    }
  }, [user])

  const loadUserStats = async () => {
    setIsLoading(true)
    try {
      // 并行请求以提高性能
      const [pointsResponse, statsResponse] = await Promise.allSettled([
        fetch('/api/points/balance'),
        fetch('/api/history/stats')
      ])

      // 处理天机点余额
      if (pointsResponse.status === 'fulfilled' && pointsResponse.value.ok) {
        const pointsData = await pointsResponse.value.json()
        setPoints(pointsData.points || 0)
      } else {
        // API不存在时设置默认值
        setPoints(100) // 新用户默认100天机点
      }

      // 处理历史记录统计
      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        const statsData = await statsResponse.value.json()
        setRecordsCount(statsData.data?.totalCount || 0)
      } else {
        // API不存在时设置默认值
        setRecordsCount(0)
      }
    } catch (error) {
      // 网络错误时设置默认值
      setPoints(100)
      setRecordsCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 font-serif">
            登录
          </Button>
        </Link>
        <Link href="/auth/sign-up">
          <Button size="sm" className="bg-slate-800 dark:bg-slate-700 text-white font-serif">
            注册
          </Button>
        </Link>
      </div>
    )
  }

  const userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0] || '用户'
  const userInitials = userDisplayName.charAt(0).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2 font-serif">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-amber-100 text-amber-800 font-serif text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {userDisplayName}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isLoading ? '加载中...' : `${points || 0} 天机点`}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel className="font-serif">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-amber-100 text-amber-800 font-serif">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-slate-800 dark:text-slate-200">
                {userDisplayName}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {user.email}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* 快速统计 */}
        <div className="px-2 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-md mx-2 mb-2">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 font-serif">
                {isLoading ? '...' : points || 0}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-serif">
                天机点
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-700 dark:text-slate-300 font-serif">
                {isLoading ? '...' : recordsCount || 0}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-serif">
                历史记录
              </div>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* 功能菜单 */}
        <Link href="/history">
          <DropdownMenuItem className="font-serif cursor-pointer">
            <History className="mr-2 h-4 w-4" />
            <span>历史记录</span>
            {!isLoading && recordsCount !== null && recordsCount > 0 && (
              <span className="ml-auto text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {recordsCount}
              </span>
            )}
          </DropdownMenuItem>
        </Link>
        
        <Link href="/points">
          <DropdownMenuItem className="font-serif cursor-pointer">
            <Sparkles className="mr-2 h-4 w-4" />
            <span>天机点</span>
            <span className="ml-auto text-xs text-amber-600 dark:text-amber-400">
              {isLoading ? '...' : points || 0}
            </span>
          </DropdownMenuItem>
        </Link>
        
        <Link href="/profile">
          <DropdownMenuItem className="font-serif cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </DropdownMenuItem>
        </Link>
        
        <Link href="/settings">
          <DropdownMenuItem className="font-serif cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>设置</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="font-serif cursor-pointer text-red-600 dark:text-red-400"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}