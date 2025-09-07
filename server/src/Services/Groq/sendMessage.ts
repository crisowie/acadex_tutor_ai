import express, { Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware } from '../../config/middleware';
import supabase from '../../config/supabaseClient';


const router = express.Router();

// send a message
router.post('/send-message', authMiddleware, async (req: Request, res: Response) => {
  const { message, chat_id } = req.body;
  const userId = (req as any).user?.userId;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message format' });
  }

  let chatIdToUse = chat_id;


  try {
    // 1. If no chat_id, generate a new chat
    if (!chatIdToUse) {
      // 1. Generate title
      const titleRes = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: 'system',
              content:
                'Generate a short educational title (max 4 words) for this conversation. Return only the title—no greetings or extra text.',
            },
            { role: 'user', content: message },
          ],
          temperature: 0.7,

        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY!}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let generatedTitle =
        titleRes.data.choices?.[0]?.message?.content?.trim() || 'Untitled Chat';

      // 2. Generate subject emphasis
      const subjectRes = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content:
                "From the given conversation, extract only the most relevant academic subject or course title. Do not include greetings, punctuation, or extra words. Respond with a single subject or course name only, e.g., 'Physics', 'Computer Science', or 'Modern European History'. If the subject is unclear, respond with 'General Studies."
            },
            { role: 'user', content: message },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY!}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let generatedSubject =
        subjectRes.data.choices?.[0]?.message?.content?.trim() || 'General';

      generatedSubject = generatedSubject.replace(/[^a-zA-Z0-9\s]/g, '').trim();

      // 3. Insert chat with both title and subject_emphasis
      const { data: chatInsertData, error: chatInsertError } = await supabase
        .from('chats')
        .insert({
          user_id: userId,
          title: generatedTitle,
          subject_emphasis: generatedSubject, // ✅ Here it is
        })
        .select('id')
        .single();

      if (chatInsertError) {
        console.error('Error creating chat:', chatInsertError);
        return res.status(500).json({ error: 'Failed to create chat' });
      }

      chatIdToUse = chatInsertData.id;
    }


    // 2. Insert user message
    const { error: userInsertError } = await supabase.from('messages').insert({
      user_id: userId,
      role: 'user',
      content: message,
      chat_id: chatIdToUse,
    });

    if (userInsertError) {
      console.error("Error inserting user message:", userInsertError);
      return res.status(500).json({ error: 'Failed to save message' });
    }

    // 3. Get full chat history
    const { data: history, error: historyError } = await supabase
      .from('messages')
      .select('role, content, resources')
      .eq('chat_id', chatIdToUse)
      .order('created_at', { ascending: true });

    if (historyError) {
      console.error("Error fetching chat history:", historyError);
      return res.status(500).json({ error: 'Failed to retrieve chat history' });
    }


    const messagesForGroq = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 4. Get AI response
    const aiResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'openai/gpt-oss-120b',
        messages: messagesForGroq,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY!}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const assistantReply = aiResponse.data.choices?.[0]?.message?.content?.trim()
      || "I'm not sure how to respond to that.";


    // === Step 5: Get resource recommendations ===
    let resources: any[] = [];
    try {
      const resourcesRes = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: `You are a strict JSON generator.

Return ONLY a JSON array of recommended learning resources based on the user's question.
No explanations, no markdown, no text outside JSON. 
If no resources apply, return: [].

Schema:
[
  {
    "title": "string",        // Short descriptive title
    "url": "string",          // Full link (https://...)
    "type": "string",         // "video" | "article" | "book" | "link" | "resource"
    "description": "string"   // Short explanation of the resource
  }
]
`
            },
            {
              role: 'user',
              content: `Generate up to 3 resources for this message: ${message}`
            }
          ],
          temperature: 0.2
        },
        { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
      );

      let rawResources = resourcesRes.data.choices[0].message?.content || "[]";

      // Clean up accidental code fences
      rawResources = rawResources.replace(/```json|```/g, "").trim();

      resources = JSON.parse(rawResources);
    } catch (error) {
      console.error("Error fetching/parsing resources:", error);
      resources = [];
    }
    // 5. Save AI response
    const { error: assistantInsertError } = await supabase.from('messages').insert({
      user_id: userId,
      role: 'assistant',
      content: assistantReply,
      resources,
      chat_id: chatIdToUse,
    });

    if (assistantInsertError) {
      console.error("Error saving assistant reply:", assistantInsertError);
      return res.status(500).json({ error: 'Failed to save assistant reply' });
    }

    res.status(200).json({
      success: true,
      reply: assistantReply,
      resources,
      chat_id: chatIdToUse,
    });

  } catch (err: any) {
    console.error('Groq API error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export { router as sendMessage }