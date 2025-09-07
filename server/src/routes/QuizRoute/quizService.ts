import axios from "axios";
import { parse } from "path";

export async function generateQuizWithGroq(topic: string) {
  const prompt = `
  Generate a quiz in strict JSON format only. 
  Do not include any explanations, introductions, or extra text. 
  Output must be valid JSON that exactly matches the following structure:

  {
    "subject": "string",
    "topic": "string",
    "difficulty": "easy | medium | hard",
    "duration": number,
    "questions": [
      {
        "question": "string",
        "options": ["A", "B", "C", "D"],
        "correct_answer": "string (must be one of the options)",
        "explanation": "string",
      }
    ]
  }

  Rules:
  - At least 10 multiple-choice questions.
  - Each question MUST include an "explanation" field with a simple layman-friendly explanation of why the correct answer is correct.
  - Duration must be between 5 and 20 minutes.
  - Difficulty should match the complexity of the topic.
  - Subject should be the exact subject or course related to "${topic}". Always return a subject.
  - Topic should be an exact topic of "${topic}" or related to it. Always return a topic.
  - Ensure the response is ONLY valid JSON with no extra text, no comments, and no explanations.
  - Do not add or include A, B, C, or D. Just return the raw options texts.

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
