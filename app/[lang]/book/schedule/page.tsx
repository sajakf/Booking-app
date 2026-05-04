import { redirect } from "next/navigation"

// This step has been replaced by the new weeks selection step.
export default async function SchedulePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  redirect(`/${lang}/book/weeks`)
}
