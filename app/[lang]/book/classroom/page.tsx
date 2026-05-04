import { redirect } from "next/navigation"

// This step has been replaced by the new workshop booking flow.
export default async function ClassroomPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  redirect(`/${lang}/book/child`)
}
