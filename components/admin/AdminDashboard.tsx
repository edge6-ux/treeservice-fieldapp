'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Phone, Camera, Search, ClipboardList } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { statusColors, statusLabel, timeAgo } from '@/lib/utils'
import type { Tenant, FieldSubmission } from '@/lib/types'

type Props = {
  tenant: Tenant
  submissions: FieldSubmission[]
  userEmail: string
}

const STAT_PILLS = [
  { status: 'new', label: 'New', dot: '#6D28D9' },
  { status: 'reviewed', label: 'Reviewed', dot: '#1D4ED8' },
  { status: 'quoted', label: 'Quoted', dot: '#92400E' },
  { status: 'won', label: 'Won', dot: '#065F46' },
  { status: 'lost', label: 'Lost', dot: '#6B7280' },
]

export function AdminDashboard({ tenant, submissions, userEmail }: Props) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const router = useRouter()

  const primary = tenant.primary_color
  const fontSans = 'var(--font-inter, Inter, system-ui, sans-serif)'
  const fontHeading = 'var(--font-space-grotesk, "Space Grotesk", system-ui, sans-serif)'

  async function handleSignOut() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.push(`/${tenant.slug}/admin/login`)
  }

  const filtered = submissions.filter(s => {
    const q = search.toLowerCase()
    const matchesSearch =
      !search ||
      s.customer_name.toLowerCase().includes(q) ||
      s.customer_email.toLowerCase().includes(q) ||
      s.property_address.toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>

      {/* ── Topbar ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {tenant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tenant.logo_url} alt={tenant.business_name} style={{ height: '32px', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontFamily: fontHeading, fontWeight: 700, fontSize: '18px', color: primary }}>
              {tenant.business_name}
            </span>
          )}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '13px' }}>{userEmail}</span>
            <button
              onClick={handleSignOut}
              style={{ background: 'white', border: '1px solid #E5E7EB', fontFamily: fontSans, fontSize: '13px', color: '#4A4A4A', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', transition: 'all 150ms' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 16px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>
              Assessments
            </h1>
            <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '14px', margin: 0 }}>
              {submissions.length} total
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {STAT_PILLS.map(({ status, label, dot }) => (
            <div
              key={status}
              style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot, flexShrink: 0 }} />
              <span style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '13px' }}>{label}</span>
              <span style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '15px' }}>
                {submissions.filter(s => s.status === status).length}
              </span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '192px', position: 'relative' }}>
            <Search
              size={15}
              color="#9CA3AF"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search by name, email, or address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '10px 14px 10px 36px',
                fontFamily: fontSans,
                fontSize: '14px',
                color: '#0D0D0D',
                background: 'white',
                width: '100%',
                outline: 'none',
                transition: 'border-color 150ms',
              }}
            />
          </div>
          {/* Status select */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '10px 12px',
              fontFamily: fontSans,
              fontSize: '14px',
              color: '#0D0D0D',
              background: 'white',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="quoted">Quoted</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* Submissions list */}
        {submissions.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center' }}>
            <ClipboardList size={40} color="#9CA3AF" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '15px', margin: '0 0 4px' }}>No assessments yet</p>
            <p style={{ fontFamily: fontSans, color: '#9CA3AF', fontSize: '13px', maxWidth: '288px', margin: '0 auto', lineHeight: 1.5 }}>
              Share your assessment link with customers to get started.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center' }}>
            <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '15px', margin: 0 }}>No results match your search.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map(submission => {
              const colors = statusColors(submission.status)
              const urgency = (submission.form_data?.urgency as string) ?? ''
              const serviceType = (submission.form_data?.service_type as string) ?? ''
              const serviceLabel = serviceType.replace(/_/g, ' ')

              return (
                <div
                  key={submission.id}
                  onClick={() => router.push(`/${tenant.slug}/admin/${submission.id}`)}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    padding: '20px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                    el.style.borderColor = '#D1D5DB'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'
                    el.style.borderColor = '#E5E7EB'
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                      <p style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '17px', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {submission.customer_name}
                      </p>
                      <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '13px', margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {submission.property_address}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: fontSans, color: '#4A4A4A', fontSize: '13px' }}>
                          <Mail size={13} color="#9CA3AF" />
                          {submission.customer_email}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: fontSans, color: '#4A4A4A', fontSize: '13px' }}>
                          <Phone size={13} color="#9CA3AF" />
                          {submission.customer_phone}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexWrap: 'wrap', flexShrink: 0 }}>
                      <span style={{ background: colors.bg, color: colors.color, fontFamily: fontSans, fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                        {statusLabel(submission.status)}
                      </span>
                      {urgency === 'high' && (
                        <span style={{ background: '#FCEBEB', color: '#991B1B', fontFamily: fontSans, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                          Emergency
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle row */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {serviceLabel && (
                      <span style={{ background: '#F3F4F6', color: '#4A4A4A', fontFamily: fontSans, fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', textTransform: 'capitalize' }}>
                        {serviceLabel}
                      </span>
                    )}
                    {submission.image_urls.length > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: fontSans, color: '#6B7280', fontSize: '12px' }}>
                        <Camera size={12} color="#6B7280" />
                        {submission.image_urls.length} photo{submission.image_urls.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Bottom row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: fontSans, color: '#9CA3AF', fontSize: '12px' }}>
                      {timeAgo(submission.created_at)}
                    </span>
                    <span style={{ fontFamily: fontSans, color: primary, fontSize: '13px', fontWeight: 500 }}>
                      View →
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
