'use client'

export default function HepanPageTest() {
  console.log('HepanPageTest is rendering')
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'black', fontSize: '24px', marginBottom: '20px' }}>
        合盘分析测试页面
      </h1>
      <p style={{ color: 'black', fontSize: '16px', marginBottom: '10px' }}>
        如果您能看到这个页面，说明基本渲染是正常的。
      </p>
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '10px', 
        borderRadius: '4px',
        marginTop: '20px'
      }}>
        <p style={{ color: 'black' }}>
          当前时间: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  )
}