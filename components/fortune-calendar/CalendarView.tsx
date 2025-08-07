'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FORTUNE_LEVELS, type DailyFortune } from '@/lib/types/fortune-calendar'

interface CalendarViewProps {
  year: number
  month: number
  dailyFortunes: DailyFortune[]
  onDateSelect: (date: string) => void
  selectedDate?: string
}

export function CalendarView({ 
  year, 
  month, 
  dailyFortunes, 
  onDateSelect, 
  selectedDate 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(year, month - 1))
  
  // 获取月份信息
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  
  // 获取当月的第一天和最后一天
  const firstDay = new Date(currentYear, currentMonth - 1, 1)
  const lastDay = new Date(currentYear, currentMonth, 0)
  const daysInMonth = lastDay.getDate()
  
  // 获取第一天是周几 (0=周日, 1=周一, ...)
  const firstDayOfWeek = firstDay.getDay()
  
  // 生成日历格子数据
  const calendarDays = []
  
  // 添加上月末尾几天 (灰色显示)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(firstDay)
    prevDate.setDate(prevDate.getDate() - i - 1)
    calendarDays.push({
      date: prevDate.getDate(),
      isCurrentMonth: false,
      dateString: prevDate.toISOString().split('T')[0]
    })
  }
  
  // 添加当月所有天
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    calendarDays.push({
      date: day,
      isCurrentMonth: true,
      dateString
    })
  }
  
  // 填满6周 (42天)
  const remainingCells = 42 - calendarDays.length
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(lastDay)
    nextDate.setDate(nextDate.getDate() + i)
    calendarDays.push({
      date: nextDate.getDate(),
      isCurrentMonth: false,
      dateString: nextDate.toISOString().split('T')[0]
    })
  }
  
  // 获取指定日期的运势
  const getFortune = (dateString: string) => {
    return dailyFortunes.find(f => f.date === dateString)
  }
  
  // 导航函数
  const navigateToPrevMonth = () => {
    const prevMonth = new Date(currentDate)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    setCurrentDate(prevMonth)
  }
  
  const navigateToNextMonth = () => {
    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setCurrentDate(nextMonth)
  }
  
  const navigateToToday = () => {
    setCurrentDate(new Date())
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="icon"
            onClick={navigateToPrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <CardTitle className="text-2xl font-serif">
            {currentYear}年{currentMonth}月
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={navigateToNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={navigateToToday}
            className="text-sm text-muted-foreground"
          >
            回到今天
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
            <div 
              key={day} 
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* 日历格子 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const fortune = getFortune(day.dateString)
            const fortuneLevel = fortune ? FORTUNE_LEVELS[fortune.level] : null
            const isSelected = selectedDate === day.dateString
            const isToday = day.dateString === new Date().toISOString().split('T')[0]
            
            return (
              <button
                key={index}
                onClick={() => onDateSelect(day.dateString)}
                className={`
                  relative p-1 sm:p-2 h-12 sm:h-16 text-xs sm:text-sm rounded-lg transition-all duration-200
                  hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 active:scale-95
                  ${day.isCurrentMonth 
                    ? 'text-foreground hover:bg-muted' 
                    : 'text-muted-foreground hover:bg-muted/50'
                  }
                  ${isSelected 
                    ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-950/20' 
                    : ''
                  }
                  ${isToday 
                    ? 'font-bold text-amber-600 dark:text-amber-400' 
                    : ''
                  }
                  ${fortuneLevel 
                    ? `${fortuneLevel.bgColor} ${fortuneLevel.borderColor} border` 
                    : 'hover:bg-muted'
                  }
                `}
              >
                {/* 日期数字 */}
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={`text-sm sm:text-base ${isToday ? 'font-bold' : ''}`}>
                    {day.date}
                  </span>
                  
                  {/* 运势标记 */}
                  {fortuneLevel && day.isCurrentMonth && (
                    <div className="mt-0.5 sm:mt-1">
                      <span className="text-xs">{fortuneLevel.emoji}</span>
                    </div>
                  )}
                </div>
                
                {/* 今天的特殊标记 */}
                {isToday && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
        
        {/* 运势说明 */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4 pt-4 border-t">
          {Object.entries(FORTUNE_LEVELS).map(([key, level]) => (
            <div key={key} className="flex items-center space-x-1 text-xs">
              <span>{level.emoji}</span>
              <span className="text-muted-foreground">{level.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}