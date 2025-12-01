const express = require('express');
const cors = require('cors');
const path = require('path');
//const fetch = require('node-fetch'); // Make sure node-fetch is installed

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper function to clean and truncate text
function cleanAndTruncateText(text, maxTokens = 8000) {
  let cleaned = text
    .replace(/[^\w\s.,;:()\-\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const maxChars = maxTokens * 4;

  if (cleaned.length > maxChars) {
    console.log(`⚠️  Text truncated from ${cleaned.length} to ${maxChars} characters`);
    cleaned = cleaned.substring(0, maxChars);
  }

  return cleaned;
}

// Resume parsing endpoint (kept as-is)
app.post('/api/parse-resume', async (req, res) => {
  console.log('📥 Received parse request');

  try {
    const { messages } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ No API key provided');
      return res.status(400).json({ error: 'API key is required' });
    }

    console.log('🔑 API Key:', apiKey.substring(0, 20) + '...');

    // Extract resume text
    let resumeText = '';
    for (const content of messages[0].content) {
      if (content.type === 'text' && content.text && !content.text.includes('Extract the following')) {
        resumeText = content.text;
        break;
      }
    }

    console.log('📄 Original resume length:', resumeText.length, 'characters');

    const cleanedResume = cleanAndTruncateText(resumeText, 8000);
    console.log('🧹 Cleaned resume length:', cleanedResume.length, 'characters');

    const extractPrompt = messages[0].content.find(c =>
      c.type === 'text' && c.text.includes('Extract the following')
    );

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a resume parser. Extract information from the resume text and return ONLY valid JSON with no markdown formatting or additional text.'
          },
          {
            role: 'user',
            content: `Here is the resume text:\n\n${cleanedResume}\n\n${extractPrompt.text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    console.log('📡 API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return res.status(response.status).json({
        error: 'API request failed',
        details: errorText
      });
    }

    const data = await response.json();
    console.log('💬 Response preview:', data.choices[0].message.content.substring(0, 200));

    const convertedResponse = {
      content: [
        {
          type: 'text',
          text: data.choices[0].message.content
        }
      ]
    };

    res.json(convertedResponse);

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Serve React build instead of public
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all for React router
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// // ----------------------------
// // Serve React frontend from public folder
// // ----------------------------
// app.use(express.static(path.join(__dirname, 'public')));

// // Catch-all route to serve index.html
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// ----------------------------
// Start server
// ----------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 Proxy Server Running (OpenAI)      ║
║  📍 Running on PORT: ${PORT}            ║
║  ✅ Ready to parse resumes             ║
╚════════════════════════════════════════╝
  `);
});
