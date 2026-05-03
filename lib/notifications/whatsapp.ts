import type { Booking } from "@/types/booking"

export async function sendWhatsAppConfirmation(booking: Booking): Promise<{ sent: boolean }> {
  const message = buildMessage(booking)

  if (process.env.WHATSAPP_STUB === "true") {
    console.log("[WhatsApp STUB] To:", booking.parent.mobile)
    console.log("[WhatsApp STUB] Message:", message)
    return { sent: true }
  }

  const twilio = require("twilio")
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886",
    to: `whatsapp:${booking.parent.mobile}`,
    body: message,
  })

  return { sent: true }
}

export async function sendAbsenceAlert(
  parentPhone: string,
  childName: string,
  date: string
): Promise<{ sent: boolean }> {
  const message = [
    `Dear Parent,`,
    ``,
    `We noticed that ${childName} was marked absent from Little Stars Camp today (${date}).`,
    ``,
    `If this is unexpected, please contact us immediately.`,
    ``,
    `— Little Stars Camp Team`,
  ].join("\n")

  if (process.env.WHATSAPP_STUB === "true") {
    console.log("[WhatsApp STUB - Absence Alert] To:", parentPhone)
    console.log("[WhatsApp STUB - Absence Alert] Message:", message)
    return { sent: true }
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const twilio = require("twilio")
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886",
    to: `whatsapp:${parentPhone}`,
    body: message,
  })
  return { sent: true }
}

function buildMessage(booking: Booking): string {
  const dates = booking.lineItems.map((i) => i.date).join(", ")
  return [
    `Dear ${booking.parent.name},`,
    `Your booking for ${booking.child.name} at Little Stars Camp is confirmed! 🎉`,
    ``,
    `📋 Booking Ref: ${booking.ref}`,
    `🏫 Room: ${booking.lineItems[0]?.classroomName ?? ""}`,
    `📅 Dates: ${dates}`,
    `👤 Instructor: ${booking.lineItems[0]?.instructorName ?? ""}`,
    `💰 Total Paid: ${booking.total.toFixed(3)} KD`,
    ``,
    `See you soon!`,
  ].join("\n")
}
