'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, CreditCard, Gift, Zap, Star } from 'lucide-react'
import { TianjiPointsCalculator } from '@/lib/tianji-points/calculator'
import { PaymentModal } from '@/components/payment/PaymentModal'

const RECHARGE_PACKAGES = [
  {
    id: 'starter',
    name: '入门套餐',
    price: 18,
    basePoints: 180,
    bonusPoints: 20,
    popular: false,
    features: ['基础八字分析', '简单运势查询', '基础姓名分析']
  },
  {
    id: 'popular',
    name: '热门套餐',
    price: 68,
    basePoints: 680,
    bonusPoints: 120,
    popular: true,
    features: ['完整八字分析', '详细运势预测', '全面姓名分析', 'AI智能解读']
  },
  {
    id: 'premium',
    name: '专业套餐',
    price: 188,
    basePoints: 1880,
    bonusPoints: 420,
    popular: false,
    features: ['专业八字分析', '全年运势规划', '深度姓名分析', 'AI个性化建议', '优先客服支持']
  },
  {
    id: 'vip',
    name: 'VIP套餐',
    price: 588,
    basePoints: 5880,
    bonusPoints: 1520,
    popular: false,
    features: ['VIP专属分析', '终身运势追踪', '专家级解读', '一对一咨询', '全服务免费使用']
  }
]

export default function PointsPage() {
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handlePurchase = (packageData: any) => {
    setSelectedPackage(packageData)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (packageId: string, orderId: string) => {
    alert(`支付成功！订单号: ${orderId}\n天机点已充值到您的账户`)
    setShowPaymentModal(false)
    setSelectedPackage(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* 页面介绍 */}
          <section className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              天机点充值中心
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
              天机点是天机AI平台的虚拟货币，用于购买各种命理分析服务。
              充值即享受额外天机点赠送，让您的探索之旅更加丰富。
            </p>
            <div className="flex justify-center items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>1元 = 10天机点</span>
              </div>
              <div className="flex items-center space-x-2">
                <Gift className="h-4 w-4" />
                <span>充值越多赠送越多</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>支持多种支付方式</span>
              </div>
            </div>
          </section>

          {/* 套餐选择 */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8">选择充值套餐</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {RECHARGE_PACKAGES.map((pkg) => {
                const totalPoints = pkg.basePoints + pkg.bonusPoints
                const bonusRate = Math.round((pkg.bonusPoints / pkg.basePoints) * 100)
                
                return (
                  <Card 
                    key={pkg.id} 
                    className={`relative hover:shadow-lg transition-all duration-300 ${
                      pkg.popular 
                        ? 'border-primary shadow-md scale-105' 
                        : 'hover:scale-102'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          最受欢迎
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                      <div className="text-3xl font-bold text-primary mt-2">
                        ¥{pkg.price}
                      </div>
                      <CardDescription className="text-lg">
                        获得 <span className="font-semibold text-primary">{totalPoints}</span> 天机点
                      </CardDescription>
                      {pkg.bonusPoints > 0 && (
                        <Badge variant="secondary" className="mx-auto mt-2">
                          <Gift className="w-3 h-3 mr-1" />
                          额外赠送 {pkg.bonusPoints} 点 (+{bonusRate}%)
                        </Badge>
                      )}
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        className={`w-full ${
                          pkg.popular 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                            : ''
                        }`}
                        onClick={() => handlePurchase(pkg)}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        立即购买
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* 服务价格表 */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8">服务价格表</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                    个人八字分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">200 天机点</div>
                  <p className="text-muted-foreground text-sm">
                    包含完整的四柱排盘、五行分析、大运推算和AI智能解读
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-pink-600" />
                    八字合盘分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">300 天机点</div>
                  <p className="text-muted-foreground text-sm">
                    分析两人八字配对指数，感情运势和相处建议
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                    日常卜卦
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">150 天机点</div>
                  <p className="text-muted-foreground text-sm">
                    针对具体问题进行周易卜算，获得指导建议
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-green-600" />
                    运势日历
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">100 天机点</div>
                  <p className="text-muted-foreground text-sm">
                    每日个性化运势预测，把握最佳时机
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-orange-600" />
                    姓名分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">120 天机点</div>
                  <p className="text-muted-foreground text-sm">
                    姓名五行配置分析和改名建议
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-indigo-600" />
                    AI解梦
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">80 天机点</div>
                  <p className="text-muted-foreground text-sm">
                    人工智能解析梦境含义和潜在信息
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 购买须知 */}
          <section>
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>购买须知</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">关于天机点</h4>
                    <ul className="space-y-1">
                      <li>• 天机点是天机AI平台的虚拟货币</li>
                      <li>• 1元人民币 = 10天机点</li>
                      <li>• 充值越多，赠送的额外天机点越多</li>
                      <li>• 新用户注册即送300天机点</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">退款政策</h4>
                    <ul className="space-y-1">
                      <li>• 充值完成后1小时内可申请全额退款</li>
                      <li>• 已使用的天机点不可退款</li>
                      <li>• 退款将在3-5个工作日内到账</li>
                      <li>• 如有问题请联系客服处理</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 天机AI. 安全支付，值得信赖</p>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        package={selectedPackage}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}