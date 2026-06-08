'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Plus, Mail, Tag, ClipboardList, Copy, Check } from 'lucide-react'
import { fmtDate } from '@/lib/utils'
import type { Tenant } from '@/lib/types'

type SubmissionCount = { count: number }
type TenantWithCount = Tenant & { submission_count: SubmissionCount[] }

const PURPLE = '#8B2FC9'
const fontSans = 'var(--font-inter, Inter, system-ui, sans-serif)'
const fontHeading = 'var(--font-space-grotesk, "Space Grotesk", system-ui, sans-serif)'
const fontMono = 'ui-monospace, monospace'

const BORDER = '1px solid rgba(255,255,255,0.08)'
const CARD_BG = 'rgba(255,255,255,0.05)'

const dynamicCss = `
  .mp-input {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 12px 16px;
    font-family: ${fontSans};
    font-size: 14px;
    color: white;
    width: 100%;
    transition: all 150ms;
  }
  .mp-input::placeholder { color: rgba(255,255,255,0.3); }
  .mp-input:focus { outline: none; border-color: ${PURPLE}; box-shadow: 0 0 0 2px ${PURPLE}40; }
  .mp-select {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 12px 16px;
    font-family: ${fontSans};
    font-size: 14px;
    color: white;
    width: 100%;
    cursor: pointer;
    appearance: none;
  }
  .mp-select:focus { outline: none; border-color: ${PURPLE}; box-shadow: 0 0 0 2px ${PURPLE}40; }
  .mp-select option { background: #1A1A1A; color: white; }
  .tenant-card { transition: background 150ms; }
  .tenant-card:hover { background: rgba(255,255,255,0.07) !important; }
`

const labelStyle = {
  display: 'block',
  fontFamily: fontSans,
  color: 'rgba(255,255,255,0.6)',
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '6px',
} as const

const helperStyle = {
  fontFamily: fontSans,
  color: 'rgba(255,255,255,0.3)',
  fontSize: '12px',
  marginBottom: '6px',
  display: 'block',
} as const

