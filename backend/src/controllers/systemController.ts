import { Request, Response } from 'express';
import { FileManager } from '../utils/fileManager';

/**
 * 系统信息控制器
 */
export class SystemController {
  /**
   * 获取系统信息
   */
  static async getSystemInfo(req: Request, res: Response): Promise<void> {
    try {
      const systemInfo = FileManager.getSystemInfo();
      res.json({
        success: true,
        data: systemInfo
      });
    } catch (error) {
      console.error('System info error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get system info'
      });
    }
  }

  /**
   * 健康检查
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    });
  }
}
