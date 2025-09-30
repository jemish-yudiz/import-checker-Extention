# MongoDB Model Import Checker

A Visual Studio Code extension that helps you remember to import MongoDB models before using them. It detects when you're calling MongoDB model methods (like `User.updateOne`, `Product.find`, etc.) without importing the model first.

## Features

- **Comprehensive Detection**: Detects **ALL** methods on MongoDB models - including custom static methods!
- **50+ Built-in Methods**: Recognizes all standard Mongoose methods (find, create, update, delete, aggregate, etc.)
- **Auto-Import Quick Fix**: Click on the warning and automatically import the missing model with one click! 💡
- **Smart Import Path**: Automatically imports from `./models/ModelName`
- **Comment-Aware**: Properly ignores code in comments (both `//` single-line and `/* */` multi-line)
- **Intelligent Filtering**: Excludes JavaScript/Node.js built-in globals (Math, Date, Array, Promise, etc.)
- **Configurable**: Customize which MongoDB methods to check for
- **Real-time Checking**: Checks your code as you type and when you save files
- **Works with ES6 and CommonJS**: Supports both `import` and `require` syntax

## How It Works

The extension scans your JavaScript and TypeScript files for:

1. **Any method call** on capitalized identifiers (Model names like `User`, `Product`, `Order`)
2. Import statements to see which models are imported
3. Intelligently excludes built-in JavaScript/Node.js globals and commented code

If it finds a model method usage without the corresponding import, it displays a warning with helpful information. The extension uses a smart catch-all pattern that detects:

- All 50+ standard Mongoose methods
- **Custom static methods** you define on your models
- Any `ModelName.anyMethod()` pattern

## Example

```javascript
// ❌ This will trigger a warning
async function updateUser() {
  // Warning: Model 'User' is not imported
  await User.updateOne({ email: "test@example.com" }, { age: 25 });
  await User.findByEmail("test@example.com"); // ❌ Even custom methods!
}

// 💡 Click the lightbulb or press Cmd+. (Mac) / Ctrl+. (Windows) to auto-import:
// Quick Fix: Import User from './models/User'

// ✅ After using Quick Fix, the import is automatically added:
import User from "./models/User";

async function updateUser() {
  await User.updateOne({ email: "test@example.com" }, { age: 25 });
  await User.findByEmail("test@example.com"); // ✅ Now works!
}

// ✅ Comments are properly ignored:
// await User.deleteOne({ _id: "123" }); // No warning here!

/*
  await User.find({}); // No warning in multi-line comments either!
*/
```

## How to Use Auto-Import

1. **See the warning**: When you use a model without importing it, you'll see a warning (yellow squiggles)
2. **Trigger Quick Fix**:
   - Click on the 💡 lightbulb icon that appears, OR
   - Press `Cmd+.` (Mac) or `Ctrl+.` (Windows/Linux), OR
   - Right-click and select "Quick Fix"
3. **Select the fix**: Click on `Import User from './models/User'`
4. **Done!** The import statement is automatically added at the top of your file

## Supported Model Methods

The extension detects **ALL** methods called on Model-like identifiers (capitalized names). This includes:

### Standard Mongoose Methods (50+)

- **Query methods**: `find`, `findOne`, `findById`, `findOneAndUpdate`, `findByIdAndUpdate`, `findOneAndDelete`, `findByIdAndDelete`, `findOneAndRemove`, `findByIdAndRemove`, `findOneAndReplace`, `where`, `exists`, `distinct`
- **Create methods**: `create`, `insertMany`, `save`
- **Update methods**: `update`, `updateOne`, `updateMany`, `replaceOne`
- **Delete methods**: `remove`, `deleteOne`, `deleteMany`
- **Count methods**: `count`, `countDocuments`, `estimatedDocumentCount`
- **Aggregation methods**: `aggregate`, `mapReduce`, `populate`
- **Validation methods**: `validate`, `validateSync`
- **Index methods**: `createIndexes`, `ensureIndexes`, `syncIndexes`, `listIndexes`
- **Utility methods**: `watch`, `bulkWrite`, `hydrate`, `init`, `startSession`, `translateAliases`
- **Schema/Model methods**: `discriminator`, `on`, `once`, `emit`

