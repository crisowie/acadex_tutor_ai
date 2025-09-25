import axios from "axios";

export interface SummarizeResult {
  title?: string;
  summary: string;
}

/**
 * Summarize long academic text (e.g., PDF extract).
 * Returns both a clean summary and a suggested title.
 */
export async function summarizeWithGroq(text: string): Promise<SummarizeResult> {
  const prompt = `
Summarize the following academic text into clear, structured notes.

1. Suggest a short, clear title (max 10 words).
2. Summarize the text into clear, structured notes:
   - Use simple, concise sentences.
   - Break into short paragraphs or bullet points if helpful.
   - Focus only on the key ideas, definitions, and explanations.
   - Do not include greetings, filler text, or disclaimers.
  - Keep it educational and informative.
  - Title should be relevant to the content and should be short, 4 words max
Output format (plain text only):
Title: <short title 4 words max>
Summary: <summary>

Text:
${text}
`;

  try {
    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        n: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const rawOutput: string = groqRes.data.choices?.[0]?.message?.content?.trim() || "";

    // Extract Title and Summary
    let title: string | undefined;
    let summary: string = rawOutput;

    const titleMatch = rawOutput.match(/Title:\s*(.+)/i);
    const summaryMatch = rawOutput.match(/Summary:\s*([\s\S]*)/i);

    if (titleMatch) title = titleMatch[1].trim();
    if (summaryMatch) summary = summaryMatch[1].trim();

    return {
      title,
      summary: summary || "No summary could be generated.",
    };
  } catch (err) {
    console.error("Summary generation error:", err);
    return {
      summary: "Failed to generate summary. Please try again.",
    };
  }
}
