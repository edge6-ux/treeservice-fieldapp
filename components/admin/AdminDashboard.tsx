'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Phone,
  Search,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { fmtDate, timeAgo } from '@/lib/utils'
import type { Tenant, FieldSubmission } from '@/lib/types'

type Props = {
  tenant: Tenant
  submissions: FieldSubmission[]
  userEmail: string
}

export function AdminDashboard({ tenant, submissions: initialSubmissions, userEmail }: Props) {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [search, setSearch] = useState('')
  const [contactingId, setContactingId] = useState<string | null>(null)
  const [contactDate, setContactDate] = useState(new Date().toISOString().split('T')[0])
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | null>(null)
  const [savingContact, setSavingContact] = useState(false)
  const router = useRouter()

  const primary = tenant.primary_color
  const fontSans = 'var(--font-inter, Inter, system-ui, sans-serif)'
  const fontHeading = 'var(--font-space-grotesk, "Space Grotesk", system-ui, sans-serif)'

  async function handleSignOut() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.push(`/${tenant.slug}/admin/login`)
  }

  function matchesSearch(s: FieldSubmission): boolean {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.customer_name.toLowerCase().includes(q) ||
      s.customer_email.toLowerCase().includes(q) ||
      s.property_address.toLowerCase().includes(q)
    )
  }

  const newLeads = submissions.filter(s => s.status === 'new' && matchesSearch(s))
  const contactedLeads = submissions.filter(s => s.status === 'contacted' && matchesSearch(s))
  const contactingSubmission = submissions.find(s => s.id === contactingId)

  async function saveContact() {
    if (!contactMethod) return
    setSavingContact(true)

    await fetch(`/api/submissions/${contactingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'contacted',
        contacted_at: new Date(contactDate).toISOString(),
        contact_method: contactMethod,
      }),
    })

    setSubmissions(prev =>
      prev.map(s =>
        s.id === contactingId
          ? {
              ...s,
              status: 'contacted' as const,
              contacted_at: new Date(contactDate).toISOString(),
              contact_method: contactMethod,
            }
          : s
      )
    )

    setSavingContact(false)
    setContactingId(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>

      {/* Topbar */}
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
              style={{ background: 'white', border: '1px solid #E5E7EB', fontFamily: fontSans, fontSize: '13px', color: '#4A4A4A', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '32px 16px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>
              Leads
            </h1>
            <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '14px', margin: 0 }}>
              {submissions.length} total
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                color="#9CA3AF"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                placeholder="Search leads..."
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
                  width: '224px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Pipeline summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

          {/* New Leads card */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '32px', margin: '0 0 4px' }}>
                  {newLeads.length}
                </p>
                <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '13px', margin: 0 }}>
                  New Leads
                </p>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FCEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertCircle size={22} color="#E24B4A" />
              </div>
            </div>
            {newLeads.length > 0 ? (
              <p style={{ fontFamily: fontSans, color: '#E24B4A', fontSize: '12px', fontWeight: 500, marginTop: '12px', marginBottom: 0 }}>
                Needs attention
              </p>
            ) : (
              <p style={{ fontFamily: fontSans, color: '#16A34A', fontSize: '12px', fontWeight: 500, marginTop: '12px', marginBottom: 0 }}>
                All caught up ✓
              </p>
            )}
          </div>

          {/* Contacted card */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '32px', margin: '0 0 4px' }}>
                  {contactedLeads.length}
                </p>
                <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '13px', margin: 0 }}>
                  Contacted
                </p>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={22} color="#16A34A" />
              </div>
            </div>
            {contactedLeads.length > 0 ? (
              <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '12px', marginTop: '12px', marginBottom: 0 }}>
                Most recent: {timeAgo(contactedLeads[0]?.contacted_at ?? contactedLeads[0]?.created_at ?? '')}
              </p>
            ) : (
              <p style={{ fontFamily: fontSans, color: '#9CA3AF', fontSize: '12px', marginTop: '12px', marginBottom: 0 }}>
                No contacts yet
              </p>
            )}
          </div>
        </div>

        {/* ── New Leads section ── */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '17px', margin: 0 }}>
              New Leads
            </h2>
            <span style={{ background: '#FCEBEB', color: '#E24B4A', fontFamily: fontSans, fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
              {newLeads.length}
            </span>
          </div>

          {newLeads.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
              <CheckCircle size={32} color="#16A34A" style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '14px', margin: '0 0 4px' }}>No new leads</p>
              <p style={{ fontFamily: fontSans, color: '#9CA3AF', fontSize: '13px', margin: 0 }}>All leads have been contacted.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {newLeads.map(s => {
                const urgency = (s.form_data?.urgency as string) ?? ''
                const serviceType = (s.form_data?.service_type as string) ?? ''
                const isHighUrgency = urgency === 'high'

                return (
                  <div
                    key={s.id}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      border: `1.5px solid ${isHighUrgency ? '#E24B4A' : '#E5E7EB'}`,
                      padding: '20px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {isHighUrgency && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        background: '#E24B4A',
                        borderRadius: '16px 0 0 16px',
                      }} />
                    )}
                    <div style={{ paddingLeft: isHighUrgency ? '8px' : '0' }}>

                      {/* Top row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontFamily: fontSans, color: '#0D0D0D', fontSize: '15px', fontWeight: 600 }}>
                              {s.customer_name}
                            </span>
                            {isHighUrgency && (
                              <span style={{ background: '#FCEBEB', color: '#991B1B', fontFamily: fontSans, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                                Emergency
                              </span>
                            )}
                          </div>
                          <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '13px', margin: '0 0 4px' }}>
                            {s.property_address}
                          </p>
                          <p style={{ fontFamily: fontSans, color: primary, fontSize: '13px', fontWeight: 500, margin: 0, textTransform: 'capitalize' }}>
                            {serviceType ? serviceType.replace(/_/g, ' ') : 'General inquiry'}
                          </p>
                        </div>
                        <span style={{ fontFamily: fontSans, color: '#9CA3AF', fontSize: '12px', flexShrink: 0, marginLeft: '12px' }}>
                          {timeAgo(s.created_at)}
                        </span>
                      </div>

                      {/* Contact info */}
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <span style={{ display: 'flex', gap: '6px', alignItems: 'center', fontFamily: fontSans, color: '#4A4A4A', fontSize: '13px' }}>
                          <Phone size={13} color="#6B7280" />
                          {s.customer_phone}
                        </span>
                        <span style={{ display: 'flex', gap: '6px', alignItems: 'center', fontFamily: fontSans, color: '#4A4A4A', fontSize: '13px' }}>
                          <Mail size={13} color="#6B7280" />
                          {s.customer_email}
                        </span>
                      </div>

                      {/* AI summary */}
                      <div style={{ background: '#F9F9F9', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                          <Sparkles size={12} color="#8B2FC9" />
                          <span style={{ fontFamily: fontSans, color: '#8B2FC9', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            AI Assessment
                          </span>
                        </div>
                        <p style={{ fontFamily: fontSans, color: '#4A4A4A', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                          {s.operator_report
                            ? s.operator_report.slice(0, 150) + (s.operator_report.length > 150 ? '...' : '')
                            : 'Assessment generating...'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <a
                          href={`mailto:${s.customer_email}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            padding: '8px 12px',
                            fontFamily: fontSans,
                            fontSize: '13px',
                            color: '#4A4A4A',
                            textDecoration: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Mail size={14} color="#6B7280" />
                          Email
                        </a>
                        <button
                          onClick={() => {
                            setContactingId(s.id)
                            setContactDate(new Date().toISOString().split('T')[0])
                            setContactMethod(null)
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: primary,
                            border: 'none',
                            borderRadius: '12px',
                            padding: '8px 12px',
                            fontFamily: fontSans,
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'white',
                            cursor: 'pointer',
                          }}
                        >
                          <Phone size={14} />
                          Mark Contacted
                        </button>
                        <button
                          onClick={() => router.push(`/${tenant.slug}/admin/${s.id}`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            padding: '8px 12px',
                            fontFamily: fontSans,
                            fontSize: '13px',
                            color: '#4A4A4A',
                            cursor: 'pointer',
                          }}
                        >
                          <ChevronRight size={14} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Contacted section ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '17px', margin: 0 }}>
              Contacted
            </h2>
            <span style={{ background: '#D1FAE5', color: '#065F46', fontFamily: fontSans, fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
              {contactedLeads.length}
            </span>
          </div>

          {contactedLeads.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '32px', textAlign: 'center' }}>
              <p style={{ fontFamily: fontSans, color: '#9CA3AF', fontSize: '14px', margin: 0 }}>No contacted leads yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {contactedLeads.map(s => {
                const serviceType = (s.form_data?.service_type as string) ?? ''

                return (
                  <div
                    key={s.id}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      border: '1px solid #E5E7EB',
                      padding: '20px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      opacity: 0.9,
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <p style={{ fontFamily: fontSans, color: '#0D0D0D', fontSize: '15px', fontWeight: 600, margin: '0 0 4px' }}>
                          {s.customer_name}
                        </p>
                        <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '13px', margin: '0 0 4px' }}>
                          {s.property_address}
                        </p>
                        <p style={{ fontFamily: fontSans, color: '#4A4A4A', fontSize: '13px', margin: 0, textTransform: 'capitalize' }}>
                          {serviceType ? serviceType.replace(/_/g, ' ') : 'General inquiry'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0, marginLeft: '12px' }}>
                        <span style={{
                          background: '#D1FAE5',
                          color: '#065F46',
                          fontFamily: fontSans,
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          {s.contact_method === 'phone' ? (
                            <><Phone size={11} /> Called</>
                          ) : (
                            <><Mail size={11} /> Emailed</>
                          )}
                        </span>
                        {s.contacted_at && (
                          <span style={{ fontFamily: fontSans, color: '#9CA3AF', fontSize: '11px' }}>
                            {fmtDate(s.contacted_at)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <a
                        href={`mailto:${s.customer_email}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          padding: '8px 12px',
                          fontFamily: fontSans,
                          fontSize: '13px',
                          color: '#4A4A4A',
                          textDecoration: 'none',
                        }}
                      >
                        <Mail size={14} color="#6B7280" />
                        Email
                      </a>
                      <button
                        onClick={() => router.push(`/${tenant.slug}/admin/${s.id}`)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          padding: '8px 12px',
                          fontFamily: fontSans,
                          fontSize: '13px',
                          color: '#4A4A4A',
                          cursor: 'pointer',
                        }}
                      >
                        <ChevronRight size={14} />
                        View Details
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Mark as Contacted modal ── */}
      {contactingId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setContactingId(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              padding: '24px',
              maxWidth: '384px',
              width: '100%',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '18px', margin: '0 0 4px' }}>
                Log Contact
              </h3>
              <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '14px', margin: 0 }}>
                How did you reach {contactingSubmission?.customer_name}?
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontFamily: fontSans, color: '#4A4A4A', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                Date contacted
              </label>
              <input
                type="date"
                value={contactDate}
                onChange={e => setContactDate(e.target.value)}
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontFamily: fontSans,
                  fontSize: '14px',
                  width: '100%',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontFamily: fontSans, color: '#4A4A4A', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                Contact method
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {(['phone', 'email'] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => setContactMethod(method)}
                    style={{
                      background: contactMethod === method ? primary : 'white',
                      border: `1px solid ${contactMethod === method ? primary : '#E5E7EB'}`,
                      borderRadius: '999px',
                      padding: '10px 20px',
                      fontFamily: fontSans,
                      fontSize: '14px',
                      fontWeight: 500,
                      color: contactMethod === method ? 'white' : '#4A4A4A',
                      cursor: 'pointer',
                    }}
                  >
                    {method === 'phone' ? '📞 Phone' : '✉️ Email'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setContactingId(null)}
                style={{
                  flex: 1,
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '10px',
                  fontFamily: fontSans,
                  fontSize: '14px',
                  color: '#4A4A4A',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveContact}
                disabled={!contactMethod || savingContact}
                style={{
                  flex: 1,
                  background: !contactMethod || savingContact ? '#E5E7EB' : primary,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px',
                  fontFamily: fontSans,
                  fontSize: '14px',
                  fontWeight: 500,
                  color: !contactMethod || savingContact ? '#9CA3AF' : 'white',
                  cursor: !contactMethod || savingContact ? 'not-allowed' : 'pointer',
                }}
              >
                {savingContact ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
