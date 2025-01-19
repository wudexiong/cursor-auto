/**
 * index.ts
 * 
 * 文件说明：测试套件入口
 * 功能：配置和运行所有测试用例
 */

import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export async function run(): Promise<void> {
    // 创建 mocha 测试套件
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 10000  // 增加超时时间到 10 秒
    });

    const testsRoot = path.resolve(__dirname, '..');

    try {
        // 查找所有测试文件
        const files = await glob('**/**.test.js', { cwd: testsRoot });

        // 添加所有测试文件
        files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

        // 运行测试
        return new Promise<void>((resolve, reject) => {
            try {
                mocha.run((failures: number) => {
                    if (failures > 0) {
                        reject(new Error(`${failures} tests failed.`));
                    } else {
                        resolve();
                    }
                });
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    } catch (err) {
        console.error('查找测试文件失败:', err);
        throw err;
    }
} 