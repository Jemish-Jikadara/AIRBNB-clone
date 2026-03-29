const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
}); 

(async() => {
try {
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
  const info = await transporter.sendMail({
    from: 'jikadara2aj@gmail.com', // sender address
    to: "jikadara2aj@gmail.com", // list of recipients
    subject: "Hello", // subject line
    text: "Hello world?", // plain text body
    html: `<b>Hello world?, ${otp}</b>`, // HTML body
  });

  console.log("Message sent: %s", info.messageId);
  // Preview URL is only available when using an Ethereal test account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
} catch (err) {
  console.error("Error while sending mail:", err);
}
})()
