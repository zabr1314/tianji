'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Smartphone, QrCode, ArrowLeft, CheckCircle, Gift } from 'lucide-react'

interface PaymentPackage {
  id: string
  name: string
  price: number
  basePoints: number
  bonusPoints: number
}

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  package: PaymentPackage | null
  onSuccess: (packageId: string, orderId: string) => void
}

const PAYMENT_METHODS = [
  {
    id: 'alipay',
    name: '支付宝',
    icon: Smartphone,
    description: '使用支付宝APP扫码支付',
    available: true
  },
  {
    id: 'wechat',
    name: '微信支付',
    icon: QrCode,
    description: '使用微信扫码支付',
    available: true
  },
  {
    id: 'demo',
    name: '演示支付',
    icon: CreditCard,
    description: '仅用于演示，模拟支付成功',
    available: true
  }
]

type PaymentStep = 'select' | 'processing' | 'success'

export function PaymentModal({ open, onOpenChange, package: pkg, onSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('select')
  const [orderId, setOrderId] = useState<string>('')
  const [, setProcessing] = useState(false)

  if (!pkg) return null

  const totalPoints = pkg.basePoints + pkg.bonusPoints

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
  }

  const handleProceedPayment = async () => {
    if (!selectedMethod) return

    setProcessing(true)
    setPaymentStep('processing')

    try {
      // 模拟创建订单
      const mockOrderId = `TJ${Date.now()}`
      setOrderId(mockOrderId)

      // 模拟支付处理
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 如果是演示支付，直接成功
      if (selectedMethod === 'demo') {
        setPaymentStep('success')
        // 模拟API调用更新用户天机点
        setTimeout(() => {
          onSuccess(pkg.id, mockOrderId)
          handleClose()
        }, 1500)
      } else {
        // 其他支付方式显示待开发提示
        alert('此支付方式暂未接入，请选择"演示支付"体验功能')
        setPaymentStep('select')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('支付处理失败，请重试')
      setPaymentStep('select')
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    setPaymentStep('select')
    setSelectedMethod(null)
    setOrderId('')
    setProcessing(false)
    onOpenChange(false)
  }

  const handleGoBack = () => {
    setPaymentStep('select')
    setSelectedMethod(null)
    setProcessing(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {paymentStep === 'select' && '选择支付方式'}
            {paymentStep === 'processing' && '正在处理支付'}
            {paymentStep === 'success' && '支付成功！'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {paymentStep === 'select' && `购买 ${pkg.name} - ¥${pkg.price}`}
            {paymentStep === 'processing' && '请稍候，正在处理您的支付...'}
            {paymentStep === 'success' && '恭喜您，充值已成功到账！'}
          </DialogDescription>
        </DialogHeader>

        {paymentStep === 'select' && (
          <div className="space-y-4">
            {/* 订单信息 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <CardDescription>订单详情</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>支付金额</span>
                  <span className="font-bold text-lg">¥{pkg.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>基础天机点</span>
                  <span>{pkg.basePoints} 点</span>
                </div>
                {pkg.bonusPoints > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="flex items-center">
                      <Gift className="w-4 h-4 mr-1" />
                      赠送天机点
                    </span>
                    <span>+{pkg.bonusPoints} 点</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center font-bold">
                  <span>总计获得</span>
                  <Badge variant="outline" className="text-primary">
                    {totalPoints} 天机点
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 支付方式选择 */}
            <div className="space-y-2">
              <p className="font-medium">选择支付方式</p>
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon
                return (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-all ${
                      selectedMethod === method.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => method.available && handlePaymentMethodSelect(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-6 w-6" />
                        <div className="flex-1">
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                        {selectedMethod === method.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Button 
              onClick={handleProceedPayment}
              disabled={!selectedMethod}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              立即支付 ¥{pkg.price}
            </Button>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="text-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">正在处理支付请求...</p>
            <p className="text-sm text-muted-foreground">订单号: {orderId}</p>
            <Button onClick={handleGoBack} variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-green-600">支付成功！</p>
              <p className="text-sm text-muted-foreground">
                您已成功充值 <span className="font-semibold">{totalPoints} 天机点</span>
              </p>
              <p className="text-xs text-muted-foreground">订单号: {orderId}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}