// backend/routes/trackTime.ts
import express, { Request, Response } from 'express';
import supabase from "../../config/supabaseClient";

const router = express.Router();

router.post('/track-session', async (req: Request, res: Response) => {
  const { userId, duration } = req.body;

  console.log("Received track-session:", { userId, duration });

  if (!userId || !duration) {
    return res.status(400).json({ error: 'Missing userId or duration' });
  }

  const { error } = await supabase
    .from('user_sessions')
    .insert([
      {
        user_id: userId,
        duration_seconds: duration,
      },
    ]);

  if (error) {
    console.error('Insert error:', error.message);
    return res.status(500).json({ error: 'Failed to store session' });
  }

  res.status(200).json({ message: 'Session stored' });
});

router.get("/total-time/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const { data, error } = await supabase
    .from("user_sessions")
    .select("duration_seconds")
    .eq("user_id", userId);

  if (error) {
    console.error("Fetch error:", error.message);
    return res.status(500).json({ error: "Failed to fetch session durations" });
  }

  const totalSeconds = data.reduce((sum, row) => sum + (row.duration_seconds || 0), 0);

  res.status(200).json({ totalSeconds });
});


export { router as TrackUserTime };
