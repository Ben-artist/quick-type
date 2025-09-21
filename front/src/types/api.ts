/**
 * API 请求和响应类型定义
 */

export interface GenerateTypesRequest {
  /** 目标 API URL */
  url: string;
  /** 自定义请求头 */
  headers?: Record<string, string>;
  /** HTTP 请求方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** 请求体（用于 POST/PUT 请求） */
  body?: string;
  /** 根类型名称 */
  rootTypeName?: string;
  /** 是否保存到文件 */
  saveToFile?: boolean;
  /** 文件名 */
  fileName?: string;
  /** 保存路径 */
  savePath?: string;
}

export interface GenerateTypesResponse {
  /** 请求是否成功 */
  success: boolean;
  /** 生成的 TypeScript 类型定义 */
  types?: string;
  /** 错误信息 */
  error?: string;
  /** 原始响应数据（用于调试） */
  originalData?: any;
  /** 请求的 URL */
  requestedUrl?: string;
  /** 文件保存信息 */
  fileInfo?: {
    saved: boolean;
    filePath?: string;
    fileName?: string;
  };
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface HeaderItem {
  key: string;
  value: string;
  enabled: boolean;
}
