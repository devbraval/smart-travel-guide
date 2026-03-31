import transporter from "../email.js";

const sendEmail = async ({ to, subject, html }) => {  // ✅ destructuring here
  try {
    console.log("Sending email to:", to); // DEBUG

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,   // ✅ now correct
      subject: subject,
      html: html,
    });

  } catch (error) {
    console.log("Send Email Error:", error.message);
    throw error;
  }
};

export default sendEmail;