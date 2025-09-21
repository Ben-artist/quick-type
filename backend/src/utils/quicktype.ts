/**
 * TypeScript 类型生成工具类
 * 将 JSON 数据转换为 TypeScript 类型定义
 */
export class TypeGenerator {
  /**
   * 将 JSON 数据转换为 TypeScript 类型定义
   * @param jsonData JSON 数据
   * @param rootName 根类型名称
   * @returns Promise<string> 生成的 TypeScript 类型定义
   */
  static async generateTypes(jsonData: any, rootName: string = 'ApiResponse'): Promise<string> {
    try {
      // 验证输入数据
      if (!jsonData) {
        throw new Error('No data provided for type generation');
      }

      // 生成类型定义
      const { interfaces, rootType } = this.generateTypesFromObject(jsonData, rootName);
      
      // 添加文件头注释
      const header = `/**
 * 自动生成的 TypeScript 类型定义
 * 由 Quick Type 工具生成
 * 生成时间: ${new Date().toISOString()}
 */

`;

      // 组合所有接口定义
      const allInterfaces = [...interfaces];
      
      // 添加根类型导出
      if (rootType) {
        allInterfaces.push(`export type ${rootName} = ${rootType};`);
      }

      return header + allInterfaces.join('\n\n');
    } catch (error) {
      console.error('Type generation failed:', error);
      throw new Error(`Failed to generate types: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 从对象生成 TypeScript 类型定义
   * @param obj 要分析的对象
   * @param rootName 根类型名称
   * @returns 生成的类型定义
   */
  private static generateTypesFromObject(obj: any, rootName: string): { interfaces: string[], rootType: string } {
    const interfaces: string[] = [];
    const processedTypes = new Set<string>();
    const typeMap = new Map<string, string>();

    // 处理根对象
    const rootType = this.processObject(obj, rootName, interfaces, processedTypes, typeMap);

    return { interfaces, rootType };
  }

  /**
   * 处理对象并生成接口定义
   * @param obj 要处理的对象
   * @param name 类型名称
   * @param interfaces 接口数组
   * @param processedTypes 已处理的类型集合
   * @param typeMap 类型映射
   * @returns 根类型定义
   */
  private static processObject(
    obj: any, 
    name: string, 
    interfaces: string[], 
    processedTypes: Set<string>,
    typeMap: Map<string, string>
  ): string {
    if (obj === null || obj === undefined) {
      return 'any';
    }

    if (typeof obj === 'boolean') {
      return 'boolean';
    }

    if (typeof obj === 'number') {
      return 'number';
    }

    if (typeof obj === 'string') {
      return 'string';
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return 'any[]';
      }
      
      const itemType = this.processObject(obj[0], name + 'Item', interfaces, processedTypes, typeMap);
      return `${itemType}[]`;
    }

    if (typeof obj === 'object') {
      // 检查是否已经处理过相同的对象结构
      const objectKey = this.getObjectKey(obj);
      if (typeMap.has(objectKey)) {
        return typeMap.get(objectKey)!;
      }

      const interfaceName = this.toPascalCase(name);
      
      // 避免重复处理
      if (processedTypes.has(interfaceName)) {
        return interfaceName;
      }
      processedTypes.add(interfaceName);

      const properties: string[] = [];
      const nestedTypes: string[] = [];

      for (const [key, value] of Object.entries(obj)) {
        const propertyName = this.formatPropertyName(key);
        const propertyType = this.inferPropertyType(value, interfaceName + this.capitalize(propertyName), interfaces, processedTypes, typeMap);
        properties.push(`  ${propertyName}: ${propertyType};`);

        // 处理嵌套对象
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const nestedType = this.processObject(value, interfaceName + this.capitalize(propertyName), interfaces, processedTypes, typeMap);
          if (nestedType !== 'any' && !this.isPrimitiveType(nestedType)) {
            nestedTypes.push(nestedType);
          }
        } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
          const itemType = this.processObject(value[0], interfaceName + this.capitalize(propertyName) + 'Item', interfaces, processedTypes, typeMap);
          if (itemType !== 'any' && !this.isPrimitiveType(itemType)) {
            nestedTypes.push(itemType);
          }
        }
      }

      const interfaceDef = `interface ${interfaceName} {
${properties.join('\n')}
}`;

      interfaces.push(interfaceDef);
      typeMap.set(objectKey, interfaceName);

      return interfaceName;
    }

    return 'any';
  }

  /**
   * 推断属性类型
   */
  private static inferPropertyType(
    value: any, 
    suggestedName: string, 
    interfaces: string[], 
    processedTypes: Set<string>,
    typeMap: Map<string, string>
  ): string {
    if (value === null) {
      return 'any';
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return 'any[]';
      }
      const itemType = this.inferPropertyType(value[0], suggestedName + 'Item', interfaces, processedTypes, typeMap);
      return `${itemType}[]`;
    }

    if (typeof value === 'object') {
      return this.processObject(value, suggestedName, interfaces, processedTypes, typeMap);
    }

    return typeof value;
  }

  /**
   * 格式化属性名称
   */
  private static formatPropertyName(name: string): string {
    // 如果属性名是数字开头，添加前缀
    if (/^\d/.test(name)) {
      return `_${name}`;
    }
    return name;
  }

  /**
   * 首字母大写
   */
  private static capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /**
   * 转换为 PascalCase
   */
  private static toPascalCase(str: string): string {
    if (!str) return 'Unknown';
    
    return str
      .split(/[-_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * 检查是否是原始类型
   */
  private static isPrimitiveType(type: string): boolean {
    return ['string', 'number', 'boolean', 'any', 'null', 'undefined'].includes(type);
  }

  /**
   * 获取对象的唯一标识
   */
  private static getObjectKey(obj: any): string {
    const keys = Object.keys(obj).sort();
    return keys.join(',');
  }

  /**
   * 检查字符串是否是日期格式
   */
  private static isDateString(str: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return dateRegex.test(str) && !isNaN(Date.parse(str));
  }

  /**
   * 验证 JSON 数据是否有效
   */
  static isValidJsonData(data: any): boolean {
    try {
      if (typeof data === 'string') {
        JSON.parse(data);
      } else if (typeof data === 'object' && data !== null) {
        JSON.stringify(data);
      } else {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取建议的根类型名称
   */
  static getSuggestedRootName(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // 从路径中提取有意义的名称
      const segments = pathname.split('/').filter(segment => segment.length > 0);
      
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        if (lastSegment) {
          // 转换为 PascalCase
          return lastSegment
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('') + 'Response';
        }
      }
      
      return 'ApiResponse';
    } catch {
      return 'ApiResponse';
    }
  }
}