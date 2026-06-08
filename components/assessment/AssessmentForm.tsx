'use client'

import { useState, useRef } from 'react'
import type { CSSProperties } from 'react'
import {
  Axe,
  Scissors,
  Circle,
  AlertTriangle,
  Search,
  MoreHorizontal,
  Camera,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Tenant } from '@/lib/types'

type ServiceOption = {
  value: string
  label: string
  Icon: LucideIcon
}

const SERVICE_OPTIONS: ServiceOption[] = [
  { value: 'removal', label: 'Tree Removal', Icon: Axe },
  { value: 'trimming', label: 'Trimming & Pruning', Icon: Scissors },
  { value: 'stump_grinding', label: 'Stump Grinding', Icon: Circle },
  { value: 'emergency', label: 'Emergency Service', Icon: AlertTriangle },
  { value: 'health_assessment', label: 'Health Assessment', Icon: Search },
  { value: 'other', label: 'Other', Icon: MoreHorizontal },
]

const HAZARD_OPTIONS = [
  'Power lines nearby',
  'Close to structure',
  'Fence or property line',
  'Over a road or driveway',
  'Steep terrain',
  'Limited access',
]

const URGENCY_OPTIONS: { value: string; label: string }[] = [
  { value: 'low', label: 'Not urgent' },
  { value: 'medium', label: 'Within a week' },
  { value: 'high', label: 'Emergency' },
]

const PHOTO_PROMPTS = [
  { num: '1', label: 'The tree(s)', helper: 'Show the full tree from base to top if possible' },
  { num: '2', label: 'The surrounding area', helper: 'Show the property, nearby structures, and access points' },
  { num: '3', label: 'Any damage or concerns', helper: 'Close-up of anything that looks concerning' },
]

const STEP_LABELS = ['Your Info', 'The Job', 'Photos']

// Static style constants (no dynamic colors)
const labelStyle: CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
  color: '#4A4A4A',
  fontSize: '14px',
  fontWeight: 500,
  marginBottom: '6px',
}

const helperStyle: CSSProperties = {
  fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
  color: '#9CA3AF',
  fontSize: '12px',
  marginTop: '6px',
}

const backBtnStyle: CSSProperties = {
  background: 'white',
  color: '#4A4A4A',
  border: '1px solid #E5E7EB',
  fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
  fontSize: '14px',
  padding: '12px 24px',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 150ms',
}

