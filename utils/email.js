
const {Resend} = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(email,code){
    try {
 await resend.emails.send({
    from: "onboarding@resend.dev",
    to : email,
    subject: "Email Verification",
    html: `<h2>Email Verification</h2>
           <p>Your verification code is:</p>
           <h1>${code}</h1>`
 })
} catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
}
module.exports = sendVerificationEmail;

