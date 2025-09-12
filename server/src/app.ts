import express, { Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import rateLimit from "express-rate-limit";
import { LoginRoute } from './routes/auth/login'
import { SignupRoute } from './routes/auth/Signup'
import { ForgotPasswordRoute } from './routes/auth/forgotPassword'
import { RefreshTokenRoute } from './routes/auth/refresh'
import { LogOutRoute } from './routes/auth/logout'
import { ProfileRoute } from './routes/userDetailsRoutes/profile'
import cors from 'cors'
import { ChatHistory } from './Services/ChatService/chatHistory'
import youtubeRoutes from './Services/Google/YoutubeAPI'
import { TrackUserTime } from './routes/userDetailsRoutes/trackTime'
import { Bookmark } from './routes/userDetailsRoutes/bookmarks'
import { MeRoute } from './routes/userDetailsRoutes/me'
import { DeleteRoute } from './routes/auth/delete'
import { GoogleAuth } from './routes/auth/googleAuth'
import { Onboarding } from './routes/auth/onboarding';
import { sendMessage } from './Services/ChatService/sendMessage';
import { DeleteChat } from './Services/ChatService/deleteChat';
import { SentMessages } from './Services/ChatService/getMessages';
import { SingleChat } from './Services/ChatService/getSingleChat';
import { QuizRoutes } from './Services/QuizService';
import NotesRoutes from './Services/NoteService';
import Chat from './Services/ChatService/index'
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

app.use(globalLimiter);
// Rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000 * 10, // 1 min window
  max: 50, // each IP gets 5 requests per window
  message: "Too many requests, try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Login route limiter
// const loginLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 minutes
//   max: 30, // max 30 attempts per minute
//   message: "Too many login attempts, please wait.",
// });

// Signup route limiter
const signupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // max 30 signups per IP
  message: "Too many signup attempts, please try later.",
});

// app.use("/auth/login", loginLimiter);
app.use("/auth/signup", signupLimiter);

// Apply general auth limiter only to the rest
app.use(
  ["/auth/forgot-password", "/auth/refresh", "/auth/logout", "/auth/delete", "/auth/google"],
  authLimiter
);
app.use("/auth", SignupRoute)
app.use("/auth", LoginRoute)
app.use("/auth", ForgotPasswordRoute)
app.use("/auth", RefreshTokenRoute)
app.use("/auth", LogOutRoute)
app.use("/auth", DeleteRoute)
app.use("/auth", Onboarding)
app.use("/auth", GoogleAuth)
app.use("/me", MeRoute)

// User Route
app.use("/user", ProfileRoute)
app.use("/user", TrackUserTime)
app.use("/user", Bookmark)


// OpenAI API Route
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 API requests per minute
  message: "Too many API requests, please slow down.",
});
app.use("/api", apiLimiter);

// // Groq Apis
// app.use("/api", ChatHistory);
// app.use("/api", sendMessage)
// app.use("/api", DeleteChat)
// app.use("/api", SentMessages)
// app.use("/api", SingleChat)
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