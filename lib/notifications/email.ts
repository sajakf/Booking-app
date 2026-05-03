import type { Booking } from "@/types/booking"

export async function sendConfirmationEmail(booking: Booking): Promise<{ sent: boolean }> {
  const html = buildEmailHtml(booking)

  if (process.env.EMAIL_STUB === "true") {
    console.log("[Email STUB] To:", booking.parent.email)
    console.log("[Email STUB] Subject: Booking Confirmed –", booking.ref)
    return { sent: true }
  }

  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@littlestarskw.com",
    to: booking.parent.email,
    subject: `Booking Confirmed – ${booking.ref}`,
    html,
  })

  return { sent: true }
}

function buildEmailHtml(booking: Booking): string {
  const rows = booking.lineItems
    .map(
      (item) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.date}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.timeSlotId === "morning" ? "Morning 9AM–12PM" : "Afternoon 1PM–4PM"}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.instructorName}</td>
    </tr>`,
    )
    .join("")

  return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <h1 style="color:#1d4ed8">Booking Confirmed! 🎉</h1>
  <p>Dear ${booking.parent.name},</p>
  <p>Your booking for <strong>${booking.child.name}</strong> has been confirmed.</p>

  <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:20px 0">
    <p><strong>Booking Reference:</strong> <code style="font-size:18px;color:#1d4ed8">${booking.ref}</code></p>
    <p><strong>Classroom:</strong> ${booking.lineItems[0]?.classroomName ?? ""}</p>
    <p><strong>Total Paid:</strong> ${booking.total.toFixed(3)} KD</p>
  </div>

  <h2>Your Schedule</h2>
  <table style="width:100%;border-collapse:collapse">
    <thead>
      <tr style="background:#1d4ed8;color:white">
        <th style="padding:8px;text-align:left">Date</th>
        <th style="padding:8px;text-align:left">Time</th>
        <th style="padding:8px;text-align:left">Instructor</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <h2>What to Bring</h2>
  <ul>
    <li>Water bottle</li>
    <li>Comfortable clothes &amp; closed shoes</li>
    <li>Light snack</li>
    <li>Sunscreen (if outdoor activities)</li>
    <li>Enthusiasm!</li>
  </ul>

  <p style="color:#64748b;font-size:14px">Questions? WhatsApp us or reply to this email.</p>
</body>
</html>`
}
