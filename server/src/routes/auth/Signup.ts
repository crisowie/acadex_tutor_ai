import express, { Request, Response } from 'express'
import supabase from '../../config/supabaseClient'
import { Auth } from '../../types'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const router = express.Router()

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!

router.post("/signup", async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body as Auth

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Please specify all details" })
  }
  const { data: existingUsers, error: existError } = await supabase
    .from("profiles")
    .select("email")
    .eq("email", email)

    if (existError) {
      return res.status(500).json({ error: "Database error", message: existError.message });
    }
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }
    
  try {
    // ✅ Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) {
      console.log(authError)
      return res.status(500).json({ error: "Something went wrong" });
    }

    const user = authData.user
    if (!user?.id) {
      return res.status(400).json({ message: "User ID missing after signup." })
    }

    // ✅ Insert into profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: user.id, email, full_name: fullName, plan: "Free" }])

    if (profileError) {
      return res.status(500).json({ error: "Something went wrong" });
    }

    // ✅ Issue JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email }, ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    )

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email }, REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    )

    // ✅ Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,      
      maxAge: 1000 * 60 * 60
    })

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,      
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    })

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        email,
        fullName
      }
    })
  } catch (error) {
    console.error("Signup error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
})

export { router as SignupRoute }
