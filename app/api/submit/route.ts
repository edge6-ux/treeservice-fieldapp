import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import type { Tenant } from '@/lib/types'

// ── Email builders ──────────────────────────────────────────────────────────

function buildCustomerEmail({
  tenant,
  customerName,
  propertyAddress,
  serviceType,
  customerReport,
}: {
  tenant: Tenant
  customerName: string
  propertyAddress: string
  serviceType: string
  customerReport: string
}): string {
  const firstName = customerName.split(' ')[0]
  const service = serviceType.replace(/_/g, ' ')
  const serviceLabel = service.charAt(0).toUpperCase() + service.slice(1)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:32px 16px;background:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;">
    <div style="background:${tenant.primary_color};padding:24px 32px;">
      ${tenant.logo_url
        ? `<img src="${tenant.logo_url}" height="40" alt="${tenant.business_name}" style="display:block;">`
        : `<p style="margin:0;color:white;font-size:20px;font-weight:700;">${tenant.business_name}</p>`
      }
    </div>
    <div style="padding:32px 36px;">
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0D0D0D;">Hi ${firstName},</h2>
      <p style="margin:0 0 8px;font-size:14px;color:#6B7280;">
        Service requested: <strong style="color:#0D0D0D;">${serviceLabel}</strong>
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#6B7280;">
        Property: <strong style="color:#0D0D0D;">${propertyAddress}</strong>
      </p>
      <div style="background:#F9F9F9;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${tenant.primary_color};text-transform:uppercase;letter-spacing:0.08em;">
          Your Assessment
        </p>
        <p style="margin:0;font-size:14px;color:#4A4A4A;line-height:1.8;white-space:pre-wrap;">${customerReport}</p>
      </div>
      <p style="margin:0 0 24px;font-size:14px;color:#4A4A4A;line-height:1.6;">
        We'll be in touch shortly to discuss next steps. If you have any questions feel free to reach out directly.
      </p>
      <p style="margin:0;font-size:14px;font-weight:700;color:#0D0D0D;">The ${tenant.business_name} Team</p>
    </div>
    <div style="background:#0D0D0D;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);">Powered by Honed Ops</p>
    </div>
  </div>
</body>
</html>`
}

function buildOperatorEmail({
  tenant,
  customerName,
  customerEmail,
  customerPhone,
  propertyAddress,
  serviceType,
  urgency,
  imageCount,
  slug,
}: {
  tenant: Tenant
  customerName: string
  customerEmail: string
  customerPhone: string
  propertyAddress: string
  serviceType: string
  urgency: string
  imageCount: number
  submissionId: string
  slug: string
}): string {
  const service = serviceType.replace(/_/g, ' ')
  const urgencyLabel =
    urgency === 'high' ? '🚨 Emergency' : urgency === 'medium' ? '⚡ Within a week' : '📅 Not urgent'
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}/admin`

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:32px 16px;background:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;">
    <div style="background:#0D0D0D;padding:20px 32px;">
      <p style="margin:0;color:white;font-size:16px;font-weight:700;">New Assessment Submitted</p>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.5);font-size:13px;">${tenant.business_name}</p>
    </div>
    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#6B7280;width:140px;">Name</td>
          <td style="padding:10px 0;border-bottom:1px solid #F5F5F5;font-size:13px;font-weight:600;color:#0D0D0D;">${customerName}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#6B7280;">Email</td>
          <td style="padding:10px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#0D0D0D;">
            <a href="mailto:${customerEmail}" style="color:${tenant.primary_color};">${customerEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#6B7280;">Phone</td>
          <td style="padding:10px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#0D0D0D;">
            <a href="tel:${customerPhone}" style="color:${tenant.primary_color};">${customerPhone}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#6B7280;">Address</td>
          <td style="padding:10px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#0D0D0D;">${propertyAddress}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#6B7280;">Service</td>
          <td style="padding:10px 0;border-bottom:1px solid #F5F5F5;font-size:13px;font-weight:600;color:#0D0D0D;text-transform:capitalize;">${service}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#6B7280;">Urgency</td>
          <td style="padding:10px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#0D0D0D;">${urgencyLabel}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-size:13px;color:#6B7280;">Photos</td>
          <td style="padding:10px 0;font-size:13px;color:#0D0D0D;">${imageCount} photo${imageCount !== 1 ? 's' : ''} submitted</td>
        </tr>
      </table>
      <a href="${dashboardUrl}" style="display:block;background:${tenant.primary_color};color:white;text-align:center;padding:14px 24px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.04em;">
        VIEW FULL ASSESSMENT →
      </a>
      <p style="margin:16px 0 0;font-size:12px;color:#9CA3AF;text-align:center;">
        Log in to your dashboard to see the full AI report and operator assessment.
      </p>
    </div>
  </div>
</body>
</html>`
}

// ── POST handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const tenantId = formData.get('tenantId') as string
    const slug = formData.get('slug') as string
    const customerName = formData.get('customerName') as string
    const customerEmail = formData.get('customerEmail') as string
    const customerPhone = formData.get('customerPhone') as string
    const propertyAddress = formData.get('propertyAddress') as string
    const serviceTypes = formData.getAll('serviceTypes') as string[]
    const treeCount = formData.get('treeCount') as string
    const treeHeight = formData.get('treeHeight') as string
    const hazards = formData.getAll('hazards') as string[]
    const urgency = formData.get('urgency') as string
    const additionalNotes = formData.get('additionalNotes') as string
    const imageFiles = formData.getAll('images') as File[]

    // 2. Fetch tenant
    const { data: tenant } = await getSupabaseAdmin()
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single()

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // 3. Upload images to Vercel Blob
    const imageUrls: string[] = []
    for (const image of imageFiles) {
      if (image.size === 0) continue
      const blob = await put(
        `assessments/${tenantId}/${Date.now()}-${image.name}`,
        image,
        { access: 'public', contentType: image.type }
      )
      imageUrls.push(blob.url)
    }

    // 4. Build form data object
    const formDataObj = {
      service_type: serviceTypes.join(', '),
      tree_count: treeCount,
      tree_height: treeHeight,
      hazards,
      urgency,
      additional_notes: additionalNotes,
    }

    // 5. Generate AI reports
    let customerReport = ''
    let operatorReport = ''

    try {
      const imageContent = imageUrls.map(url => ({
        type: 'image' as const,
        source: { type: 'url' as const, url },
      }))

      const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: `You are an expert tree service assessor for ${tenant.business_name}. You analyze submitted photos and job details to generate two reports: one for the customer and one for the operator.

Respond with JSON only. No markdown, no preamble.
{"customer_report": string, "operator_report": string}

Customer report rules:
- Plain language, friendly
- Acknowledge what they submitted
- Describe what the job likely involves
- Mention timeline and what to expect
- 2-3 short paragraphs
- No pricing

Operator report rules:
- Technical assessment
- Safety considerations
- Equipment likely needed
- Estimated crew size and time
- Pricing signals and complexity level (low/medium/high)
- Any red flags from the photos
- 3-4 paragraphs`,
          messages: [{
            role: 'user',
            content: [
              ...imageContent,
              {
                type: 'text',
                text: `Generate assessment reports for this tree service job.

Business: ${tenant.business_name}
Customer: ${customerName}
Address: ${propertyAddress}
Service needed: ${serviceTypes.join(', ').replace(/_/g, ' ')}
Tree count: ${treeCount || 'Not specified'}
Tree height: ${treeHeight || 'Not specified'}
Hazards: ${hazards.join(', ') || 'None reported'}
Urgency: ${urgency || 'Not specified'}
Notes: ${additionalNotes || 'None'}
Photos submitted: ${imageUrls.length}`,
              },
            ],
          }],
        }),
      })

      const aiData = await aiResponse.json()
      const rawText: string = aiData.content?.[0]?.text ?? ''
      const parsed = JSON.parse(rawText) as { customer_report?: string; operator_report?: string }
      customerReport = parsed.customer_report ?? ''
      operatorReport = parsed.operator_report ?? ''
    } catch (aiErr) {
      console.error('AI report generation failed:', aiErr)
      customerReport = 'Thank you for submitting your assessment. Our team will review your request and follow up shortly.'
      operatorReport = 'AI report generation failed — please review submission details manually.'
    }

    // 6. Save to Supabase
    const { data: submission, error: dbError } = await getSupabaseAdmin()
      .from('field_submissions')
      .insert({
        tenant_id: tenantId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        property_address: propertyAddress,
        form_data: formDataObj,
        image_urls: imageUrls,
        customer_report: customerReport,
        operator_report: operatorReport,
        status: 'new',
      })
      .select()
      .single()

    if (dbError || !submission) {
      console.error('DB insert failed:', dbError)
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    // 7. Send emails (non-fatal if they fail)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      try {
        await Promise.all([
          resend.emails.send({
            from: `${tenant.business_name} <contact@honedops.com>`,
            to: customerEmail,
            subject: `Your Assessment Report — ${tenant.business_name}`,
            html: buildCustomerEmail({
              tenant,
              customerName,
              propertyAddress,
              serviceType: serviceTypes.join(', '),
              customerReport,
            }),
          }),
          resend.emails.send({
            from: 'Honed Ops Field App <contact@honedops.com>',
            to: tenant.notification_email,
            subject: `New Assessment — ${customerName}`,
            html: buildOperatorEmail({
              tenant,
              customerName,
              customerEmail,
              customerPhone,
              propertyAddress,
              serviceType: serviceTypes.join(', '),
              urgency,
              imageCount: imageUrls.length,
              submissionId: submission.id as string,
              slug,
            }),
          }),
        ])
      } catch (emailErr) {
        console.error('Email delivery failed:', emailErr)
      }
    }

    // 8. Return success
    return NextResponse.json({ success: true, submissionId: submission.id })
  } catch (err) {
    console.error('Submit route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
