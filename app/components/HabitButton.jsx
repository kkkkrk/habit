'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HabitButton({ userId = 'user_123', habitName = '기본 습관' }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleClick = async () => {
        setLoading(true)
        setMessage('')
        try {
            const res = await fetch('/api/habit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, habitName }),
            })
            const data = await res.json()

            if (res.ok) {
                setMessage(`✅ 오늘 ${data.count}회 완료!`)
                router.refresh()  // 서버 컴포넌트 데이터 재조회 → 잔디 업데이트
            } else {
                setMessage('❌ 오류가 발생했습니다.')
            }
        } catch (e) {
            setMessage('❌ 네트워크 오류')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
                onClick={handleClick}
                disabled={loading}
                style={{
                    padding: '10px 24px',
                    fontSize: '15px',
                    fontWeight: 600,
                    backgroundColor: loading ? '#aaa' : '#216e39',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                }}
            >
                {loading ? '저장 중...' : '✅ 오늘 습관 체크'}
            </button>
            {message && (
                <span style={{ fontSize: '14px', color: '#216e39', fontWeight: 500 }}>
                    {message}
                </span>
            )}
        </div>
    )
}
