import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import type { Tenant } from '@/lib/types'
import { LoginForm } from '@/components/admin/LoginForm'

export default async function LoginPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: tenant } = await getSupabaseAdmin()
    .from('tenants')
    .select('business_name, logo_url, primary_color, slug')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!tenant) notFound()

  return <LoginForm tenant={tenant as Pick<Tenant, 'business_name' | 'logo_url' | 'primary_color' | 'slug'>} />
}
