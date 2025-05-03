import express from 'express';
const router = express.Router();
import userModel from '../model/userModel.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { errorRes } from '../config/generalResponses.js';
import blogModel from '../model/blogModel.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from'dotenv';
import { asyncHandler } from '../utils/tryCatch.js';

//env
dotenv.config();

//config
cloudinary.config({ 
    cloud_name: 'dzzgu7qws', 
    api_key: '994123695836625', 
    api_secret: process.env.CLOUDINARY
})

router.post('/sregister', async (req, res) => {
    try {

        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(401).json({
                res: false,
                msg: "incomplete request"
            })
        }

        const user = await userModel.findOne({ email, type: "staff" });

        if (user) {
            return res.status(401).json({
                res: false,
                msg: "Email already used"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            name,
            email,
            password: hashedPassword,
            role,
            type: "staff"
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

        return res.status(500).json({
            res: false,
            msg: "server error"
        })
    }
})

router.post('/slogin', async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            res.status(401).json({
                res: false,
                msg: "incomplete request"
            })
        }

        const user = await userModel.findOne({ email, type: "staff" });

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
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in ms
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
router.get('/sjwt',async (req,res)=>{
    try{

        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                res:false,
                msg:"incomplete req"
            })
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = await userModel.findOne({email:decoded.email,type:"staff"})

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

router.get('/slogout', (req, res) => {
    try {

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV,
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


//blog publish
router.post('/blog',async (req,res)=>{
    try{

        const {title, content, image, author_id, id} = req.body;

        if(!title || !content || !author_id){
            return errorRes("incomplete req",res);
        }

        const author = await userModel.findById(author_id);

        if(!author){
            return errorRes("Admin not found",res);
        }

        if(id){
            const oldBlog = await blogModel.findById(id);
            oldBlog.content = content || oldBlog.content 
            oldBlog.image = image || oldBlog.image
            oldBlog.title = title || oldBlog.title
            
            await oldBlog.save()

            return res.status(200).json({
                res:true,
                msg:"req ok"
            })
        }

        if(!image){
            return errorRes("incomplete req",res);
        }

        const result = await cloudinary.uploader.upload(image, {
            folder: "blogs", // Optional
          });
      

        const blog = await blogModel.create({
            title,
            content,
            image : result.secure_url,
            author_name: author.name,
            author_id,
            views:1
        })

        return res.status(200).json({
            res:true,
            msg:"req ok"
        })

    }
    catch(err){
        console.log(err);
        return errorRes("server error",res);
    }
});

//delete blog
router.delete('/blog/:id',async(req,res)=>{
    try{

        const {id} = req.params;

        if(!id){
            return errorRes("incomplete req");
        }

        await blogModel.findByIdAndDelete(id);

        return res.status(200).json({
            res:true,
            msg:"deleted!"
        })

    }
    catch(err){
        console.log(err)
        return errorRes("sever error",res)
    }
})

//get blogs
router.get('/blogs',async (req,res)=>{
    try{

        const blogs = await blogModel.find({})

        return res.status(200).json({
            res:true,
            msg:"req ok",
            blogs
        })

    }
    catch(err){
        console.log(err)
        return errorRes("server err",res);
    }
})

//get blog
router.get('/blogs',async (req,res)=>{
    try{

        const blogs = await blogModel.find({})

        return res.status(200).json({
            res:true,
            msg:"req ok",
            blogs
        })

    }
    catch(err){
        console.log(err)
        return errorRes("server err",res);
    }
})
//get staff blogs
router.get('/blog/:id',asyncHandler(async (req,res)=>{

    const {id} = req.params

    if(!id){
        return errorRes("Incomplete req",res)
    }

    const blog = await blogModel.findById(id);

    return res.status(200).json({
        res:true,
        msg:"request ok",
        blog
    })
}))

export default router;