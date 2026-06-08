'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  Camera,
  Clock,
  Tag,
  CheckCircle,
  Sparkles,
} from 'lucide-react'
import { fmtDate, fmtDateTime } from '@/lib/utils'
import type { Tenant, FieldSubmission } from '@/lib/types'

type Props = {
  tenant: Tenant
  submission: FieldSubmission
}

function getStr(val: unknown): string {
  if (typeof val === 'string') return val
  if (Array.isArray(val)) return (val as string[]).join(', ')
  return ''
}

function getStrArr(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[]
  return []
}

export function SubmissionDetail({ tenant, submission }: Props) {
  const [status, setStatus] = useState(submission.status)
  const [notes, setNotes] = useState(submission.notes || '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [savedNotes, setSavedNotes] = useState(false)
  const [activeReport, setActiveReport] = useState<'customer' | 'operator'>('operator')
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactDate, setContactDate] = useState(new Date().toISOString().split('T')[0])
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | null>(null)
  const [savingContact, setSavingContact] = useState(false)
  const [contactedAt, setContactedAt] = useState<string | null>(submission.contacted_at)
  const [contactMethodSaved, setContactMethodSaved] = useState<'phone' | 'email' | null>(
    submission.contact_method
  )
  const router = useRouter()

  const primary = tenant.primary_color
  const fontSans = 'var(--font-inter, Inter, system-ui, sans-serif)'
  const fontHeading = 'var(--font-space-grotesk, "Space Grotesk", system-ui, sans-serif)'

  const urgency = getStr(submission.form_data?.urgency)
  const serviceType = getStr(submission.form_data?.service_type)
  const treeCount = getStr(submission.form_data?.tree_count)
  const treeHeight = getStr(submission.form_data?.tree_height)
  const hazards = getStrArr(submission.form_data?.hazards)
  const additionalNotes = getStr(submission.form_data?.additional_notes)

  const urgencyLabel =
    urgency === 'high' ? 'Emergency 🚨' :
    urgency === 'medium' ? 'Within a week' :
    urgency === 'low' ? 'Not urgent' : '—'

  async function saveNotes() {
    if (notes === submission.notes) return
    setSavingNotes(true)
    await fetch(`/api/submissions/${submission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    setSavingNotes(false)
    setSavedNotes(true)
    setTimeout(() => setSavedNotes(false), 2000)
  }

  async function saveContact() {
    if (!contactMethod) return
    setSavingContact(true)
    const contacted = new Date(contactDate).toISOString()
    await fetch(`/api/submissions/${submission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'contacted',
        contacted_at: contacted,
        contact_method: contactMethod,
      }),
    })
    setStatus('contacted')
    setContactedAt(contacted)
    setContactMethodSaved(contactMethod)
    setSavingContact(false)
    setShowContactModal(false)
  }

  const jobRows = [
    { label: 'Service', value: serviceType ? serviceType.replace(/_/g, ' ') : '—', capitalize: true },
    { label: 'Tree Count', value: treeCount || '—', capitalize: false },
    { label: 'Height', value: treeHeight || '—', capitalize: false },
    { label: 'Hazards', value: hazards.length > 0 ? hazards.join(', ') : 'None reported', capitalize: false },
    { label: 'Urgency', value: urgencyLabel, capitalize: false },
    { label: 'Notes', value: additionalNotes || '—', capitalize: false },
  ]

  const leadInfoRows = [
    { label: 'Submitted', value: fmtDateTime(submission.created_at), color: '#0D0D0D' },
    {
      label: 'Status',
      value: status === 'new' ? 'New Lead' : status === 'contacted' ? 'Contacted' : status,
      color: status === 'new' ? '#E24B4A' : status === 'contacted' ? '#16A34A' : '#0D0D0D',
    },
    ...(contactedAt
      ? [
          { label: 'Contacted On', value: fmtDate(contactedAt), color: '#0D0D0D' },
          {
            label: 'Via',
            value: contactMethodSaved === 'phone' ? '📞 Phone call' : '✉️ Email',
            color: '#0D0D0D',
          },
        ]
      : []),
    {
      label: 'Photos',
      value: `${submission.image_urls.length} submitted`,
      color: '#0D0D0D',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <style>{`
        .lead-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 1024px) {
          .lead-detail-grid {
            grid-template-columns: 1fr 300px;
          }
        }
        .photos-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 1024px) {
          .photos-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

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
          <button
            onClick={() => router.push(`/${tenant.slug}/admin`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              fontFamily: fontSans,
              color: '#6B7280',
              fontSize: '13px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <ChevronLeft size={16} color="#6B7280" />
            Back to Leads
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '32px 16px' }}>

        {/* Lead header card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: `1px solid ${urgency === 'high' ? '#E24B4A' : '#E5E7EB'}`,
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>

            {/* Left */}
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <h1 style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '24px', margin: 0 }}>
                  {submission.customer_name}
                </h1>
                {urgency === 'high' && (
                  <span style={{ background: '#FCEBEB', color: '#991B1B', fontFamily: fontSans, fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
                    Emergency
                  </span>
                )}
              </div>
              <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '15px', margin: '0 0 12px' }}>
                {submission.property_address}
              </p>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <a href={`tel:${submission.customer_phone}`} style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', textDecoration: 'none' }}>
                  <Phone size={15} color={primary} />
                  <span style={{ fontFamily: fontSans, color: '#0D0D0D', fontSize: '14px', fontWeight: 500 }}>
                    {submission.customer_phone}
                  </span>
                </a>
                <a href={`mailto:${submission.customer_email}`} style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', textDecoration: 'none' }}>
                  <Mail size={15} color={primary} />
                  <span style={{ fontFamily: fontSans, color: '#0D0D0D', fontSize: '14px', fontWeight: 500 }}>
                    {submission.customer_email}
                  </span>
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(submission.property_address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', textDecoration: 'none' }}
                >
                  <MapPin size={15} color={primary} />
                  <span style={{ fontFamily: fontSans, color: '#0D0D0D', fontSize: '14px', fontWeight: 500 }}>
                    Get Directions
                  </span>
                </a>
              </div>
            </div>

            {/* Right — status block */}
            <div style={{ textAlign: 'right' }}>
              {status === 'new' ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    background: '#FCEBEB',
                    color: '#E24B4A',
                    fontFamily: fontHeading,
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    marginBottom: '8px',
                  }}>
                    New Lead
                  </span>
                  <br />
                  <button
                    onClick={() => setShowContactModal(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: primary,
                      border: 'none',
                      borderRadius: '12px',
                      padding: '8px 16px',
                      fontFamily: fontSans,
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <Phone size={13} />
                    Mark as Contacted
                  </button>
                </>
              ) : status === 'contacted' ? (
                <>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#D1FAE5',
                    color: '#065F46',
                    fontFamily: fontHeading,
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    marginBottom: '4px',
                  }}>
                    <CheckCircle size={14} />
                    {contactMethodSaved === 'phone' ? 'Called' : 'Emailed'}
                  </span>
                  {contactedAt && (
                    <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '12px', margin: '4px 0' }}>
                      {fmtDate(contactedAt)}
                    </p>
                  )}
                  <button
                    onClick={() => setShowContactModal(true)}
                    style={{
                      display: 'block',
                      background: 'none',
                      border: 'none',
                      fontFamily: fontSans,
                      color: '#9CA3AF',
                      fontSize: '12px',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '4px',
                      marginLeft: 'auto',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#4A4A4A' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF' }}
                  >
                    Update Contact
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {/* Submission meta */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F5F5F5', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {serviceType && (
              <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', fontFamily: fontSans, color: '#6B7280', fontSize: '13px' }}>
                <Tag size={14} color="#9CA3AF" />
                <span style={{ textTransform: 'capitalize' }}>{serviceType.replace(/_/g, ' ')}</span>
              </span>
            )}
            <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', fontFamily: fontSans, color: '#6B7280', fontSize: '13px' }}>
              <Clock size={14} color="#9CA3AF" />
              Submitted {fmtDateTime(submission.created_at)}
            </span>
            {submission.image_urls.length > 0 && (
              <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', fontFamily: fontSans, color: '#6B7280', fontSize: '13px' }}>
                <Camera size={14} color="#9CA3AF" />
                {submission.image_urls.length} photo{submission.image_urls.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Two-column grid */}
        <div className="lead-detail-grid">

          {/* Left column */}
          <div>

            {/* AI Assessment */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Sparkles size={16} color="#8B2FC9" />
                  <h2 style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '17px', margin: 0 }}>
                    AI Assessment
                  </h2>
                </div>
                <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', padding: '4px', borderRadius: '999px' }}>
                  {(['operator', 'customer'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveReport(tab)}
                      style={{
                        background: activeReport === tab ? 'white' : 'transparent',
                        border: 'none',
                        borderRadius: '999px',
                        padding: '6px 12px',
                        fontFamily: fontSans,
                        fontSize: '12px',
                        fontWeight: 500,
                        color: activeReport === tab ? '#0D0D0D' : '#6B7280',
                        cursor: 'pointer',
                        boxShadow: activeReport === tab ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 120ms',
                      }}
                    >
                      {tab === 'operator' ? 'Operator' : 'Customer'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: '#F9F9F9', borderRadius: '12px', padding: '20px' }}>
                <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                  {activeReport === 'operator' ? 'Internal — not shared with customer' : 'Sent to customer'}
                </p>
                {activeReport === 'operator' ? (
                  submission.operator_report ? (
                    <p style={{ fontFamily: fontSans, color: '#4A4A4A', fontSize: '14px', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {submission.operator_report}
                    </p>
                  ) : (
                    <p style={{ fontFamily: fontSans, color: '#9CA3AF', fontSize: '14px', margin: 0 }}>
                      Assessment not yet generated.
                    </p>
                  )
                ) : (
                  <p style={{ fontFamily: fontSans, color: '#4A4A4A', fontSize: '14px', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {submission.customer_report}
                  </p>
                )}
              </div>
            </div>

            {/* Photos */}
            {submission.image_urls.length > 0 && (
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '15px', margin: '0 0 16px' }}>
                  Photos ({submission.image_urls.length})
                </h2>
                <div className="photos-grid">
                  {submission.image_urls.map((url, i) => (
                    <div
                      key={i}
                      onClick={() => window.open(url)}
                      style={{
                        aspectRatio: '1',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#F3F4F6',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Photo ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Details */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '15px', margin: '0 0 4px' }}>
                Job Details
              </h2>
              <div>
                {jobRows.map(({ label, value, capitalize }, i) => {
                  const isNotesRow = label === 'Notes' && !!additionalNotes
                  return (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: isNotesRow ? 'flex-start' : 'center',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        borderBottom: i < jobRows.length - 1 ? '1px solid #F5F5F5' : 'none',
                      }}
                    >
                      <span style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '13px', fontWeight: 500, flexShrink: 0, marginRight: '16px' }}>
                        {label}
                      </span>
                      <span style={{
                        fontFamily: fontSans,
                        color: isNotesRow ? '#4A4A4A' : '#0D0D0D',
                        fontSize: '13px',
                        fontWeight: isNotesRow ? 400 : 600,
                        textAlign: isNotesRow ? 'left' : 'right',
                        textTransform: capitalize ? 'capitalize' : 'none',
                        lineHeight: isNotesRow ? 1.6 : 'normal',
                        maxWidth: '60%',
                      }}>
                        {value}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div>

            {/* Your Notes */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '15px', margin: '0 0 12px' }}>
                Your Notes
              </h2>
              <textarea
                rows={6}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onFocus={e => { e.currentTarget.style.boxShadow = `0 0 0 2px ${primary}40` }}
                onBlur={e => {
                  e.currentTarget.style.boxShadow = 'none'
                  saveNotes()
                }}
                placeholder="Add notes — quotes discussed, follow-up plans, anything relevant..."
                style={{
                  width: '100%',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontFamily: fontSans,
                  fontSize: '14px',
                  color: '#0D0D0D',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  lineHeight: 1.6,
                }}
              />
              <p style={{
                fontFamily: fontSans,
                fontSize: '12px',
                margin: '4px 0 0',
                textAlign: 'right',
                color: savingNotes ? '#9CA3AF' : '#16A34A',
                visibility: savingNotes || savedNotes ? 'visible' : 'hidden',
              }}>
                {savingNotes ? 'Saving...' : 'Saved ✓'}
              </p>
            </div>

            {/* Lead Info */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '15px', margin: '0 0 12px' }}>
                Lead Info
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {leadInfoRows.map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '13px', flexShrink: 0, marginRight: '8px' }}>
                      {label}
                    </span>
                    <span style={{ fontFamily: fontSans, color, fontSize: '13px', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mark as Contacted modal */}
      {showContactModal && (
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
          onClick={() => setShowContactModal(false)}
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
                How did you reach {submission.customer_name}?
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
                onClick={() => setShowContactModal(false)}
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
