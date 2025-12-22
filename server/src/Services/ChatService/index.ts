import express from "express"
import { ChatHistory } from "./chatHistory"
import { DeleteChat } from "./deleteChat"
import { SentMessages } from "./getMessages"
import PublicShare from "./getSharedChat"
import { SingleChat } from "./getSingleChat"
import PDFSummarizer from "./pdfSummarizer"
import { RenameChat } from "./renameChat"
import { sendMessage } from "./sendMessage"
import SharedChat from './shareChat'
const router = express.Router()

router.use("/send-message", sendMessage)
router.use("/chat-history", SingleChat)
router.use("/sent-messages", SentMessages)
router.use("/delete-chat", DeleteChat)
router.use("/chats-history", ChatHistory)
router.use("/pdf-summarizer", PDFSummarizer)
router.use("/rename-chat", RenameChat)
router.use("/share", SharedChat); 
router.use("/get-share", PublicShare);


router.use((req, res, next) => {
  console.log("Chat service route hit:", req.method, req.originalUrl);
  next();
});


export default router