import express, { Request, Response } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import supabase from "../../config/supabaseClient";
import { generateQuizWithGroq } from "./quizService";
import { authMiddleware } from "../../config/middleware";

const router = express.Router();

// Configure multer with file size limits and validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface GeneratedQuiz {
  topic: string;
  subject: string;
  difficulty: string;
  duration?: number;
  questions: QuizQuestion[];
}

/**
 * Smart text chunking for large PDFs
 */
function chunkTextForAI(text: string, maxSize: number = 60000): string {
  if (text.length <= maxSize) {
    return text;
  }
  
  console.log("📄 Chunking large text from", text.length, "to", maxSize, "characters");
  
  const lines = text.split('\n');
  let result = '';
  let currentSize = 0;
  
  // Priority lines: headers, definitions, key concepts
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 5) continue;
    
    const isImportant = /^(Chapter|Section|Definition|Key|Important|Note:|Summary)/i.test(trimmed) ||
                       trimmed.endsWith(':') ||
                       /^\d+\./.test(trimmed);
    
    if (isImportant && currentSize + trimmed.length < maxSize) {
      result += trimmed + '\n';
      currentSize += trimmed.length;
    }
  }
  
  // Fill remaining space with regular content
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 5 || result.includes(trimmed)) continue;
    
    if (currentSize + trimmed.length > maxSize) break;
    
    result += trimmed + '\n';
    currentSize += trimmed.length;
  }
  
  return result.trim() || text.substring(0, maxSize);
}

/**
 * Generate quiz from uploaded PDF
 */
