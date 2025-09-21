# Quick Type Backend - 纯 Dist 部署指南

## 📦 部署包内容

- `dist/` - 编译后的 JavaScript 代码
- `package.json` - 项目配置和依赖
- `ecosystem.config.js` - PM2 配置文件
- `deploy.sh` - 自动部署脚本

## 🚀 服务器部署步骤

### 1. 上传文件到服务器

```bash
# 方式一：使用 scp
scp quick-type-backend-dist.tar.gz user@your-server:/opt/apps/

# 方式二：使用 rsync
rsync -avz quick-type-backend-dist.tar.gz user@your-server:/opt/apps/

# 方式三：使用 FTP/SFTP 工具上传
```

### 2. 在服务器上解压和部署

```bash
# 登录服务器
ssh user@your-server

# 进入部署目录
cd /opt/apps/

# 解压文件
tar -xzf quick-type-backend-dist.tar.gz

# 进入项目目录
cd quick-type-backend

# 给部署脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh production
```

### 3. 手动部署（如果不想用脚本）

```bash
# 安装 Node.js 和 pnpm（如果未安装）
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc

# 安装 PM2（如果未安装）
npm install -g pm2

# 安装项目依赖
pnpm install --production

# 启动服务
pm2 start ecosystem.config.js --env production
```

## 🔧 服务器环境要求

### 必需软件
- **Node.js**: 18.x 或更高版本
- **pnpm**: 包管理器
- **PM2**: 进程管理器

### 安装命令

```bash
# 安装 Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PM2
npm install -g pm2
```

## 📊 服务管理

### PM2 常用命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs quick-type-backend

# 重启服务
pm2 restart quick-type-backend

# 停止服务
pm2 stop quick-type-backend

# 删除服务
pm2 delete quick-type-backend

# 监控面板
pm2 monit

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

## 🌐 服务配置

### 端口配置
- 默认端口：8787
- 修改端口：编辑 `ecosystem.config.js` 中的 `PORT` 环境变量

### 反向代理配置（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8787;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔍 健康检查

```bash
# 检查服务是否运行
curl http://localhost:8787/health

# 测试 API 功能
curl -X POST http://localhost:8787/api/generate-types \
  -H "Content-Type: application/json" \
  -d '{"url": "https://jsonplaceholder.typicode.com/posts/1"}'
```

## 📝 日志文件

- 错误日志：`./logs/err.log`
- 输出日志：`./logs/out.log`
- 合并日志：`./logs/combined.log`

## 🆘 故障排除

1. **端口被占用**：
   ```bash
   lsof -i :8787
   sudo kill -9 <PID>
   ```

2. **服务启动失败**：
   ```bash
   pm2 logs quick-type-backend
   ```

3. **依赖安装失败**：
   ```bash
   rm -rf node_modules
   pnpm install --production
   ```

4. **权限问题**：
   ```bash
   sudo chown -R $USER:$USER /opt/apps/quick-type-backend
   chmod +x deploy.sh
   ```
