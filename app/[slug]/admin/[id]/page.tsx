export default async function SubmissionDetail({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params
  return (
    <div className="p-8">
      <p className="text-2xl font-bold">
        Submission detail — coming soon ({slug}/{id})
      </p>
    </div>
  )
}