export function AssessmentForm({ tenant }: { tenant: Tenant }) {
  const primary = tenant.primary_color

  // Step 1
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')

  // Step 2
  const [serviceTypes, setServiceTypes] = useState<string[]>([])
  const [treeCount, setTreeCount] = useState('')
  const [treeHeight, setTreeHeight] = useState('')
  const [hazards, setHazards] = useState<string[]>([])
  const [urgency, setUrgency] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Step 3
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // UI
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const step1Valid =
    customerName.trim() !== '' &&
    customerEmail.trim() !== '' &&
    customerPhone.trim() !== '' &&
    propertyAddress.trim() !== ''

  function goToStep(step: number) {
    window.scrollTo(0, 0)
    setCurrentStep(step)
  }

  function toggleHazard(hazard: string) {
    setHazards(prev =>
      prev.includes(hazard) ? prev.filter(h => h !== hazard) : [...prev, hazard]
    )
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const combined = [...images, ...files].slice(0, 10)
    setImages(combined)
    const pending: string[] = new Array(combined.length)
    combined.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = ev => {
        pending[index] = ev.target?.result as string
        if (pending.every(Boolean)) setImagePreviews([...pending])
      }
      reader.readAsDataURL(file)
    })
    if (combined.length === 0) setImagePreviews([])
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      const fd = new FormData()
      fd.append('tenantId', tenant.id)
      fd.append('slug', tenant.slug)
      fd.append('customerName', customerName)
      fd.append('customerEmail', customerEmail)
      fd.append('customerPhone', customerPhone)
      fd.append('propertyAddress', propertyAddress)
      serviceTypes.forEach(st => fd.append('serviceTypes', st))
      fd.append('treeCount', treeCount)
      fd.append('treeHeight', treeHeight)
      hazards.forEach(h => fd.append('hazards', h))
      fd.append('urgency', urgency)
      fd.append('additionalNotes', additionalNotes)
      images.forEach(img => fd.append('images', img))

      const res = await fetch('/api/submit', { method: 'POST', body: fd })

      if (!res.ok) throw new Error('Submission failed')

      setSubmitted(true)
      window.scrollTo(0, 0)
    } catch {
      setError('Something went wrong. Please try again or call us directly.')
      setSubmitting(false)
    }
  }

  // Dynamic CSS scoped to primary color
  const dynamicCss = `
    .af-input {
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 15px;
      color: #0D0D0D;
      background: white;
      width: 100%;
      transition: all 150ms;
      font-family: var(--font-inter, Inter, system-ui, sans-serif);
    }
    .af-input::placeholder { color: #9CA3AF; }
    .af-input:focus {
      outline: none;
      border-color: ${primary};
      box-shadow: 0 0 0 2px ${primary}40;
    }
    .af-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      padding-right: 36px;
    }
    .af-service-card {
      border: 1.5px solid #E5E7EB;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 150ms;
      text-align: center;
      user-select: none;
      background: white;
    }
    .af-service-card.selected {
      border-color: ${primary};
      background: ${primary}14;
    }
    .af-service-card:hover:not(.selected) {
      border-color: #D1D5DB;
      background: #F9FAFB;
    }
    .af-hazard-cb {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      border: 1.5px solid #D1D5DB;
      cursor: pointer;
      appearance: none;
      background: white;
      flex-shrink: 0;
      transition: all 150ms;
    }
    .af-hazard-cb:checked {
      background: ${primary};
      border-color: ${primary};
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
    }
    .af-upload-zone {
      border: 2px dashed #E5E7EB;
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 150ms;
    }
    .af-upload-zone:hover {
      border-color: ${primary};
      background: ${primary}08;
    }
    @keyframes af-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .af-spinner { animation: af-spin 1s linear infinite; }
  `

  const fontSans = 'var(--font-inter, Inter, system-ui, sans-serif)'
  const fontHeading = 'var(--font-space-grotesk, "Space Grotesk", system-ui, sans-serif)'

  // ── Success state ──
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '48px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: '512px', width: '100%', textAlign: 'center' }}>
          <CheckCircle size={64} color={primary} style={{ margin: '0 auto 24px', display: 'block' }} />
          <h2 style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '26px', marginBottom: '12px' }}>
            Assessment Submitted!
          </h2>
          <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '15px', lineHeight: 1.7, maxWidth: '384px', margin: '0 auto 24px' }}>
            Thanks {customerName.split(' ')[0]}. We&apos;ve received your assessment and will send your report to {customerEmail} shortly.
          </p>
          <div style={{ borderTop: '1px solid #F5F5F5', paddingTop: '24px' }}>
            <p style={{ fontFamily: fontSans, color: '#9CA3AF', fontSize: '13px' }}>
              Questions? Contact us at{' '}
              <a
                href={`mailto:${tenant.notification_email}`}
                style={{ color: primary, fontWeight: 500, textDecoration: 'none' }}
              >
                {tenant.notification_email}
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Primary next button style (dynamic) ──
  function nextBtnStyle(disabled: boolean): CSSProperties {
    return {
      background: disabled ? '#D1D5DB' : primary,
      color: 'white',
      fontFamily: fontHeading,
      fontWeight: 700,
      fontSize: '14px',
      textTransform: 'uppercase',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 150ms',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <style>{dynamicCss}</style>

      {/* ── Header ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {tenant.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tenant.logo_url} alt={tenant.business_name} style={{ height: '36px', objectFit: 'contain', display: 'block' }} />
        ) : (
          <span style={{ fontFamily: fontHeading, fontWeight: 700, fontSize: '18px', color: primary }}>
            {tenant.business_name}
          </span>
        )}
        <span style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '13px' }}>
          Free Assessment
        </span>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '12px 24px' }}>
        <div style={{ maxWidth: '672px', margin: '0 auto' }}>
          <div style={{ display: 'flex', marginBottom: '8px' }}>
            {STEP_LABELS.map((label, i) => {
              const active = i + 1 <= currentStep
              return (
                <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                  <span style={{ fontFamily: fontSans, fontSize: '12px', color: active ? primary : '#9CA3AF', fontWeight: active ? 600 : 400 }}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: primary,
              borderRadius: '999px',
              width: `${((currentStep - 1) / 2) * 100}%`,
              transition: 'width 300ms ease',
            }} />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: '672px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '24px' }}>

          {/* Step header */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontFamily: fontSans, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: primary, marginBottom: '4px' }}>
              Step {currentStep} of 3
            </p>
            <h1 style={{ fontFamily: fontHeading, color: '#0D0D0D', fontWeight: 700, fontSize: '22px', marginBottom: '4px' }}>
              {currentStep === 1 && "Let's start with your information"}
              {currentStep === 2 && 'Tell us about the job'}
              {currentStep === 3 && 'Add some photos'}
            </h1>
            <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '14px', lineHeight: 1.5 }}>
              {currentStep === 1 && "We'll use this to send you your assessment report."}
              {currentStep === 2 && 'The more detail you provide the more accurate your assessment.'}
              {currentStep === 3 && "Photos help us give you the most accurate assessment. Don't have any right now? No problem — skip this step and we'll collect them later."}
            </p>
          </div>

          {/* ── STEP 1: Your Info ── */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  className="af-input"
                  type="text"
                  placeholder="John Smith"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  className="af-input"
                  type="email"
                  placeholder="john@email.com"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                />
                <p style={helperStyle}>Your assessment report will be sent here</p>
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  className="af-input"
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Property Address</label>
                <input
                  className="af-input"
                  type="text"
                  placeholder="123 Main St, City, GA"
                  value={propertyAddress}
                  onChange={e => setPropertyAddress(e.target.value)}
                />
                <p style={helperStyle}>Where is the work needed?</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  onClick={() => goToStep(2)}
                  disabled={!step1Valid}
                  style={nextBtnStyle(!step1Valid)}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: The Job ── */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Service type */}
              <div>
                <label style={labelStyle}>What service do you need?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                  {SERVICE_OPTIONS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      className={`af-service-card${serviceTypes.includes(value) ? ' selected' : ''}`}
                      onClick={() =>
                        setServiceTypes(prev =>
                          prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
                        )
                      }
                    >
                      <Icon
                        size={24}
                        color={serviceTypes.includes(value) ? primary : '#6B7280'}
                        style={{ margin: '0 auto 8px', display: 'block' }}
                      />
                      <span style={{ fontFamily: fontSans, color: '#0D0D0D', fontSize: '13px', fontWeight: 600 }}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tree count */}
              <div>
                <label style={labelStyle}>How many trees?</label>
                <select
                  className="af-input af-select"
                  value={treeCount}
                  onChange={e => setTreeCount(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="1">1 tree</option>
                  <option value="2-3">2–3 trees</option>
                  <option value="4-6">4–6 trees</option>
                  <option value="7-10">7–10 trees</option>
                  <option value="10+">10+ trees</option>
                </select>
              </div>

              {/* Tree height */}
              <div>
                <label style={labelStyle}>Approximate tree height</label>
                <select
                  className="af-input af-select"
                  value={treeHeight}
                  onChange={e => setTreeHeight(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="under-20">Under 20 feet (small)</option>
                  <option value="20-40">20–40 feet (medium)</option>
                  <option value="40-70">40–70 feet (large)</option>
                  <option value="70+">70+ feet (very large)</option>
                  <option value="not-sure">Not sure</option>
                </select>
              </div>

              {/* Hazards */}
              <div>
                <label style={labelStyle}>Are there any hazards nearby?</label>
                <p style={{ ...helperStyle, marginTop: 0, marginBottom: '8px' }}>Select all that apply</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {HAZARD_OPTIONS.map(hazard => (
                    <label
                      key={hazard}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: fontSans, fontSize: '14px', color: '#0D0D0D' }}
                    >
                      <input
                        type="checkbox"
                        className="af-hazard-cb"
                        checked={hazards.includes(hazard)}
                        onChange={() => toggleHazard(hazard)}
                      />
                      {hazard}
                    </label>
                  ))}
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label style={labelStyle}>How urgent is this?</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {URGENCY_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setUrgency(value)}
                      style={{
                        background: urgency === value ? primary : 'white',
                        color: urgency === value ? 'white' : '#4A4A4A',
                        border: `1px solid ${urgency === value ? primary : '#E5E7EB'}`,
                        fontFamily: fontSans,
                        fontSize: '14px',
                        fontWeight: 500,
                        padding: '10px 20px',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        transition: 'all 150ms',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional notes */}
              <div>
                <label style={labelStyle}>Additional Details</label>
                <p style={{ ...helperStyle, marginTop: 0, marginBottom: '8px' }}>Anything else we should know?</p>
                <textarea
                  className="af-input"
                  rows={3}
                  style={{ resize: 'none' }}
                  placeholder="Describe the condition of the tree, any previous work done, access considerations..."
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                />
              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <button onClick={() => goToStep(1)} style={backBtnStyle}>← Back</button>
                <button
                  onClick={() => goToStep(3)}
                  disabled={serviceTypes.length === 0}
                  style={nextBtnStyle(serviceTypes.length === 0)}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Photos ── */}
          {currentStep === 3 && (
            <div>
              {/* Photo prompts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {PHOTO_PROMPTS.map(({ num, label, helper }) => (
                  <div key={num} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#F9F9F9', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: primary, color: 'white', fontFamily: fontSans, fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {num}
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2px' }}>
                        <p style={{ fontFamily: fontSans, color: '#0D0D0D', fontSize: '14px', fontWeight: 600, margin: 0 }}>{label}</p>
                        <span style={{ background: '#F3F4F6', color: '#9CA3AF', fontFamily: fontSans, fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '999px', flexShrink: 0 }}>
                          Optional
                        </span>
                      </div>
                      <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '13px', margin: 0 }}>{helper}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />

              {/* Upload zone */}
              <div
                className="af-upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                {images.length === 0 ? (
                  <>
                    <Camera size={40} color="#9CA3AF" style={{ margin: '0 auto 12px', display: 'block' }} />
                    <p style={{ fontFamily: fontSans, color: '#4A4A4A', fontSize: '15px', fontWeight: 500, margin: '0 0 4px' }}>
                      Tap to add photos
                    </p>
                    <p style={{ fontFamily: fontSans, color: '#9CA3AF', fontSize: '13px', margin: 0 }}>
                      JPG, PNG up to 10MB each · Optional
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ fontFamily: fontSans, color: primary, fontSize: '14px', fontWeight: 600, margin: '0 0 4px' }}>
                      {images.length} photo{images.length !== 1 ? 's' : ''} selected
                    </p>
                    <p style={{ fontFamily: fontSans, color: '#6B7280', fontSize: '13px', margin: 0 }}>
                      Tap to add more
                    </p>
                  </>
                )}
              </div>

              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '16px' }}>
                  {imagePreviews.map((src, i) =>
                    src ? (
                      <div key={i} style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: '12px', overflow: 'hidden' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Preview ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          onClick={ev => { ev.stopPropagation(); removeImage(i) }}
                          style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', fontFamily: fontSans, lineHeight: 1 }}
                        >
                          ×
                        </button>
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* Skip link */}
              <p style={{ textAlign: 'center', marginTop: '16px', fontFamily: fontSans, fontSize: '13px', color: '#9CA3AF' }}>
                No photos?{' '}
                <span
                  onClick={handleSubmit}
                  style={{ fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', transition: 'color 150ms' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLSpanElement).style.color = '#4A4A4A' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLSpanElement).style.color = '#9CA3AF' }}
                >
                  Skip this step →
                </span>
              </p>

              {/* Error */}
              {error && (
                <p style={{ fontFamily: fontSans, color: '#DC2626', fontSize: '14px', marginTop: '12px' }}>
                  {error}
                </p>
              )}

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button onClick={() => goToStep(2)} style={backBtnStyle}>← Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={nextBtnStyle(submitting)}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="af-spinner" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Assessment'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
