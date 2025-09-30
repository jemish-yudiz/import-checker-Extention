# MongoDB Model Import Checker

A Visual Studio Code extension that helps you remember to import MongoDB models before using them. It detects when you're calling MongoDB model methods (like `User.updateOne`, `Product.find`, etc.) without importing the model first.

## Features

- **Automatic Detection**: Detects when you're using MongoDB model methods without importing the model
- **Auto-Import Quick Fix**: Click on the warning and automatically import the missing model with one click! 💡
- **Smart Import Path**: Automatically imports from `./models/ModelName`
- **Smart Warnings**: Shows warnings when model methods are called on unimported models
- **Configurable**: Customize which MongoDB methods to check for
- **Real-time Checking**: Checks your code as you type and when you save files
- **Works with ES6 and CommonJS**: Supports both `import` and `require` syntax

## How It Works

The extension scans your JavaScript and TypeScript files for:

1. MongoDB model method calls (like `User.updateOne`, `Product.find`, etc.)
2. Import statements to see which models are imported

If it finds model method usage without the corresponding import, it displays a warning with helpful information.

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

By default, the extension checks for these MongoDB/Mongoose model methods:

- Query methods: `find`, `findOne`, `findById`
- Update methods: `findOneAndUpdate`, `findByIdAndUpdate`, `updateOne`, `updateMany`, `replaceOne`
- Delete methods: `findOneAndDelete`, `findByIdAndDelete`, `deleteOne`, `deleteMany`
- Create methods: `create`, `insertMany`
- Count methods: `countDocuments`, `estimatedDocumentCount`
- Other methods: `aggregate`, `watch`

## Configuration

You can customize the extension's behavior in VS Code settings:

### `mongodbSchemaChecker.modelMethods`

List of MongoDB model methods to check for.

**Default**:

```json
[
  "find",
  "findOne",
  "findById",
  "findOneAndUpdate",
  "findByIdAndUpdate",
  "findOneAndDelete",
  "findByIdAndDelete",
  "findOneAndRemove",
  "findByIdAndRemove",
  "create",
  "insertMany",
  "updateOne",
  "updateMany",
  "replaceOne",
  "deleteOne",
  "deleteMany",
  "countDocuments",
  "estimatedDocumentCount",
  "aggregate",
  "watch"
]
```

**Example - Add custom methods**:

```json
{
  "mongodbSchemaChecker.modelMethods": [
    "find",
    "findOne",
    "updateOne",
    "create",
    "myCustomMethod"
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

// These will all work fine (no warnings)
await User.findOne({ email: "test@example.com" });
await User.updateOne({ _id: "123" }, { name: "John" });
await Product.find({ inStock: true });
await Order.create({ userId: "123", total: 99.99 });
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
