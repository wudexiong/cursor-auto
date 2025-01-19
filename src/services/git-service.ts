/**
 * git-service.ts
 * 
 * 文件说明：Git操作自动化服务
 * 功能描述：
 * 1. 自动Git初始化
 * 2. 自动提交代码
 * 3. 生成规范的提交信息
 * 
 * 实现思路：
 * - 使用simple-git库处理Git操作
 * - 监听文件变更自动提交
 * - 集成AI生成提交信息
 * 
 * @author Cursor生产力助手
 */

import * as vscode from 'vscode';
import * as path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { AIService } from './ai-service';

export class GitService {
    private git: SimpleGit | null = null;
    private readonly outputChannel: vscode.OutputChannel;
    private isInitialized: boolean = false;
    private aiService: AIService;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Cursor Git管理');
        this.aiService = new AIService();
    }

    /**
     * 初始化Git服务
     */
    public async initialize(): Promise<void> {
        try {
            if (!vscode.workspace.workspaceFolders) {
                throw new Error('未找到工作区');
            }

            const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            this.git = simpleGit(workspacePath);
            
            // 检查是否已初始化Git仓库
            const isRepo = await this.git.checkIsRepo();
            if (!isRepo) {
                await this.initializeRepository();
            }

            this.isInitialized = true;
            this.outputChannel.appendLine('Git服务初始化完成');
        } catch (error) {
            this.outputChannel.appendLine(`Git服务初始化失败: ${error}`);
            throw error;
        }
    }

    /**
     * 初始化Git仓库
     */
    private async initializeRepository(): Promise<void> {
        if (!this.git) {
            throw new Error('Git服务未初始化');
        }

        try {
            await this.git.init();
            this.outputChannel.appendLine('Git仓库初始化成功');

            // 创建.gitignore文件
            const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;
            const gitignorePath = path.join(workspacePath, '.gitignore');
            await vscode.workspace.fs.writeFile(
                vscode.Uri.file(gitignorePath),
                Buffer.from(this.getDefaultGitignore())
            );

            // 初始提交
            await this.git.add('.gitignore');
            await this.git.commit('初始化项目');
            
            this.outputChannel.appendLine('完成初始提交');
        } catch (error) {
            this.outputChannel.appendLine(`初始化Git仓库失败: ${error}`);
            throw error;
        }
    }

    /**
     * 获取默认的.gitignore内容
     */
    private getDefaultGitignore(): string {
        return `# 依赖目录
node_modules/
dist/
out/

# 编译输出
*.js
*.js.map
*.d.ts

# 环境文件
.env
.env.local

# 编辑器配置
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# 系统文件
.DS_Store
Thumbs.db`;
    }

    /**
     * 自动提交变更
     */
    public async autoCommit(message?: string): Promise<void> {
        if (!this.git || !this.isInitialized) {
            throw new Error('Git服务未初始化');
        }

        try {
            const status = await this.git.status();
            
            if (status.files.length === 0) {
                this.outputChannel.appendLine('没有需要提交的变更');
                return;
            }

            this.outputChannel.appendLine('变更文件:');
            status.files.forEach(file => {
                this.outputChannel.appendLine(`- ${file.path} (${file.index})`);
            });

            // 如果没有提供提交信息，则生成一个
            const commitMessage = message || await this.generateCommitMessage(status.files);
            
            await this.git.add('.');
            await this.git.commit(commitMessage);
            
            this.outputChannel.appendLine(`已提交变更: ${commitMessage}`);
            vscode.window.showInformationMessage(`Git提交成功: ${commitMessage}`);
        } catch (error) {
            this.outputChannel.appendLine(`提交变更失败: ${error}`);
            throw error;
        }
    }

    /**
     * 生成提交信息
     */
    private async generateCommitMessage(files: any[]): Promise<string> {
        if (!this.git) {
            throw new Error('Git服务未初始化');
        }
        return this.aiService.generateCommitMessage(this.git, files);
    }

    /**
     * 销毁服务
     */
    public dispose(): void {
        this.outputChannel.dispose();
        this.aiService.dispose();
    }
} 