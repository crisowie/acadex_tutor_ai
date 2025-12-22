import express from 'express'
import SingleBookmark from './getSingleBookmarks'
import AddBookmark from './addBookmark'
import GetTypeBookmarks from './getTypeBokmarks';
import  DeleteBookmark from './deleteBookmark';
import AllHistory from "./getHistory"
const router = express.Router()

router.use("/add",AddBookmark)
router.use("/all",GetTypeBookmarks)
router.use("/single",SingleBookmark)
router.use("/delete",DeleteBookmark)
router.use("/history",AllHistory)

export default router