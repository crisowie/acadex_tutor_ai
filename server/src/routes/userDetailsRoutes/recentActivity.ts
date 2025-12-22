import express, { Request, Response } from 'express'
import { authMiddleware } from '../../config/middleware'
import supabase from '../../config/supabaseClient'
import dotenv from 'dotenv'

const router = express.Router()

router.post("/",authMiddleware,async (req:Request, res:Response) =>{
 const userId = (req as any).user?.userId
 
 const {data, error} = await supabase.from("recent_activity")
 .select("*")
 .eq("user_id",userId)
 .single()

 if(error || !data){
  return res.status(500).json({message:"User not found"})
 }

 return res.status(200).json({
  data
 })
})

export default router