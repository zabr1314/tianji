'use client'

import { FortuneCalendarMain } from '@/components/fortune-calendar/FortuneCalendarMain'

export default function CalendarPage() {
  return (
    <div className="min-h-screen" style={{
      background: '#f0f9f0'
    }}>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <FortuneCalendarMain isLoggedIn={false} hasPersonalInfo={false} />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="font-serif">&copy; 2024 天机AI. 传统智慧，现代科技</p>
          </div>
        </div>
      </footer>
    </div>
  )
}