### Custom Methods

The extension also detects **any custom static methods** you define on your models! For example:

- `User.findByEmail()`
- `Product.searchByCategory()`
- `Order.calculateTotal()`

### Smart Exclusions

The extension intelligently excludes built-in JavaScript/Node.js globals:
- `Math.random()`, `Date.now()`, `Array.from()`, `Object.keys()`, `Promise.resolve()`, `JSON.parse()`, etc.

## Configuration

You can customize the extension's behavior in VS Code settings:

### `mongodbSchemaChecker.modelMethods`

List of MongoDB model methods to prioritize for detection. The extension uses a catch-all pattern to detect **any method** on capitalized identifiers, but this list ensures specific methods are always checked.

**Default** (includes 50+ methods):

```json
[
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
  "emit"
]
```

**Note**: Even if you customize this list, the extension will still detect **ANY method** called on capitalized identifiers (Models), including custom methods not in this list.

**Example - Minimal configuration**:

```json
{
  "mongodbSchemaChecker.modelMethods": [
    "find",
    "findOne",
    "updateOne",
    "create"
  ]
}
```

## Installation & Development

### Prerequisites

- Node.js (v16 or higher)
- VS Code (v1.75.0 or higher)

### Setup

1. Clone this repository
2. Run `npm install` to install dependencies
3. Press `F5` to open a new VS Code window with the extension loaded
4. Open a JavaScript or TypeScript file and start coding!

### Building

```bash
npm run compile
```

### Testing the Extension

1. Press `F5` in VS Code to launch the Extension Development Host
2. Create a new JavaScript or TypeScript file
3. Try writing code that uses `User.updateOne()` without importing `User`
4. You should see a warning appear on the `User` model name!

## Examples

```javascript
// ES6 imports
import User from "./models/User";
import { Product, Order } from "./models";

// CommonJS imports
const User = require("./models/User");
const { Product, Order } = require("./models");

// ✅ These will all work fine (no warnings)
await User.findOne({ email: "test@example.com" });
await User.updateOne({ _id: "123" }, { name: "John" });
await User.findByEmail("test@example.com"); // Custom method - works!
await Product.find({ inStock: true });
await Product.searchByCategory("electronics"); // Custom method - works!
await Order.create({ userId: "123", total: 99.99 });
await Order.calculateTotal(); // Custom method - works!

// ✅ Comments are properly ignored (no warnings)
// await UnimportedModel.find({}); // This won't trigger a warning
/*
  Multi-line comments are also ignored:
  await AnotherUnimportedModel.create({});
*/

// ✅ Built-in globals are excluded (no warnings)
Math.random();
Date.now();
Array.from([1, 2, 3]);
Promise.resolve();
```

## Steps to Install Locally

1. **Compile the extension:**

   ```bash
   npm run compile
   ```

2. **Package it (using `npx` to avoid permission issues):**

   ```bash
   npx vsce package
   ```

   This will create a file called `mongodb-model-import-checker-1.0.0.vsix` in your current directory.

3. **Install in VS Code:**

   **Option A – Via Command Palette:**

   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type: `Extensions: Install from VSIX...`
   - Find and Select `mongodb-model-import-checker-1.0.0.vsix`

   **Option B – Via Extensions View:**

   - Press `Cmd+Shift+X` to open Extensions
   - Click the `...` (three dots) menu at the top right
   - Select **Install from VSIX...**
   - Navigate to the `.vsix` file and select it

## Support

If you encounter any issues or have suggestions, please file an issue on the GitHub repository.

## License

MIT License - feel free to use and modify as needed!
