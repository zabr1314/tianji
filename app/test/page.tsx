// 测试页面 - 验证基础部署是否正常
export default function TestPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎉 天机AI 部署测试成功！</h1>
      <p>当前时间: {new Date().toLocaleString()}</p>
      <p>环境变量测试:</p>
      <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
        <li>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已配置' : '❌ 缺失'}</li>
        <li>SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL || '❌ 缺失'}</li>
      </ul>
      <p style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: '#0070f3' }}>← 返回首页</a>
      </p>
    </div>
  )
}