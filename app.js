
import express from "express"
import sanitiseMango from "express-mongo-sanitize"
import xss from "xss-clean"
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from 'url';
import morgan from "morgan";
import rateLimit from "express-rate-limit"
import log from "./logs/logger.js"
import AppErrors from "./utils/appErrors.js"
import globalErrorHandler from "./controller/errorController.js"
import userRoutes from "./routes/userRotes.js"
import adminRoutes from "./routes/adminRoutes.js"
import webHookRoutes from "./routes/webhook.js"
import cors from "cors"
import proposeRoute from './routes/proposeRoute.js'
import cookieParser from 'cookie-parser';
import blogRoute from './routes/staffRoute.js'
import providerRoute from './routes/providerRoute.js'



const app = express();

console.log('ENV :', process.env.NODE_ENV);

/* security headers */

app.use(helmet());
app.use(cors({ 
    origin: "http://localhost:3000",
    credentials:true
 }))

/* body parser read the data from the body to req.body */

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser())

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'controller', 'uploads')));

/* sanitize data against noSQl attacks */

app.use(sanitiseMango());

/*  sanitize data like html injection */

app.use(xss());

/* development logging */

app.use(morgan('dev'));

/* control number of api requests from same IP */

const limiter = rateLimit({
 max: 1000,
 windowMs: 60 * 60 * 1000,
 message: 'To many requesta from this IP . Please try in an hour!',
});

app.use('/api', limiter);

/* save the user lo logger file */

app.use((req, res, next) => {
 log.info(req.url);
 next();
});

/* ROUTES */

app.use('/api/user', userRoutes)

app.use('/api/admin', adminRoutes)

app.use('/api/webhook',webHookRoutes)

app.use('/api',proposeRoute);

app.use('/api',blogRoute )

app.use('/api',providerRoute)
// app.use('/',)

/* unhandled routes */

app.all('*', (req, res, next) => {
//  next(
//   new AppErrors(
//    `Can't find this URL ${req.originalUrl} on this Server!`,
//    400,
//   ),
//  );

 return res.json({
    res:false,
    msg:"No api found at this url"
 })
});

/* global error handlling */

app.use(globalErrorHandler);

export default app
