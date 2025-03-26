
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

const sendInvitationMail = async (name) => {
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
    subject: "Wribate Join Invitation",
    html: `<!DOCTYPE html>
<html>
<head>
    <title>You're Invited to Join Our Platform!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 15px;
            font-size: 22px;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }
        .content {
            padding: 20px;
            font-size: 16px;
            color: #333333;
        }
        .button {
            background-color: #007bff;
            color: white;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin-top: 20px;
            font-size: 18px;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            🎉 You're Invited to Join Our Platform!
        </div>
        <div class="content">
            <p>Hello <b>${name}</b>,</p>
            <p>We are excited to invite you to join <b>Wribate</b>, a platform where you can engage in structured debates, learn, and grow.</p>
            <p>Click the button below to accept your invitation and create your account:</p>
            <a href="https://wribate-d6342.web.app/#/auth" class="button">Join Now</a>
            <p>If you did not request this invitation, please ignore this email.</p>
        </div>
        <div class="footer">
            &copy; 2011 Wribate. All rights reserved.
        </div>
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


/* 
 */

export default { contactUs, appendUrls, sendInvitationMail }