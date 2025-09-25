// routes/auth/me.ts
import express, { Request, Response } from 'express'
import { authMiddleware } from '../../config/middleware'
import supabase from '../../config/supabaseClient'

const router = express.Router()

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", userId)
    .single()

  if (error || !profile) {
    return res.status(404).json({ message: "User not found" })
  }


  return res.status(200).json({
    user: {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
    }
  })
})

export { router as MeRoute }
