/**
 * runTest.ts
 * 
 * 文件说明：测试运行器
 * 功能：启动 VS Code 并运行测试用例
 */

import * as path from 'path';
import { runTests } from '@vscode/test-electron';
import * as fs from 'fs';

async function main() {
    try {
        // 测试文件所在的目录
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // 创建测试工作区
        const testWorkspacePath = path.resolve(__dirname, '../../test-workspace');
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

        // 运行测试
        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [
                testWorkspacePath,
                '--disable-extensions',  // 禁用其他扩展
                '--disable-workspace-trust',  // 禁用工作区信任提示
                '--skip-welcome',  // 跳过欢迎页面
                '--skip-release-notes',  // 跳过发行说明
                '--disable-telemetry'  // 禁用遥测
            ]
        });
    } catch (err) {
        console.error('测试运行失败:', err);
        process.exit(1);
    }
}

main(); 