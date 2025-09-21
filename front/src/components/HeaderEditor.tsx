import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { HeaderItem } from '@/types/api';

interface HeaderEditorProps {
  headers: HeaderItem[];
  onHeadersChange: (headers: HeaderItem[]) => void;
}

/**
 * 请求头编辑器组件
 * 允许用户添加、编辑和删除自定义请求头
 */
export const HeaderEditor: React.FC<HeaderEditorProps> = ({ headers, onHeadersChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const addHeader = () => {
    const newHeaders = [...headers, { key: '', value: '', enabled: true }];
    onHeadersChange(newHeaders);
  };

  const updateHeader = (index: number, field: keyof HeaderItem, value: string | boolean) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    onHeadersChange(newHeaders);
  };

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    onHeadersChange(newHeaders);
  };

  const toggleHeader = (index: number) => {
    updateHeader(index, 'enabled', !headers[index].enabled);
  };

  const enabledHeaders = headers.filter(h => h.enabled && h.key.trim() && h.value.trim());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">自定义请求头</CardTitle>
            <CardDescription>
              添加认证信息或其他自定义请求头
              {enabledHeaders.length > 0 && (
                <span className="ml-2 text-primary">
                  ({enabledHeaders.length} 个已启用)
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '收起' : '展开'}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {headers.map((header, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`header-key-${index}`} className="text-xs">
                    键名
                  </Label>
                  <Input
                    id={`header-key-${index}`}
                    placeholder="例如: Authorization"
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor={`header-value-${index}`} className="text-xs">
                    值
                  </Label>
                  <Input
                    id={`header-value-${index}`}
                    placeholder="例如: Bearer your-token"
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-1 mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleHeader(index)}
                  className={`${header.enabled ? 'text-green-600' : 'text-gray-400'} flex items-center justify-center`}
                >
                  {header.enabled ? '✓' : '○'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHeader(index)}
                  className="text-red-500 hover:text-red-700 flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addHeader}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加请求头
          </Button>
        </CardContent>
      )}
    </Card>
  );
};
