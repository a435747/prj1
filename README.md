# Money Task Platform

一个可上线的前台 + 管理后台一体项目：
- 前台任务平台
- 管理后台
- Express API
- JSON 持久化存储
- 后台登录鉴权
- 管理员账号/密码在线修改

## 技术栈
- React
- Vite
- Tailwind CSS
- Express
- dotenv

## 本地开发
### 1. 安装依赖
```bash
npm install
```

### 2. 创建环境变量文件
复制 `.env.example` 为 `.env`：
```bash
cp .env.example .env
```

Windows 也可以直接手动新建 `.env`。

### 3. 启动 API
```bash
npm run dev:api
```

### 4. 启动前端
```bash
npm run dev
```

默认开发地址：
- 前端: `http://localhost:5173`
- API: `http://localhost:3001`

## 默认后台账号
如果未配置 `.env`，默认账号为：
```text
用户名: admin
密码: admin123456
```

正式环境务必修改。

## 环境变量
参考 `.env.example`：
```bash
NODE_ENV=production
PORT=3001
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisPassword123
ADMIN_TOKEN=change-this-admin-token
```

服务端会自动读取 `.env`。

## 生产部署

### 1. 上传项目到服务器
```bash
npm install
```

### 2. 配置 `.env`
复制并修改：
```bash
cp .env.example .env
```

至少改这三个：
```bash
ADMIN_USERNAME=你的后台账号
ADMIN_PASSWORD=你的后台强密码
ADMIN_TOKEN=你的随机长 token
```

### 3. 首次部署前建议检查数据文件
如果你之前已经运行过服务，并且想让新环境变量生效：
```bash
rm -f server/db.json
```

因为 `server/db.json` 一旦生成，就会保存当时的管理员信息。

### 4. 构建前端
```bash
npm run build
```

### 5. 启动 Node 服务
```bash
npm start
```

生产模式下，Express 会：
- 提供 `/api/*` 接口
- 直接托管 `dist/` 静态页面
- 如果仍使用默认管理员凭据，则拒绝启动

## PM2 部署
PM2 配置文件里已经不再写死管理员账号密码。

请先确认项目根目录存在正确的 `.env` 文件，然后执行：
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

如果你修改了 `.env`，并且需要让配置生效，建议：
```bash
pm2 restart money-task-platform
```

## Nginx 反向代理
推荐配置：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 数据存储
服务启动后会自动创建数据文件：
- `server/db.json`

这份文件保存：
- 前台展示数据
- 后台模拟业务数据
- 管理员账号信息

建议：
- 不要提交 `server/db.json`
- 定期备份此文件
- 正式环境后续迁移到 MySQL / PostgreSQL

## 已具备的后台能力
- 登录
- 修改管理员密码
- 修改管理员账号
- 前台内容实时保存到服务端
- 登录失效自动退出
- 全局成功/失败提示

## 常用命令
```bash
npm run dev        # 启动前端开发
npm run dev:api    # 启动 API 开发
npm run build      # 构建前端
npm start          # 生产启动服务
npm run lint       # 代码检查
```
