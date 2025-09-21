# Quick Type - URL 转 TypeScript 类型生成器

## 项目简介

Quick Type 是一个智能的 TypeScript 类型生成工具，可以根据用户提供的 URL 和请求头，自动分析 API 响应并生成对应的 TypeScript 类型定义。这个工具特别适合前端开发者在对接后端 API 时快速生成类型定义，提高开发效率。

## 功能特性

- 🌐 **URL 请求分析**: 支持输入任意 URL，自动发送请求并分析响应
- 🔧 **自定义请求头**: 支持添加自定义请求头（如 Authorization、Content-Type 等）
- 📝 **智能类型生成**: 使用 quicktype-core 自动生成 TypeScript 类型定义
- 🎨 **现代化界面**: 基于 ShadcnUI 的美观用户界面
- ⚡ **快速响应**: 基于 AWS Workers 的高性能后端服务
- 📱 **响应式设计**: 支持各种设备尺寸

## 技术栈

### 后端
- **AWS Workers**: 无服务器计算平台
- **quicktype-core**: TypeScript 类型生成核心库
- **TypeScript**: 类型安全的 JavaScript

### 前端
- **Vite**: 快速的前端构建工具
- **React**: 用户界面库
- **ShadcnUI**: 现代化 UI 组件库
- **TypeScript**: 类型安全的开发体验

## 项目结构

```
quick-type/
├── backend/          # AWS Workers 后端服务
│   ├── src/
│   │   ├── index.ts  # 主入口文件
│   │   └── types/    # 类型定义
│   ├── wrangler.toml # Workers 配置
│   └── package.json  # 依赖管理
├── front/            # React 前端应用
│   ├── src/
│   │   ├── components/ # UI 组件
│   │   ├── pages/      # 页面组件
│   │   └── utils/      # 工具函数
│   ├── package.json    # 依赖管理
│   └── vite.config.ts  # Vite 配置
└── README.md          # 项目说明文档
```

## 使用方法

### 1. 输入 URL
在输入框中输入你想要分析的 API URL，例如：
```
https://api.example.com/users
```

### 2. 添加请求头（可选）
如果需要认证或特殊请求头，可以添加：
- `Authorization: Bearer your-token`
- `Content-Type: application/json`
- `Accept: application/json`

### 3. 发送请求
点击"生成类型"按钮，系统会：
1. 发送请求到指定 URL
2. 分析响应数据结构
3. 自动生成 TypeScript 类型定义

### 4. 复制类型定义
生成的类型定义可以直接复制到你的项目中使用。

## 快速开始

### 一键启动（推荐）

我们提供了便捷的启动脚本来快速启动整个项目：

**macOS/Linux:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

启动脚本会自动：
- 检查并安装必要的依赖
- 启动后端 AWS Workers 服务
- 启动前端开发服务器
- 在浏览器中打开应用

### 手动启动

#### 环境要求
- Node.js 18+
- pnpm（推荐）或 npm/yarn
- Wrangler CLI（用于 AWS Workers）

#### 安装 pnpm 和 Wrangler CLI
```bash
# 安装 pnpm
npm install -g pnpm

# 安装 Wrangler CLI
pnpm install -g wrangler
```

#### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd quick-type
```

2. **安装依赖**
```bash
# 安装后端依赖
cd backend
pnpm install

# 安装前端依赖
cd ../front
pnpm install
```

3. **启动开发服务器**

**终端 1 - 启动后端:**
```bash
cd backend
pnpm run dev
```

**终端 2 - 启动前端:**
```bash
cd front
pnpm run dev
```

4. **访问应用**
- 前端: http://localhost:3000
- 后端: http://localhost:8787

### 部署

1. **部署后端到 AWS Workers**
```bash
cd backend
pnpm run deploy
```

2. **构建并部署前端**
```bash
cd front
pnpm run build
# 将 dist 目录部署到你的静态托管服务
```

## API 接口

### POST /api/generate-types

生成 TypeScript 类型定义

**请求参数：**
```typescript
{
  url: string;           // 目标 API URL
  headers?: Record<string, string>; // 自定义请求头
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // 请求方法
}
```

**响应：**
```typescript
{
  success: boolean;
  types?: string;        // 生成的 TypeScript 类型定义
  error?: string;        // 错误信息
}
```

## 使用示例

### 示例 1: 基础 GET 请求
```
URL: https://jsonplaceholder.typicode.com/users
方法: GET
```

生成的类型定义：
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

interface Geo {
  lat: string;
  lng: string;
}

interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}
```

### 示例 2: 带认证的 POST 请求
```
URL: https://api.example.com/users
方法: POST
请求头:
  Authorization: Bearer your-token
  Content-Type: application/json
请求体:
  {
    "name": "新用户",
    "email": "user@example.com"
  }
```

### 示例 3: 复杂嵌套结构
对于包含数组、嵌套对象和联合类型的复杂 API 响应，系统会智能识别并生成相应的类型定义。

## 常见问题

### Q: 支持哪些 HTTP 方法？
A: 目前支持 GET、POST、PUT、DELETE、PATCH 方法。

### Q: 生成的类型定义准确吗？
A: 系统会智能分析响应数据结构，对于大多数标准 API 响应都能生成准确的类型定义。

### Q: 如何处理嵌套对象和数组？
A: 系统会自动处理复杂的嵌套结构，生成对应的 TypeScript 接口和类型。

### Q: 支持认证吗？
A: 支持，可以通过请求头添加各种认证信息，如 Bearer Token、API Key 等。

### Q: 生成的类型定义可以直接使用吗？
A: 是的，生成的类型定义可以直接复制到你的 TypeScript 项目中使用，无需修改。

### Q: 如何处理错误响应？
A: 系统会显示详细的错误信息，包括网络错误、API 错误和类型生成错误，帮助用户快速定位问题。

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 许可证

MIT License

## 项目特色

### 🚀 技术亮点
- **无服务器架构**: 使用 AWS Workers 实现高性能、低成本的后端服务
- **智能类型推断**: 基于 quicktype-core 的先进算法，准确识别复杂数据结构
- **现代化 UI**: 采用 ShadcnUI 组件库，提供优雅的用户体验
- **类型安全**: 全栈 TypeScript 开发，确保代码质量和开发效率
- **响应式设计**: 支持各种设备尺寸，随时随地使用

### 🎯 解决的问题
- **开发效率**: 自动生成类型定义，减少手动编写时间
- **类型安全**: 提供准确的 TypeScript 类型，避免运行时错误
- **API 对接**: 快速理解 API 结构，加速前后端协作
- **代码质量**: 统一的类型定义，提高代码可维护性

## 更新日志

### v1.0.0 (已完成)
- ✅ 基础功能实现
- ✅ URL 请求和类型生成
- ✅ 现代化用户界面
- ✅ AWS Workers 后端服务
- ✅ 一键启动脚本
- ✅ 完整的使用文档和示例

### 未来计划
- 🔄 支持更多数据格式（GraphQL、XML 等）
- 🔄 类型定义模板和自定义规则
- 🔄 批量 API 处理
- 🔄 类型定义版本管理
- 🔄 团队协作功能

---

**注意**: 这是一个功能完整的项目，可以直接用于生产环境。我们欢迎社区贡献和反馈！
