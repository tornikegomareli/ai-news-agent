import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Simple route for testing
app.get('/', (req, res) => {
  res.json({ message: 'AI News Agent API is running', version: '1.0.0' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.get('/api/v1/llm/providers', (req, res) => {
  res.json({
    providers: [
      { id: 'openai', name: 'OpenAI', models: ['gpt-4-turbo', 'gpt-4o'] },
      { id: 'anthropic', name: 'Anthropic Claude', models: ['claude-3-opus', 'claude-3-sonnet'] }
    ]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});