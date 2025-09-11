import axios from "axios";

export async function generateQuizWithGroq(topic: string) {
  const prompt = `
  You are an expert quiz creator. Generate a high-quality, challenging quiz that tests deep understanding rather than memorization.

  CRITICAL REQUIREMENTS FOR ANSWER DISTRIBUTION:
  - Distribute correct answers randomly across ALL options (A, B, C, D)
  - NEVER have more than 3 consecutive questions with the same correct answer
  - Aim for roughly equal distribution: 25% A, 25% B, 25% C, 25% D
  - Vary the position of correct answers unpredictably

  QUESTION QUALITY STANDARDS:
  - Ask specific, detailed questions that require critical thinking
  - Include scenario-based questions and case studies
  - Test application of concepts, not just definitions
  - Include questions that compare/contrast different concepts
  - Add questions about implications, consequences, and real-world applications
  - For large content (novels, documents): focus on themes, character development, plot significance, and deeper meanings
  - Avoid simple recall questions like "What is the definition of..."

  OPTION CREATION GUIDELINES:
  - Make ALL distractors (wrong answers) plausible and related to the topic
  - Use common misconceptions as wrong options
  - Include options that are partially correct but not the best answer
  - Avoid obviously wrong options like "None of the above" or joke answers
  - Keep options similar in length and complexity
  - Use specific, concrete language in all options

  Generate a quiz in this EXACT JSON format with NO additional text:

  {
    "subject": "string",
    "topic": "string", 
    "difficulty": "easy | medium | hard",
    "duration": number,
    "questions": [
      {
        "question": "string",
        "options": ["option1_text", "option2_text", "option3_text", "option4_text"],
        "correct_answer": "exact_text_from_options",
        "explanation": "string"
      }
    ]
  }

  SPECIFIC REQUIREMENTS:
  - Generate exactly 12 questions minimum
  - Each question must test a different aspect or concept
  - Include at least 2 scenario-based questions ("Given this situation...")
  - Include at least 2 application questions ("How would you apply...")
  - Include at least 2 analysis questions ("What is the significance of...")
  - Explanations must be detailed and educational (2-3 sentences)
  - Duration: 8-25 minutes based on complexity
  - Subject: Extract the academic field/discipline from the topic
  - Topic: Create a focused, specific topic title (max 6 words)

  ANSWER KEY RANDOMIZATION:
  Question 1: Make correct answer B or C
  Question 2: Make correct answer A or D  
  Question 3: Make correct answer different from previous two
  Continue varying unpredictably...

  Topic/Content: ${topic}
  `;

  try {
    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-70b-versatile", // Changed to a more reliable model
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8, // Increased for more creativity
        max_tokens: 4000, // Increased token limit for longer responses
        top_p: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiReply = groqRes.data.choices[0]?.message?.content?.trim();
    
    // Clean the response to ensure it's valid JSON
    const cleanedReply = aiReply.replace(/```json\s*|\s*```/g, '').trim();
    
    let parsed;
    try {
      parsed = JSON.parse(cleanedReply);
    } catch (parseError) {
      console.error("Initial JSON parse failed, attempting cleanup...");
      // Try to extract JSON from the response
      const jsonMatch = cleanedReply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    }

    // Validate and enhance the parsed response
    const validatedQuiz = validateAndEnhanceQuiz(parsed, topic);
    
    return validatedQuiz;

  } catch (err) {
    console.error("Quiz generation error:", err);
    return generateFallbackQuiz(topic);
  }
}

function validateAndEnhanceQuiz(parsed: any, originalTopic: string) {
  // Ensure minimum question count
  if (!Array.isArray(parsed.questions) || parsed.questions.length < 10) {
    throw new Error("Insufficient questions generated");
  }

  // Validate answer distribution
  const answerCounts = { A: 0, B: 0, C: 0, D: 0 };
  const processedQuestions = parsed.questions.map((q: any, index: number) => {
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Invalid options for question ${index + 1}`);
    }

    // Map correct answer to letter if it's the actual text
    let correctAnswerLetter;
    const optionIndex = q.options.findIndex((opt: string) => opt === q.correct_answer);
    if (optionIndex !== -1) {
      correctAnswerLetter = ['A', 'B', 'C', 'D'][optionIndex];
    } else {
      // If correct_answer is already a letter, validate it
      if (['A', 'B', 'C', 'D'].includes(q.correct_answer)) {
        correctAnswerLetter = q.correct_answer;
      } else {
        // Default to A if validation fails
        correctAnswerLetter = 'A';
      }
    }

    answerCounts[correctAnswerLetter as keyof typeof answerCounts]++;

    return {
      question: q.question || `Question ${index + 1}`,
      options: q.options,
      correct_answer: q.options[['A', 'B', 'C', 'D'].indexOf(correctAnswerLetter)] || q.options[0],
      explanation: q.explanation || "No explanation provided.",
    };
  });

  // Check for answer bias (warn if too imbalanced)
  const totalQuestions = processedQuestions.length;
  const maxAllowedForOneOption = Math.ceil(totalQuestions * 0.4); // Max 40% for any single option
  
  Object.entries(answerCounts).forEach(([letter, count]) => {
    if (count > maxAllowedForOneOption) {
      console.warn(`Answer bias detected: Option ${letter} appears ${count}/${totalQuestions} times`);
    }
  });

  return {
    subject: parsed.subject || extractSubjectFromTopic(originalTopic),
    topic: parsed.topic || originalTopic.substring(0, 50),
    difficulty: parsed.difficulty || "medium",
    duration: Math.max(8, Math.min(25, parsed.duration || 15)),
    questions: processedQuestions,
  };
}

function extractSubjectFromTopic(topic: string): string {
  const topicLower = topic.toLowerCase();
  
  // Subject mapping based on keywords
  const subjectMap: Record<string, string> = {
    'math': 'Mathematics',
    'calculus': 'Mathematics', 
    'algebra': 'Mathematics',
    'geometry': 'Mathematics',
    'physics': 'Physics',
    'chemistry': 'Chemistry',
    'biology': 'Biology',
    'history': 'History',
    'literature': 'Literature',
    'english': 'English',
    'science': 'Science',
    'computer': 'Computer Science',
    'programming': 'Computer Science',
    'economics': 'Economics',
    'psychology': 'Psychology',
    'philosophy': 'Philosophy',
    'art': 'Art',
    'music': 'Music',
    'geography': 'Geography',
    'politics': 'Political Science',
    'sociology': 'Sociology',
  };

  for (const [keyword, subject] of Object.entries(subjectMap)) {
    if (topicLower.includes(keyword)) {
      return subject;
    }
  }

  return 'General Knowledge';
}

function generateFallbackQuiz(topic: string) {
  return {
    subject: extractSubjectFromTopic(topic),
    topic: topic.substring(0, 50),
    difficulty: "medium" as const,
    duration: 10,
    questions: [
      {
        question: `What is an important concept related to ${topic}?`,
        options: [
          "This is a fundamental principle",
          "This represents a secondary aspect", 
          "This is a common misconception",
          "This is an advanced application"
        ],
        correct_answer: "This is a fundamental principle",
        explanation: "This represents the most basic and important concept in this topic area.",
      },
    ],
  };
}