import { RequestConfig } from '../types';

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * HTTP 请求工具类
 * 用于发送 HTTP 请求并处理响应
 */
export class HttpClient {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30秒超时
  private static readonly MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB 最大响应大小

  /**
   * 发送 HTTP 请求
   * @param url 请求 URL
   * @param config 请求配置
   * @returns Promise<any> 响应数据
   */
  static async request(url: string, config: RequestConfig): Promise<any> {
    try {
      // 验证 URL
      this.validateUrl(url);

      // 构建请求配置
      const requestConfig: RequestInit = {
        method: config.method,
        headers: {
          'User-Agent': 'QuickType/1.0.0',
          'Accept': 'application/json, text/plain, */*',
          ...config.headers,
        },
        ...(config.body && { body: config.body }),
      };

      // 设置超时
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        config.timeout || this.DEFAULT_TIMEOUT
      );

      try {
        const response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // 检查响应状态
        if (!response.ok) {
          throw new ApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            'HTTP_ERROR',
            response.status
          );
        }

        // 检查响应大小
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > this.MAX_RESPONSE_SIZE) {
          throw new ApiError(
            'Response too large',
            'RESPONSE_TOO_LARGE',
            413
          );
        }

        // 获取响应内容类型
        const contentType = response.headers.get('content-type') || '';
        
        // 根据内容类型解析响应
        if (contentType.includes('application/json')) {
          return await response.json();
        } else if (contentType.includes('text/')) {
          return await response.text();
        } else {
          // 对于其他类型，尝试作为 JSON 解析
          const text = await response.text();
          try {
            return JSON.parse(text);
          } catch {
            return text;
          }
        }
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 验证 URL 是否有效
   * @param url 要验证的 URL
   */
  private static validateUrl(url: string): void {
    try {
      const parsedUrl = new URL(url);
      
      // 只允许 HTTP 和 HTTPS 协议
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new ApiError(
          'Only HTTP and HTTPS protocols are allowed',
          'INVALID_PROTOCOL',
          400
        );
      }

      // 检查是否为本地地址（安全考虑）
      if (this.isLocalAddress(parsedUrl.hostname)) {
        throw new ApiError(
          'Local addresses are not allowed for security reasons',
          'LOCAL_ADDRESS_NOT_ALLOWED',
          400
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Invalid URL format',
        'INVALID_URL',
        400
      );
    }
  }

  /**
   * 检查是否为本地地址
   * @param hostname 主机名
   * @returns boolean
   */
  private static isLocalAddress(hostname: string): boolean {
    const localPatterns = [
      /^localhost$/i,
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^::1$/,
      /^fe80:/,
    ];

    return localPatterns.some(pattern => pattern.test(hostname));
  }

  /**
   * 处理错误
   * @param error 原始错误
   * @returns ApiError
   */
  private static handleError(error: any): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error.name === 'AbortError') {
      return new ApiError(
        'Request timeout',
        'TIMEOUT',
        408
      );
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new ApiError(
        'Network error: Unable to connect to the server',
        'NETWORK_ERROR',
        503
      );
    }

    return new ApiError(
      error.message || 'Unknown error occurred',
      'UNKNOWN_ERROR',
      500
    );
  }
}