export default function MasterPage() {
  const [tenants, setTenants] = useState<TenantWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form state
  const [businessName, setBusinessName] = useState('')
  const [slug, setSlug] = useState('')
  const [industry, setIndustry] = useState('tree_services')
  const [primaryColor, setPrimaryColor] = useState('#1C3A2B')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  const router = useRouter()

  const fetchTenants = useCallback(async () => {
    try {
      const res = await fetch('/api/master/tenants')
      const data = await res.json() as TenantWithCount[]
      setTenants(Array.isArray(data) ? data : [])
    } catch {
      setTenants([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTenants() }, [fetchTenants])

  function resetForm() {
    setBusinessName('')
    setSlug('')
    setIndustry('tree_services')
    setPrimaryColor('#1C3A2B')
    setNotificationEmail('')
    setAdminEmail('')
    setAdminPassword('')
    setLogoUrl('')
    setFormError(null)
  }

  async function handleSignOut() {
    await fetch('/api/master/logout', { method: 'POST' })
    router.push('/master/login')
  }

  async function handleToggleActive(tenant: TenantWithCount) {
    const updated = !tenant.active
    setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, active: updated } : t))
    await fetch(`/api/master/tenants/${tenant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: updated }),
    })
  }

  async function handleCopyLink(tenant: TenantWithCount) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/${tenant.slug}`
    await navigator.clipboard.writeText(url)
    setCopiedId(tenant.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleCreate() {
    if (!businessName || !slug || !notificationEmail || !adminEmail || !adminPassword) {
      setFormError('All required fields must be filled.')
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      const res = await fetch('/api/master/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          business_name: businessName,
          industry,
          primary_color: primaryColor,
          secondary_color: '#C8922A',
          logo_url: logoUrl,
          notification_email: notificationEmail,
          admin_email: adminEmail,
          admin_password: adminPassword,
        }),
      })

      if (res.status === 409) {
        setFormError('That URL slug is already taken.')
        setSaving(false)
        return
      }

      if (!res.ok) throw new Error('Failed')

      const newTenant = await res.json() as TenantWithCount
      setTenants(prev => [{ ...newTenant, submission_count: [{ count: 0 }] }, ...prev])
      setShowNewForm(false)
      resetForm()
    } catch {
      setFormError('Failed to create tenant. Please try again.')
      setSaving(false)
    }
  }

  const totalSubmissions = tenants.reduce(
    (sum, t) => sum + (t.submission_count?.[0]?.count ?? 0),
    0
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D' }}>
      <style>{dynamicCss}</style>

      {/* ── Topbar ── */}
      <div style={{ borderBottom: BORDER, padding: '16px 24px' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Settings size={20} color={PURPLE} />
            <span style={{ fontFamily: fontHeading, color: 'white', fontWeight: 700, fontSize: '18px' }}>
              Honed Ops
            </span>
            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)' }} />
            <span style={{ fontFamily: fontSans, color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              Master Panel
            </span>
          </div>
          <button
            onClick={handleSignOut}
            style={{ background: 'white', color: '#0D0D0D', fontFamily: fontSans, fontSize: '13px', padding: '8px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 16px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontFamily: fontHeading, color: 'white', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>
              Tenants
            </h1>
            <p style={{ fontFamily: fontSans, color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
              {tenants.filter(t => t.active).length} active
            </p>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            style={{ background: PURPLE, color: 'white', fontFamily: fontHeading, fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            New Tenant
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          {[
            { value: tenants.length, label: 'Total Tenants' },
            { value: tenants.filter(t => t.active).length, label: 'Active' },
            { value: totalSubmissions, label: 'Total Assessments' },
          ].map(({ value, label }) => (
            <div key={label} style={{ background: CARD_BG, border: BORDER, borderRadius: '16px', padding: '20px' }}>
              <p style={{ fontFamily: fontHeading, color: 'white', fontWeight: 700, fontSize: '32px', margin: '0 0 4px' }}>{value}</p>
              <p style={{ fontFamily: fontSans, color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tenants list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: CARD_BG, borderRadius: '16px', height: '128px', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
            ))}
          </div>
        ) : tenants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 16px' }}>
            <p style={{ fontFamily: fontSans, color: 'rgba(255,255,255,0.3)', fontSize: '15px', margin: '0 0 4px' }}>No tenants yet</p>
            <p style={{ fontFamily: fontSans, color: 'rgba(255,255,255,0.2)', fontSize: '13px', margin: 0 }}>Click New Tenant to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tenants.map(tenant => {
              const subCount = tenant.submission_count?.[0]?.count ?? 0
              const industryLabel = tenant.industry.replace(/_/g, ' ')

              return (
                <div
                  key={tenant.id}
                  className="tenant-card"
                  style={{ background: CARD_BG, border: BORDER, borderRadius: '16px', padding: '20px' }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: tenant.primary_color, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontFamily: fontSans, color: 'white', fontSize: '15px', fontWeight: 600, margin: '0 0 2px' }}>
                          {tenant.business_name}
                        </p>
                        <p style={{ fontFamily: fontMono, color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
                          /{tenant.slug}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleActive(tenant)}
                      style={{
                        background: tenant.active ? '#D1FAE5' : '#F3F4F6',
                        color: tenant.active ? '#065F46' : '#6B7280',
                        fontFamily: fontSans,
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '999px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {tenant.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Details row */}
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {[
                      { Icon: Mail, text: tenant.notification_email },
                      { Icon: Tag, text: industryLabel },
                      { Icon: ClipboardList, text: `${subCount} assessment${subCount !== 1 ? 's' : ''}` },
                    ].map(({ Icon, text }) => (
                      <span key={text} style={{ display: 'flex', gap: '6px', alignItems: 'center', fontFamily: fontSans, color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                        <Icon size={12} />
                        {text}
                      </span>
                    ))}
                  </div>

                  {/* Bottom row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontFamily: fontSans, color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                      Created {fmtDate(tenant.created_at)}
                    </span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <a
                        href={`/${tenant.slug}/admin`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontFamily: fontSans, color: PURPLE, fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}
                      >
                        View Dashboard →
                      </a>
                      <button
                        onClick={() => handleCopyLink(tenant)}
                        style={{ display: 'flex', gap: '4px', alignItems: 'center', fontFamily: fontSans, color: 'rgba(255,255,255,0.4)', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        {copiedId === tenant.id ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                        {copiedId === tenant.id ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── New Tenant Modal ── */}
      {showNewForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setShowNewForm(false)}
        >
          <div
            style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', maxWidth: '512px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontFamily: fontHeading, color: 'white', fontWeight: 700, fontSize: '18px' }}>New Tenant</span>
              <button
                onClick={() => setShowNewForm(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'white' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)' }}
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Business Name *</label>
                <input className="mp-input" type="text" placeholder="Smith's Tree Service" value={businessName} onChange={e => setBusinessName(e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>URL Slug *</label>
                <span style={helperStyle}>Your site URL will be /{`{slug}`} — lowercase, no spaces</span>
                <input
                  className="mp-input"
                  type="text"
                  placeholder="smiths-tree"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                />
              </div>

              <div>
                <label style={labelStyle}>Industry</label>
                <select className="mp-select" value={industry} onChange={e => setIndustry(e.target.value)}>
                  <option value="tree_services">Tree Services</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Notification Email *</label>
                <span style={helperStyle}>Where new assessment alerts are sent</span>
                <input className="mp-input" type="email" placeholder="alerts@example.com" value={notificationEmail} onChange={e => setNotificationEmail(e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Admin Login Email *</label>
                <span style={helperStyle}>Email the operator uses to log in</span>
                <input className="mp-input" type="email" placeholder="operator@example.com" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Admin Password *</label>
                <span style={helperStyle}>Set initial password for the operator</span>
                <input className="mp-input" type="password" placeholder="••••••••" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Primary Color</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    style={{ width: '48px', height: '40px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', padding: '4px', cursor: 'pointer' }}
                  />
                  <input
                    className="mp-input"
                    type="text"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Logo URL <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(optional)</span></label>
                <input className="mp-input" type="url" placeholder="https://example.com/logo.png" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
              </div>

              {formError && (
                <p style={{ fontFamily: fontSans, color: '#E24B4A', fontSize: '13px', margin: 0 }}>{formError}</p>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => { setShowNewForm(false); resetForm() }}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontFamily: fontSans, fontSize: '14px', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                style={{ background: saving ? '#6B21A8' : PURPLE, color: 'white', fontFamily: fontHeading, fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Creating...' : 'Create Tenant'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}
