
import crypto from "crypto"
import moment from "moment-timezone"
import catchAsync from "../utils/catchAsync.js"
import userModel from "../models/userModel.js";


const webHook = async (inputs) => {
  //logger.debug(process.env.RAZORPAY_WEBHOOK_SECRET, "RAZORPAY_WEBHOOK_SECRET");

  const expectedSignature = crypto
    .createHmac("sha256", process.env.WEB_HOOK_SECRET)
    .update(JSON.stringify(inputs.body))
    .digest("hex");

  console.log("sig received :", inputs.headers["x-razorpay-signature"]);
  console.log("sig generated :", expectedSignature);
  console.log(inputs.body, "body");
  //console.log(inputs.body.payload.payment, "payload");

  if (expectedSignature === inputs.headers["x-razorpay-signature"]) {
    console.log("Valid request");
    const Status = inputs.body.event;
    console.log("Status", Status);
    let paymentDetails;
    let orderDetails;
    let razorpayOrderId;
    let transactionId;
    let phoneNumberWithoutPrefix;
    let paymentStatus;
    let fee;
    let tax;
    let payment;
    let order;


    switch (Status) {
      case "order.paid":
        console.log("enter to case!");
        const id = inputs.body.payload.payment.entity.notes.transaction_id;
        paymentDetails = inputs.body.payload.payment.entity;
        orderDetails = inputs.body.payload.order.entity;

        console.log("Payment Details: ", paymentDetails);
        console.log("Order Details: ", orderDetails);

        razorpayOrderId = paymentDetails.order_id;
        transactionId = orderDetails.receipt;
        console.log("transactionId",transactionId)
        phoneNumberWithoutPrefix = paymentDetails.contact.substring(3);
        paymentStatus = paymentDetails.status;
        fee = parseFloat(paymentDetails.fee / 100).toFixed(2);
        tax = parseFloat(paymentDetails.tax / 100).toFixed(2);
        payment = { method: paymentDetails.method, fee: fee, tax: tax };
        order = {
          amount_paid: paymentDetails.amount / 100,
          Status: "paid",
        };

        paymentStatus="completed"

        const updated = await userModel.Razorpay.findOneAndUpdate(
            { transactionId },
            { paymentStatus },
            { new: true }
          );
          const user=await userModel.Razorpay.findOne({transactionId})
          console.log("user😘😘😘😘😘😘😘😘",user)
       
          const durationInDays = 365; // or get from plan
          const startDate = new Date();
          const expiryDate = new Date(startDate.getTime() + durationInDays * 24 * 60 * 60 * 1000);
      
          const updatedUser = await userModel.User.findByIdAndUpdate(
            user.userId,
            {
              subscription: {
                isActive: true,
                startDate,
                durationInDays,
                expiryDate
              }
            },
            { new: true }
          );

        break;
      default:
        console.log("PAYOUT STAGE: ", Status);
        break;
    }
  }
};

const razorpay = catchAsync(async (req, res, next) => {
  await webHook(req);
  console.log(req.body)
  res.status(200).json({ screentatus: "Success" });
});

export default razorpay