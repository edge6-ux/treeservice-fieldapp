import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import type { Tenant } from '@/lib/types'
import { AssessmentForm } from '@/components/assessment/AssessmentForm'

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: tenant } = await getSupabaseAdmin()
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!tenant) notFound()

  return <AssessmentForm tenant={tenant as Tenant} />
}
