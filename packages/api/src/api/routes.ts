import { Express } from 'express';
import userRoutes from './routes/userRoutes';
import llmRoutes from './routes/llmRoutes';
import newsRoutes from './routes/newsRoutes';

export const configureRoutes = (app: Express): void => {
  // API version prefix
  const apiPrefix = '/api/v1';
  
  // Register route groups
  app.use(`${apiPrefix}/users`, userRoutes);
  app.use(`${apiPrefix}/llm`, llmRoutes);
  app.use(`${apiPrefix}/news`, newsRoutes);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
};