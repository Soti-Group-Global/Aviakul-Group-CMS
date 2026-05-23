import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();

    const { fullName, organization, designation, email, phone, tier } = body;

    if (!fullName || !email) {
      return Response.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.zeptomail.in",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"NAO 2026" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "NAO 2026 Sponsorship Brochure",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height:1.6;">

          <!-- Logos (left & right) -->
        <table width="100%" style="margin-bottom:20px;">
          <tr>
            <td align="left">
              <img src="https://aviationolympiad.com/NAO.png" alt="NAO Logo" style="height:45px;" />
            </td>
            <td align="right">
              <img src="https://aviationolympiad.com/CSO.png" alt="CSO Logo" style="height:45px;" />
            </td>
          </tr>
        </table>

                <h2 style="color:#1b3687;">Download NAO 2026 Sponsorship Brochure</h2>


          <p>Hello ${fullName},</p>

          <p>
            Thank you for your interest in partnering with
            National Aviation Olympiad 2026.
          </p>

          <p>
            Please find the sponsorship brochure attached.
          </p>

          <br/>

          <p>
            Regards,<br/>
            NAO Team
          </p>
        </div>
      `,
      attachments: [
        {
          filename: "NAO_2026_Brochure.pdf",
          path: process.cwd() + "/public/NAO_2026_Sponsorship_Brochure.pdf",
        },
      ],
    });

    await transporter.sendMail({
      from: `"NAO 2026" <${process.env.EMAIL_USER}>`,
      to: "nao@thecso.in",
      subject: "New Sponsorship Brochure Request",
      html: `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2>New Sponsorship Brochure Request</h2>

      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse;">
        <tr>
          <td><strong>Full Name</strong></td>
          <td>${fullName}</td>
        </tr>

        <tr>
          <td><strong>Organization</strong></td>
          <td>${organization}</td>
        </tr>

        <tr>
          <td><strong>Designation</strong></td>
          <td>${designation}</td>
        </tr>

        <tr>
          <td><strong>Email</strong></td>
          <td>${email}</td>
        </tr>

        <tr>
          <td><strong>Phone</strong></td>
          <td>${phone}</td>
        </tr>

        <tr>
          <td><strong>Partnership Tier</strong></td>
          <td>${tier || "Not selected"}</td>
        </tr>
      </table>
    </div>
  `,
    });

    return Response.json({
      success: true,
      message: "Brochure sent successfully",
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
