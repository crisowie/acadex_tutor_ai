import express from "express"
import { sendMessage } from "./sendMessage"
import { SingleChat } from "./getSingleChat"
import { SentMessages } from "./getMessages"
import { DeleteChat } from "./deleteChat"
import { ChatHistory } from "./chatHistory"
import PDFSummarizer from "./pdfSummarizer"
const router = express.Router()

router.use("/send-message", sendMessage)
router.use("/chat-history", SingleChat)
router.use("/sent-messages", SentMessages)
router.use("/delete-chat", DeleteChat)
router.use("/chats-history", ChatHistory)
router.use("/pdf-summarizer", PDFSummarizer)

export default router