router.post("/", authMiddleware, upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    // Extract and validate user ID
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    // Extract optional chat ID
    const chatId = req.body.chatid || null;

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "PDF file is required"
      });
    }

    // Extract PDF text
    let pdfText = await extractPdfText(req.file.buffer);
    if (!pdfText || pdfText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "PDF contains no readable text or is corrupted"
      });
    }

    console.log("📄 Extracted PDF text length:", pdfText.length);
    console.log("📄 First 200 chars:", pdfText.substring(0, 200) + "...");

    // Apply chunking for large texts
    if (pdfText.length > 80000) {
      pdfText = chunkTextForAI(pdfText, 60000);
      console.log("📄 Text after chunking:", pdfText.length);
    }

    // Generate quiz using AI service
    const quizData = await generateQuizWithGroq(pdfText);
    console.log("🤖 Generated Quiz data:", {
      topic: quizData.topic,
      subject: quizData.subject,
      difficulty: quizData.difficulty,
      questionsCount: quizData.questions?.length
    });

    // Validate generated quiz
    if (!quizData.questions || quizData.questions.length < 3) {
      return res.status(500).json({
        success: false,
        error: "Invalid quiz generated - insufficient questions. Please try with a different PDF."
      });
    }

    // Validate each question
    for (const question of quizData.questions) {
      if (!question.question || !question.options || question.options.length < 2 || !question.correct_answer) {
        return res.status(500).json({
          success: false,
          error: "Invalid quiz structure generated. Please try with a different PDF."
        });
      }
    }

    // Prepare quiz data for database
    const quizInsertData = {
      user_id: userId,
      chat_id: chatId,
      subject: quizData.subject || "PDF Content",
      difficulty: quizData.difficulty || "medium",
      duration: quizData.duration || 10,
      score: null,
      percentage: null,
      completed: false,
      rating: null,
      topic: quizData.topic || "PDF Content Quiz",
      source_type: "pdf",
      pdf_text: pdfText.length > 5000 ? pdfText.substring(0, 5000) + "..." : pdfText,
    };

    console.log("💾 Inserting quiz with data:", {
      ...quizInsertData,
      pdf_text: "[TRUNCATED]"
    });

    // Insert quiz into database
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert([quizInsertData])
      .select("*")
      .single();

    if (quizError || !quiz) {
      console.error("❌ Database error creating quiz:", quizError);
      return res.status(500).json({
        success: false,
        error: "Failed to save quiz to database"
      });
    }

    console.log("✅ Quiz created with ID:", quiz.id);

    // Format questions for database
    const formattedQuestions = quizData.questions.map((q: any) => ({
      quiz_id: quiz.id,
      question_text: q.question,
      options: JSON.stringify(q.options || []),
      correct_answer: q.correct_answer,
      explanation: q.explanation || ""
    }));

    // Insert questions (handle large sets with batching if needed)
    let insertedQuestions;
    
    if (formattedQuestions.length > 50) {
      // Batch insert for large question sets
      insertedQuestions = [];
      const batchSize = 25;
      
      for (let i = 0; i < formattedQuestions.length; i += batchSize) {
        const batch = formattedQuestions.slice(i, i + batchSize);
        
        const { data: batchResult, error: batchError } = await supabase
          .from("quiz_questions")
          .insert(batch)
          .select("id, question_text, options, correct_answer, explanation")
          .order("id", { ascending: true });

        if (batchError) {
          console.error("❌ Database error creating questions batch:", batchError);
          await supabase.from("quizzes").delete().eq("id", quiz.id);
          return res.status(500).json({
            success: false,
            error: "Failed to save quiz questions to database"
          });
        }

        insertedQuestions.push(...(batchResult || []));
        
        // Small delay between batches
        if (i + batchSize < formattedQuestions.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } else {
      // Standard insert for smaller question sets
      const { data: questionsResult, error: questionsError } = await supabase
        .from("quiz_questions")
        .insert(formattedQuestions)
        .select("id, question_text, options, correct_answer, explanation")
        .order("id", { ascending: true });

      if (questionsError) {
        console.error("❌ Database error creating questions:", questionsError);
        await supabase.from("quizzes").delete().eq("id", quiz.id);
        return res.status(500).json({
          success: false,
          error: "Failed to save quiz questions to database"
        });
      }

      insertedQuestions = questionsResult;
    }

    console.log("✅ Questions inserted successfully, count:", insertedQuestions?.length);

    // Format response
    const responseData = {
      id: quiz.id,
      subject: quiz.subject,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      duration: quiz.duration,
      score: quiz.score,
      completed: quiz.completed,
      rating: quiz.rating,
      percentage: quiz.percentage,
      source_type: quiz.source_type,
      questions: insertedQuestions?.map((q: any) => ({
        id: q.id,
        question: q.question_text,
        options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
      })) || [],
    };

    console.log("🎉 Returning quiz data with", responseData.questions.length, "questions");

    return res.status(200).json({
      success: true,
      data: responseData,
      message: "Quiz generated successfully from PDF"
    });

  } catch (error) {
    console.error("❌ Error in PDF quiz generation:", error);

    // Handle specific error types
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: "File size too large. Maximum size is 10MB."
        });
      }
    }

    if (error instanceof Error) {
      if (error.message.includes('Only PDF files are allowed')) {
        return res.status(400).json({
          success: false,
          error: "Invalid file type. Only PDF files are supported."
        });
      }

      if (error.message.includes('Failed to generate quiz')) {
        return res.status(500).json({
          success: false,
          error: "AI service failed to generate quiz. Please try again with a different PDF."
        });
      }

      if (error.message.includes('timeout')) {
        return res.status(400).json({
          success: false,
          error: "PDF processing timed out. Please try a smaller or simpler document."
        });
      }

      if (error.message.includes('Failed to parse PDF')) {
        return res.status(400).json({
          success: false,
          error: "Unable to read PDF content. Please ensure the PDF is not encrypted or corrupted."
        });
      }

      if (error.message.includes('mostly images, tables, or diagrams')) {
        return res.status(400).json({
          success: false,
          error: "This PDF contains mostly tables, diagrams, or images that cannot be converted to text. Please try a text-based PDF."
        });
      }
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: "Failed to generate quiz from PDF. Please try again."
    });
  }
});

/**
 * Extract text content from PDF buffer - Ultra-conservative for large files
 */
async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log("📄 Starting PDF extraction, buffer size:", pdfBuffer.length);

    // For files over 3MB, limit pages severely to prevent crashes
    const maxPages = pdfBuffer.length > 3000000 ? 10 : 
                    pdfBuffer.length > 1000000 ? 20 : 0; // 0 = all pages

    // Very short timeout for large files
    const timeout = pdfBuffer.length > 2000000 ? 15000 : 30000;

    const extractionPromise = pdfParse(pdfBuffer, {
      max: maxPages,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('PDF extraction timeout')), timeout);
    });

    const pdfData = await Promise.race([extractionPromise, timeoutPromise]);

    let extractedText = pdfData.text.trim();
    console.log("📄 Raw extraction complete, length:", extractedText.length);

    if (!extractedText || extractedText.length < 50) {
      throw new Error("PDF contains no readable text");
    }

    // For very large extractions, take only the beginning
    if (extractedText.length > 100000) {
      console.log("📄 Large extraction detected, taking first 50K characters");
      extractedText = extractedText.substring(0, 50000);
    }

    return extractedText;
  } catch (error) {
    console.error("❌ PDF extraction error:", error);
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new Error("PDF too large or complex to extract");
    }
    throw new Error("Failed to extract PDF content");
  }
}

export default router;