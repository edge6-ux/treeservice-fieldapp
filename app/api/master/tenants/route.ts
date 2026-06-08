import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    const { data: tenants, error } = await getSupabaseAdmin()
      .from('tenants')
      .select('*, submission_count:field_submissions(count)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(tenants ?? [])
  } catch (err) {
    console.error('GET /api/master/tenants error:', err)
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      slug: string
      business_name: string
      industry: string
      primary_color: string
      secondary_color: string
      logo_url: string
      notification_email: string
      admin_email: string
      admin_password: string
    }

    const {
      slug,
      business_name,
      industry,
      primary_color,
      secondary_color,
      logo_url,
      notification_email,
      admin_email,
      admin_password,
    } = body

    // 1. Validate slug is unique
    const { data: existing } = await getSupabaseAdmin()
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
    }

    // 2. Create Supabase Auth user
    const { data: authUser, error: authError } = await getSupabaseAdmin()
      .auth.admin.createUser({
        email: admin_email,
        password: admin_password,
        email_confirm: true,
      })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // 3. Insert tenant
    const { data: tenant, error: insertError } = await getSupabaseAdmin()
      .from('tenants')
      .insert({
        slug,
        business_name,
        industry: industry || 'tree_services',
        primary_color: primary_color || '#1C3A2B',
        secondary_color: secondary_color || '#C8922A',
        logo_url: logo_url || '',
        notification_email,
        admin_email,
        active: true,
      })
      .select()
      .single()

    if (insertError) throw insertError
    return NextResponse.json(tenant)
  } catch (err) {
    console.error('POST /api/master/tenants error:', err)
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 })
  }
}
