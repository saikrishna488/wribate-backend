import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();

const connectDb = async ()=>{
    try{

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongodb connected!")

    }
    catch(err){
        console.log(err)
    }
}

connectDb();