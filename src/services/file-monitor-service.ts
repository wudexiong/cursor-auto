/**
 * file-monitor-service.ts
 * 
 * 文件说明：文件监控服务，负责监控文件长度和结构变化
 * 功能描述：
 * 1. 监控文件长度，超过500行给出警告
 * 2. 分析文件结构，提供优化建议
 * 3. 自动触发AI分析和重构建议
 * 
 * 实现思路：
 * - 使用VSCode的FileSystemWatcher监控文件变化
 * - 通过事件系统处理文件变更
 * - 集成AI分析提供重构建议
 * 
 * @author Cursor生产力助手
 */

import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';

export class FileMonitorService {
    private readonly outputChannel: vscode.OutputChannel;
    private fileWatcher: vscode.FileSystemWatcher | undefined;
    private readonly maxFileLines: number = 500;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Cursor文件监控');
    }

    /**
     * 初始化文件监控服务
     */
    public async initialize(): Promise<void> {
        if (!vscode.workspace.workspaceFolders) {
            throw new Error('未找到工作区');
        }

        this.setupFileWatcher();
        this.outputChannel.appendLine('文件监控服务已启动');
    }

    /**
     * 设置文件监控
     */
    private setupFileWatcher(): void {
        this.fileWatcher = vscode.workspace.createFileSystemWatcher(
            '**/*.{ts,js,tsx,jsx}',
            false,
            false,
            false
        );

        this.fileWatcher.onDidChange(this.handleFileChange.bind(this));
        this.fileWatcher.onDidCreate(this.handleFileChange.bind(this));
    }

    /**
     * 处理文件变化
     */
    private async handleFileChange(uri: vscode.Uri): Promise<void> {
        try {
            const filePath = uri.fsPath;
            const content = await fs.readFile(filePath, 'utf-8');
            const lineCount = content.split('\n').length;

            if (lineCount > this.maxFileLines) {
                this.outputChannel.appendLine(`警告：文件 ${path.basename(filePath)} 超过 ${this.maxFileLines} 行`);
                this.outputChannel.show();

                const result = await vscode.window.showWarningMessage(
                    `文件 ${path.basename(filePath)} 已超过 ${this.maxFileLines} 行，是否需要AI分析重构建议？`,
                    '是',
                    '否'
                );

                if (result === '是') {
                    await this.provideRefactoringAdvice(uri, content);
                }
            }
        } catch (error) {
            this.outputChannel.appendLine(`处理文件变化时出错: ${error}`);
        }
    }

    /**
     * 提供重构建议
     */
    private async provideRefactoringAdvice(uri: vscode.Uri, content: string): Promise<void> {
        // TODO: 集成AI分析，提供重构建议
        // 1. 分析文件结构
        // 2. 识别可拆分的模块
        // 3. 生成重构方案
        this.outputChannel.appendLine('正在分析文件结构...');
        
        // 临时提示
        vscode.window.showInformationMessage('文件分析功能开发中，即将支持AI分析重构建议');
    }

    /**
     * 销毁服务
     */
    public dispose(): void {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }
        this.outputChannel.dispose();
    }
} 