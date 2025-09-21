import { createApp } from './app';

/**
 * 启动服务器
 */
function startServer(): void {
  const app = createApp();
  const PORT = process.env.PORT || 8787;

  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  });
}

// 启动服务器
startServer();
