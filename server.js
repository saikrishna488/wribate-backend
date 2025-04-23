import express from 'express';
const app = express()
const port = process.env.PORT || 5000;
import cors from 'cors';
import dotenv from 'dotenv';
import errorHandle from './middlewares/errorHandle.js';
import staffRoute from './routes/staffRoute.js'
import userRoute from './routes/userRoute.js'
import proposeRoute from './routes/proposeRoute.js'
import cookieParser from 'cookie-parser';

//.env
dotenv.config()

//connect to mongodb
import './config/db.js'

//handle json
app.use(express.json({ limit: '50mb' }));

//cookie parser
app.use(cookieParser())

//handle cors
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

//handle error
app.use(errorHandle);

//handle routes
app.get('/',(req,res)=>{
    res.send("Server is Live")
})

app.use('/',staffRoute) // staffroute
app.use('/',userRoute) // userroute
app.use('/',proposeRoute)

app.listen(port,()=>{
    console.log("Server is running on http://localhost:"+port)
})