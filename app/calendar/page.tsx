'use client'

import { FortuneCalendarMain } from '@/components/fortune-calendar/FortuneCalendarMain'

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-slate-900 dark:via-amber-900 dark:to-orange-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <FortuneCalendarMain isLoggedIn={false} hasPersonalInfo={false} />
        </div>
      </main>
    </div>
  )
}