import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

router.post('/refresh-token', (req: Request, res: Response) => {
  const token = req.cookies.refreshToken
  if (!token) {
    return res.status(401).json({ error: 'Refresh token not found' });
  }
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as {
      userId: string;
      email: string;
    };

    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' } // Short-lived
    );
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: true, // set to true in production with HTTPS
      sameSite: 'none',
      maxAge: 1000 * 60 * 60,
    });

    return res.status(200).json({ message: 'Access token refreshed' });
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
});

export { router as RefreshTokenRoute };
