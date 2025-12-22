import express from "express";
import chatQuizRouter from "./chatQuiz";
import topicQuizRouter from "./topicQuiz";
import historyQuizRouter from "./quizHistory";
import submitRoute from "./submitAnswer";
import delteRoute from "./deleteQuiz";
import pdfQuizRoute from "./pdfQuiz";
import RenameChat from "./renameChat"
const router = express.Router();

// /quiz/chat/:chatId
router.use("/chat", chatQuizRouter);

// /quiz/topic
router.use("/topic", topicQuizRouter);

// /quiz/delete
router.use("/delete", delteRoute);

// /quiz/history
router.use("/history", historyQuizRouter);

// /quiz/pdf
router.use("/pdf", pdfQuizRoute);

// /quiz/:id/submit
router.use("/", submitRoute);

export { router as QuizRoutes };
