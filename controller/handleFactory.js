
import nodemailer from "nodemailer"
import moment from "moment";
import dotenv from "dotenv"
import Razorpay from "razorpay";
import { SendTemplatedEmailCommand, SendEmailCommand, SESClient } from "@aws-sdk/client-ses";


dotenv.config();

const accessKeyId = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_KEY
const region = process.env.REGION


const ses = new SESClient({
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
  },
  region: region
})

// async function sendEmail(mail, otp) {
//   console.log(process.env.ACCESS_KEY,process.env.SECRET_KEY,process.env.SES_MAIL,mail,otp)
//   const params = {
//     Source: process.env.SES_MAIL, // Must be a verified email in SES
//     Destination: {
//       ToAddresses: [mail], // Receiver's email
//     },
//     Message: {
//       Body: {
//         Html: {
//           // HTML Format of the email
//           Charset: "UTF-8",
//           Data: `<!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>OTP Verification</title>
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             background-color: #f4f4f4;
//             margin: 0;
//             padding: 0;
//         }
//         .container {
//             max-width: 600px;
//             margin: 20px auto;
//             background: #ffffff;
//             padding: 20px;
//             border-radius: 10px;
//             box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
//             text-align: center;
//         }
//         h2 {
//             color: #333;
//         }
//         p {
//             font-size: 16px;
//             color: #555;
//         }
//         .otp {
//             font-size: 24px;
//             font-weight: bold;
//             color: #007bff;
//             padding: 10px;
//             border: 2px dashed #007bff;
//             display: inline-block;
//             margin: 15px 0;
//         }
//         .footer {
//             margin-top: 20px;
//             font-size: 14px;
//             color: #888;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <h2>OTP Verification</h2>
//         <p>Your One-Time Password (OTP) for verification is:</p>
//         <div class="otp">${otp}</div>
//         <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
//         <p>If you did not request this, please ignore this email.</p>
//         <div class="footer">
//             <p>Thank you,<br><strong>Uptik</strong></p>
//         </div>
//     </div>
// </body>
// </html>
// `
//         },

//       },
//       Subject: {
//         Charset: "UTF-8",
//         Data: "Your OTP for Verification - Wribate"
//       }
//     },
//   };

//   try {
//     const command = new SendEmailCommand(params);
//     const response = await ses.send(command);
//     console.log("Email sent successfully!", response);
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// }

