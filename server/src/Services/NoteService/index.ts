import express from 'express';
import getAllNotes from './getAllNote';
import addNote from './addNote';
import deleteNote from './deleteNote';

const router = express.Router();

router.use('/all', getAllNotes);
router.use('/add', addNote);
router.use('/delete', deleteNote);

export default router;