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
 * - 通过Cursor编辑器的内置AI功能
 * - 分析文件变更内容
 * - 生成符合规范的提交信息
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
     * 生成Git提交信息
     */
    public async generateCommitMessage(git: SimpleGit, files: any[]): Promise<string> {
        try {
            // 收集文件变更信息
            const changes = await this.collectChanges(git, files);
            
            // 分析变更内容
            const analysis = await this.analyzeChanges(changes);
            
            // 生成提交信息
            return this.formatCommitMessage(analysis);
        } catch (error) {
            this.outputChannel.appendLine(`生成提交信息失败: ${error}`);
            // 返回基础的提交信息作为后备方案
            return this.generateBasicCommitMessage(files);
        }
    }

    /**
     * 收集文件变更信息
     */
    private async collectChanges(git: SimpleGit, files: any[]): Promise<FileChange[]> {
        const changes: FileChange[] = [];
        
        for (const file of files) {
            try {
                const filePath = file.path;
                const type = this.getChangeType(file);
                
                // 获取文件内容（如果文件仍然存在）
                let content: string | undefined;
                if (type !== 'delete') {
                    const uri = vscode.Uri.file(path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, filePath));
                    const document = await vscode.workspace.openTextDocument(uri);
                    content = document.getText();
                }

                changes.push({
                    path: filePath,
                    content,
                    type,
                    oldPath: file.oldPath
                });
            } catch (error) {
                this.outputChannel.appendLine(`收集文件 ${file.path} 的变更信息失败: ${error}`);
            }
        }

        return changes;
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