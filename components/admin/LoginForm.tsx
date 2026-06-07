'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import type { Tenant } from '@/lib/types'

type TenantSlim = Pick<Tenant, 'business_name' | 'logo_url' | 'primary_color' | 'slug'>

export function LoginForm({ tenant }: { tenant: TenantSlim }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const primary = tenant.primary_color
  const fontSans = 'var(--font-inter, Inter, system-ui, sans-serif)'
  const fontHeading = 'var(--font-space-grotesk, "Space Grotesk", system-ui, sans-serif)'

  const dynamicCss = `
    .lf-input {
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
    .lf-input::placeholder { color: #9CA3AF; }
    .lf-input:focus {
      outline: none;
      border-color: ${primary};
      box-shadow: 0 0 0 2px ${primary}40;
    }
  `

  const labelStyle = {
    display: 'block',
    fontFamily: fontSans,
    color: '#4A4A4A',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '6px',
  } as const

  async function handleSignIn() {
    setLoading(true)
    setError(null)

    const supabase = createSupabaseBrowser()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push(`/${tenant.slug}/admin`)
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <style>{dynamicCss}</style>
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: '384px', width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {tenant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tenant.logo_url} alt={tenant.business_name} style={{ height: '48px', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} />
          ) : (
            <p style={{ fontFamily: fontHeading, fontWeight: 700, fontSize: '22px', color: primary, marginBottom: '16px', marginTop: 0 }}>
              {tenant.business_name}
            </p>
          )}
          <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '14px', margin: 0 }}>
            Admin Dashboard
          </p>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              className="lf-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignIn()}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              className="lf-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignIn()}
            />
          </div>
        </div>

        {error && (
          <p style={{ fontFamily: fontSans, color: '#E24B4A', fontSize: '13px', marginTop: '8px', marginBottom: 0 }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSignIn}
          disabled={loading}
          style={{
            marginTop: '24px',
            width: '100%',
            background: loading ? '#D1D5DB' : primary,
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

        <p style={{ fontFamily: fontSans, color: '#9CA3AF', fontSize: '12px', textAlign: 'center', marginTop: '24px', marginBottom: 0 }}>
          Powered by Honed Ops
        </p>
      </div>
    </div>
  )
}
