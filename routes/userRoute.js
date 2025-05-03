import express from 'express';
const router = express.Router();
import { errorRes } from '../config/generalResponses.js';
import userModel from '../model/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from'jsonwebtoken';


router.post('/register', async (req, res) => {
    try {

        const { name, email, password, username } = req.body;

        if (!name || !email || !password || !username) {
            return errorRes
        }

        const user = await userModel.findOne({ email, type: "user", username });

        if (user) {
            return res.status(401).json({
                res: false,
                msg: "Email or username already used"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            name,
            email,
            password: hashedPassword,
            username,
            type: "user"
        })

        const { password: pwd, ...userObj } = newUser._doc;

        return res.status(200).json({
            res: true,
            msg: "req success",
            user: userObj
        })

    }
    catch (err) {
        console.log(err);

        return errorRes("server error", res)
    }
});

router.post('/login', async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            res.status(401).json({
                res: false,
                msg: "incomplete request"
            })
        }

        const user = await userModel.findOne({ email, type: "user" });

        if (!bcrypt.compare(password, user.password)) {
            return res.status(400).json({
                res: false,
                msg: "Invalid Password"
            })
        }

        const { password: pwd, ...userObj } = user._doc;

        const token = jwt.sign({ email, id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true in production
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
            path:'/'
        });

        return res.status(200).json({
            res: true,
            msg: " request success",
            user: userObj
        })


    }
    catch (err) {

        console.log(err);

        res.status(500).json({
            res: false,
            msg: "server error"
        })
    }
});

//jwt login
router.get('/jwt',async (req,res)=>{
    try{

        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                res:false,
                msg:"incomplete req"
            })
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = await userModel.findOne({email:decoded.email,type:"user"})

        if(!user){
            return res.status(401).json({
                res:false,
                msg:"No user found"
            })
        }

        const {password, ...userObj} = user._doc;

        return res.status(200).json({
            res:true,
            msg:"request success",
            user:userObj
        })
        
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            res:false,
            msg:"server error"
        })
    }
})

router.get('/logout', (req, res) => {
    try {

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV == "production",
            path: '/', // must match path used during set
        });

        return res.status(200).json({ 
            res:true,
            msg: 'Cookie cleared' });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            res: false,
            msg: "server error"
        })
    }
});



export default router;