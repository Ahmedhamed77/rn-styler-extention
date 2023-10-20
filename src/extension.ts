// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

function getStyleName(documentText: string): string {
  let counter = 1;
  while (documentText.includes(`styles.container${counter}`)) {
    counter++;
  }
  return `container${counter}`;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "rnstyler" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  // let disposable = vscode.commands.registerCommand('rnstyler.helloWorld', () => {
  // 	// The code you place here will be executed every time your command is executed
  // 	// Display a message box to the user
  // 	vscode.window.showInformationMessage('Hello World from RNStyler!');
  // });

  let disposable = vscode.commands.registerCommand(
    "rnstyler.helloWorld",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const selection = editor.selection;
        const inlineStyle = document.getText(selection);

        // Remove outer curly braces if they exist
        let refinedStyle = inlineStyle.trim();
        if (refinedStyle.startsWith("{{") && refinedStyle.endsWith("}}")) {
          refinedStyle = refinedStyle
            .substring(1, refinedStyle.length - 1)
            .trim();
        }

        // Convert the inline style to StyleSheet format
        const styleName = getStyleName(refinedStyle); // This can be dynamic in the future
        const stylesheet = `const styles = StyleSheet.create({\n\t${styleName}: ${refinedStyle}\n});`;

        // 1. Replace the inline style with the style reference
        editor
          .edit((editBuilder) => {
            editBuilder.replace(selection, `styles.${styleName}`);

            if (
              !editor.document
                .getText()
                .includes('import { StyleSheet } from "react-native";')
            ) {
              const firstLine = editor.document.lineAt(0);
              const startOfFirstLine = firstLine.range.start;

              editBuilder.insert(
                startOfFirstLine,
                'import { StyleSheet } from "react-native";\n'
              );
            }
          })
          .then(() => {
            // 2. Insert the generated StyleSheet at the end of the document
            const lastLine = editor.document.lineAt(
              editor.document.lineCount - 1
            );
            const endOfLastLine = lastLine.range.end;
            editor.edit((editBuilder) => {
              editBuilder.insert(endOfLastLine, `\n\n${stylesheet}`);
            });
          });

        vscode.window.showInformationMessage(
          "Inline style successfully converted to StyleSheet!"
        );
      } else {
        vscode.window.showErrorMessage(
          "Please select an inline style to convert."
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
