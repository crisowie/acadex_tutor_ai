import express from "express"
import { sendMessage } from "./sendMessage"

const router = express.Router()

router.use("/send-message",sendMessage)
router.use("/sigle")