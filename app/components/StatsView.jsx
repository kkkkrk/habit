'use client'

import { useState, useEffect } from 'react'
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import HabitHeatmap from './HabitHeatmap'


const COLORS = [
    '#FF6B35', '#A855F7', '#3B82F6', '#10B981',
    '#F59E0B', '#EF4444', '#06B6D4', '#EC4899',
    '#84CC16', '#F97316',
]
const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토']

/* ── 서브 컴포넌트 ── */
function StatBadge({ label, value, color }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '16px 20px', gap: '4px', flex: 1,
            transition: 'background 0.3s',
        }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: color ?? 'var(--text)' }}>{value}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
        </div>
    )
}

function StreakFlame({ count }) {
    if (count === 0) return null
    const fontSize = count >= 30 ? '28px' : count >= 7 ? '22px' : '18px'
    return <span style={{ fontSize, lineHeight: 1 }}>🔥</span>
}

function SectionTitle({ children }) {
    return (
        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>
            {children}
        </p>
    )
}

const tooltipStyle = {
    contentStyle: { background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '12px' },
    labelStyle: { color: 'var(--text-secondary)' },
    itemStyle: { color: 'var(--text)' },
    cursor: { fill: 'var(--surface2, rgba(128,128,128,0.1))' },
}

/* ── 메인 ── */
export default function StatsView({ userId }) {
    const [summary, setSummary] = useState([])
    const [allLogs, setAllLogs] = useState([])       // 전체 히트맵 데이터 (date, count)
    const [habitStats, setHabitStats] = useState({})
    const [expandedHabit, setExpandedHabit] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAll()
    }, [])

    const fetchAll = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/habit/summary?userId=${userId}`)
            if (!res.ok) return
            const data = await res.json()
            setSummary(data)
            // 모든 습관 stats 병렬 로드 → 그래프 즉시 표시
            const statsResults = await Promise.all(
                data.map(item =>
                    fetch(`/api/habit/stats?userId=${userId}&habitName=${encodeURIComponent(item.habitName)}`)
                        .then(r => r.ok ? r.json() : [])
                        .then(logs => ({ id: item.habitId, logs }))
                )
            )
            const statsMap = {}
            statsResults.forEach(({ id, logs }) => { statsMap[id] = logs })
            setHabitStats(statsMap)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const toggleHeatmap = (item) => {
        const id = item.habitId
        setExpandedHabit(prev => ({ ...prev, [id]: !prev[id] }))
    }

    /* ── 차트용 데이터 가공 ── */


    // 최근 30일 일별 체크 합계
    const last30Data = (() => {
        const map = {}
        Object.values(habitStats).forEach(logs => {
            ; (logs || []).forEach(({ date, count }) => { map[date] = (map[date] || 0) + count })
        })
        const result = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            result.push({ date: ds, label: `${d.getMonth() + 1}/${d.getDate()}`, count: map[ds] || 0 })
        }
        return result
    })()

    // 요일별 평균 (0=일 ~ 6=토)
    const weekdayAvg = (() => {
        const sums = Array(7).fill(0)
        const cnts = Array(7).fill(0)
        Object.values(habitStats).forEach(logs => {
            ; (logs || []).forEach(({ date, count }) => {
                const dow = new Date(date).getDay()
                sums[dow] += count
                cnts[dow]++
            })
        })
        return DAYS_KO.map((d, i) => ({ day: d, avg: cnts[i] ? +(sums[i] / cnts[i]).toFixed(1) : 0 }))
    })()

    // 전체 히트맵 합산 (habitStats에서)
    const allHabitLogsForHeatmap = (() => {
        const map = {}
        Object.values(habitStats).forEach(logs => {
            ; (logs || []).forEach(({ date, count }) => { map[date] = (map[date] || 0) + count })
        })
        return Object.entries(map).map(([date, count]) => ({ date, count }))
    })()

    const hasChartData = Object.keys(habitStats).length > 0

    const totalChecks = summary.reduce((s, h) => s + h.totalCount, 0)
    const maxStreak = summary.reduce((m, h) => Math.max(m, h.bestStreak), 0)
    const activeToday = summary.filter(h => h.currentStreak > 0).length

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '16px' }}>불러오는 중...</p>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* ── 요약 카드 ── */}
            <div className="responsive-stats-grid" style={{ display: 'grid', gap: '12px' }}>
                <StatBadge label="총 체크 횟수" value={totalChecks.toLocaleString()} color="#10B981" />
                <StatBadge label="등록 습관" value={`${summary.length}개`} color="#3B82F6" />
                <StatBadge label="최고 연속" value={`${maxStreak}일`} color="#F59E0B" />
                <StatBadge label="스트릭 진행" value={`${activeToday}개`} color="#A855F7" />
            </div>

            {/* ── 그래프 섹션 ── */}
            {hasChartData && (
                <div className="responsive-stats-charts" style={{ display: 'grid', gap: '16px' }}>

                    {/* 최근 30일 바 차트 */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 24px', transition: 'background 0.3s' }}>
                        <SectionTitle>최근 30일 체크 횟수</SectionTitle>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={last30Data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
                                    tickLine={false} axisLine={false}
                                    interval={4}
                                />
                                <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} tickLine={false} axisLine={false} />
                                <Tooltip {...tooltipStyle} formatter={(v) => [v + '회', '체크']} />
                                <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 요일별 평균 바 차트 */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 24px', transition: 'background 0.3s' }}>
                        <SectionTitle>요일별 평균 체크</SectionTitle>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={weekdayAvg} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="day" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} tickLine={false} axisLine={false} />
                                <Tooltip {...tooltipStyle} formatter={(v) => [v + '회', '평균']} />
                                <Bar dataKey="avg" fill="#A855F7" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 전체 활동 라인 차트 (30일) */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 24px', gridColumn: '1 / -1', transition: 'background 0.3s' }}>
                        <SectionTitle>최근 30일 누적 추이</SectionTitle>
                        <ResponsiveContainer width="100%" height={160}>
                            <LineChart data={last30Data} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="label" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                                <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} tickLine={false} axisLine={false} />
                                <Tooltip {...tooltipStyle} formatter={(v) => [v + '회', '합계']} />
                                <Line
                                    type="monotone" dataKey="count"
                                    stroke="#10B981" strokeWidth={2}
                                    dot={false} activeDot={{ r: 4, fill: '#10B981' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {!hasChartData && summary.length > 0 && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', textAlign: 'center', transition: 'background 0.3s' }}>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
                        아래 습관 카드에서 <strong style={{ color: 'var(--text-secondary)' }}>히트맵 보기</strong>를 열면 그래프가 표시됩니다
                    </p>
                </div>
            )}

            {/* ── 습관별 카드 ── */}
            {summary.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '64px 32px',
                    background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)',
                }}>
                    <div style={{ fontSize: '56px', marginBottom: '16px' }}>📊</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.8 }}>
                        아직 습관 데이터가 없어요.<br />대시보드에서 습관을 추가해보세요!
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <SectionTitle>습관별 상세</SectionTitle>
                    {summary.map((item, idx) => {
                        const hash = item.habitId ? item.habitId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : idx
                        const color = COLORS[hash % COLORS.length]
                        const isExpanded = !!expandedHabit[item.habitId]

                        // 이 습관의 최근 30일 바 차트 데이터
                        const habitChart = (() => {
                            const logs = habitStats[item.habitId] || []
                            const map = {}
                            logs.forEach(({ date, count }) => { map[date] = count })
                            const result = []
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            for (let i = 29; i >= 0; i--) {
                                const d = new Date(today)
                                d.setDate(d.getDate() - i)
                                const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                                result.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, count: map[ds] || 0 })
                            }
                            return result
                        })()

                        return (
                            <div key={item.habitId} style={{
                                background: 'var(--surface)', border: `1px solid ${color}33`,
                                borderRadius: '20px', overflow: 'hidden', transition: 'background 0.3s'
                            }}>
                                {/* 카드 헤더 */}
                                <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '11px',
                                        background: color + '22', border: `1px solid ${color}55`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <span style={{ fontSize: '18px', fontWeight: 700, color }}>{item.habitName[0]?.toUpperCase()}</span>
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.habitName}
                                            </p>
                                            <StreakFlame count={item.currentStreak} />
                                        </div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                            총 <span style={{ color, fontWeight: 600 }}>{item.totalCount}회</span> 완료
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ fontSize: '20px', fontWeight: 700, color: item.currentStreak > 0 ? '#F59E0B' : 'var(--border)' }}>{item.currentStreak}</p>
                                            <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>현재</p>
                                        </div>
                                        <div style={{ width: '1px', background: 'var(--border)', margin: '4px 0' }} />
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ fontSize: '20px', fontWeight: 700, color: '#A855F7' }}>{item.bestStreak}</p>
                                            <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>최고</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleHeatmap(item)}
                                        style={{
                                            padding: '7px 14px', fontSize: '12px', fontWeight: 600,
                                            background: isExpanded ? color + '22' : 'var(--border)',
                                            color: isExpanded ? color : 'var(--text-tertiary)',
                                            border: `1px solid ${isExpanded ? color + '55' : 'var(--border)'}`,
                                            borderRadius: '9px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                                        }}
                                    >
                                        {isExpanded ? '닫기' : '상세 보기'}
                                    </button>
                                </div>

                                {/* 상세 영역: 미니 바 차트 + 히트맵 */}
                                {isExpanded && (
                                    <div style={{ borderTop: `1px solid ${color}22`, padding: '16px 22px 20px', background: color + '06' }}>
                                        {habitStats[item.habitId] ? (
                                            <>
                                                {/* 미니 바 차트 */}
                                                <p style={{ fontSize: '11px', color: color, fontWeight: 600, marginBottom: '10px', letterSpacing: '0.04em' }}>
                                                    최근 30일
                                                </p>
                                                <ResponsiveContainer width="100%" height={90}>
                                                    <BarChart data={habitChart} margin={{ top: 2, right: 4, left: -32, bottom: 0 }}>
                                                        <XAxis dataKey="label" tick={{ fill: 'var(--text-tertiary)', fontSize: 9 }} tickLine={false} axisLine={false} interval={4} />
                                                        <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 9 }} tickLine={false} axisLine={false} />
                                                        <Tooltip {...tooltipStyle} formatter={(v) => [v + '회', item.habitName]} />
                                                        <Bar dataKey="count" fill={color} radius={[3, 3, 0, 0]} maxBarSize={14} />
                                                    </BarChart>
                                                </ResponsiveContainer>

                                                {/* 히트맵 */}
                                                <p style={{ fontSize: '11px', color: color, fontWeight: 600, margin: '14px 0 10px', letterSpacing: '0.04em' }}>
                                                    최근 1년 히트맵
                                                </p>
                                                <div style={{ overflowX: 'auto' }}>
                                                    <HabitHeatmap data={habitStats[item.habitId]} compact={true} accentColor={color} />
                                                </div>
                                            </>
                                        ) : (
                                            <p style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>불러오는 중...</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
