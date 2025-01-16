# Cursor 生产力助手

Cursor 编辑器的生产力增强扩展。

## 功能特性

- 检查扩展运行状态
- 更多功能开发中...

## 开发环境设置

### 前置要求

- Node.js (>= 16.0.0)
- VS Code 或 Cursor 编辑器
- Git

### 安装依赖

```bash
# 安装所有依赖
npm install
```

## 调试指南

### 1. 环境准备

1. 确保 Node.js 版本正确

   ```bash
   node --version  # 应该 >= 16.0.0
   ```

2. 检查项目结构
   ```
   .
   ├── .vscode/
   │   ├── launch.json     # 调试配置
   │   └── tasks.json      # 任务配置
   ├── src/
   │   └── extension.ts    # 扩展入口文件
   ├── package.json        # 项目配置
   └── webpack.config.js   # 构建配置
   ```

### 2. 构建项目

1. 清理旧的构建文件

   ```bash
   npm run clean
   ```

2. 构建项目
   ```bash
   npm run compile
   ```

### 3. 启动调试

1. 在 VS Code/Cursor 中打开项目

2. 按 F5 启动调试

   - 这将打开一个新的扩展开发主机窗口
   - 应该看到 "Cursor 生产力助手已启动" 的通知

3. 验证扩展是否正常工作：
   - 使用 Ctrl+Shift+P (Windows) 或 Cmd+Shift+P (Mac) 打开命令面板
   - 输入 "Cursor" 或 "检查"
   - 选择 "检查 Cursor 生产力助手状态"
   - 应该看到 "Cursor 生产力助手运行正常！" 的提示

### 4. 调试技巧

1. 查看输出

   - 打开输出面板（查看 > 输出）
   - 在下拉列表中选择 "Cursor 生产力助手"
   - 可以看到扩展的运行日志

2. 开发者工具

   - 帮助 > 切换开发人员工具
   - 查看控制台输出和错误信息

3. 常见问题解决
   - 如果命令不可见，尝试重新加载窗口（Ctrl+R）
   - 如果构建失败，检查 dist 目录是否正确生成
   - 如果依赖有问题，尝试删除 node_modules 并重新安装

### 5. 发布准备

1. 打包扩展

   ```bash
   npm run package
   ```

2. 测试打包后的扩展
   - 确保所有功能正常工作
   - 检查性能和内存使用情况

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交改动
4. 推送到分支
5. 创建 Pull Request

## 许可证

[ISC](LICENSE)

## 更多信息

- [VS Code 扩展开发文档](https://code.visualstudio.com/api)
- [项目问题追踪](https://github.com/your-username/cursor-productivity-extension/issues)
