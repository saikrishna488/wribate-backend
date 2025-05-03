
import express  from "express"
import webHook from "../controller/webhook.js"


const router = express.Router();

router.post("/payment", webHook);

export default router