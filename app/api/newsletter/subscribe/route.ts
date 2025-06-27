import { Resend } from "resend"
import { NextResponse } from "next/server"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    try {
      // Send confirmation email to the subscriber
      const data = await resend.emails.send({
        from: "Rim Revival <onboarding@resend.dev>", // Use the default Resend sender until domain is verified
        to: email,
        subject: "Welcome to Rim Revival Newsletter",
        html: `
          <div>
            <h1>Thank you for subscribing!</h1>
            <p>You're now subscribed to the Rim Revival newsletter. We'll keep you updated with our latest products, promotions, and wheel care tips.</p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The Rim Revival Team</p>
          </div>
        `,
      })

      return NextResponse.json({ success: true, message: "Subscription successful" })
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
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "Failed to process request", details: error.message || "Unknown error" },
      { status: 500 },
    )
  }
}
