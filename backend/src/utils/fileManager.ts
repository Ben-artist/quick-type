import * as shell from 'shelljs';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 文件管理工具类
 * 处理 TypeScript 类型文件的保存和管理
 */
export class FileManager {
  /**
   * 保存 TypeScript 类型定义到文件
   * @param content 类型定义内容
   * @param fileName 文件名
   * @param savePath 保存路径
   * @returns 保存结果
   */
  static async saveTypeFile(
    content: string, 
    fileName: string, 
    savePath?: string
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // 确保文件名有 .ts 扩展名
      if (!fileName.endsWith('.ts')) {
        fileName += '.ts';
      }

      // 确定保存路径
      let targetPath: string;
      if (savePath) {
        // 使用用户指定的路径
        targetPath = path.resolve(savePath);
      } else {
        // 使用默认路径：用户主目录下的 quick-type-types 文件夹
        targetPath = path.join(os.homedir(), 'quick-type-types');
      }

      // 确保目录存在
      if (!fs.existsSync(targetPath)) {
        shell.mkdir('-p', targetPath);
      }

      // 完整的文件路径
      const fullPath = path.join(targetPath, fileName);

      // 写入文件
      fs.writeFileSync(fullPath, content, 'utf8');

      return {
        success: true,
        filePath: fullPath
      };
    } catch (error) {
      console.error('File save error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 获取建议的文件名
   * @param url API URL
   * @param rootTypeName 根类型名称
   * @returns 建议的文件名
   */
  static getSuggestedFileName(url: string, rootTypeName?: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // 从路径中提取有意义的名称
      const segments = pathname.split('/').filter(segment => segment.length > 0);
      
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        if (lastSegment) {
          return lastSegment
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('') + 'Types';
        }
      }
      
      return rootTypeName || 'ApiTypes';
    } catch {
      return rootTypeName || 'ApiTypes';
    }
  }

  /**
   * 获取默认保存路径
   * @returns 默认保存路径
   */
  static getDefaultSavePath(): string {
    return path.join(os.homedir(), 'quick-type-types');
  }

  /**
   * 检查路径是否可写
   * @param dirPath 目录路径
   * @returns 是否可写
   */
  static isWritable(dirPath: string): boolean {
    try {
      const testFile = path.join(dirPath, '.write-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取系统信息
   * @returns 系统信息
   */
  static getSystemInfo(): {
    platform: string;
    homeDir: string;
    defaultSavePath: string;
    isWritable: boolean;
  } {
    const homeDir = os.homedir();
    const defaultSavePath = this.getDefaultSavePath();
    
    return {
      platform: os.platform(),
      homeDir,
      defaultSavePath,
      isWritable: this.isWritable(homeDir)
    };
  }

  /**
   * 在 VSCode 中打开文件
   * @param filePath 文件路径
   * @returns 是否成功打开
   */
  static openInVSCode(filePath: string): boolean {
    try {
      // 检查 VSCode 是否可用
      const codeCommand = shell.which('code');
      if (!codeCommand) {
        console.warn('VSCode command not found. Please install VSCode and add it to PATH.');
        return false;
      }

      // 使用 VSCode 打开文件
      const result = shell.exec(`code "${filePath}"`, { silent: true });
      return result.code === 0;
    } catch (error) {
      console.error('Failed to open in VSCode:', error);
      return false;
    }
  }

  /**
   * 在默认编辑器中打开文件
   * @param filePath 文件路径
   * @returns 是否成功打开
   */
  static openInDefaultEditor(filePath: string): boolean {
    try {
      let command: string;
      
      switch (os.platform()) {
        case 'darwin': // macOS
          command = `open "${filePath}"`;
          break;
        case 'win32': // Windows
          command = `start "" "${filePath}"`;
          break;
        default: // Linux and others
          command = `xdg-open "${filePath}"`;
          break;
      }

      const result = shell.exec(command, { silent: true });
      return result.code === 0;
    } catch (error) {
      console.error('Failed to open in default editor:', error);
      return false;
    }
  }
}
