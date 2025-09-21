import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { SystemController } from './controllers/systemController';
import apiRoutes from './routes/api';

/**
 * 创建 Express 应用
 */
export function createApp(): express.Application {
  const app = express();

  // 中间件
  app.use(cors(corsOptions));
  app.use(express.json());

  // 路由
  app.get('/health', SystemController.healthCheck);
  app.use('/api', apiRoutes);

  return app;
}
