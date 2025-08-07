'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CitySelectorProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
}

export function CitySelector({
  label,
  value,
  onChange,
  error,
  placeholder = '请选择城市',
  required = false
}: CitySelectorProps) {
  // 中国主要城市列表（按省份分组）
  const cities = [
    // 直辖市
    { province: '直辖市', cities: ['北京市', '上海市', '天津市', '重庆市'] },
    
    // 省会城市和主要城市
    { province: '华北地区', cities: ['石家庄市', '太原市', '呼和浩特市'] },
    { province: '东北地区', cities: ['沈阳市', '大连市', '长春市', '吉林市', '哈尔滨市', '齐齐哈尔市'] },
    { province: '华东地区', cities: ['南京市', '苏州市', '无锡市', '杭州市', '宁波市', '温州市', '合肥市', '福州市', '厦门市', '南昌市', '济南市', '青岛市', '烟台市'] },
    { province: '华中地区', cities: ['郑州市', '洛阳市', '武汉市', '长沙市'] },
    { province: '华南地区', cities: ['广州市', '深圳市', '珠海市', '佛山市', '东莞市', '中山市', '南宁市', '海口市', '三亚市'] },
    { province: '西南地区', cities: ['成都市', '绵阳市', '贵阳市', '昆明市', '大理市', '丽江市', '拉萨市'] },
    { province: '西北地区', cities: ['西安市', '兰州市', '西宁市', '银川市', '乌鲁木齐市'] },
    
    // 港澳台
    { province: '港澳台', cities: ['香港', '澳门', '台北市', '高雄市'] },
  ]

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {cities.map((group) => (
            <div key={group.province}>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                {group.province}
              </div>
              {group.cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        🏙️ 请选择准确的出生城市，影响时区和地理位置计算
      </p>
    </div>
  )
}