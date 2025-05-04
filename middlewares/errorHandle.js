
const errorHandle = (err,req,res,next)=>{
    console.log(err.stack);

    res.status(err.status || 500).json({
        res: false,
        msg: "Something went wrong!"
    })
}

export default errorHandle;