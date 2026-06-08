import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import type { Tenant, FieldSubmission } from '@/lib/types'
import { SubmissionDetail } from '@/components/admin/SubmissionDetail'

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params

  // 1. Fetch tenant
  const { data: tenant } = await getSupabaseAdmin()
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!tenant) notFound()

  // 2. Check auth
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/${slug}/admin/login`)

  // 3. Verify user belongs to this tenant
  const { data: tenantCheck } = await getSupabaseAdmin()
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .eq('admin_email', user.email)
    .single()

  if (!tenantCheck) redirect(`/${slug}/admin/login`)

  // 4. Fetch submission
  const { data: submission } = await getSupabaseAdmin()
    .from('field_submissions')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenant.id)
    .single()

  if (!submission) notFound()

  return (
    <SubmissionDetail
      tenant={tenant as Tenant}
      submission={submission as FieldSubmission}
    />
  )
}
