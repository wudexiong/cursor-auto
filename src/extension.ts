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
import { AIService } from './services/ai-service';

let outputChannel: vscode.OutputChannel;
let documentService: DocumentService;
let fileMonitorService: FileMonitorService;
let gitService: GitService;
let aiService: AIService;

export async function activate(context: vscode.ExtensionContext) {
  console.log("开始激活扩展...");

  try {
    // 创建输出通道
    outputChannel = vscode.window.createOutputChannel("Cursor生产力助手");
    outputChannel.appendLine("输出通道已创建");
    outputChannel.show(true);

    // 创建服务实例
    documentService = new DocumentService();
    fileMonitorService = new FileMonitorService();
    gitService = new GitService();
    aiService = new AIService();

    // 初始化服务
    await documentService.initialize();
    await fileMonitorService.initialize();
    await gitService.initialize();

    // 注册到上下文
    context.subscriptions.push(
      documentService,
      fileMonitorService,
      gitService,
      aiService,
      outputChannel
    );

    // 注册命令
    console.log("开始注册命令...");
    outputChannel.appendLine("开始注册命令...");

    const commands = [
      {
        id: 'cursor-productivity.checkStatus',
        handler: () => {
          outputChannel.appendLine("执行状态检查命令");
          vscode.window.showInformationMessage("Cursor生产力助手运行正常！");
        }
      },
      {
        id: 'cursor-productivity.updateFileHeader',
        handler: async () => {
          const editor = vscode.window.activeTextEditor;
          if (editor) {
            await documentService.updateFileHeader(editor.document.fileName);
            vscode.window.showInformationMessage("文件头部注释已更新");
          }
        }
      },
      {
        id: 'cursor-productivity.gitCommit',
        handler: async () => {
          try {
            await gitService.autoCommit();
            vscode.window.showInformationMessage("Git提交成功");
          } catch (error) {
            vscode.window.showErrorMessage(`Git提交失败: ${error}`);
          }
        }
      },
      {
        id: 'cursor-productivity.analyzeCode',
        handler: async () => {
          try {
            // 获取当前编辑器
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
              vscode.window.showErrorMessage('请先打开一个文件');
              return;
            }

            // 获取选中的代码或整个文件内容
            const document = editor.document;
            const selection = editor.selection;
            const text = selection.isEmpty ? 
              document.getText() : 
              document.getText(selection);

            outputChannel.appendLine("开始分析代码...");
            outputChannel.appendLine(`代码长度: ${text.length} 字符`);

            // 显示进度提示
            await vscode.window.withProgress({
              location: vscode.ProgressLocation.Notification,
              title: "正在分析代码...",
              cancellable: false
            }, async (progress) => {
              try {
                // 调用 AI 分析
                const result = await aiService.analyzeCursorAI(text);
                
                // 创建新文档显示结果
                const resultDoc = await vscode.workspace.openTextDocument({
                  content: result,
                  language: 'markdown'
                });
                
                await vscode.window.showTextDocument(resultDoc, {
                  viewColumn: vscode.ViewColumn.Beside
                });
                
                vscode.window.showInformationMessage('代码分析完成');
              } catch (error) {
                vscode.window.showErrorMessage(`分析失败: ${error}`);
                outputChannel.appendLine(`分析错误: ${error}`);
              }
            });
          } catch (error) {
            vscode.window.showErrorMessage(`命令执行失败: ${error}`);
            outputChannel.appendLine(`命令错误: ${error}`);
          }
        }
      }
    ];

    // 注册所有命令
    commands.forEach(command => {
      const disposable = vscode.commands.registerCommand(command.id, command.handler);
      context.subscriptions.push(disposable);
      outputChannel.appendLine(`已注册命令: ${command.id}`);
    });

    console.log("命令注册完成");
    outputChannel.appendLine("命令注册完成");

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
  if (aiService) {
    aiService.dispose();
  }
  if (outputChannel) {
    outputChannel.appendLine("Cursor生产力助手已停用");
    outputChannel.dispose();
  }
}
