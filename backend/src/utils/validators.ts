/**
 * 请求验证工具
 */

/**
 * 验证请求数据
 * @param requestData 请求数据
 * @returns string | null 错误信息，null 表示验证通过
 */
export function validateRequest(requestData: any): string | null {
  if (!requestData) {
    return 'Request data is required';
  }

  if (!requestData.url || typeof requestData.url !== 'string') {
    return 'URL is required and must be a string';
  }

  // 验证 URL 格式
  try {
    new URL(requestData.url);
  } catch {
    return 'Invalid URL format';
  }

  // 验证请求头
  if (requestData.headers && typeof requestData.headers !== 'object') {
    return 'Headers must be an object';
  }

  // 验证请求方法
  if (requestData.method && !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(requestData.method)) {
    return 'Invalid HTTP method';
  }

  // 验证文件保存相关参数
  if (requestData.saveToFile) {
    if (requestData.fileName && typeof requestData.fileName !== 'string') {
      return 'File name must be a string';
    }
    if (requestData.savePath && typeof requestData.savePath !== 'string') {
      return 'Save path must be a string';
    }
  }

  return null;
}
