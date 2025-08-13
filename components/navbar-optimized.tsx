'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserMenuOptimized } from '@/components/ui/user-menu-optimized'
import { createClient } from '@/lib/supabase/client'
import { Menu, X } from 'lucide-react'

// 优化：将静态数据移出组件，避免每次渲染重新创建
const MAIN_NAV_LINKS = [
  { href: '/bazi', label: '八字分析' },
  { href: '/hepan', label: '合盘配对' },
  { href: '/bugua', label: '卜卦占卜' },
  { href: '/calendar', label: '运势日历' },
  { href: '/name', label: '姓名分析' },
  { href: '/dream', label: 'AI解梦' }
] as const

const USER_NAV_LINKS = [
  { href: '/history', label: '历史记录' },
  { href: '/points', label: '天机点' }
] as const

// 优化：分离导航链接组件
const NavLink = memo(({ href, label, onClick }: {
  href: string
  label: string
  onClick?: () => void
}) => (
  <Link 
    href={href} 
    onClick={onClick}
    className="text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 font-serif transition-colors duration-200"
  >
    {label}
  </Link>
))

NavLink.displayName = 'NavLink'

// 优化：分离移动端菜单
const MobileMenu = memo(({ 
  isOpen, 
  onClose, 
  user, 
  onSignOut 
}: {
  isOpen: boolean
  onClose: () => void
  user: any
  onSignOut: () => void
}) => {
  if (!isOpen) return null

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        {/* 主导航链接 */}
        <div className="space-y-2 mb-4">
          {MAIN_NAV_LINKS.map((link) => (
            <NavLink 
              key={link.href}
              href={link.href} 
              label={link.label}
              onClick={onClose}
            />
          ))}
        </div>

        {/* 用户链接 */}
        {user && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
            {USER_NAV_LINKS.map((link) => (
              <NavLink 
                key={link.href}
                href={link.href} 
                label={link.label}
                onClick={onClose}
              />
            ))}
            <Button
              variant="outline"
              onClick={onSignOut}
              className="w-full text-left justify-start font-serif"
            >
              退出登录
            </Button>
          </div>
        )}

        {/* 未登录状态 */}
        {!user && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
            <Link href="/auth/login" onClick={onClose}>
              <Button variant="outline" className="w-full font-serif">
                登录
              </Button>
            </Link>
            <Link href="/auth/sign-up" onClick={onClose}>
              <Button className="w-full bg-amber-600 hover:bg-amber-700 font-serif">
                注册
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
})

MobileMenu.displayName = 'MobileMenu'

export const NavbarOptimized = memo(({ initialUser }: { initialUser: any }) => {
  const [user, setUser] = useState<any>(initialUser)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // 优化：创建单例supabase客户端
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let mounted = true

    // 只在没有初始用户时才重新获取，或者用于验证服务器端状态
    async function getUser() {
      if (!initialUser) {
        const { data: { user } } = await supabase.auth.getUser()
        if (mounted) {
          setUser(user)
        }
      }
    }
    
    getUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setUser(session?.user || null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, initialUser])

  // 优化：使用useCallback避免重新创建函数
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsMobileMenuOpen(false)
  }, [supabase])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-amber-600 dark:bg-amber-700 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                <span className="text-white text-sm font-serif font-bold">天</span>
              </div>
              <span className="text-xl font-serif font-bold text-slate-800 dark:text-slate-200">
                天机AI
              </span>
            </Link>
          </div>

          {/* 桌面端导航 */}
          <div className="hidden md:flex items-center space-x-8">
            {MAIN_NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </div>

          {/* 右侧按钮 */}
          <div className="flex items-center space-x-4">
            {user ? (
              <UserMenuOptimized user={user} onSignOut={handleSignOut} />
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" className="font-serif">
                    登录
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button className="bg-amber-600 hover:bg-amber-700 font-serif">
                    注册
                  </Button>
                </Link>
              </div>
            )}

            {/* 移动端菜单按钮 */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="text-slate-600 dark:text-slate-400"
                aria-label="菜单"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        user={user}
        onSignOut={handleSignOut}
      />
    </nav>
  )
})

NavbarOptimized.displayName = 'NavbarOptimized'

// 为了向后兼容，导出一个默认的Navbar (使用默认参数)
const NavbarDefault = memo(() => <NavbarOptimized initialUser={null} />)
NavbarDefault.displayName = 'Navbar'
export const Navbar = NavbarDefault