
import mongoose from 'mongoose';
import cron from 'node-cron';
import http from "http";
import dotenv from "dotenv"
import log from "./logs/logger.js"
import app from "./app.js"
import userModel from './models/userModel.js';
import { initializeSocket } from "./socket/socket.js";



dotenv.config();

/* handle unhandleException */

process.on('uncaughtException', (err) => {
 console.log('unhandled Exception appShutting down...😈');
 console.log(err.name, err.message, err);
 process.exit(1);
});


/* cron job for checking subscription */


cron.schedule('0 0 * * *', async () => {
  const now = new Date();

  const result = await userModel.User.updateMany(
    {
      'subscription.isActive': true,
      'subscription.expiryDate': { $lte: now }
    },
    { 'subscription.isActive': false }
  );

  console.log(`[CRON] Deactivated ${result.modifiedCount} expired subscriptions`);
});

const DB = process.env.DATABASE;

mongoose.connect(DB).then(() => {
 console.log('Connected to MongoDB');
}).catch(err => {
 console.error('Error connecting to MongoDB:', err);
});

/* SERVER */


const server = http.createServer(app);
// Initialize Socket.io
initializeSocket(server);

const port = 8000;
server.listen(port, () => {
 log.info(`server is running  on the port ${port}...`);
 console.log(`server is running  on the port ${port}...`);
});

/*  handle unhandled Rejections  */


process.on('unhandledRejection', (err) => {
 console.log('UnhandledRejection sutting down!!😈..');
 console.log(err.name, err.message, err);
 server.close(() => {
  process.exit(1);
 });
});
