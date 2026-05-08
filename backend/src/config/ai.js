const axios = require('axios');

const AI_SERVICE = {
  name: 'OpenRouter',
  model: process.env.OPENROUTER_MODEL || 'tencent/hy3-preview:free',
  apiKey: process.env.OPENROUTER_API_KEY,
  baseUrl: 'https://openrouter.ai/api/v1',
};

async function chatCompletion(messages) {
  const response = await axios.post(
    `${AI_SERVICE.baseUrl}/chat/completions`,
    {
      model: AI_SERVICE.model,
      messages,
    },
    {
      headers: {
        'Authorization': `Bearer ${AI_SERVICE.apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

module.exports = { AI_SERVICE, chatCompletion };