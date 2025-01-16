import * as vscode from "vscode";

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  console.log("开始激活扩展...");

  try {
    // 创建输出通道
    outputChannel = vscode.window.createOutputChannel("Cursor生产力助手");
    console.log("输出通道已创建");

    // 注册命令和事件监听器
    console.log("开始注册命令...");
    const disposable = vscode.commands.registerCommand(
      "cursor-productivity.checkStatus",
      () => {
        console.log("命令被触发");
        outputChannel.appendLine("执行状态检查命令");
        outputChannel.show(true);
        vscode.window.showInformationMessage("Cursor生产力助手运行正常！");
      }
    );

    context.subscriptions.push(disposable);
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
  if (outputChannel) {
    outputChannel.appendLine("Cursor生产力助手已停用");
    outputChannel.dispose();
  }
}
