'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import HabitList from './HabitList'
import StatsView from './StatsView'

const TABS = [
    { tab: 'dashboard', icon: '🏠', label: '대시보드' },
    { tab: 'stats', icon: '📊', label: '통계' },
]

export default function MainLayout({ allHabitData, todayLabel, userId, userName, userImage }) {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [showUserMenu, setShowUserMenu] = useState(false)
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', transition: 'background 0.3s' }}>
            {/* ── 상단 네비바 ── */}
            <header className="responsive-header" style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'var(--surface)', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'background 0.3s, border-color 0.3s'
            }}>
                {/* 로고 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '9px',
                        background: 'linear-gradient(135deg, #FF6B35, #F59E0B)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px',
                    }}>🔥</div>
                    <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
                        Streaks
                    </span>
                </div>

                {/* 탭 */}
                <nav style={{ display: 'flex', gap: '4px' }}>
                    {TABS.map(({ tab, icon, label }) => {
                        const isActive = activeTab === tab
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '7px 16px', borderRadius: '9px',
                                    background: isActive ? 'var(--surface2, var(--border))' : 'transparent',
                                    color: isActive ? 'var(--text)' : 'var(--text-tertiary)',
                                    border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                                    fontSize: '14px', fontWeight: isActive ? 600 : 400,
                                    cursor: 'pointer', transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)' }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-tertiary)' }}
                            >
                                <span>{icon}</span>
                                {label}
                            </button>
                        )
                    })}
                </nav>

                {/* 우측 영역: 테마 토글 + 유저 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* 테마 토글 */}
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: 'transparent', border: '1px solid var(--border)',
                                color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                    )}

                    {/* 유저 영역 */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowUserMenu(v => !v)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '6px 10px 6px 6px', borderRadius: '20px',
                                background: 'transparent', border: '1px solid var(--border)',
                                cursor: 'pointer', transition: 'border-color 0.15s',
                            }}
                        >
                            {userImage ? (
                                <img src={userImage} alt={userName} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3B82F6, #A855F7)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0,
                                }}>{userName?.[0]?.toUpperCase() ?? 'U'}</div>
                            )}
                            <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {userName}
                            </span>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>▾</span>
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {showUserMenu && (
                            <>
                                {/* 바깥 클릭 닫기 */}
                                <div onClick={() => setShowUserMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                                <div style={{
                                    position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 100,
                                    background: 'var(--surface)', border: '1px solid var(--border)',
                                    borderRadius: '14px', padding: '8px',
                                    minWidth: '180px', boxShadow: '0 16px 32px rgba(0,0,0,0.15)',
                                }}>
                                    <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border)', marginBottom: '6px' }}>
                                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{userName}</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>계정</p>
                                    </div>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/login' })}
                                        style={{
                                            width: '100%', padding: '9px 12px', textAlign: 'left',
                                            background: 'transparent', border: 'none', borderRadius: '9px',
                                            color: 'var(--red)', fontSize: '13px', fontWeight: 500,
                                            cursor: 'pointer', transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--red-light)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ── 메인 콘텐츠 ── */}
            <main className="responsive-main" style={{ maxWidth: '960px', margin: '0 auto' }}>
                {activeTab === 'dashboard' && (
                    <>
                        <div style={{ marginBottom: '36px' }}>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                                오늘도 화이팅 🔥
                            </p>
                            <h1 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
                                내 습관
                            </h1>
                        </div>
                        <HabitList allHabitData={allHabitData} userId={userId} />
                    </>
                )}

                {activeTab === 'stats' && (
                    <>
                        <div style={{ marginBottom: '36px' }}>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                                나의 기록 📊
                            </p>
                            <h1 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
                                전체 통계
                            </h1>
                        </div>
                        <StatsView userId={userId} />
                    </>
                )}
            </main>
        </div>
    )
}
