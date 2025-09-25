import express, { Request, Response } from 'express'
import supabase from '../../config/supabaseClient'
import { authMiddleware } from '../../config/middleware'
const router = express.Router()

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userI
  const { community_name, description, type, topics, logo} = req.body
  if (!community_name || !description || !type || !topics) {
    res.status(300).json({ status: false, message: "Please submit all credentials" })
  }
  if(!Array.isArray(topics) || !topics){
    return res.json({message: "Array field empty or undefined"})
  }
  try {
    const { data, error } = await supabase.from("community").insert([{
      community_name,
      description,
      type,
      topics,
      logo,
      user_id: userId
    }]).select("*")
      .single()
    if (error) return res.json({ message: "Error creaing community", status: false })

    res.json({ data, status: true })

  } catch (error: any) {
    console.log(error || error.data || "Coul not create community")
  }
})

export default router