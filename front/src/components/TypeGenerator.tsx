import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HeaderEditor } from './HeaderEditor';
import { ApiService } from '@/services/api';
import { GenerateTypesRequest, HeaderItem } from '@/types/api';
import { Loader2, Copy, Check, AlertCircle, Code, Globe, Download, FolderOpen } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useEffect } from 'react';

/**
 * 类型生成器主组件
 * 处理用户输入和类型生成逻辑
 */
export const TypeGenerator: React.FC = () => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [headers, setHeaders] = useState<HeaderItem[]>([]);
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [rootTypeName, setRootTypeName] = useState<string>('');
  const [saveToFile, setSaveToFile] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [savePath, setSavePath] = useState<string>('');
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pathError, setPathError] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [tempFileName, setTempFileName] = useState<string>('');
  const [tempSavePath, setTempSavePath] = useState<string>('');

  // 获取系统信息
  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const info = await ApiService.getSystemInfo();
        setSystemInfo(info);
        setSavePath(info.defaultSavePath);
      } catch (error) {
        console.error('Failed to get system info:', error);
      }
    };
    fetchSystemInfo();
  }, []);

  // 当 URL 改变时，自动生成建议的根类型名称和文件名
  useEffect(() => {
    if (url && !rootTypeName) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const segments = pathname.split('/').filter(segment => segment.length > 0);
        
        if (segments.length > 0) {
          const lastSegment = segments[segments.length - 1];
          const suggestedName = lastSegment
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('') + 'Response';
          
          setRootTypeName(suggestedName);
          setFileName(suggestedName + 'Types');
        }
      } catch {
        // URL 无效，忽略
      }
    }
  }, [url, rootTypeName]);

  // 验证路径
  const validatePath = (path: string): boolean => {
    if (!path.trim()) {
      setPathError('请输入保存路径');
      return false;
    }
    
    // 基本路径格式验证
    const pathPattern = /^[a-zA-Z0-9\/\\:\.\-\s_~]+$/;
    if (!pathPattern.test(path)) {
      setPathError('路径包含无效字符');
      return false;
    }
    
    setPathError('');
    return true;
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // 获取第一个文件的目录路径
      const filePath = files[0].path || files[0].webkitRelativePath;
      if (filePath) {
        const directory = filePath.substring(0, filePath.lastIndexOf('/'));
        setSavePath(directory);
      }
    }
  };

  const handleGenerate = async () => {
    // 验证输入
    if (!url.trim()) {
      setError('请输入 URL');
      return;
    }

    if (!ApiService.isValidUrl(url)) {
      setError('请输入有效的 URL');
      return;
    }

    // 如果启用了文件保存，验证路径
    if (saveToFile && !validatePath(savePath)) {
      setError('请检查保存路径是否正确');
      return;
    }

    // 构建请求头
    const requestHeaders: Record<string, string> = {};
    headers
      .filter(h => h.enabled && h.key.trim() && h.value.trim())
      .forEach(h => {
        requestHeaders[h.key.trim()] = h.value.trim();
      });

    // 验证请求头
    const headerError = ApiService.validateHeaders(requestHeaders);
    if (headerError) {
      setError(headerError);
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const request: GenerateTypesRequest = {
        url: url.trim(),
        method,
        headers: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
        body: body.trim() || undefined,
        rootTypeName: rootTypeName || undefined,
        saveToFile,
        fileName: saveToFile ? fileName : undefined,
        savePath: saveToFile ? savePath : undefined,
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

  const handleSaveToFile = async () => {
    if (!result) return;

    // 设置临时保存参数
    setTempFileName(fileName || 'ApiTypes');
    setTempSavePath(savePath || systemInfo?.defaultSavePath || '');
    setShowSaveDialog(true);
  };

  const confirmSaveToFile = async () => {
    if (!result || !tempFileName.trim() || !tempSavePath.trim()) {
      setError('请填写文件名和保存路径');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const request: GenerateTypesRequest = {
        url: url.trim(),
        method,
        headers: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
        body: body.trim() || undefined,
        rootTypeName: rootTypeName || undefined,
        saveToFile: true,
        fileName: tempFileName,
        savePath: tempSavePath,
      };

      const response = await ApiService.generateTypes(request);
      
      if (response.success) {
        setShowSaveDialog(false);
        setError('');
        // 显示成功消息
        setError('文件保存成功！');
        setTimeout(() => setError(''), 3000);
      } else {
        setError(response.error || '保存失败');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('保存失败');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setHeaders([]);
    setBody('');
    setResult('');
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Quick Type
        </h1>
        <p className="text-lg text-muted-foreground">
          将 API URL 转换为 TypeScript 类型定义
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API 请求配置
              </CardTitle>
              <CardDescription>
                输入 API URL 和请求参数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* URL 输入 */}
              <div className="space-y-2">
                <Label htmlFor="url">API URL *</Label>
                <Input
                  id="url"
                  placeholder="https://api.example.com/users"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="font-mono"
                />
              </div>

              {/* HTTP 方法选择 */}
              <div className="space-y-2">
                <Label htmlFor="method">HTTP 方法</Label>
                <select
                  id="method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              {/* 请求体（用于 POST/PUT） */}
              {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
                <div className="space-y-2">
                  <Label htmlFor="body">请求体 (JSON)</Label>
                  <Textarea
                    id="body"
                    placeholder='{"key": "value"}'
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="font-mono min-h-[100px]"
                  />
                </div>
              )}

              {/* 类型生成配置 */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  类型生成配置
                </h3>
                
                {/* 根类型名称 */}
                <div className="space-y-2">
                  <Label htmlFor="rootTypeName">根类型名称</Label>
                  <input
                    id="rootTypeName"
                    type="text"
                    placeholder="ApiResponse"
                    value={rootTypeName}
                    onChange={(e) => setRootTypeName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 文件保存选项 */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      id="saveToFile"
                      type="checkbox"
                      checked={saveToFile}
                      onChange={(e) => setSaveToFile(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="saveToFile" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      保存到文件
                    </Label>
                  </div>

                  {saveToFile && (
                    <div className="space-y-3 pl-6 border-l-2 border-gray-200">
                      {/* 文件名 */}
                      <div className="space-y-2">
                        <Label htmlFor="fileName">文件名</Label>
                        <input
                          id="fileName"
                          type="text"
                          placeholder="ApiTypes.ts"
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* 保存路径 */}
                      <div className="space-y-2">
                        <Label htmlFor="savePath">保存路径</Label>
                        <div 
                          className={`flex gap-2 p-2 border-2 border-dashed rounded-md transition-colors ${
                            isDragOver 
                              ? 'border-blue-400 bg-blue-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <input
                            id="savePath"
                            type="text"
                            placeholder={systemInfo?.defaultSavePath || '~/quick-type-types'}
                            value={savePath}
                            onChange={(e) => {
                              setSavePath(e.target.value);
                              validatePath(e.target.value);
                            }}
                            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                              pathError 
                                ? 'border-red-300 focus:ring-red-500' 
                                : 'border-gray-300 focus:ring-blue-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setSavePath(systemInfo?.defaultSavePath || '')}
                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-1"
                          >
                            <FolderOpen className="h-4 w-4" />
                            默认
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newPath = prompt('请输入保存路径:', savePath || systemInfo?.defaultSavePath || '');
                              if (newPath !== null) {
                                setSavePath(newPath);
                              }
                            }}
                            className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md flex items-center gap-1"
                          >
                            <FolderOpen className="h-4 w-4" />
                            浏览
                          </button>
                        </div>
                        {isDragOver && (
                          <p className="text-sm text-blue-600">拖拽文件或文件夹到此处设置路径</p>
                        )}
                        {pathError && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {pathError}
                          </p>
                        )}
                        
                        {/* 常用路径选项 */}
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">常用路径:</p>
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => setSavePath(systemInfo?.homeDir + '/Desktop')}
                              className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200"
                            >
                              桌面
                            </button>
                            <button
                              type="button"
                              onClick={() => setSavePath(systemInfo?.homeDir + '/Documents')}
                              className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200"
                            >
                              文档
                            </button>
                            <button
                              type="button"
                              onClick={() => setSavePath(systemInfo?.homeDir + '/Downloads')}
                              className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200"
                            >
                              下载
                            </button>
                            <button
                              type="button"
                              onClick={() => setSavePath(systemInfo?.defaultSavePath || '')}
                              className="px-2 py-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200"
                            >
                              推荐路径
                            </button>
                          </div>
                        </div>
                        
                        {systemInfo && (
                          <p className="text-sm text-gray-500">
                            默认路径: {systemInfo.defaultSavePath}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !url.trim()}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Code className="h-4 w-4 mr-2" />
                      生成类型
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  清空
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 请求头编辑器 */}
          <HeaderEditor
            headers={headers}
            onHeadersChange={setHeaders}
          />
        </div>

        {/* 结果区域 */}
        <div className="space-y-6">
          {/* 错误显示 */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">错误</span>
                </div>
                <p className="mt-2 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* 类型定义结果 */}
          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    生成的 TypeScript 类型
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={copied}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          复制
                        </>
                      )}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveToFile}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      保存到文件
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  点击复制按钮将类型定义复制到剪贴板，或点击保存到文件按钮保存到本地
                  {result && result.includes('fileInfo') && (
                    <div className="mt-2 text-sm text-green-600">
                      ✅ 文件已保存到指定位置
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md overflow-hidden">
                  <SyntaxHighlighter
                    language="typescript"
                    style={oneDark}
                    customStyle={{
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: '1.5',
                    }}
                    showLineNumbers={true}
                    wrapLines={true}
                    wrapLongLines={true}
                  >
                    {result}
                  </SyntaxHighlighter>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 使用说明 */}
          {!result && !error && (
            <Card>
              <CardHeader>
                <CardTitle>使用说明</CardTitle>
                <CardDescription>
                  如何快速生成 TypeScript 类型定义
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">1. 输入 API URL</h4>
                  <p className="text-muted-foreground">
                    输入你想要分析的 API 端点 URL
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">2. 选择请求方法</h4>
                  <p className="text-muted-foreground">
                    选择对应的 HTTP 方法（GET、POST 等）
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">3. 添加请求头（可选）</h4>
                  <p className="text-muted-foreground">
                    如果需要认证，可以添加 Authorization 等请求头
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">4. 生成类型定义</h4>
                  <p className="text-muted-foreground">
                    点击"生成类型"按钮，系统会自动分析响应并生成类型定义
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 保存到文件对话框 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Download className="h-5 w-5" />
              保存到文件
            </h3>
            
            <div className="space-y-4">
              {/* 文件名 */}
              <div className="space-y-2">
                <Label htmlFor="tempFileName">文件名</Label>
                <input
                  id="tempFileName"
                  type="text"
                  placeholder="ApiTypes.ts"
                  value={tempFileName}
                  onChange={(e) => setTempFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 保存路径 */}
              <div className="space-y-2">
                <Label htmlFor="tempSavePath">保存路径</Label>
                <input
                  id="tempSavePath"
                  type="text"
                  placeholder={systemInfo?.defaultSavePath || '~/quick-type-types'}
                  value={tempSavePath}
                  onChange={(e) => setTempSavePath(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 常用路径选项 */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500">常用路径:</p>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setTempSavePath(systemInfo?.homeDir + '/Desktop')}
                    className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200"
                  >
                    桌面
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempSavePath(systemInfo?.homeDir + '/Documents')}
                    className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200"
                  >
                    文档
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempSavePath(systemInfo?.homeDir + '/Downloads')}
                    className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200"
                  >
                    下载
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempSavePath(systemInfo?.defaultSavePath || '')}
                    className="px-2 py-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200"
                  >
                    推荐路径
                  </button>
                </div>
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex gap-2 mt-6">
              <Button
                onClick={confirmSaveToFile}
                disabled={isLoading || !tempFileName.trim() || !tempSavePath.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    保存
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                disabled={isLoading}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
