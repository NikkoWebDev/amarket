const { createClient } = require('openrouter');

const client = createClient({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseUrl: 'https://openrouter.ai/api/v1'
});

// Add AI service configuration
const AI_SERVICE = {
  name: 'OpenRouter',
  client: client,
  model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet'
};

module.exports = { client, AI_SERVICE };