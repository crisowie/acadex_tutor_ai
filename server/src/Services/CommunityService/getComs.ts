import express, { Request, Response } from 'express'
import { authMiddleware } from '../../config/middleware'
import supabase from '../../config/supabaseClient'


const router = express.Router()

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("community")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase Error")
      return res.status(402).json({ status: false, error: "There was an error while getting the communities" })
    }
    return res.status(200).json({ communities: data })
  } catch (error: any) {
    console.error(error || "There was an error while fetching communities")
    return res.status(500).json({ error: "there was an error", status: false })
  }
})

export default router