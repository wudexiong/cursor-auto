/**
 * ai-service.test.ts
 * 
 * 文件说明：AI服务的测试用例
 * 测试内容：
 * 1. Composer 功能
 * 2. Chat 交互
 * 3. 提交信息生成
 * 4. 代码分析功能
 * 5. AI 响应处理
 */

import * as vscode from 'vscode';
import * as assert from 'assert';
import { AIService } from '../services/ai-service';
import { SimpleGit } from 'simple-git';
import { describe, it, beforeEach, afterEach } from 'mocha';
import * as sinon from 'sinon';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

interface MockFile {
    path: string;
    workingDir: string;
    index: string;
}

describe('AI Service Test Suite', () => {
    let aiService: AIService | undefined;
    let sandbox: sinon.SinonSandbox;
    let testWorkspacePath: string;

    beforeEach(async function() {
        this.timeout(10000); // 设置更长的超时时间用于初始化

        try {
            // 在系统临时目录中创建测试工作区
            testWorkspacePath = path.join(os.tmpdir(), 'cursor-test-' + Math.random().toString(36).substring(7));
            if (fs.existsSync(testWorkspacePath)) {
                fs.rmSync(testWorkspacePath, { recursive: true, force: true });
            }
            fs.mkdirSync(testWorkspacePath, { recursive: true });

            // 创建基本的项目结构
            fs.writeFileSync(
                path.join(testWorkspacePath, 'package.json'),
                JSON.stringify({
                    name: "test-project",
                    version: "1.0.0"
                }, null, 2)
            );

            // 初始化服务
            aiService = new AIService();
            sandbox = sinon.createSandbox();

            // 等待工作区加载
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 模拟认证状态
            sandbox.stub(vscode.authentication, 'getSession').resolves({
                id: 'test-session',
                accessToken: 'test-token',
                account: {
                    id: 'test-account',
                    label: 'Test Account'
                },
                scopes: []
            });

            // 模拟编辑器响应
            sandbox.stub(vscode.window, 'onDidChangeActiveTextEditor').callsFake((callback: any) => {
                // 创建一个模拟的 TextDocument
                const mockDocument = {
                    fileName: 'cursor-chat',
                    getText: () => '这是一个测试响应'
                };
                
                // 创建一个模拟的 TextEditor
                const mockEditor = {
                    document: mockDocument
                };

                // 立即调用回调
                setTimeout(() => callback(mockEditor), 100);

                // 返回一个模拟的 Disposable
                return {
                    dispose: () => {}
                };
            });

            // 模拟命令执行
            sandbox.stub(vscode.commands, 'executeCommand').resolves();
        } catch (error) {
            console.error('初始化错误:', error);
            throw error;
        }
    });

    describe('实际 AI 功能测试', () => {
        it('应该能够实际分析代码并生成注释', async function() {
            this.timeout(10000); // 减少超时时间，因为我们已经模拟了响应

            if (!aiService) {
                throw new Error('AI 服务未初始化');
            }

            // 创建测试文件
            const testFilePath = path.join(testWorkspacePath, 'test.ts');
            const testCode = `
function calculateSum(a: number, b: number): number {
    return a + b;
}

class DataProcessor {
    private data: number[];

    constructor() {
        this.data = [];
    }

    addValue(value: number): void {
        this.data.push(value);
    }

    getAverage(): number {
        if (this.data.length === 0) return 0;
        return this.data.reduce((sum, val) => sum + val, 0) / this.data.length;
    }
}`;

            fs.writeFileSync(testFilePath, testCode);

            // 分析代码
            const result = await aiService.analyzeCursorAI(testCode);
            sinon.assert.match(result, sinon.match.string);
            sinon.assert.match(result.length > 0, true);
        });

        it('应该能够实际生成 Git 提交信息', async function() {
            this.timeout(10000);

            if (!aiService) {
                throw new Error('AI 服务未初始化');
            }

            // 创建测试文件
            const testFilePath = path.join(testWorkspacePath, 'test-git.ts');
            fs.writeFileSync(testFilePath, 'console.log("Hello");');

            // 模拟 Git 对象
            const mockGit = {
                status: async () => ({
                    files: [{
                        path: 'test-git.ts',
                        workingDir: 'A',
                        index: 'A'
                    }]
                })
            } as unknown as SimpleGit;

            // 生成提交信息
            const message = await aiService.generateCommitMessage(mockGit, [{
                path: 'test-git.ts',
                workingDir: 'A',
                index: 'A'
            }]);

            sinon.assert.match(message, sinon.match.string);
            sinon.assert.match(message.length > 0, true);
        });
    });

    afterEach(() => {
        sandbox.restore();
        if (fs.existsSync(testWorkspacePath)) {
            fs.rmSync(testWorkspacePath, { recursive: true, force: true });
        }
    });
}); 