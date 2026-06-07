export type Industry = 'tree_services'

export type SubmissionStatus = 'new' | 'reviewed' | 'quoted' | 'won' | 'lost'

export type Tenant = {
  id: string
  created_at: string
  updated_at: string
  slug: string
  business_name: string
  industry: Industry
  logo_url: string
  primary_color: string
  secondary_color: string
  notification_email: string
  admin_email: string
  active: boolean
}

export type FieldSubmission = {
  id: string
  created_at: string
  tenant_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  property_address: string
  form_data: Record<string, unknown>
  image_urls: string[]
  customer_report: string
  operator_report: string
  status: SubmissionStatus
  notes: string
}

export type TreeServiceFormData = {
  service_type: string
  tree_count: string
  tree_height: string
  hazards: string[]
  urgency: string
  additional_notes: string
}
