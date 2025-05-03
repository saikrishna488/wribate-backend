import express from 'express';
const router = express.Router();
import models from '../models/userModel.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { errorRes } from '../config/generalResponses.js';
import blogModel from '../models/blogModel.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from'dotenv';
const userModel = models.User;

//env
dotenv.config();

//config
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET
})

router.post('/sregister', async (req, res) => {
    try {

        const { name, email, password, userRole, userName } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(401).json({
                res: false,
                msg: "incomplete request"
            })
        }

        const user = await userModel.findOne({ email});

        if (user) {

            user.userRole = userRole;

            await user.save();

            return res.status(200).json({
                res: true,
                msg: "Email already Found Role Updated to "+userRole
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            name,
            email,
            password: hashedPassword,
            userName,
            userRole
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

        const user = await userModel.findOne({ email });

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

        res.cookie('admintoken', token, {
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

        const token = req.cookies.admintoken;

        if(!token){
            return res.status(401).json({
                res:false,
                msg:"incomplete req"
            })
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = await userModel.findOne({email:decoded.email})

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

        res.clearCookie('admintoken', {
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
            oldBlog.author_name = author.name;
            
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

        const blogs = await blogModel.find({}).sort({ createdAt: -1 });

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

//get staff blog
router.post('/blogs',async (req,res)=>{
    try{

        const {author_id} = req.body;

        if(!author_id){
            return errorRes("incomplete req",res)
        }


        const blogs = await blogModel.find({ author_id }).sort({ createdAt: -1 });

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
router.get('/blog/:id',(async (req,res)=>{

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