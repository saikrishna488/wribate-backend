
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

  logger.debug("sig received :", inputs.headers["x-razorpay-signature"]);
  logger.debug("sig generated :", expectedSignature);
  logger.debug(inputs.body, "body");
  //logger.debug(inputs.body.payload.payment, "payload");

  if (expectedSignature === inputs.headers["x-razorpay-signature"]) {
    logger.debug("Valid request");
    const Status = inputs.body.event;
    logger.debug("Status", Status);
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
        logger.debug("enter to case!");
        const id = inputs.body.payload.payment.entity.notes.transaction_id;
        paymentDetails = inputs.body.payload.payment.entity;
        orderDetails = inputs.body.payload.order.entity;

        logger.debug("Payment Details: ", paymentDetails);
        logger.debug("Order Details: ", orderDetails);

        razorpayOrderId = paymentDetails.order_id;
        transactionId = paymentDetails.id;
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
       
        break;
      default:
        logger.debug("PAYOUT STAGE: ", Status);
        break;
    }
  }
};

const razorpay = catchAsync(async (req, res, next) => {
  await webHook(req);
  res.status(200).json({ screentatus: "Success" });
});

export default razorpay