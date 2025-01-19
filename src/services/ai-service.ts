/**
 * ai-service.ts
 * 
 * 文件说明：AI服务，负责处理所有AI相关功能
 * 功能描述：
 * 1. 生成Git提交信息
 * 2. 分析代码结构
 * 3. 提供重构建议
 * 
 * 实现思路：
 * - 使用 Cursor 内置的专有模型功能
 * - 通过 VS Code API 调用 Cursor 命令
 * - 集成 Composer 和 Chat 功能
 * 
 * @author Cursor生产力助手
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { SimpleGit } from 'simple-git';

interface FileChange {
    path: string;
    content?: string;
    type: 'add' | 'modify' | 'delete' | 'rename';
    oldPath?: string;
}

export class AIService {
    private readonly outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Cursor AI助手');
    }

    /**
     * 使用 Cursor AI 分析代码
     */
    public async analyzeCursorAI(content: string): Promise<string> {
        try {
            this.outputChannel.appendLine('开始分析代码...');
            this.outputChannel.appendLine(`代码长度: ${content.length} 字符`);

            // 打开 Composer 窗口
            this.outputChannel.appendLine('尝试打开 Composer 窗口...');
            await vscode.commands.executeCommand('cursor.openComposer');
            this.outputChannel.appendLine('Composer 窗口已打开');
            
            // 发送分析请求
            this.outputChannel.appendLine('准备发送分析请求...');
            await vscode.commands.executeCommand('cursor.chat.send', {
                message: `分析以下代码：\n\`\`\`\n${content}\n\`\`\`\n请提供代码结构分析和改进建议。`
            });
            this.outputChannel.appendLine('分析请求已发送');
            
            // 等待并获取分析结果
            this.outputChannel.appendLine('等待分析结果...');
            const result = await this.waitForChatResponse();
            this.outputChannel.appendLine('已收到分析结果');
            this.outputChannel.appendLine(`结果长度: ${result.length} 字符`);
            
            return result;
        } catch (error) {
            this.outputChannel.appendLine(`Cursor AI 分析失败: ${error}`);
            if (error instanceof Error) {
                this.outputChannel.appendLine(`错误堆栈: ${error.stack}`);
            }
            throw error;
        }
    }

    /**
     * 等待 Chat 响应
     */
    private async waitForChatResponse(): Promise<string> {
        return new Promise((resolve, reject) => {
            let timeout: NodeJS.Timeout | undefined;
            let disposable: vscode.Disposable | undefined;

            const cleanup = () => {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = undefined;
                }
                if (disposable) {
                    disposable.dispose();
                    disposable = undefined;
                }
            };

            try {
                this.outputChannel.appendLine('设置编辑器变化监听器...');
                disposable = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
                    this.outputChannel.appendLine('检测到编辑器变化');
                    if (editor) {
                        this.outputChannel.appendLine(`当前文件: ${editor.document.fileName}`);
                    }

                    if (editor?.document.fileName.includes('cursor-chat')) {
                        const result = editor.document.getText();
                        this.outputChannel.appendLine('找到 Chat 响应');
                        
                        if (!result || result.trim() === '') {
                            cleanup();
                            const error = new Error('Chat 响应为空');
                            this.outputChannel.appendLine(`错误: ${error.message}`);
                            reject(error);
                            return;
                        }
                        
                        cleanup();
                        this.outputChannel.appendLine('成功获取响应');
                        resolve(result);
                    }
                });

                // 设置超时处理
                this.outputChannel.appendLine('设置超时处理...');
                timeout = setTimeout(() => {
                    cleanup();
                    const error = new Error('等待 Chat 响应超时');
                    this.outputChannel.appendLine(`错误: ${error.message}`);
                    reject(error);
                }, 30000);  // 增加超时时间到 30 秒
                this.outputChannel.appendLine('超时处理已设置');
            } catch (error) {
                cleanup();
                this.outputChannel.appendLine(`等待响应时发生错误: ${error}`);
                reject(error);
            }
        });
    }

    /**
     * 生成Git提交信息
     */
    public async generateCommitMessage(git: SimpleGit, files: any[]): Promise<string> {
        try {
            // 收集文件变更信息
            const changes = await this.collectChanges(git, files);
            
            // 使用 Cursor AI 生成提交信息
            const message = await this.generateCommitWithCursor(changes);
            return message;
        } catch (error) {
            this.outputChannel.appendLine(`生成提交信息失败: ${error}`);
            return this.generateBasicCommitMessage(files);
        }
    }

    /**
     * 使用 Cursor 生成提交信息
     */
    private async generateCommitWithCursor(changes: FileChange[]): Promise<string> {
        try {
            // 准备变更摘要
            const summary = this.prepareChangesSummary(changes);
            
            // 使用 Cursor 的提交消息生成功能
            await vscode.commands.executeCommand('cursor.generateCommitMessage', {
                changes: summary
            });
            
            // 获取生成的提交信息
            const message = await this.waitForGeneratedMessage();
            return message;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 等待生成的提交信息
     */
    private async waitForGeneratedMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            let timeout: NodeJS.Timeout | undefined;
            let disposable: vscode.Disposable | undefined;

            const cleanup = () => {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = undefined;
                }
                if (disposable) {
                    disposable.dispose();
                    disposable = undefined;
                }
            };

            try {
                disposable = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
                    if (editor?.document.fileName.includes('cursor-chat')) {
                        const result = editor.document.getText();
                        
                        if (!result || result.trim() === '') {
                            cleanup();
                            reject(new Error('提交信息为空'));
                            return;
                        }
                        
                        cleanup();
                        resolve(result);
                    }
                });

                // 设置超时处理
                timeout = setTimeout(() => {
                    cleanup();
                    reject(new Error('等待提交信息超时'));
                }, 5000);  // 5秒超时
            } catch (error) {
                cleanup();
                reject(error);
            }
        });
    }

    /**
     * 收集变更信息
     */
    private async collectChanges(git: SimpleGit, files: any[]): Promise<FileChange[]> {
        const changes: FileChange[] = [];
        
        for (const file of files) {
            changes.push({
                path: file.path,
                type: this.getChangeType(file)
            });
        }
        
        return changes;
    }

    /**
     * 准备变更摘要
     */
    private prepareChangesSummary(changes: FileChange[]): string {
        return changes.map(change => {
            const type = change.type;
            const path = change.path;
            return `${type}: ${path}`;
        }).join('\n');
    }

    /**
     * 获取变更类型
     */
    private getChangeType(file: any): 'add' | 'modify' | 'delete' | 'rename' {
        // Git状态说明：
        // A: 新增文件
        // M: 修改文件
        // D: 删除文件
        // R: 重命名文件
        // ??: 未跟踪文件
        const status = file.working_dir || file.index;
        
        if (status === 'A' || status === '??') return 'add';
        if (status === 'D') return 'delete';
        if (status === 'R') return 'rename';
        return 'modify';
    }

    /**
     * 分析变更内容
     */
    private async analyzeChanges(changes: FileChange[]): Promise<string[]> {
        const analysis: string[] = [];

        // 按文件类型分组
        const groups = this.groupChangesByType(changes);

        // 分析每种类型的变更
        if (groups.features.length > 0) {
            analysis.push('✨ 新功能:', ...this.summarizeFeatures(groups.features));
        }
        if (groups.fixes.length > 0) {
            analysis.push('🐛 修复:', ...this.summarizeFixes(groups.fixes));
        }
        if (groups.docs.length > 0) {
            analysis.push('📚 文档:', ...this.summarizeDocs(groups.docs));
        }
        if (groups.refactor.length > 0) {
            analysis.push('♻️ 重构:', ...this.summarizeRefactor(groups.refactor));
        }
        if (groups.other.length > 0) {
            analysis.push('🔨 其他:', ...this.summarizeOther(groups.other));
        }

        return analysis;
    }

    /**
     * 按类型分组变更
     */
    private groupChangesByType(changes: FileChange[]) {
        return {
            features: changes.filter(c => this.isFeatureChange(c)),
            fixes: changes.filter(c => this.isFixChange(c)),
            docs: changes.filter(c => this.isDocChange(c)),
            refactor: changes.filter(c => this.isRefactorChange(c)),
            other: changes.filter(c => !this.isFeatureChange(c) && !this.isFixChange(c) && 
                                     !this.isDocChange(c) && !this.isRefactorChange(c))
        };
    }

    /**
     * 判断是否为新功能变更
     */
    private isFeatureChange(change: FileChange): boolean {
        if (change.type === 'add') return true;
        
        const pathLower = change.path.toLowerCase();
        return pathLower.includes('feature') || 
               pathLower.includes('新功能') ||
               pathLower.includes('/test/') ||  // 测试文件通常也视为新功能
               pathLower.endsWith('.test.ts') ||
               pathLower.endsWith('.spec.ts');
    }

    /**
     * 判断是否为修复变更
     */
    private isFixChange(change: FileChange): boolean {
        const pathLower = change.path.toLowerCase();
        return pathLower.includes('fix') || 
               pathLower.includes('bug') || 
               pathLower.includes('修复') ||
               pathLower.includes('hotfix');
    }

    /**
     * 判断是否为文档变更
     */
    private isDocChange(change: FileChange): boolean {
        const pathLower = change.path.toLowerCase();
        return pathLower.endsWith('.md') || 
               pathLower.includes('doc') || 
               pathLower.includes('文档') ||
               pathLower.includes('readme') ||
               pathLower.includes('changelog');
    }

    /**
     * 判断是否为重构变更
     */
    private isRefactorChange(change: FileChange): boolean {
        return change.path.includes('refactor') || 
               change.path.includes('重构');
    }

    /**
     * 总结功能变更
     */
    private summarizeFeatures(changes: FileChange[]): string[] {
        return changes.map(change => {
            const name = path.basename(change.path);
            return `- ${name}: ${this.getBasicDescription(change)}`;
        });
    }

    /**
     * 总结修复变更
     */
    private summarizeFixes(changes: FileChange[]): string[] {
        return changes.map(change => {
            const name = path.basename(change.path);
            return `- ${name}: ${this.getBasicDescription(change)}`;
        });
    }

    /**
     * 总结文档变更
     */
    private summarizeDocs(changes: FileChange[]): string[] {
        return changes.map(change => {
            const name = path.basename(change.path);
            return `- ${name}: ${this.getBasicDescription(change)}`;
        });
    }

    /**
     * 总结重构变更
     */
    private summarizeRefactor(changes: FileChange[]): string[] {
        return changes.map(change => {
            const name = path.basename(change.path);
            return `- ${name}: ${this.getBasicDescription(change)}`;
        });
    }

    /**
     * 总结其他变更
     */
    private summarizeOther(changes: FileChange[]): string[] {
        return changes.map(change => {
            const name = path.basename(change.path);
            return `- ${name}: ${this.getBasicDescription(change)}`;
        });
    }

    /**
     * 获取基础描述
     */
    private getBasicDescription(change: FileChange): string {
        switch (change.type) {
            case 'add':
                return '新增文件';
            case 'modify':
                return '更新内容';
            case 'delete':
                return '删除文件';
            case 'rename':
                return `重命名自 ${change.oldPath}`;
            default:
                return '变更文件';
        }
    }

    /**
     * 格式化提交信息
     */
    private formatCommitMessage(analysis: string[]): string {
        if (analysis.length === 0) {
            return '更新文件';
        }

        // 将分析结果格式化为提交信息
        return analysis.join('\n');
    }

    /**
     * 生成基础提交信息
     */
    private generateBasicCommitMessage(files: any[]): string {
        const changedFiles = files.map(f => path.basename(f.path)).join(', ');
        return `更新文件: ${changedFiles}`;
    }

    /**
     * 销毁服务
     */
    public dispose(): void {
        this.outputChannel.dispose();
    }
} 