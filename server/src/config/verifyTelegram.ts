import crypto from "crypto";

export const verifyTelegramInitData = (rawInitData: string, botToken: string) => {
  const params = Object.fromEntries(
    rawInitData.split("&").map((p: string) => {
      const [k, v] = p.split("=");
      return [decodeURIComponent(k), decodeURIComponent(v)];
    })
  );

  const checkString = Object.entries(params)
    .filter(([k]) => k !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secret = crypto.createHash("sha256").update(botToken).digest();
  const hmac = crypto.createHmac("sha256", secret).update(checkString).digest("hex");

  // Constant-time compare
  const valid =
    params.hash &&
    crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(params.hash, "hex"));
  if (!valid) return null;

  // Parse user JSON safely
  let user = null;
  if (params.user) {
    try {
      user = JSON.parse(params.user);
    } catch (err) {
      console.error("Failed to parse Telegram user JSON:", err);
      return null; // reject instead of continuing silently
    }
  }

  // Drop raw user string to avoid confusion
  const { user: _rawUser, ...rest } = params;

  return {
    ...rest,
    user,
  };
};
