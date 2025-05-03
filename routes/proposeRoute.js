import express from 'express';
const router = express.Router();
import { errorRes } from '../config/generalResponses.js';
import models from '../models/userModel.js';
import { proposeModel, proposeVoteModel } from '../models/wribateModel.js';
const userModel = models.User;


router.post('/propose', async (req, res) => {
    try {

        const { title, user_id, category, tag, country } = req.body;

        if (!title || !user_id, !category || !tag || !country) {
            return errorRes("incomplete req", res);
        }

        console.log(req.body)
        const user = await userModel.findById(user_id);

        if (!user) {
            return errorRes("User doesn't exist", res);
        }

        const propose = await proposeModel.create({
            title,
            user_id,
            category,
            tag,
            country,
            userName: user.userName
        })

        return res.status(200).json({
            res: true,
            msg: "Success",
            propose
        })

    }
    catch (err) {
        console.log(err);

        return errorRes("server error", res);
    }
})

router.get('/propose', async (req, res) => {
    try {

        const propose = await proposeModel.find({});

        return res.status(200).json({
            res: true,
            msg: "req ok",
            propose
        })

    }
    catch (err) {
        console.log(err);
        return errorRes("server error", res)
    }
});

router.post('/propose-vote', async (req, res) => {
    try {

        const { id, propose_id } = req.body;

        if (!id || !propose_id) {
            return errorRes("incomplete req", res);
        }

        const vote = await proposeVoteModel.findOne({ user_id: id,propose_id });

        if (vote) {
            return res.status(200).json({
                res: false,
                msg: "Already Voted",
            })
        }

        const propose = await proposeModel.findById(propose_id)
        propose.votes = propose.votes+1;
        await propose.save()

        await proposeVoteModel.create({
            user_id:id,
            propose_id
        })

        return res.status(200).json({
            res:true,
            msg:"Voted",
        })

    }
    catch (err) {
        console.log(err);
        return errorRes("server error", res);
    }
})

export default router;