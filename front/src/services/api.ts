import { GenerateTypesRequest, GenerateTypesResponse, ApiError as ApiErrorType } from '@/types/api';

/**
 * API 服务类
 * 处理与后端的通信
 */
export class ApiService {
  private static readonly BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

  /**
   * 生成 TypeScript 类型定义
   * @param request 请求参数
   * @returns Promise<GenerateTypesResponse>
   */
  static async generateTypes(request: GenerateTypesRequest): Promise<GenerateTypesResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/generate-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiErrorClass(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          errorData.code || 'HTTP_ERROR',
          response.status
        );
      }

      const data: GenerateTypesResponse = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      if (error instanceof ApiErrorClass) {
        throw error;
      }

      // 处理网络错误
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiErrorClass(
          '网络错误：无法连接到服务器',
          'NETWORK_ERROR',
          0
        );
      }

      throw new ApiErrorClass(
        error instanceof Error ? error.message : '未知错误',
        'UNKNOWN_ERROR',
        0
      );
    }
  }

  /**
   * 验证 URL 是否有效
   * @param url 要验证的 URL
   * @returns boolean
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static async getSystemInfo(): Promise<any> {
    try {
      const response = await fetch(`${ApiService.BASE_URL}/api/system-info`);
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new ApiErrorClass(
          data.error || 'Failed to get system info',
          'API_ERROR',
          response.status
        );
      }
      return data.data;
    } catch (error) {
      console.error('Failed to get system info:', error);
      throw error;
    }
  }

  /**
   * 验证请求头格式
   * @param headers 请求头对象
   * @returns string | null 错误信息，null 表示验证通过
   */
  static validateHeaders(headers: Record<string, string>): string | null {
    for (const [key, value] of Object.entries(headers)) {
      if (!key.trim()) {
        return '请求头键名不能为空';
      }
      if (!value.trim()) {
        return '请求头值不能为空';
      }
    }
    return null;
  }
}

/**
 * 自定义错误类
 */
class ApiErrorClass extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}