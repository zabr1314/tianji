'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TimeSelectorProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
}

export function TimeSelector({
  label,
  value,
  onChange,
  error,
  placeholder = '请选择时间',
  required = false
}: TimeSelectorProps) {
  const handleHourChange = (hour: string) => {
    const newTime = `${hour}:00`
    onChange(newTime)
  }

  // 时辰对照表
  const timeRanges = [
    { hour: '23', name: '子时', range: '23:00-00:59' },
    { hour: '01', name: '丑时', range: '01:00-02:59' },
    { hour: '03', name: '寅时', range: '03:00-04:59' },
    { hour: '05', name: '卯时', range: '05:00-06:59' },
    { hour: '07', name: '辰时', range: '07:00-08:59' },
    { hour: '09', name: '巳时', range: '09:00-10:59' },
    { hour: '11', name: '午时', range: '11:00-12:59' },
    { hour: '13', name: '未时', range: '13:00-14:59' },
    { hour: '15', name: '申时', range: '15:00-16:59' },
    { hour: '17', name: '酉时', range: '17:00-18:59' },
    { hour: '19', name: '戌时', range: '19:00-20:59' },
    { hour: '21', name: '亥时', range: '21:00-22:59' },
  ]

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      <div>
        <Select 
          value={value ? value.split(':')[0] : ''} 
          onValueChange={handleHourChange}
        >
          <SelectTrigger className={error ? 'border-red-500' : ''}>
            <SelectValue placeholder="选择小时" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({length: 24}, (_, i) => {
              const hour = i.toString().padStart(2, '0')
              const timeRange = timeRanges.find(t => parseInt(t.hour) === i)
              return (
                <SelectItem key={hour} value={hour}>
                  {hour}时 {timeRange && `(${timeRange.name})`}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <div className="text-xs text-muted-foreground">
        <p>🕐 请选择准确的出生小时（24小时制）</p>
        <p>💡 括号中显示对应的传统时辰</p>
      </div>
    </div>
  )
}