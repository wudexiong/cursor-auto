# Cursor生产力助手

一个为Cursor编辑器开发的生产力增强扩展，提供智能文件管理、Git操作自动化等功能。

## 功能特性

### 1. 文件管理
- 自动添加和更新文件头部注释
- 文件长度监控和优化建议
- 智能文件结构分析

### 2. Git操作自动化
- 自动初始化Git仓库
- 智能提交信息生成
- 文件变更自动分类

### 3. 项目管理
- README文件自动更新
- 项目结构优化建议
- 开发规范检查

## 安装

1. 在Cursor编辑器中打开扩展面板
2. 搜索"Cursor生产力助手"
3. 点击安装

## 使用方法

### 文件头部注释
- 命令：`更新文件头部注释`
- 快捷键：无
- 说明：自动为当前文件添加或更新标准格式的头部注释

### Git自动提交
- 命令：`Git自动提交`
- 快捷键：无
- 说明：自动检测文件变更，生成智能提交信息并提交

## 配置选项

在设置中可以配置以下选项：

- `cursor-productivity.enableAutoHeader`: 是否启用自动添加文件头部注释
- `cursor-productivity.autoUpdateReadme`: 是否自动更新README.md文件
- `cursor-productivity.gitAutoCommit`: 是否启用Git自动提交

## 开发

1. 克隆仓库
```bash
git clone https://github.com/wwwjs/cursor-productivity-extension.git
```

2. 安装依赖
```bash
npm install
```

3. 编译项目
```bash
npm run compile
```

4. 启动调试
- 按F5启动调试
- 在新窗口中测试功能

## 贡献

欢迎提交Issue和Pull Request。

## 许可证

MIT License

## 更多信息

- [VS Code 扩展开发文档](https://code.visualstudio.com/api)
- [项目问题追踪](https://github.com/your-username/cursor-productivity-extension/issues)
