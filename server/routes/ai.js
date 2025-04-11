import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { verifyToken } from '../middleware/auth.js';

dotenv.config(); // Load .env variables

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Middleware to check if API key is set
const ensureApiKey = (req, res, next) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
  }
  next();
};

// Generate blog content
router.post('/generate-content', verifyToken, ensureApiKey, async (req, res) => {
  try {
    const { topic, type } = req.body;

    if (!topic || !type) {
      return res.status(400).json({ message: 'Missing required fields: topic or type' });
    }

    let prompt = '';
    if (type === 'blog') {
      prompt = `Write a comprehensive, engaging blog post about ${topic} for a retail website. The blog should be well-structured with proper headings and sections.

Format the content as follows:

# [Create an engaging title about ${topic}]

## [Write a compelling subtitle that draws readers in]

### Introduction
- Provide a captivating opening about ${topic}
- Include relevant statistics or interesting facts
- Explain what readers will learn

### Key Points
1. [Write a detailed section about the first main aspect of ${topic}]
   - Include specific examples
   - Add relevant data or statistics
   - Provide actionable insights

2. [Write a detailed section about the second main aspect of ${topic}]
   - Share best practices
   - Include expert tips
   - Offer practical advice

3. [Write a detailed section about the third main aspect of ${topic}]
   - Explain implementation strategies
   - Discuss real-world applications
   - Share success stories or case studies

### Conclusion
- Summarize the key takeaways
- Provide a clear call to action
- End with a thought-provoking statement

Note: Generate actual content for each section, replacing the placeholders in [brackets] with real, informative content.`;
    } else if (type === 'idea') {
      prompt = `Generate 5 creative blog post ideas related to ${topic} for a retail website.

BLOG POST IDEAS

Idea 1:
TITLE:
[Write an attention-grabbing title]

Opening Hook:
[Write a compelling first paragraph]

Main Points to Cover:
1. [First key point]
2. [Second key point]
3. [Third key point]

Target Audience:
[Describe who this content is for]

Visual Suggestions:
1. [First visual element]
2. [Second visual element]

[Repeat the same structure for Ideas 2-5]

Ensure each idea is:
1. Relevant to current trends
2. Practical and actionable
3. Engaging for retail audiences
4. Fresh and unique
5. Shareable on social media`;
    } else {
      return res.status(400).json({ message: 'Invalid type. Must be either "blog" or "idea"' });
    }

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.85,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        stopSequences: ["[", "]"]
      }
    };

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      requestBody,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const candidate = response.data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Invalid response from Gemini API');
    }

    // Process the content with proper HTML formatting
    const processedContent = text
      // Process headings
      .replace(/^# (.+)$/gm, '<h1 class="blog-heading">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="blog-subheading">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="blog-section">$1</h3>')
      // Process bullet points with proper nesting
      .replace(/^(\s*)-\s+(.+)$/gm, (match, indent, content) => {
        const level = indent.length / 2;
        return `${level === 0 ? '<ul class="blog-list">' : ''}<li>${content}</li>`;
      })
      // Close bullet lists
      .replace(/(<\/li>)(?!\n\s*-\s+)/g, '$1</ul>')
      // Process numbered lists with proper nesting
      .replace(/^(\s*)\d+\.\s+(.+)$/gm, (match, indent, content) => {
        const level = indent.length / 2;
        return `${level === 0 ? '<ol class="blog-ordered-list">' : ''}<li>${content}</li>`;
      })
      // Close numbered lists
      .replace(/(<\/li>)(?!\n\s*\d+\.\s+)/g, '$1</ol>')
      // Process blockquotes
      .replace(/^>\s+(.+)$/gm, '<blockquote class="blog-quote">$1</blockquote>')
      // Process emphasis
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*\*/g, '<em>$1</em>')
      // Process paragraphs (lines that aren't headings, lists, or blockquotes)
      .replace(/^(?!<[hol]|<block)[^\n].+$/gm, '<p class="blog-paragraph">$&</p>')
      // Clean up any empty paragraphs
      .replace(/<p[^>]*>\s*<\/p>/g, '')
      // Add proper spacing between sections
      .replace(/(<\/h[123]>|<\/[uo]l>|<\/blockquote>)\s*(?=<)/g, '$1\n');

    res.json({ content: processedContent });
  } catch (error) {
    console.error('Error in AI request:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Error generating content',
      error: error.response?.data || error.message
    });
  }
});

// Optimize content for SEO
router.post('/optimize-seo', verifyToken, ensureApiKey, async (req, res) => {
  try {
    const { content, keywords } = req.body;

    if (!content || !keywords) {
      return res.status(400).json({ message: 'Missing required fields: content or keywords' });
    }

    const prompt = `Optimize this content for SEO, focusing on the keywords ${keywords.join(', ')}. 
Maintain the original message while improving search engine friendliness.
Keep all existing HTML formatting and structure.
Do not add any markdown or code fences.
Add relevant meta descriptions and title tags if needed.

Content to optimize:
${content}`;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      requestBody,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const candidate = response.data?.candidates?.[0];
    let optimizedContent = candidate?.content?.parts?.[0]?.text;

    if (!optimizedContent) {
      throw new Error('Invalid response from Gemini API');
    }

    // Remove any code fences or markdown artifacts
    optimizedContent = optimizedContent
      .replace(/```html/g, '')
      .replace(/```/g, '')
      .trim();

    res.json({ optimizedContent });
  } catch (error) {
    console.error('Error in SEO optimization:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Error optimizing content',
      error: error.response?.data || error.message
    });
  }
});

export default router;
