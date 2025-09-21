import { Router } from 'express';
import { TypeController } from '../controllers/typeController';
import { SystemController } from '../controllers/systemController';

const router: Router = Router();

// 系统信息路由
router.get('/system-info', SystemController.getSystemInfo);

// 类型生成路由
router.post('/generate-types', TypeController.generateTypes);

export default router;
