import * as fs from 'fs-extra';
import * as path from 'path';
import * as chokidar from 'chokidar';
import { workspace, window, WorkspaceFolder } from 'vscode';

/**
 * 文档管理服务
 * 负责处理项目中的文档生成、更新和管理
 */
export class DocumentService {
    private watcher: chokidar.FSWatcher | null = null;
    private readonly outputChannel = window.createOutputChannel('Cursor文档管理');
    private initialized = false;

    constructor() {
        this.outputChannel.show(true);
        this.outputChannel.appendLine('文档管理服务已创建');
    }

    /**
     * 初始化文档服务
     */
    async initialize(): Promise<void> {
        try {
            this.outputChannel.appendLine('正在初始化文档管理服务...');
            this.outputChannel.appendLine(`当前工作区状态: ${workspace.workspaceFolders ? '已打开' : '未打开'}`);
            
            // 检查是否有工作区
            if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
                this.outputChannel.appendLine('等待工作区打开...');
                // 监听工作区变化
                workspace.onDidChangeWorkspaceFolders(async (event) => {
                    this.outputChannel.appendLine(`工作区变化: 新增=${event.added.length}, 移除=${event.removed.length}`);
                    if (!this.initialized && workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
                        this.outputChannel.appendLine('检测到新工作区，开始初始化...');
                        await this.initializeWithWorkspace(workspace.workspaceFolders[0]);
                    }
                });
                return;
            }

            this.outputChannel.appendLine(`找到工作区: ${workspace.workspaceFolders[0].uri.fsPath}`);
            await this.initializeWithWorkspace(workspace.workspaceFolders[0]);
        } catch (error) {
            this.outputChannel.appendLine(`初始化失败: ${error}`);
            this.outputChannel.appendLine(`错误堆栈: ${error instanceof Error ? error.stack : '未知'}`);
            throw error;
        }
    }

    /**
     * 使用工作区初始化服务
     */
    private async initializeWithWorkspace(workspaceFolder: WorkspaceFolder): Promise<void> {
        try {
            this.outputChannel.appendLine(`开始初始化工作区: ${workspaceFolder.uri.fsPath}`);
            await this.setupFileWatcher(workspaceFolder);
            this.initialized = true;
            this.outputChannel.appendLine('文档管理服务初始化完成');
            window.showInformationMessage('文档管理服务已启动');
        } catch (error) {
            this.outputChannel.appendLine(`工作区初始化失败: ${error}`);
            this.outputChannel.appendLine(`错误堆栈: ${error instanceof Error ? error.stack : '未知'}`);
            throw error;
        }
    }

    /**
     * 设置文件监控
     */
    private async setupFileWatcher(workspaceFolder: WorkspaceFolder): Promise<void> {
        const workspacePath = workspaceFolder.uri.fsPath;
        this.outputChannel.appendLine(`开始监控工作区: ${workspacePath}`);
        
        try {
            // 检查工作区路径是否存在
            const exists = await fs.pathExists(workspacePath);
            if (!exists) {
                throw new Error(`工作区路径不存在: ${workspacePath}`);
            }

            this.outputChannel.appendLine('正在设置文件监控...');
            
            // 监控特定文件的变化
            this.watcher = chokidar.watch(
                [
                    '**/*.ts',
                    '**/*.js',
                    'package.json',
                    'README.md',
                    '.cursorrules'
                ],
                {
                    cwd: workspacePath,
                    ignored: ['**/node_modules/**', '**/dist/**', '**/out/**'],
                    persistent: true
                }
            );

            this.watcher
                .on('ready', () => {
                    this.outputChannel.appendLine('文件监控已就绪');
                })
                .on('change', async (filePath: string) => {
                    this.outputChannel.appendLine(`检测到文件变化: ${filePath}`);
                    await this.handleFileChange(filePath);
                })
                .on('error', (error: Error) => {
                    this.outputChannel.appendLine(`文件监控错误: ${error}`);
                    this.outputChannel.appendLine(`错误堆栈: ${error.stack}`);
                });

            this.outputChannel.appendLine('文件监控设置完成');
        } catch (error) {
            this.outputChannel.appendLine(`设置文件监控失败: ${error}`);
            this.outputChannel.appendLine(`错误堆栈: ${error instanceof Error ? error.stack : '未知'}`);
            throw error;
        }
    }

    /**
     * 处理文件变化
     */
    private async handleFileChange(filePath: string): Promise<void> {
        try {
            if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
                return;
            }

            if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
                await this.updateFileHeader(filePath);
            } else if (filePath === 'README.md') {
                await this.updateReadme();
            }
        } catch (error) {
            this.outputChannel.appendLine(`处理文件变化失败: ${error}`);
        }
    }

    /**
     * 更新文件头部注释
     */
    async updateFileHeader(filePath: string): Promise<void> {
        try {
            if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
                throw new Error('未找到工作区');
            }

            const fullPath = path.join(workspace.workspaceFolders[0].uri.fsPath, filePath);
            const content = await fs.readFile(fullPath, 'utf-8');
            
            // 检查是否已有文件头注释
            if (!content.startsWith('/**')) {
                const header = this.generateFileHeader(filePath);
                const newContent = `${header}\n${content}`;
                await fs.writeFile(fullPath, newContent, 'utf-8');
                this.outputChannel.appendLine(`已更新文件头部注释: ${filePath}`);
            }
        } catch (error) {
            this.outputChannel.appendLine(`更新文件头部注释失败: ${error}`);
            throw error;
        }
    }

    /**
     * 生成文件头部注释
     */
    private generateFileHeader(filePath: string): string {
        const filename = path.basename(filePath);
        const date = new Date().toISOString().split('T')[0];
        
        return `/**
 * ${filename}
 * 
 * 文件说明：
 * 创建日期：${date}
 * 最后修改：${date}
 * 
 * @author Cursor生产力助手
 */`;
    }

    /**
     * 更新README文档
     */
    async updateReadme(): Promise<void> {
        try {
            if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
                throw new Error('未找到工作区');
            }

            const workspacePath = workspace.workspaceFolders[0].uri.fsPath;
            const readmePath = path.join(workspacePath, 'README.md');
            
            // 检查README是否存在
            if (await fs.pathExists(readmePath)) {
                const content = await fs.readFile(readmePath, 'utf-8');
                // TODO: 根据项目状态更新README内容
                this.outputChannel.appendLine('README更新完成');
            }
        } catch (error) {
            this.outputChannel.appendLine(`更新README失败: ${error}`);
            throw error;
        }
    }

    /**
     * 销毁服务
     */
    dispose(): void {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }
        this.outputChannel.dispose();
    }
} 