# MongoDB Model Import Checker

A Visual Studio Code extension that helps you remember to import MongoDB models before using them. It detects when you're calling MongoDB model methods (like `User.updateOne`, `Product.find`, etc.) without importing the model first.

## Features

- **Comprehensive Detection**: Detects **ALL** methods on MongoDB models
- **50+ Built-in Methods**: Recognizes all standard Mongoose methods (find, create, update, delete, aggregate, etc.)
- **Auto-Import Quick Fix**: Click on the warning and automatically import the missing model with one click! 💡
- **Smart Import Path**: Automatically imports from `./models/ModelName`
- **Comment-Aware**: Properly ignores code in comments (both `//` single-line and `/* */` multi-line)
- **Configurable**: Customize which MongoDB methods to check for
- **Real-time Checking**: Checks your code as you type and when you save files
- **Works with ES6 and CommonJS**: Supports both `import` and `require` syntax

## How It Works

The extension scans your JavaScript and TypeScript files for:

1. **Any method call** on capitalized identifiers (Model names like `User`, `Product`, `Order`)
2. Import statements to see which models are imported
3. Properly ignores commented code

If it finds a model method usage without the corresponding import, it displays a warning with helpful information. The extension uses a smart catch-all pattern that detects:

- All 50+ standard Mongoose methods
- Any `ModelName.anyMethod()` pattern

## Example

```javascript
// ❌ This will trigger a warning
async function updateUser() {
  // Warning: Model 'User' is not imported
  await User.updateOne({ email: "test@example.com" }, { age: 25 });
}

// 💡 Click the lightbulb or press Cmd+. (Mac) / Ctrl+. (Windows) to auto-import:
// Quick Fix: Import User from './models/User'

// ✅ After using Quick Fix, the import is automatically added:
import User from "./models/User";

async function updateUser() {
  await User.updateOne({ email: "test@example.com" }, { age: 25 });
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

**Note**: Even if you customize this list, the extension will still detect **ANY method** called on capitalized identifiers (Models).

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

### `mongodbSchemaChecker.checkOnType`

✓ **Checkbox**: Check for missing imports while typing (with 500ms debounce).

**Default**: `true` (checked)

**Description**: When enabled, the extension checks your code as you type (with a 500ms delay after you stop typing). Uncheck this on slower machines to only check on file save.

**Example - Disable for better performance**:

```json
{
  "mongodbSchemaChecker.checkOnType": false
}
```

### `mongodbSchemaChecker.skipLargeFiles`

✓ **Checkbox**: Skip large files automatically for better performance.

**Default**: `true` (checked)

**Description**: When enabled, files larger than `maxFileSize` will be automatically skipped to prevent slowdowns. Uncheck to force checking all files regardless of size.

**Example - Disable to check all files**:

```json
{
  "mongodbSchemaChecker.skipLargeFiles": false
}
```

### `mongodbSchemaChecker.maxFileSize`

Maximum file size in bytes to check (when `skipLargeFiles` is enabled).

**Default**: `100000` (100KB)

**Description**: Files larger than this size will be skipped when `skipLargeFiles` is enabled. Adjust based on your machine's capabilities.

**Example - Adjust file size limit**:

```json
{
  "mongodbSchemaChecker.maxFileSize": 50000 // 50KB for slower machines
}
```

## Performance

The extension is designed to be **lightweight and fast**:

### ⚡ Performance Features

All performance features can be toggled using **checkboxes** in VS Code settings:

- ✓ **500ms Debouncing** (`checkOnType`): Only checks after you stop typing for 500ms, not on every keystroke
- ✓ **Skip Large Files** (`skipLargeFiles`): Automatically skips very large files (>100KB by default) to prevent slowdowns
- **File Size Limit** (`maxFileSize`): Configurable size threshold for skipping files
- **Smart Caching**: Regex patterns are compiled once and reused
- **Early Returns**: Skips non-JavaScript/TypeScript files immediately

### 🎯 Performance Tips

If you experience slowness, use the **checkbox options** in VS Code settings:

1. **☐ Uncheck "Check On Type"** to only check on save (Settings → MongoDB Model Import Checker):

   ```json
   {
     "mongodbSchemaChecker.checkOnType": false
   }
   ```

2. **☐ Uncheck "Skip Large Files"** if you want to check all files regardless of size:

   ```json
   {
     "mongodbSchemaChecker.skipLargeFiles": false
   }
   ```

3. **Reduce file size limit** for very large projects:

   ```json
   {
     "mongodbSchemaChecker.maxFileSize": 50000
   }
   ```

4. **Check console output** to see if large files are being skipped:
   - Open: `View > Output > MongoDB Schema Checker`

### 📊 Typical Performance

- **Small files** (<10KB): ~1-5ms
- **Medium files** (10-50KB): ~5-20ms
- **Large files** (50-100KB): ~20-50ms
- **Very large files** (>100KB): Skipped by default

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
await Product.find({ inStock: true });
await Order.create({ userId: "123", total: 99.99 });

// ✅ Comments are properly ignored (no warnings)
// await UnimportedModel.find({}); // This won't trigger a warning
/*
  Multi-line comments are also ignored:
  await AnotherUnimportedModel.create({});
*/
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
