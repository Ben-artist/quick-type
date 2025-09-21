import { Request, Response } from 'express';
import { GenerateTypesRequest, GenerateTypesResponse } from '../types';
import { HttpClient } from '../utils/http';
import { TypeGenerator } from '../utils/quicktype';
import { FileManager } from '../utils/fileManager';
/**
 * 类型生成控制器
 */
export class TypeController {
  /**
   * 生成 TypeScript 类型定义
   */
  static async generateTypes(req: Request, res: Response): Promise<void> {
    try {
      const requestData: GenerateTypesRequest = req.body;

      // 验证请求数据
      if (!requestData || !requestData.url) {
        res.status(400).json({
          success: false,
          error: 'URL is required',
        });
        return;
      }

      // 处理请求
      const result = await TypeController.processRequest(requestData);
      res.json(result);

    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * 处理生成类型的请求
   */
  private static async processRequest(requestData: GenerateTypesRequest): Promise<GenerateTypesResponse> {
    try {
      // 发送 HTTP 请求获取数据
      const requestConfig: any = {
        method: requestData.method || 'GET',
        headers: requestData.headers || {},
      };
      
      if (requestData.body) {
        requestConfig.body = requestData.body;
      }
      
      const responseData = await HttpClient.request(requestData.url, requestConfig);

      // 验证响应数据
      if (!TypeGenerator.isValidJsonData(responseData)) {
        return {
          success: false,
          error: 'The API response is not valid JSON data',
          requestedUrl: requestData.url,
        };
      }

      // 确定根类型名称
      const rootName = requestData.rootTypeName || TypeGenerator.getSuggestedRootName(requestData.url);

      // 生成 TypeScript 类型定义
      const types = await TypeGenerator.generateTypes(responseData, rootName);

      const result: GenerateTypesResponse = {
        success: true,
        types,
        requestedUrl: requestData.url,
        originalData: responseData,
      };

      // 如果需要保存到文件
      if (requestData.saveToFile) {
        const fileName = requestData.fileName || FileManager.getSuggestedFileName(requestData.url, rootName);
        const saveResult = await FileManager.saveTypeFile(types, fileName, requestData.savePath);
        
        result.fileInfo = {
          saved: saveResult.success,
          fileName: fileName,
        };
        
        if (saveResult.filePath) {
          result.fileInfo.filePath = saveResult.filePath;
        }

        if (saveResult.error) {
          console.error('File save error:', saveResult.error);
        }
      }

      return result;

    } catch (error) {
      console.error('Process request error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        requestedUrl: requestData.url,
      };
    }
  }
}
