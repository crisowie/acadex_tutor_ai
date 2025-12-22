import OpenAI from "openai";

// Initialize OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // set this in your .env
});

/**
 * Sends a user message to the AI and returns the response.
 * @param userMessage - The question or prompt from the user
 * @returns AI's response as a string
 */
export const getAIResponse = async (userMessage: string): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // or "gpt-3.5-turbo"
      messages: [
        {
          role: "system",
          content: "You are a project assistant AI. Answer clearly and concisely."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 500, // controls length of response
    });

    // Return the AI's reply
    const aiReply = completion.choices[0].message?.content ?? "AI did not respond";
    return aiReply;
  } catch (err) {
    console.error("AI Error:", err);
    return "AI failed to generate a response";
  }
};