async function sendEmail(recipient, otp) {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // true for 465, false for 587
    auth: {
      user: "info@wribate.com",
      pass: process.env.WRIBATE_MAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"Wribate" <info@wribate.com>',
    to: recipient,
    subject: "Your OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f9f9f9; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">OTP Verification</h2>
          <p style="font-size: 16px; color: #555;">Your One-Time Password (OTP) is:</p>
          <div style="font-size: 24px; font-weight: bold; color: #007bff; margin: 20px 0;">${otp}</div>
          <p style="color: #888;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 14px; color: #aaa;">Thank you,<br><strong>Wribate.com</strong></p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}



//date format
function formatToUTCString(localTimeString) {
  const date = new Date(localTimeString); // Treated as local time

  const day = date.getUTCDate();
  const month = date.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  // Function to add ordinal suffix (st, nd, rd, th)
  function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${getOrdinal(day)} ${month} ${year}, ${hour12}:${minutes} ${period} UTC`;
}

//send mail to contestents
async function sendEmailToContestents(title, side, date, email, emailAgainst, duration, id) {

  date = formatToUTCString(date)
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // true for 465, false for 587
    auth: {
      user: "info@wribate.com",
      pass: process.env.WRIBATE_MAIL_PASS,
    },
  });

  const lead = side=="For"? "For" : "Against"
  const against = side=="For"? "Against" : "For"

  const mailOptions = {
    from: '"Wribate" <info@wribate.com>',
    to: email,
    subject: "You're Invited to Join a Wribate!",
    html: `
      <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Wribate Invitation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p>Dear <strong>${email}</strong>,</p>

  <p>
    We are excited to invite you to participate as <strong>Lead Panel</strong> in an engaging online Wribate on the motion: 
    <strong>"${title}"</strong>. This event is scheduled for <strong>${date}</strong> at (Time Zone). 
    This is a fantastic opportunity to share your insights, connect with others, and explore diverse perspectives on this important issue.
  </p>

  <h3 style="margin-top: 24px;">Wribate Details:</h3>
  <ul>
    <li><strong>Motion:</strong> ${title}</li>
    <li><strong>Position:</strong>${lead}</li>
    <li><strong>Start Date/Time:</strong> ${date}</li>
    <li><strong>Duration:</strong> ${duration}</li>
    <li><strong>Platform:</strong> <a href="https://wribate.com/wribate/${id}" target="_blank">Visit Wribate</a></li>
    <li><strong>Opposition Lead Panel:</strong> ${emailAgainst} (${against})</li>
  </ul>

  <h3 style="margin-top: 24px;">How to Participate:</h3>
  <p>
    Click the link below to accept the invitation and/or to sign up:
  </p>
  <p>
    <a href="https://wribate.com/wribate/${id}" target="_blank" style="background-color: #007BFF; color: #fff; padding: 10px 16px; text-decoration: none; border-radius: 5px;">
      Accept Invitation & Sign Up
    </a>
  </p>

  <p>
    We believe you will passionately advocate for your position on the topic and play a key role in shaping the outcome of this important discussion. We look forward to your participation!
  </p>

  <p>All the best!</p>

  <p>Regards,<br />
  <strong>Wribate.com</strong></p>
</body>
</html>

    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}


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

const sendInvitationMail = async (name, mail) => {
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

const appendUserPic = async (users) => {
  const baseURL = process.env.USER
  for (const user of users) {
    if (user.profilePhoto) user.profilePhoto = `${baseURL}${user.profilePhoto}`
  }

  return users
}

function generateRounds(startDate, totalDuration) {
  let totalHours = totalDuration * 24; // Convert total duration to hours
  let roundDuration = totalHours / 3; // Divide into 3 equal parts

  let currentStartDate = moment(startDate);
  const rounds = [];

  for (let i = 0; i < 3; i++) {
    let round = {
      roundNumber: i + 1,
      startDate: currentStartDate.toDate(),
      endDate: moment(currentStartDate).add(roundDuration, 'hours').subtract(1, 'second').toDate(),
      duration: `${roundDuration} hours`
    };

    rounds.push(round);
    currentStartDate.add(roundDuration, 'hours'); // Move to next round
  }

  return rounds;
}

async function categorizeWribates(wribates) {

  const currentDate = moment().toDate(); // Get current date
  try {


    // Categorize wribates
    const ongoing = [];
    const completed = [];
    const freeWribates = [];
    const sponsoredWribates = [];

    wribates.forEach(wribate => {
      let startDate = moment(wribate.startDate);
      let endDate = startDate.clone().add(wribate.durationDays, 'days').toDate();

      // Check if wribate is ongoing or completed
      if (endDate >= currentDate) {
        ongoing.push(wribate);
      } else {
        completed.push(wribate);
      }

      // Categorize by type
      if (wribate.type === "Free") {
        freeWribates.push(wribate);
      } else if (wribate.type === "Sponsored") {
        sponsoredWribates.push(wribate);
      }
    });

    return { ongoing, completed, freeWribates, sponsoredWribates };
  } catch (error) {
    console.error("Error fetching wribates:", error);
  }
}

function divideIntoParts(startDate, totalDurationHours, parts = 12) {
  const startTime = new Date(startDate);
  const totalDurationMs = totalDurationHours * 60 * 60 * 1000;
  const partDurationMs = totalDurationMs / parts;

  let timeSlots = [];
  for (let i = 0; i < parts; i++) {
    let partStart = new Date(startTime.getTime() + i * partDurationMs);
    let partEnd = new Date(startTime.getTime() + (i + 1) * partDurationMs);

    timeSlots.push({
      partNumber: i + 1,
      startDate: partStart.toISOString(),
      endDate: partEnd.toISOString()
    });
  }

  return timeSlots;
}

function countVotesByRound(rounds, votes) {
  let roundVotes = rounds.map(round => {
    let forCount = 0;
    let againstCount = 0;
    const roundStart = new Date(round.startDate);
    const roundEnd = new Date(round.endDate);

    votes.forEach(vote => {
      console.log('vote', vote)
      const voteTime = new Date(vote.createdAt);
      if (voteTime >= roundStart && voteTime <= roundEnd) {
        if (vote.vote === "For") forCount++;
        if (vote.vote === "Against") againstCount++;
      }
    });

    return {
      roundNumber: round.partNumber,
      forVotes: forCount,
      againstVotes: againstCount
    };
  });

  // Add round 13 for votes after the last round
  let lastRoundEnd = new Date(rounds[rounds.length - 1].endDate);
  let forCount13 = 0;
  let againstCount13 = 0;

  votes.forEach(vote => {
    const voteTime = new Date(vote.createdAt);
    if (voteTime > lastRoundEnd) {
      if (vote.vote === "For") forCount13++;
      if (vote.vote === "Against") againstCount13++;
    }
  });

  roundVotes.push({
    roundNumber: 13,
    forVotes: forCount13,
    againstVotes: againstCount13
  });
  return roundVotes;
}

const razorpayInstance = async () => {
  const instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
  });
  return instance;
};

const createorderpayment = async (orderPayment, instance) => {
  return await instance.orders.create(orderPayment);
};

const getpaymentdetails = async (paymentId, instance) => {
  return await instance.payments.fetch(paymentId);
};

/* 
 */

export default {
  contactUs, appendUrls, sendInvitationMail, generateRounds,
  categorizeWribates, appendUserPic, divideIntoParts, countVotesByRound,
  razorpayInstance, createorderpayment, getpaymentdetails, sendEmail, sendEmailToContestents
}