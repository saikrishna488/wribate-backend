
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



const app = express();

console.log('ENV :', process.env.NODE_ENV);

/* security headers */

app.use(helmet());

/* body parser read the data from the body to req.body */

app.use(express.json({ limit: '10kb' }));

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

/* unhandled routes */

app.all('*', (req, res, next) => {
 next(
  new AppErrors(
   `Can't find this URL ${req.originalUrl} on this Server!`,
   400,
  ),
 );
});

/* global error handlling */

app.use(globalErrorHandler);

export default app
