# Cursor 生产力助手

一个为 Cursor 编辑器开发的生产力增强扩展插件。

## 功能特性

### 1. 文档与注释管理

- README 文档自动管理
- 代码注释自动化
- 文件头注释管理
- 技术文档准备
- 项目状态追踪

### 2. 版本控制与文件管理

- Git 操作自动化
- 文件长度监控
- 文件结构管理

### 3. 项目初始化与配置

- Cursor 规则文件生成
- 上下文管理
- 项目状态记录

### 4. 需求与对话管理

- 需求明确性检查
- 上下文长度控制
- 需求复杂度评估

## 开发环境要求

- Node.js >= 14.x
- VS Code >= 1.80.0
- TypeScript >= 5.2.x
- Git

## 安装依赖

```bash
npm install
```

## 开发命令

- `npm run compile` - 编译项目
- `npm run watch` - 监视模式编译
- `npm run package` - 打包扩展
- `npm run lint` - 运行代码检查
- `npm test` - 运行测试

## 项目结构

```
.
├── src/                # 源代码目录
│   ├── extension.ts    # 扩展入口文件
│   └── features/      # 功能模块目录
├── dist/              # 编译输出目录
├── .vscode/           # VS Code配置
├── .cursorrules       # Cursor规则文件
├── package.json       # 项目配置
├── tsconfig.json      # TypeScript配置
└── webpack.config.js  # Webpack配置
```

## 开发状态

当前版本: 0.0.1 (开发中)

详细进展请查看[项目状态](./项目状态.md)文档。

## 贡献指南

1. Fork 本仓库
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

ISC
