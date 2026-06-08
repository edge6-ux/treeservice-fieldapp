import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json() as Record<string, unknown>

    const { data: tenant, error } = await getSupabaseAdmin()
      .from('tenants')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(tenant)
  } catch (err) {
    console.error('PATCH /api/master/tenants/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 })
  }
}
