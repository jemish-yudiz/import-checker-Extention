import * as vscode from "vscode";

let diagnosticCollection: vscode.DiagnosticCollection;
let debounceTimer: NodeJS.Timeout | undefined;
const DEBOUNCE_DELAY = 500; // milliseconds

export function activate(context: vscode.ExtensionContext) {
  console.log("MongoDB Schema Import Checker is now active!");

  // Create diagnostic collection
  diagnosticCollection = vscode.languages.createDiagnosticCollection(
    "mongodbSchemaChecker"
  );
  context.subscriptions.push(diagnosticCollection);

  // Register code actions provider for auto-import
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ["javascript", "typescript", "javascriptreact", "typescriptreact"],
      new ModelImportCodeActionProvider(),
      {
        providedCodeActionKinds:
          ModelImportCodeActionProvider.providedCodeActionKinds,
      }
    )
  );

  // Check active editor on activation
  if (vscode.window.activeTextEditor) {
    checkDocument(vscode.window.activeTextEditor.document);
  }

  // Check when changing active editor
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        checkDocument(editor.document);
      }
    })
  );

  // Check when document changes (with debouncing for performance)
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const config = vscode.workspace.getConfiguration("mongodbSchemaChecker");
      const checkOnType = config.get<boolean>("checkOnType", true);

      if (!checkOnType) {
        return; // Skip if checkOnType is disabled
      }

      if (event.document === vscode.window.activeTextEditor?.document) {
        // Debounce: Clear previous timer and set a new one
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
          checkDocument(event.document);
        }, DEBOUNCE_DELAY);
      }
    })
  );

  // Check when document is saved
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      checkDocument(document);
    })
  );

  // Check when opening a document
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      checkDocument(document);
    })
  );
}

function checkDocument(document: vscode.TextDocument) {
  // Only check JavaScript and TypeScript files
  if (
    ![
      "javascript",
      "typescript",
      "javascriptreact",
      "typescriptreact",
    ].includes(document.languageId)
  ) {
    return;
  }

  const text = document.getText();
  const diagnostics: vscode.Diagnostic[] = [];

  // Get configuration
  const config = vscode.workspace.getConfiguration("mongodbSchemaChecker");

  // PERFORMANCE: Skip very large files (if enabled)
  const skipLargeFiles = config.get<boolean>("skipLargeFiles", true);
  const maxFileSize = config.get<number>("maxFileSize", 100000); // 100KB default

  if (skipLargeFiles && text.length > maxFileSize) {
    console.log(
      `MongoDB Schema Checker: Skipping large file (${text.length} bytes)`
    );
    return;
  }
  const modelMethods: string[] = config.get("modelMethods", [
    // Query methods
    "find",
    "findOne",
    "findById",
    "findOneAndUpdate",
    "findByIdAndUpdate",
    "findOneAndDelete",
    "findByIdAndDelete",
    "findOneAndRemove",
    "findByIdAndRemove",
    "findOneAndReplace",
    "where",
    "exists",
    "distinct",
    // Create methods
    "create",
    "insertMany",
    "save",
    // Update methods
    "update",
    "updateOne",
    "updateMany",
    "replaceOne",
    // Delete methods
    "remove",
    "deleteOne",
    "deleteMany",
    // Count methods
    "count",
    "countDocuments",
    "estimatedDocumentCount",
    // Aggregation methods
    "aggregate",
    "mapReduce",
    "populate",
    // Validation methods
    "validate",
    "validateSync",
    // Index methods
    "createIndexes",
    "ensureIndexes",
    "syncIndexes",
    "listIndexes",
    // Utility methods
    "watch",
    "bulkWrite",
    "hydrate",
    "init",
    "startSession",

    "translateAliases",
    // Schema/Model methods
    "discriminator",
    "on",
    "once",
    "emit",
  ]);

  // Get imported model names
  const importedModels = getImportedModels(text);

  // Find model method usages (only specific Mongoose methods)
  const modelUsages = findModelMethodUsages(text, modelMethods, document);

  // Check if models are imported
  for (const usage of modelUsages) {
    if (!importedModels.has(usage.modelName)) {
      const diagnostic = new vscode.Diagnostic(
        usage.range,
        `Model '${usage.modelName}' is not imported. Please import the model before using it.`,
        vscode.DiagnosticSeverity.Warning
      );
      diagnostic.code = "missing-model-import";
      diagnostic.source = "MongoDB Schema Checker";
      diagnostics.push(diagnostic);
    }
  }

  diagnosticCollection.set(document.uri, diagnostics);
}

