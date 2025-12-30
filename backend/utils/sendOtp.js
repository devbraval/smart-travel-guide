const transporter = require("../email");

async function sendOtp(email,otp) {
    await transporter.sendMail({
        from: `Smart Travel Guide <${process.env.EMAIL_USER}>`,
        to:email,
        subject:"Your Otp Code",
        html:
        `
        <h2>OTP Verification </h2>
        <p>Your OTP is: </p>
        <h1 style="letter-spacing:4px">${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
        `
    });
}