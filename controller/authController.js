import jwt from "jsonwebtoken"
import catchAsync from "../utils/catchAsync.js"
import { ErrorResponse } from "../utils/commonResponse.js"
import userModel from "../models/userModel.js"
// authMiddleware.js


const authMiddleware = async (req, res, next) => {
        // Read token from cookies (assuming token is stored in 'token' cookie)
        const token = req.cookies?.token;

        console.log("token :", token, req.cookies)

        if (!token) {
                return res.status(401).json({ message: "Unauthorized" });
        }

        try {
                const decoded = jwt.verify(token, process.env.JTW_SECRET);
                const user = await userModel.User.findById(decoded.id);
                if (!user) return res.status(404).json({ message: "User not found" });

                req.user = user; // Attach user to the request
                next();
        } catch (err) {
                return res.status(403).json({ message: "Invalid token" });
        }
};




const jwtToken = async (id) => {
        const jwtSecret = process.env.JTW_SECRET
        const expiresIn = process.env.JWT_EXPIRES_IN
        const token = jwt.sign({ id: id }, jwtSecret, {
                expiresIn: '30d'
        })
        return token
}

// const authenticateUser = catchAsync(async (req, res, next) => {
//         if (!req.headers.authorization) return ErrorResponse(res, "token is empty")
//         const token = req.headers.authorization.split(' ')[1]
//         if (!token) ErrorResponse(res, "token is empty")
//         const decode = jwt.verify(token, process.env.JTW_SECRET)
//         if (!decode) return ErrorResponse(res, "Un-Authorised user")
//         console.log('decode', decode)
//         const user = await userModel.User.findById(decode.id)
//         if (!user) return ErrorResponse(res, "Un-Authorised user")
//         req.user = user
//         next()
// })

const authenticateSocket = async (socket, next) => {
        try {

                const token = socket.handshake.query?.token; // Get token from handshake
                console.log('token', socket.handshake.query.token)

                if (!token) {
                        throw new Error("Authentication error: No token provided")
                }
                // Verify JWT
                const decoded = jwt.verify(token, process.env.JTW_SECRET)
                if (!decoded) {
                        throw new Error("Authentication error: No token provided")
                        //res.status(401).json({ status: 0, message: "Authentication error: Invalid token" })
                }

                const user = await userModel.User.findById(decoded.id)
                if (!user) throw new Error("Un-Authorised user")

                // return ErrorResponse(res, "Un-Authorised user")

                socket.user = decoded; // Attach user data to the socket
                // Continue with connection

                next()
        } catch (err) {
                console.log("err", err)

        }


}

export default { jwtToken, authenticateSocket, authMiddleware }