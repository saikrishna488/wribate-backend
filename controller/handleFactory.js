
import nodemailer from "nodemailer"

const contactUs = async (mail, otp) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use SSL
    auth: {
      user: process.env.EMAIL,
      pass: process.env.MAILPWD,
    }
  });

  // Configure the mailoptions object
  const mailOptions = {
    from: process.env.EMAIL,
    to: mail,
    subject: "Wribate verification mail",
    html: `<!DOCTYPE html>
 <html>
 <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hey Admin, you received a new enquiry</title>
 </head>
 <body>
    <div>
        <h3> Subject: Verification OTP </h3>
        <h4>OTP:${otp}</h4>
        <p>This the OTP veification for Wribate do not share with anyone!</p>
    </div>
 </body>
 </html>`,
  };

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });

}

const appendUrls = async (user) => {
  const baseURL = process.env.USER
  if (user.profilePhoto) user.profilePhoto = `${baseURL}${user.profilePhoto}`
  return user
}


export default { contactUs, appendUrls }