'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DateSelectorProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
}

export function DateSelector({
  label,
  value,
  onChange,
  error,
  placeholder = '请选择日期',
  required = false
}: DateSelectorProps) {
  const currentYear = new Date().getFullYear()

  const handleYearChange = (year: string) => {
    const currentParts = value ? value.split('-') : ['', '', '']
    const newDate = `${year}-${currentParts[1] || '01'}-${currentParts[2] || '01'}`
    onChange(newDate)
  }

  const handleMonthChange = (month: string) => {
    const currentParts = value ? value.split('-') : ['', '', '']
    const newDate = `${currentParts[0] || currentYear}-${month}-${currentParts[2] || '01'}`
    onChange(newDate)
  }

  const handleDayChange = (day: string) => {
    const currentParts = value ? value.split('-') : ['', '', '']
    const newDate = `${currentParts[0] || currentYear}-${currentParts[1] || '01'}-${day}`
    onChange(newDate)
  }

  const monthNames = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      <div className="grid grid-cols-3 gap-2">
        {/* Year Selector */}
        <div>
          <Select 
            value={value ? value.split('-')[0] : ''} 
            onValueChange={handleYearChange}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder="年份" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({length: 80}, (_, i) => {
                const year = currentYear - i
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}年
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Month Selector */}
        <div>
          <Select 
            value={value ? value.split('-')[1] : ''} 
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder="月份" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({length: 12}, (_, i) => {
                const month = (i + 1).toString().padStart(2, '0')
                return (
                  <SelectItem key={month} value={month}>
                    {monthNames[i]}月
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Day Selector */}
        <div>
          <Select 
            value={value ? value.split('-')[2] : ''} 
            onValueChange={handleDayChange}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder="日期" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({length: 31}, (_, i) => {
                const day = (i + 1).toString().padStart(2, '0')
                return (
                  <SelectItem key={day} value={day}>
                    {i + 1}日
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        📅 请选择阳历（公历）日期
      </p>
    </div>
  )
}