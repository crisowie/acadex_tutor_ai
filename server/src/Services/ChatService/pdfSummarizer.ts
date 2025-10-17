import express, { Request, Response } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import axios from "axios";
import { authMiddleware } from "../../config/middleware";
import supabase from "../../config/supabaseClient";

const router = express.Router();

// Configure multer for PDF upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req: Request, file: any, cb: multer.FileFilterCallback) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
  const pdfData = await pdfParse(pdfBuffer);
  let text = pdfData.text.trim();

  if (!text || text.length < 50) {
    throw new Error("PDF contains no readable text");
  }
  if (text.length > 100000) {
    text = text.substring(0, 50000);
  }

  return text;
}

async function summarizeWithGroq(pdfText: string): Promise<{ title: string; summary: string }> {
  try {
    // Generate title
    const titleRes = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: 'system',
            content: 'Generate a short descriptive title (max 6 words) for this PDF content. Return only the title—no greetings or extra text.',
          },
          {
            role: 'user',
            content: `PDF content: ${pdfText.substring(0, 2000)}...`
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY!}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const title = titleRes.data.choices?.[0]?.message?.content?.trim() || 'PDF Summary';

    // Generate summary
    const summaryRes = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: 'system',
            content: `You are an expert at summarizing documents. Create a comprehensive but concise summary of the following PDF content. 

Guidelines:
- Focus on key points, main arguments, and important details
- Use clear, readable paragraphs (not bullet points unless absolutely necessary)
- Make it educational and informative
- Length should be 200-500 words depending on content complexity
- Write in plain text, no markdown formatting
- Be objective and factual`,
          },
          {
            role: 'user',
            content: `Please summarize this PDF content:\n\n${pdfText}`
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY!}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const summary = summaryRes.data.choices?.[0]?.message?.content?.trim() || 'Unable to generate summary';

    return { title, summary };

  } catch (error) {
    console.error('Error in summarizeWithGroq:', error);
    throw new Error('Failed to generate summary with Groq API');
  }
}

async function generateSubjectFromPdf(pdfText: string): Promise<string> {
  try {
    const subjectRes = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: "From the given PDF content, extract only the most relevant academic subject or course title. Do not include greetings, punctuation, or extra words. Respond with a single subject or course name only, e.g., 'Physics', 'Computer Science', or 'Modern European History'. If the subject is unclear, respond with 'General Studies'."
          },
          {
            role: 'user',
            content: `PDF content preview: ${pdfText.substring(0, 2000)}...`
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY!}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let subject = subjectRes.data.choices?.[0]?.message?.content?.trim() || 'General Studies';
    subject = subject.replace(/[^a-zA-Z0-9\s]/g, '').trim();

    return subject;
  } catch (error) {
    console.error('Error generating subject:', error);
    return 'General Studies';
  }
}

router.post("/", authMiddleware, upload.single("file"), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "PDF file is required"
      });
    }

    const chatId = req.body.chat_id as string | undefined;

    console.log('📄 Processing PDF:', req.file.originalname);

    // 1. Extract text from PDF
    const pdfText = await extractPdfText(req.file.buffer);
    console.log('✅ PDF text extracted, length:', pdfText.length);

    // 2. Summarize with Groq
    const { title, summary } = await summarizeWithGroq(pdfText);
    console.log('✅ Summary generated:', { title: title.substring(0, 50), summaryLength: summary.length, summary });

    if (!summary) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate summary"
      });
    }

    let finalChatId = chatId;

    // 3. If no chatId provided, create a new chat
    if (!finalChatId) {
      const subject = await generateSubjectFromPdf(pdfText);

      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert([{
          user_id: userId,
          title: title || "PDF Summary",
          subject_emphasis: subject
        }])
        .select("id")
        .single();

      if (chatError) {
        console.error('Error creating chat:', chatError);
        throw new Error('Failed to create chat');
      }

      finalChatId = newChat.id;
      console.log('✅ New chat created:', finalChatId);
    }

    // 4. Save user "PDF upload" message
    const { error: userMsgError } = await supabase
      .from("messages")
      .insert([{
        user_id: userId,
        chat_id: finalChatId,
        role: "user",
        content: `📄 Uploaded PDF: ${req.file.originalname}`,
      }]);

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
      throw new Error('Failed to save user message');
    }

    // 5. Save assistant summary message
    const { error: assistantMsgError } = await supabase
      .from("messages")
      .insert([{
        user_id: userId,
        chat_id: finalChatId,
        role: "assistant",
        content: summary,
      }]);

    if (assistantMsgError) {
      console.error('Error saving assistant message:', assistantMsgError);
      throw new Error('Failed to save assistant message');
    }

    console.log('✅ PDF processing completed successfully');

    // 6. Return successful response
    return res.status(200).json({
      success: true,
      title,
      reply: summary,
      chat_id: finalChatId,
      message: "PDF summarized and saved successfully",
    });

  } catch (err: any) {
    console.error("❌ PDF processing error:", err.message || err);

    return res.status(500).json({
      success: false,
      error: err.message || "Failed to process PDF. Please try again."
    });
  }
});

export default router;