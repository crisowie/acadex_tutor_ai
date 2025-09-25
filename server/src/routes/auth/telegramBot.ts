import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const FRONTEND_URL = process.env.FRONTEND_URL!;
if (!BOT_TOKEN) throw new Error("Missing TELEGRAM_BOT_TOKEN in .env");

export const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome to Acadex! 🎓", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open Acadex 📚",
            web_app: { url: `${FRONTEND_URL}` },
          },
        ],
      ],
    },
  });
});
