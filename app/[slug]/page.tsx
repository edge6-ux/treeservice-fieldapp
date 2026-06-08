import { getSupabaseAdmin } from '@/lib/supabase-server'
import type { Tenant } from '@/lib/types'
import { AssessmentForm } from '@/components/assessment/AssessmentForm'
import { AlertCircle } from 'lucide-react'

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
    .is('deleted_at', null)
    .single()

  if (!tenant) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border p-12 shadow-sm max-w-md w-full text-center">
          <AlertCircle className="mx-auto mb-4 text-[#9CA3AF]" size={48} />
          <h2 className="font-bold text-[#0D0D0D] text-xl mb-2">Temporarily Unavailable</h2>
          <p className="text-[#6B7280] text-sm leading-relaxed">
            This assessment form is temporarily unavailable. Please contact us directly for
            assistance.
          </p>
        </div>
      </div>
    )
  }

  return <AssessmentForm tenant={tenant as Tenant} />
}
