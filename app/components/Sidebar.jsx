'use client'

const NAV_ITEMS = [
    { icon: '🏠', label: '대시보드', tab: 'dashboard' },
    { icon: '📊', label: '통계', tab: 'stats' },
]

export default function Sidebar({ activeTab, onTabChange, todayLabel }) {
    return (
        <aside style={{
            width: '240px',
            flexShrink: 0,
            background: '#111113',
            borderRight: '1px solid #1E1E22',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 0',
            position: 'sticky',
            top: 0,
            height: '100vh',
        }}>
            {/* 로고 */}
            <div style={{ padding: '0 24px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                        Habit Tracker
                    </span>
                </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #1E1E22', margin: '0 24px 24px' }} />

            {/* 오늘 날짜 */}
            <div style={{ padding: '0 24px', marginBottom: '32px' }}>
                <p style={{ fontSize: '11px', color: '#48484A', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>오늘</p>
                <p style={{ fontSize: '13px', color: '#8E8E93', lineHeight: 1.5 }}>{todayLabel}</p>
            </div>

            {/* 네비 */}
            <nav style={{ padding: '0 12px', flex: 1 }}>
                {NAV_ITEMS.map(item => {
                    const isActive = activeTab === item.tab
                    return (
                        <div
                            key={item.tab}
                            onClick={() => onTabChange(item.tab)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
                                background: isActive ? '#1E1E22' : 'transparent',
                                cursor: 'pointer', transition: 'background 0.15s',
                                userSelect: 'none',
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#17171A' }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                        >
                            <span style={{ fontSize: '16px' }}>{item.icon}</span>
                            <span style={{ fontSize: '14px', color: isActive ? '#FFFFFF' : '#48484A', fontWeight: isActive ? 600 : 400 }}>
                                {item.label}
                            </span>
                        </div>
                    )
                })}
            </nav>

            {/* 하단 사용자 */}
            <div style={{ padding: '16px 24px 0', borderTop: '1px solid #1E1E22', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3B82F6, #A855F7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 700, color: '#fff',
                    }}>U</div>
                    <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>user_123</p>
                        <p style={{ fontSize: '11px', color: '#48484A' }}>열혈 습관러</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
