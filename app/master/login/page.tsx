'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const fontSans = 'var(--font-inter, Inter, system-ui, sans-serif)'
const fontHeading = 'var(--font-space-grotesk, "Space Grotesk", system-ui, sans-serif)'
const PURPLE = '#8B2FC9'

const css = `
  .ml-input {
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 15px;
    color: #0D0D0D;
    background: white;
    width: 100%;
    transition: all 150ms;
    font-family: ${fontSans};
  }
  .ml-input::placeholder { color: #9CA3AF; }
  .ml-input:focus {
    outline: none;
    border-color: ${PURPLE};
    box-shadow: 0 0 0 2px ${PURPLE}40;
  }
`

export default function MasterLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/master/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/master')
      router.refresh()
    } else {
      setError('Incorrect password.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <style>{css}</style>
      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', maxWidth: '384px', width: '100%' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>
            Honed Ops
          </p>
          <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '14px', margin: 0 }}>
            Master Panel
          </p>
        </div>

        <div>
          <label style={{ display: 'block', fontFamily: fontSans, color: '#4A4A4A', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
            Master Password
          </label>
          <input
            className="ml-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {error && (
          <p style={{ fontFamily: fontSans, color: '#E24B4A', fontSize: '13px', marginTop: '8px', marginBottom: 0 }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            marginTop: '20px',
            width: '100%',
            background: loading ? '#D1D5DB' : PURPLE,
            color: 'white',
            fontFamily: fontHeading,
            fontWeight: 700,
            fontSize: '14px',
            textTransform: 'uppercase',
            padding: '12px 20px',
            borderRadius: '12px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 150ms',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}
