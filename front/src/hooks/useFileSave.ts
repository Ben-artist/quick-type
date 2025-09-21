import { useState, useEffect } from 'react';
import { GenerateTypesRequest } from '@/types/api';
import { ApiService } from '@/services/api';

/**
 * 文件保存 Hook
 */
export function useFileSave() {
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

  // 验证路径
  const validatePath = (path: string): boolean => {
    if (!path.trim()) {
      setPathError('请输入保存路径');
      return false;
    }
    
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
      const filePath = files[0].path || files[0].webkitRelativePath;
      if (filePath) {
        const directory = filePath.substring(0, filePath.lastIndexOf('/'));
        setSavePath(directory);
      }
    }
  };

  // 保存到文件
  const handleSaveToFile = async () => {
    setTempFileName(fileName || 'ApiTypes');
    setTempSavePath(savePath || systemInfo?.defaultSavePath || '');
    setShowSaveDialog(true);
  };

  // 确认保存
  const confirmSaveToFile = async (requestData: Partial<GenerateTypesRequest>) => {
    if (!tempFileName.trim() || !tempSavePath.trim()) {
      throw new Error('请填写文件名和保存路径');
    }

    const request: GenerateTypesRequest = {
      ...requestData,
      saveToFile: true,
      fileName: tempFileName,
      savePath: tempSavePath,
    } as GenerateTypesRequest;

    const response = await ApiService.generateTypes(request);
    
    if (!response.success) {
      throw new Error(response.error || '保存失败');
    }

    setShowSaveDialog(false);
    return response;
  };

  return {
    // 状态
    rootTypeName,
    saveToFile,
    fileName,
    savePath,
    systemInfo,
    isDragOver,
    pathError,
    showSaveDialog,
    tempFileName,
    tempSavePath,
    
    // 方法
    setRootTypeName,
    setSaveToFile,
    setFileName,
    setSavePath,
    setTempFileName,
    setTempSavePath,
    setShowSaveDialog,
    validatePath,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSaveToFile,
    confirmSaveToFile,
  };
}
