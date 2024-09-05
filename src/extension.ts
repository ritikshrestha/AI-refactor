// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import ollama from "ollama";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "ai-refactor.refactor",
    async () => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Ai Refactor",
          cancellable: true,
        },
        async (progress, token) => {
          const editor = vscode.window.activeTextEditor;
          if (!editor) {
            vscode.window.showInformationMessage("No active editor!");
            return;
          }

          const userText = editor.document.getText(editor.selection);

          if (!userText) {
            vscode.window.showInformationMessage("No text selected!");
            return;
          }
          token.onCancellationRequested(() => {
            vscode.window.showInformationMessage(
              "Operation cancelled by the user."
            );
          });

          progress.report({ message: "Processing..." });

          // Simulate a long-running operation with cancellation support
          const apiResponse = await askAI(userText);
          editor.edit((editBuilder) => {
            editBuilder.replace(editor.selection, "" + apiResponse);
          });
          if (!token.isCancellationRequested) {
            vscode.window.showInformationMessage("Operation completed!");
          }
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}
async function askAI(user_input: string) {
  const prompt =
    "Convert this exact code to follow airbnb js style and also refactor it for time complexity. Only show the js or ts code" +
    user_input;
  const response = await ollama.chat({
    model: "gemma:2b",
    messages: [{ role: "user", content: prompt }],
  });
  return response.message.content;
}

// This method is called when your extension is deactivated
export function deactivate() {}
