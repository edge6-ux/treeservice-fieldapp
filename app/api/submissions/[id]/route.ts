import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      status?: string
      contacted_at?: string
      contact_method?: 'phone' | 'email'
    }

    const { error } = await getSupabaseAdmin()
      .from('field_submissions')
      .update(body)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH submission error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
