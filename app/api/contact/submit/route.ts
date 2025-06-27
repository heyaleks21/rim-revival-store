import { Resend } from "resend"
import { NextResponse } from "next/server"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    try {
      // Send confirmation email to the customer
      await resend.emails.send({
        from: "Rim Revival <onboarding@resend.dev>", // Use the default Resend sender until domain is verified
        to: email,
        subject: "We've received your message - Rim Revival",
        html: `
          <div>
            <h1>Thank you for contacting us, ${name}!</h1>
            <p>We've received your message and will get back to you as soon as possible.</p>
            <p>For your reference, here's a copy of your message:</p>
            <blockquote>${message}</blockquote>
            <p>Best regards,<br>The Rim Revival Team</p>
          </div>
        `,
      })

      // Send notification to admin
      await resend.emails.send({
        from: "Rim Revival <onboarding@resend.dev>", // Use the default Resend sender until domain is verified
        to: "admin@rimrevival.com", // Replace with your admin email
        subject: "New Contact Form Submission",
        html: `
          <div>
            <h1>New Contact Form Submission</h1>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <blockquote>${message}</blockquote>
          </div>
        `,
      })

      return NextResponse.json({ success: true, message: "Message sent successfully" })
    } catch (resendError: any) {
      console.error("Resend API error:", resendError)
      return NextResponse.json(
        {
          error: "Failed to send email",
          details: resendError.message || "Unknown error with email service",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Contact form submission error:", error)
    return NextResponse.json(
      { error: "Failed to process request", details: error.message || "Unknown error" },
      { status: 500 },
    )
  }
}
