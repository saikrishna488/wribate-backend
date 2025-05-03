
export const errorRes = (msg,res) =>{
    let code=400;
    return res.status(code).json({
        res: false,
        msg
    })
}