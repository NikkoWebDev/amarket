const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';

/**
 * Sends a prompt to OpenRouter and returns the response text.
 * @param {string} prompt - The user prompt or text to send.
 * @returns {Promise<string>} - The AI generated response.
 */
async function generateText(prompt) {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }]
    },
    {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  // Assuming OpenAI compatible response format
  return response.data.choices?.[0]?.message?.content || '';
}

module.exports = { generateText };
