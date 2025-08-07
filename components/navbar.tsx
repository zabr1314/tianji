'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/ui/user-menu'
import { createClient } from '@/lib/supabase/client'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsMobileMenuOpen(false)
  }

  // 主导航链接 - 包含所有主要服务
  const mainNavLinks = [
    { href: '/bazi', label: '八字分析' },
    { href: '/hepan', label: '合盘配对' },
    { href: '/bugua', label: '卜卦占卜' },
    { href: '/calendar', label: '运势日历' },
    { href: '/name', label: '姓名分析' },
    { href: '/dream', label: 'AI解梦' }
  ]

  // 用户功能链接 - 在移动端菜单显示
  const userNavLinks = [
    { href: '/history', label: '历史记录' },
    { href: '/points', label: '天机点' }
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-amber-600 dark:bg-amber-700 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-lg font-serif font-bold">天</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-200">
                天机AI
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">传统易学·智能分析</p>
            </div>
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden lg:flex items-center space-x-5">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-serif whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 中等屏幕简化导航 */}
          <nav className="hidden md:flex lg:hidden items-center space-x-4">
            <Link href="/bazi" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-serif">
              八字
            </Link>
            <Link href="/hepan" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-serif">
              合盘
            </Link>
            <Link href="/bugua" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-serif">
              卜卦
            </Link>
            <Link href="/calendar" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-serif">
              运势
            </Link>
          </nav>

          {/* 用户菜单和移动端菜单按钮 */}
          <div className="flex items-center space-x-3">
            <UserMenu user={user} onSignOut={handleSignOut} />
            
            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* 移动端和中等屏幕下拉菜单 */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
            <nav className="py-4 space-y-1">
              {/* 主要导航 */}
              <div className="space-y-1">
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-serif rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* 分隔线 */}
              <div className="border-t border-slate-200 dark:border-slate-700 my-3"></div>

              {/* 用户功能 */}
              <div className="space-y-1">
                <div className="px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-serif">
                  用户功能
                </div>
                {userNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-serif rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* 如果未登录，显示登录注册按钮 */}
              {!user && (
                <>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-3"></div>
                  <div className="px-3 space-y-2">
                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full font-serif">
                        登录
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-amber-600 hover:bg-amber-700 font-serif">
                        注册
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}