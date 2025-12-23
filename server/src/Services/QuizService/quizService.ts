import axios from "axios";
import { parse } from "path";

export async function generateQuizWithGroq(topic: string, ) {
  const prompt = `
Generate a multiple-choice quiz in strict JSON format only.
Do not include explanations, introductions, or extra text. 
Output must be valid JSON that exactly matches this structure:

{
  "subject": "string",
  "topic": "string",
  "difficulty": "easy | medium | hard",
  "duration": number,
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct_answer": "string (must be one of the options)",
      "explanation": "string"
    }
  ]
}

Rules:
- Create at least 10 multiple-choice questions.
- Do NOT always use the first option as the correct answer. Distribute correct answers across A, B, C, and D randomly.
- Each option must be unique, concise, and plausible — avoid obvious filler answers.
- If a large text is given (e.g., a novel or article), generate high-quality, concept-based questions instead of superficial chapter-based ones.
- Each question MUST include an "explanation" with a clear, beginner-friendly reason why the correct answer is correct.
- If "${topic}" is just content without a clear name, infer a short (max 4 words) title or topic.
- "duration" must be between 5 and 20 minutes.
- "difficulty" should reflect the complexity of "${topic}".
- "subject" must always be returned (course/field related to "${topic}").
- "topic" must always be returned (specific to "${topic}" or closely related).
- Options should be raw text only (no letters A/B/C/D in front).
- Ensure the final output is ONLY valid JSON, no comments, no extra text.

Topic: ${topic}
`;


  try {
    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        n: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiReply = groqRes.data.choices[0]?.message?.content?.trim();
    const parsed = JSON.parse(aiReply);

    return {
      subject: parsed.subject,
      topic: parsed.topic,
      difficulty: parsed.difficulty || "medium",
      duration: parsed.duration || 10,
      questions: Array.isArray(parsed.questions)
        ? parsed.questions.map((q: any) => ({
          question: q.question || "No question text",
          options: Array.isArray(q.options) ? q.options : [],
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        }))
        : [],
    };
  } catch (err) {
    console.error("Quiz generation parse error:", err);
    return {
      subject: topic,
      difficulty: "medium",
      duration: 10,
      questions: [
        {
          question: "Failed to generate quiz",
          options: [],
          correct_answer: "",
          explanation: "Error while generating quiz."
        },
      ],
    };
  }
}
