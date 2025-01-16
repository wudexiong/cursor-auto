import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log("Cursor生产力助手已激活");

  // 注册命令和事件监听器
  let disposable = vscode.commands.registerCommand(
    "cursor-productivity.initialize",
    () => {
      vscode.window.showInformationMessage("Cursor生产力助手初始化成功!");
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  console.log("Cursor生产力助手已停用");
}
