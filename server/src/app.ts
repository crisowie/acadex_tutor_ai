import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import rateLimit from "express-rate-limit";
import { GoogleAuth } from './routes/auth/googleAuth';
import AuthRoutes from './routes/auth/index';
import BookmarkRoutes from './Services/BookmarkService/index'
import { MeRoute } from './routes/userDetailsRoutes/me';
import { ProfileRoute } from './routes/userDetailsRoutes/profile';
import { TrackUserTime } from './routes/userDetailsRoutes/trackTime';
import Chat from './Services/ChatService/index';
import youtubeRoutes from './Services/Google/YoutubeAPI';
import NotesRoutes from './Services/NoteService';
import { QuizRoutes } from './Services/QuizService';
dotenv.config()
const app = express()
const PORT = process.env.PORT || 5050

// Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: ["http://localhost:8080", "https://acadex-tutor-ai.vercel.app", "https://acadex.ai"],
  credentials: true
}))

// Global limiter (everyone)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 100, // each IP gets 100 requests per window
  message: "Too many requests, try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// app.use(globalLimiter);
// Rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000 * 10, // 1 min window
  max: 50, // each IP gets 5 requests per window
  message: "Too many requests, try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});


// Signup route limiter
const signupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // max 30 signups per IP
  message: "Too many signup attempts, please try later.",
});

// app.use("/auth/login", loginLimiter);
// app.use("/auth/signup", signupLimiter);

// Apply general auth limiter only to the rest
// app.use(
//   ["/auth/forgot-password", "/auth/refresh", "/auth/logout", "/auth/delete", "/auth/google"],
//   authLimiter
// );

app.use("/auth", GoogleAuth)
app.use("/me", MeRoute)
app.use("/auth", AuthRoutes)

// User Route
app.use("/user", ProfileRoute)
app.use("/user", TrackUserTime)

app.use("/bookmark", BookmarkRoutes)


// OpenAI API Route
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 API requests per minute
  message: "Too many API requests, please slow down.",
});
// app.use("/api", apiLimiter);
app.use("/api", Chat)

// Youtube Api
app.use("/api/youtube", youtubeRoutes);

// Quiz Routes
app.use("/quiz", QuizRoutes);

app.use("/note", NotesRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello")
})

app.listen(PORT, () => {
  console.log(`server running on PORT ${PORT}`)
})