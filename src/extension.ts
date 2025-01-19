/**
 * extension.ts
 * 
 * 文件说明：Cursor生产力助手扩展的主入口文件
 * 功能描述：
 * 1. 注册和初始化各项服务
 * 2. 管理扩展的生命周期
 * 3. 处理命令和事件
 * 
 * 实现思路：
 * - 统一管理所有服务的初始化和销毁
 * - 注册命令和事件处理器
 * - 提供扩展的激活和释放逻辑
 * 
 * @author Cursor生产力助手
 */

import * as vscode from "vscode";
import { DocumentService } from './services/document-service';
import { FileMonitorService } from './services/file-monitor-service';
import { GitService } from './services/git-service';

let outputChannel: vscode.OutputChannel;
let documentService: DocumentService;
let fileMonitorService: FileMonitorService;
let gitService: GitService;

export async function activate(context: vscode.ExtensionContext) {
  console.log("开始激活扩展...");

  try {
    // 创建输出通道
    outputChannel = vscode.window.createOutputChannel("Cursor生产力助手");
    console.log("输出通道已创建");

    // 创建服务实例
    documentService = new DocumentService();
    fileMonitorService = new FileMonitorService();
    gitService = new GitService();

    // 初始化服务
    await documentService.initialize();
    await fileMonitorService.initialize();
    await gitService.initialize();

    // 注册到上下文
    context.subscriptions.push(
      documentService,
      fileMonitorService,
      gitService
    );

    // 注册命令
    console.log("开始注册命令...");
    const checkStatusCommand = vscode.commands.registerCommand(
      "cursor-productivity.checkStatus",
      () => {
        console.log("命令被触发");
        outputChannel.appendLine("执行状态检查命令");
        outputChannel.show(true);
        vscode.window.showInformationMessage("Cursor生产力助手运行正常！");
      }
    );

    // 注册文档相关命令
    const updateHeaderCommand = vscode.commands.registerCommand(
      "cursor-productivity.updateFileHeader",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          await documentService.updateFileHeader(editor.document.fileName);
          vscode.window.showInformationMessage("文件头部注释已更新");
        }
      }
    );

    // 注册Git相关命令
    const gitCommitCommand = vscode.commands.registerCommand(
      "cursor-productivity.gitCommit",
      async () => {
        try {
          await gitService.autoCommit();
          vscode.window.showInformationMessage("Git提交成功");
        } catch (error) {
          vscode.window.showErrorMessage(`Git提交失败: ${error}`);
        }
      }
    );

    context.subscriptions.push(
      checkStatusCommand,
      updateHeaderCommand,
      gitCommitCommand
    );

    console.log("命令注册完成");

    // 将输出通道添加到订阅列表中
    context.subscriptions.push(outputChannel);

    // 初始化成功提示
    outputChannel.appendLine("Cursor生产力助手已成功激活");
    vscode.window.showInformationMessage("Cursor生产力助手已启动");
  } catch (error: any) {
    console.error("激活过程中发生错误:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (outputChannel) {
      outputChannel.appendLine(`初始化失败: ${errorMessage}`);
    }
    console.error("初始化失败:", errorMessage);
    vscode.window.showErrorMessage(
      `Cursor生产力助手初始化失败: ${errorMessage}`
    );
  }
}

export function deactivate() {
  if (documentService) {
    documentService.dispose();
  }
  if (fileMonitorService) {
    fileMonitorService.dispose();
  }
  if (gitService) {
    gitService.dispose();
  }
  if (outputChannel) {
    outputChannel.appendLine("Cursor生产力助手已停用");
    outputChannel.dispose();
  }
}