function getImportedModels(text: string): Set<string> {
  const importedModels = new Set<string>();
  const lines = text.split("\n");
  let inMultiLineComment = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Track multi-line comment state
    if (trimmedLine.includes("/*")) {
      inMultiLineComment = true;
    }
    if (inMultiLineComment) {
      if (trimmedLine.includes("*/")) {
        inMultiLineComment = false;
      }
      continue; // Skip lines inside multi-line comments
    }

    // Skip single-line comments
    if (trimmedLine.startsWith("//")) {
      continue;
    }

    // ES6 import statements
    // import User from './models/User'
    // import { User, Product } from './models'
    // import * as User from './models/User'
    const es6ImportMatch = line.match(
      /import\s+(?:(\w+)|{([^}]+)}|\*\s+as\s+(\w+))\s+from\s+['"]/
    );
    if (es6ImportMatch) {
      // Default import (import User from ...)
      if (es6ImportMatch[1]) {
        importedModels.add(es6ImportMatch[1]);
      }
      // Named imports (import { User, Product } from ...)
      if (es6ImportMatch[2]) {
        const namedImports = es6ImportMatch[2].split(",").map((name) =>
          name
            .trim()
            .split(/\s+as\s+/)[0]
            .trim()
        );
        namedImports.forEach((name) => importedModels.add(name));
      }
      // Namespace import (import * as User from ...)
      if (es6ImportMatch[3]) {
        importedModels.add(es6ImportMatch[3]);
      }
    }

    // CommonJS require statements
    // const User = require('./models/User')
    // const { User, Product } = require('./models')
    const requireMatch = line.match(
      /(?:const|let|var)\s+(?:(\w+)|{([^}]+)})\s*=\s*require\s*\(/
    );
    if (requireMatch) {
      // Single require (const User = require(...))
      if (requireMatch[1]) {
        importedModels.add(requireMatch[1]);
      }
      // Destructured require (const { User } = require(...))
      if (requireMatch[2]) {
        const namedImports = requireMatch[2].split(",").map((name) =>
          name
            .trim()
            .split(/\s*:\s*/)[0]
            .trim()
        );
        namedImports.forEach((name) => importedModels.add(name));
      }
    }
  }

  return importedModels;
}

// Find usages of specific MongoDB/Mongoose model methods
function findModelMethodUsages(
  text: string,
  modelMethods: string[],
  document: vscode.TextDocument
): Array<{ range: vscode.Range; modelName: string; methodName: string }> {
  const usages: Array<{
    range: vscode.Range;
    modelName: string;
    methodName: string;
  }> = [];
  const lines = text.split("\n");
  let inMultiLineComment = false;

  // Create a regex pattern for all model methods
  const methodsPattern = modelMethods.join("|");
  // Match: ModelName.methodName
  const modelMethodRegex = new RegExp(
    `\\b([A-Z][a-zA-Z0-9_]*)\\.(${methodsPattern})\\b`,
    "g"
  );

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmedLine = line.trim();

    // Track multi-line comment state
    if (trimmedLine.includes("/*")) {
      inMultiLineComment = true;
    }
    if (inMultiLineComment) {
      if (trimmedLine.includes("*/")) {
        inMultiLineComment = false;
      }
      continue; // Skip lines inside multi-line comments
    }

    // Skip single-line comments
    if (trimmedLine.startsWith("//")) {
      continue;
    }

    // Skip import/require lines
    if (
      /^\s*(import|const|let|var)\s+.*?=\s*require/.test(line) ||
      /^\s*import\s+/.test(line)
    ) {
      continue;
    }

    // Check for specific MongoDB/Mongoose methods only
    let match;
    modelMethodRegex.lastIndex = 0;
    while ((match = modelMethodRegex.exec(line)) !== null) {
      const modelName = match[1];
      const methodName = match[2];

      const startPos = new vscode.Position(lineIndex, match.index);
      const endPos = new vscode.Position(
        lineIndex,
        match.index + modelName.length
      );
      const range = new vscode.Range(startPos, endPos);
      usages.push({ range, modelName, methodName });
    }
  }

  return usages;
}

// Code Actions Provider for auto-import functionality
class ModelImportCodeActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] | undefined {
    const actions: vscode.CodeAction[] = [];

    // Only provide actions for our diagnostics
    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source === "MongoDB Schema Checker") {
        const modelName = this.extractModelName(diagnostic.message);
        if (modelName) {
          // Create action to import from models directory
          actions.push(
            this.createImportAction(document, diagnostic, modelName, "default")
          );
        }
      }
    }

    return actions;
  }

  private extractModelName(message: string): string | null {
    const match = message.match(/Model '(\w+)' is not imported/);
    return match ? match[1] : null;
  }

  private createImportAction(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    modelName: string,
    importType: "default" | "named"
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      importType === "default"
        ? `Import ${modelName} from './models/${modelName}'`
        : `Import { ${modelName} } from './models'`,
      vscode.CodeActionKind.QuickFix
    );

    action.diagnostics = [diagnostic];
    action.isPreferred = importType === "default";

    const edit = new vscode.WorkspaceEdit();
    const importStatement =
      importType === "default"
        ? `import ${modelName} from "./models/${modelName}";\n`
        : `import { ${modelName} } from "./models";\n`;

    // Find the position to insert the import
    const insertPosition = this.findImportInsertPosition(document);
    edit.insert(document.uri, insertPosition, importStatement);

    action.edit = edit;

    return action;
  }

  private findImportInsertPosition(
    document: vscode.TextDocument
  ): vscode.Position {
    let lastImportLine = -1;
    const text = document.getText();
    const lines = text.split("\n");

    // Find the last import or require statement
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (
        line.startsWith("import ") ||
        /^(const|let|var)\s+.*=\s*require/.test(line)
      ) {
        lastImportLine = i;
      }
      // Stop searching after we hit actual code (non-import/comment)
      if (
        line &&
        !line.startsWith("import ") &&
        !line.startsWith("//") &&
        !line.startsWith("/*") &&
        !line.startsWith("*") &&
        !/^(const|let|var)\s+.*=\s*require/.test(line) &&
        lastImportLine >= 0
      ) {
        break;
      }
    }

    // If there are imports, insert after the last one
    if (lastImportLine >= 0) {
      return new vscode.Position(lastImportLine + 1, 0);
    }

    // Otherwise, insert at the beginning of the file
    return new vscode.Position(0, 0);
  }
}

export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.dispose();
  }
}
