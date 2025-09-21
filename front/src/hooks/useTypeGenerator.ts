import { useState, useEffect } from 'react';
import { GenerateTypesRequest, HeaderItem } from '@/types/api';
import { ApiService } from '@/services/api';

/**
 * 类型生成器 Hook
 */
export function useTypeGenerator() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [headers, setHeaders] = useState<HeaderItem[]>([]);
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // 生成类型
  const handleGenerate = async () => {
    if (!url.trim()) {
      setError('请输入 URL');
      return;
    }

    if (!ApiService.isValidUrl(url)) {
      setError('请输入有效的 URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      // 构建请求头
      const requestHeaders: Record<string, string> = {};
      headers
        .filter(h => h.enabled && h.key.trim() && h.value.trim())
        .forEach(h => {
          requestHeaders[h.key] = h.value;
        });

      const request: GenerateTypesRequest = {
        url: url.trim(),
        method,
        headers: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
        body: body.trim() || undefined,
      };

      const response = await ApiService.generateTypes(request);
      
      if (response.success && response.types) {
        setResult(response.types);
      } else {
        setError(response.error || '生成类型定义失败');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('发生未知错误');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 复制到剪贴板
  const handleCopy = async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 清空表单
  const handleClear = () => {
    setUrl('');
    setHeaders([]);
    setBody('');
    setResult('');
    setError('');
    setCopied(false);
  };

  return {
    // 状态
    url,
    method,
    headers,
    body,
    isLoading,
    result,
    error,
    copied,
    
    // 方法
    setUrl,
    setMethod,
    setHeaders,
    setBody,
    handleGenerate,
    handleCopy,
    handleClear,
  };
}
