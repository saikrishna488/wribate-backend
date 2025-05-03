import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String
    },
    type: {
        type: String,
        required: true,
        default: 'user'
    },
    username: {
        type:String,
    }
})

const userModel = mongoose.model('user', userSchema);

export default userModel;