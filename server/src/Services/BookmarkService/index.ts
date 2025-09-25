import express from 'express';
import SingleBookmark from './getSingleBookmarks'
import AddBookmark from './addBookmark'
import GetTypeBookmarks from './getTypeBokmarks';
import  DeleteBookmark from './deleteBookmark';

const router = express.Router()

router.use("/add",AddBookmark)
router.use("/all",GetTypeBookmarks)
router.use("/single",SingleBookmark)
router.use("/delete",DeleteBookmark)

export default router