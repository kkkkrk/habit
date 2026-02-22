'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HabitHeatmap from './HabitHeatmap'



const COLORS = [
    '#FF6B35', '#A855F7', '#3B82F6', '#10B981',
    '#F59E0B', '#EF4444', '#06B6D4', '#EC4899',
    '#84CC16', '#F97316',
]

function RingProgress({ progress, color, size = 80, strokeWidth = 6 }) {
    const r = (size - strokeWidth) / 2
    const circ = 2 * Math.PI * r
    const dash = circ * Math.min(progress, 1)
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
            {progress > 0 && (
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.4s ease' }} />
            )}
        </svg>
    )
}

export default function HabitList({ allHabitData = [], userId }) {
    const router = useRouter()
    const [habits, setHabits] = useState([])
    const [checkedToday, setCheckedToday] = useState({})
    const [loadingCheck, setLoadingCheck] = useState({})
    const [showInput, setShowInput] = useState(false)
    const [newHabitName, setNewHabitName] = useState('')
    const [addLoading, setAddLoading] = useState(false)
    const [addError, setAddError] = useState('')
    const [expandedHabit, setExpandedHabit] = useState({})
    const [habitStats, setHabitStats] = useState({})
    const [statsLoading, setStatsLoading] = useState({})
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [draggedIdx, setDraggedIdx] = useState(null)

    const loadHabits = async () => {
        try {
            const res = await fetch(`/api/habits?userId=${userId}`)
            if (res.ok) setHabits(await res.json())
        } catch (e) { console.error(e) }
    }

    const loadTodayChecks = async () => {
        try {
            const res = await fetch(`/api/habit/today?userId=${userId}`)
            if (res.ok) setCheckedToday(await res.json())
        } catch (e) { }
    }

    useEffect(() => { loadHabits() }, [])
    useEffect(() => { if (habits.length > 0) loadTodayChecks() }, [habits])

    const handleAddHabit = async () => {
        if (!newHabitName.trim()) { setAddError('이름을 입력해주세요.'); return }
        setAddLoading(true); setAddError('')
        try {
            const res = await fetch('/api/habits', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId, name: newHabitName.trim() }),
            })
            if (res.ok) { setNewHabitName(''); setShowInput(false); await loadHabits() }
            else { const d = await res.json(); setAddError(d.error || '추가 실패') }
        } catch { setAddError('네트워크 오류') }
        finally { setAddLoading(false) }
    }

    const handleCheck = async (habit) => {
        setLoadingCheck(prev => ({ ...prev, [habit._id]: true }))
        try {
            const res = await fetch('/api/habit', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId, habitName: habit.name }),
            })
            const data = await res.json()
            if (res.ok) {
                setCheckedToday(prev => ({ ...prev, [habit.name]: data.count }))
                router.refresh()
                if (expandedHabit[habit._id]) loadHabitStats(habit, true)
            }
        } catch (e) { console.error(e) }
        finally { setLoadingCheck(prev => ({ ...prev, [habit._id]: false })) }
    }

    const loadHabitStats = async (habit, force = false) => {
        if (habitStats[habit._id] && !force) return
        setStatsLoading(prev => ({ ...prev, [habit._id]: true }))
        try {
            const res = await fetch(`/api/habit/stats?userId=${userId}&habitName=${encodeURIComponent(habit.name)}`)
            if (res.ok) {
                const data = await res.json()
                setHabitStats(prev => ({ ...prev, [habit._id]: data }))
            }
        } catch (e) { console.error(e) }
        finally { setStatsLoading(prev => ({ ...prev, [habit._id]: false })) }
    }

    const toggleStats = (habit) => {
        if (!expandedHabit[habit._id]) loadHabitStats(habit)
        setExpandedHabit(prev => ({ ...prev, [habit._id]: !prev[habit._id] }))
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            const res = await fetch('/api/habits', {
                method: 'DELETE', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ habitId: deleteTarget._id }),
            })
            if (res.ok) setHabits(prev => prev.filter(h => h._id !== deleteTarget._id))
        } catch (e) { console.error(e) }
        finally { setDeleteTarget(null) }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleAddHabit()
        if (e.key === 'Escape') { setShowInput(false); setNewHabitName(''); setAddError('') }
    }

    const totalCount = allHabitData.reduce((s, d) => s + d.count, 0)
    const doneCount = habits.filter(h => (checkedToday[h.name] ?? 0) > 0).length

    return (
        <div>
            {deleteTarget && (
                <div onClick={() => setDeleteTarget(null)} style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.65)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)',
                }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: 'var(--surface-hover)', border: '1px solid var(--border)',
                        borderRadius: '20px', padding: '32px 28px', width: '320px',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
                        display: 'flex', flexDirection: 'column', gap: '20px',
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗑️</div>
                            <p style={{ color: 'var(--text)', fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>습관 삭제</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                                <span style={{ color: 'var(--text)', fontWeight: 600 }}>"{deleteTarget.name}"</span><br />
                                습관과 모든 기록이 삭제됩니다.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setDeleteTarget(null)} style={{
                                flex: 1, padding: '12px', fontSize: '14px', fontWeight: 600,
                                background: 'var(--border)', color: 'var(--text-secondary)',
                                border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer',
                            }}>취소</button>
                            <button onClick={handleDelete} style={{
                                flex: 1, padding: '12px', fontSize: '14px', fontWeight: 600,
                                background: 'var(--red)', color: '#FFFFFF',
                                border: 'none', borderRadius: '12px', cursor: 'pointer',
                            }}>삭제</button>
                        </div>
                    </div>
                </div>
            )}
            {/* ── 통계 카드 row ── */}
            <div className="responsive-stats-grid" style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
                {[
                    { label: '오늘 완료', value: `${doneCount} / ${habits.length}`, sub: '개 습관', color: '#10B981' },
                    { label: '누적 기록', value: totalCount.toLocaleString(), sub: '회 완료', color: '#3B82F6' },
                    { label: '등록 습관', value: habits.length, sub: '개', color: '#A855F7' },
                ].map(card => (
                    <div key={card.label} style={{
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: '16px', padding: '20px 24px', transition: 'background 0.3s'
                    }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>
                            {card.label}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontSize: '32px', fontWeight: 700, color: card.color, letterSpacing: '-0.5px' }}>
                                {card.value}
                            </span>
                            <span style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>{card.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── 전체 히트맵 ── */}
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '24px 28px', marginBottom: '32px',
                overflowX: 'auto', transition: 'background 0.3s'
            }}>
                <HabitHeatmap data={allHabitData} compact={false} />
            </div>

            {/* ── 습관 섹션 헤더 ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>오늘의 습관</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '2px' }}>카드를 클릭하면 체크됩니다</p>
                </div>
                <button
                    onClick={() => { setShowInput(true); setAddError('') }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '10px',
                        background: '#FF6B35', color: '#FFFFFF',
                        border: 'none', fontSize: '14px', fontWeight: 600,
                        cursor: 'pointer', transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                    + 습관 추가
                </button>
            </div>

            {/* ── 새 습관 입력 폼 ── */}
            {showInput && (
                <div style={{
                    display: 'flex', gap: '10px', marginBottom: '20px',
                    padding: '16px 20px', background: 'var(--surface)', borderRadius: '14px',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                }}>
                    <input autoFocus type="text" value={newHabitName}
                        onChange={e => setNewHabitName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="새 습관 이름 (Enter로 저장, Esc로 취소)"
                        maxLength={30}
                        style={{
                            flex: 1, padding: '10px 14px', fontSize: '15px',
                            background: 'var(--bg)', border: '1px solid var(--border)',
                            borderRadius: '10px', color: 'var(--text)', outline: 'none',
                        }}
                    />
                    <button onClick={handleAddHabit} disabled={addLoading}
                        style={{
                            padding: '10px 20px', fontSize: '14px', fontWeight: 600,
                            background: addLoading ? 'var(--border)' : 'var(--accent)',
                            color: '#FFFFFF', border: 'none', borderRadius: '10px',
                            cursor: addLoading ? 'not-allowed' : 'pointer',
                        }}
                    >{addLoading ? '저장 중...' : '저장'}</button>
                    <button onClick={() => { setShowInput(false); setNewHabitName(''); setAddError('') }}
                        style={{
                            padding: '10px 16px', fontSize: '14px', fontWeight: 600,
                            background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)',
                            borderRadius: '10px', cursor: 'pointer',
                        }}
                    >취소</button>
                    {addError && <span style={{ color: 'var(--red)', fontSize: '13px', alignSelf: 'center' }}>{addError}</span>}
                </div>
            )}

            {/* ── 빈 상태 ── */}
            {habits.length === 0 && !showInput && (
                <div style={{
                    textAlign: 'center', padding: '64px 32px',
                    background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)',
                }}>
                    <div style={{ fontSize: '56px', marginBottom: '16px' }}>🌱</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.8 }}>
                        아직 습관이 없어요.<br />"+ 습관 추가" 버튼으로 시작해보세요!
                    </p>
                </div>
            )}

            {/* ── 습관 카드 그리드 ── */}
            <div className="responsive-grid" style={{
                display: 'grid',
                gap: '16px',
            }}>
                {habits.map((habit, idx) => {
                    const hash = habit._id ? habit._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : idx
                    const color = COLORS[hash % COLORS.length]
                    const count = checkedToday[habit.name] ?? 0
                    const done = count > 0
                    const isLoading = !!loadingCheck[habit._id]
                    const isExpanded = !!expandedHabit[habit._id]

                    return (
                        <div key={habit._id}
                            draggable
                            onDragStart={(e) => { setDraggedIdx(idx); e.dataTransfer.effectAllowed = 'move'; }}
                            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                            onDrop={(e) => {
                                e.preventDefault()
                                if (draggedIdx === null || draggedIdx === idx) return
                                const newHabits = [...habits]
                                // 기존: 드래그한 카드를 빼서(splice) 현재 인덱스에 넣음 (나머지가 밀림)
                                // 변경: 두 카드의 위치를 서로 맞바꿈 (swap)
                                const temp = newHabits[draggedIdx]
                                newHabits[draggedIdx] = newHabits[idx]
                                newHabits[idx] = temp
                                setHabits(newHabits)
                                setDraggedIdx(null)

                                fetch('/api/habits/reorder', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId, orderedIds: newHabits.map(h => h._id) })
                                }).catch(console.error)
                            }}
                            onDragEnd={() => setDraggedIdx(null)}
                            style={{ opacity: draggedIdx === idx ? 0.4 : 1, transition: 'opacity 0.2s' }}
                        >
                            {/* 습관 카드 */}
                            <div
                                onClick={() => !isLoading && handleCheck(habit)}
                                className={done ? 'habit-card-done' : 'habit-card'}
                                style={{
                                    background: done ? `${color}14` : 'var(--surface)',
                                    border: `1px solid ${done ? color + '44' : 'var(--border)'}`,
                                    borderRadius: '20px',
                                    padding: '24px 20px',
                                    cursor: isLoading ? 'wait' : 'pointer',
                                    transition: 'all 0.25s ease, border-color 0.2s',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                                    position: 'relative', overflow: 'hidden',
                                    userSelect: 'none',
                                }}
                                onMouseEnter={e => {
                                    if (!done) e.currentTarget.style.borderColor = color + '44';
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                }}
                                onMouseLeave={e => {
                                    if (!done) e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.transform = 'translateY(0)'
                                }}
                            >
                                {/* 링 + 아이콘 */}
                                <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                                    <RingProgress progress={done ? 1 : 0} color={color} size={80} strokeWidth={6} />
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: done ? '28px' : '22px',
                                        fontWeight: 700,
                                        color: done ? color : 'var(--text-tertiary)',
                                        transition: 'all 0.3s',
                                    }}>
                                        {done ? '✓' : habit.name[0]?.toUpperCase()}
                                    </div>
                                </div>

                                {/* 이름 */}
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{
                                        fontSize: '14px', fontWeight: 600,
                                        color: done ? 'var(--text)' : 'var(--text-secondary)',
                                        maxWidth: '140px', overflow: 'hidden',
                                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {habit.name}
                                    </p>
                                    {done ? (
                                        <p style={{ fontSize: '12px', color: color, marginTop: '4px', fontWeight: 600 }}>
                                            {count}회 완료 ✓
                                        </p>
                                    ) : (
                                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                            클릭해서 체크
                                        </p>
                                    )}
                                </div>

                                {isLoading && (
                                    <div style={{
                                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: '20px', fontSize: '22px',
                                    }}>⏳</div>
                                )}
                            </div>

                            {/* 카드 하단 액션 */}
                            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                <button onClick={() => toggleStats(habit)} style={{
                                    flex: 1, padding: '7px 0', fontSize: '12px',
                                    background: isExpanded ? `${color}22` : 'var(--surface)',
                                    color: isExpanded ? color : 'var(--text-tertiary)',
                                    border: `1px solid ${isExpanded ? color + '44' : 'var(--border)'}`,
                                    borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                                }}>
                                    {statsLoading[habit._id] ? '⏳' : isExpanded ? '📊 닫기' : '📊 기록'}
                                </button>
                                <button onClick={() => setDeleteTarget(habit)}
                                    style={{
                                        padding: '7px 12px', fontSize: '12px',
                                        background: 'var(--surface)', color: 'var(--text-tertiary)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-light)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                                >🗑️</button>
                            </div>

                            {/* 습관별 히트맵 */}
                            {isExpanded && (
                                <div style={{
                                    marginTop: '8px', padding: '14px 16px',
                                    background: 'var(--surface-hover)', borderRadius: '12px',
                                    border: `1px solid ${color}33`,
                                }}>
                                    <p style={{ fontSize: '11px', color: color, fontWeight: 600, marginBottom: '10px', letterSpacing: '0.04em' }}>
                                        최근 1년 · 총 {(habitStats[habit._id] || []).reduce((s, d) => s + d.count, 0)}회
                                    </p>
                                    {statsLoading[habit._id] ? (
                                        <p style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>불러오는 중...</p>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <HabitHeatmap data={habitStats[habit._id] || []} compact={true} accentColor={color} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
