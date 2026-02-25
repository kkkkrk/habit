'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const inputStyle = {
    width: '100%', padding: '11px 14px', fontSize: '14px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '10px', color: 'var(--text)', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.15s, background 0.3s',
}

export default function LoginPage() {
    const router = useRouter()
    const [tab, setTab] = useState('login') // 'login' | 'register'
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [smsConsent, setSmsConsent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleCredentialsLogin = async (e) => {
        e.preventDefault()
        setError(''); setLoading(true)
        const res = await signIn('credentials', {
            redirect: false,
            username: username.trim(),
            password,
        })
        setLoading(false)
        if (res?.ok) {
            router.push('/')
            router.refresh()
        } else {
            setError('아이디 또는 비밀번호가 올바르지 않습니다.')
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setError(''); setSuccess('')
        if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return }
        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password, displayName: displayName.trim(), email: email.trim(), phone: phone.trim(), smsConsent }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error); return }
            setSuccess('가입 완료! 로그인해주세요.')
            setTab('login')
            setDisplayName(''); setEmail(''); setPhone(''); setSmsConsent(false); setPasswordConfirm('')
        } catch {
            setError('네트워크 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg)', transition: 'background 0.3s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div className="responsive-login-box" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px',
            }}>
                {/* 로고 */}
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.4px', marginBottom: '4px' }}>
                        Habit Tracker
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>작은 습관이 큰 변화를 만듭니다</p>
                </div>

                {/* GitHub 로그인 */}
                <button
                    onClick={() => signIn('github', { callbackUrl: '/' })}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        padding: '12px 20px', borderRadius: '12px',
                        background: '#FFFFFF', color: '#0D0D0F',
                        border: 'none', fontSize: '14px', fontWeight: 700,
                        cursor: 'pointer', transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub로 계속하기
                </button>

                {/* 구분선 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>또는</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                {/* 탭 */}
                <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', borderRadius: '10px', padding: '4px', width: '100%', border: '1px solid var(--border)' }}>
                    {[['login', '로그인'], ['register', '회원가입']].map(([key, label]) => (
                        <button key={key} onClick={() => { setTab(key); setError(''); setSuccess('') }} style={{
                            flex: 1, padding: '8px', fontSize: '13px', fontWeight: tab === key ? 600 : 400,
                            background: tab === key ? 'var(--surface-hover)' : 'transparent',
                            color: tab === key ? 'var(--text)' : 'var(--text-secondary)',
                            border: tab === key ? '1px solid var(--border)' : '1px solid transparent',
                            borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                        }}>{label}</button>
                    ))}
                </div>

                {/* 폼 */}
                <form onSubmit={tab === 'login' ? handleCredentialsLogin : handleRegister}
                    style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>

                    {tab === 'register' && (
                        <>
                            <input
                                placeholder="닉네임 (선택)"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                maxLength={20}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                            <input
                                type="email"
                                placeholder="이메일 (선택)"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                        </>
                    )}

                    <input
                        placeholder="아이디 (3자 이상)"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required minLength={3} maxLength={30}
                        autoComplete="username"
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                    <input
                        type="password"
                        placeholder="비밀번호 (6자 이상)"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required minLength={6}
                        autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />

                    {tab === 'register' && (
                        <>
                            <input
                                type="password"
                                placeholder="비밀번호 확인"
                                value={passwordConfirm}
                                onChange={e => setPasswordConfirm(e.target.value)}
                                required
                                autoComplete="new-password"
                                style={{
                                    ...inputStyle,
                                    borderColor: passwordConfirm && password !== passwordConfirm ? 'var(--red)' : 'var(--border)',
                                }}
                                onFocus={e => e.target.style.borderColor = password !== passwordConfirm ? 'var(--red)' : 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = password !== passwordConfirm ? 'var(--red)' : 'var(--border)'}
                            />
                            {passwordConfirm && password !== passwordConfirm && (
                                <p style={{ fontSize: '12px', color: 'var(--red)', marginTop: '-4px' }}>비밀번호가 일치하지 않습니다.</p>
                            )}
                            <input
                                type="tel"
                                placeholder="전화번호 (선택, 예: 010-1234-5678)"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                                <input
                                    type="checkbox"
                                    checked={smsConsent}
                                    onChange={e => setSmsConsent(e.target.checked)}
                                    style={{ width: '16px', height: '16px', accentColor: '#FF6B35', cursor: 'pointer', flexShrink: 0 }}
                                />
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    SMS 수신에 동의합니다 <span style={{ color: 'var(--text-tertiary)' }}>(선택)</span>
                                </span>
                            </label>
                        </>
                    )}

                    {error && (
                        <p style={{ fontSize: '13px', color: 'var(--red)', textAlign: 'center', padding: '8px 12px', background: 'var(--red-light)', borderRadius: '8px' }}>
                            {error}
                        </p>
                    )}
                    {success && (
                        <p style={{ fontSize: '13px', color: '#10B981', textAlign: 'center', padding: '8px 12px', background: '#10B98110', borderRadius: '8px' }}>
                            {success}
                        </p>
                    )}

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '12px', borderRadius: '12px',
                        background: loading ? 'var(--border)' : 'var(--accent)',
                        color: '#FFFFFF', border: 'none',
                        fontSize: '14px', fontWeight: 700,
                        cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s',
                    }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88' }}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        {loading ? '처리 중...' : tab === 'login' ? '로그인' : '회원가입'}
                    </button>
                </form>
            </div>
        </div>
    )
}
