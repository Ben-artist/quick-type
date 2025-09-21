import { CorsOptions } from 'cors';

/**
 * CORS 配置
 */
export const corsOptions: CorsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://quicktype.vercel.app',
    'https://quicktype.netlify.app',
  ],
  credentials: true,
};
