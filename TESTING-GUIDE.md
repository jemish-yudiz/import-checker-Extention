# Testing Guide for MongoDB Model Import Checker

## Quick Start

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Compile the Extension**

   ```bash
   npm run compile
   ```

3. **Launch Extension**

   - Press `F5` in VS Code
   - OR: Use the Run menu → "Start Debugging"
   - OR: Press `Cmd+Shift+D` (Mac) or `Ctrl+Shift+D` (Windows/Linux), then click "Run Extension"

4. **Test in the New Window**
   - A new VS Code window will open titled "[Extension Development Host]"
   - Open `test-user-update.js` in that window
   - You should see warnings on the `User` model

## What to Look For

### ✅ Expected Behavior

When you open `test-user-update.js`, you should see:

1. **Yellow squiggly underlines** under `User` in this line:

   ```javascript
   await User.updateOne(...)
   ```

2. **Hover over `User`** to see:

   ```
   Model 'User' is not imported. Please import the model before using it.
   ```

3. **Problems Panel** (View → Problems or `Cmd+Shift+M`):
   - Should show the warning listed there too

### 🔧 How to Fix the Warning

Uncomment the import line:

```javascript
import User from "./models/User";
```

The warning should disappear immediately!

## Testing Different Scenarios

### Test Case 1: Missing Import (Current State)

```javascript
// No import
async function updateUserEmail() {
  await User.updateOne({ _id: "123" }, { email: "new@example.com" });
  // ⚠️ Should show warning on "User"
}
```

### Test Case 2: With Import (Fixed)

```javascript
import User from "./models/User";

async function updateUserEmail() {
  await User.updateOne({ _id: "123" }, { email: "new@example.com" });
  // ✅ No warning - User is imported
}
```

### Test Case 3: Multiple Models

```javascript
import User from "./models/User";
// Product is NOT imported

await User.updateOne(...);    // ✅ No warning
await Product.find(...);      // ⚠️ Warning: Product not imported
```

### Test Case 4: CommonJS Require

```javascript
const User = require("./models/User");

await User.updateOne(...);    // ✅ No warning - works with require too
```

### Test Case 5: Destructured Import

```javascript
import { User, Product } from "./models";

await User.find(...);         // ✅ No warning
await Product.create(...);    // ✅ No warning
```

## Supported MongoDB Methods

The extension checks for these methods by default:

- `find`, `findOne`, `findById`
- `findOneAndUpdate`, `findByIdAndUpdate`
- `updateOne`, `updateMany`, `replaceOne`
- `create`, `insertMany`
- `deleteOne`, `deleteMany`
- `findOneAndDelete`, `findByIdAndDelete`
- `countDocuments`, `estimatedDocumentCount`
- `aggregate`, `watch`

## Troubleshooting

### No warnings appear?

1. Make sure you're in the **Extension Development Host** window (not the main window)
2. Check the file language mode is JavaScript or TypeScript (bottom right corner)
3. Try saving the file (`Cmd+S` or `Ctrl+S`)
4. Check the console in the main window (Help → Toggle Developer Tools) for errors

### Extension not loading?

1. Make sure you ran `npm install`
2. Make sure you ran `npm run compile`
3. Try restarting VS Code and pressing F5 again

### Want to see console logs?

1. In the Extension Development Host window: Help → Toggle Developer Tools
2. Look at the Console tab
3. You should see: "MongoDB Schema Import Checker is now active!"

## Making Changes to the Extension

1. **Edit the code** in `src/extension.ts`
2. **Recompile**: Run `npm run compile` or use `npm run watch` for auto-compilation
3. **Reload the extension**: In the Extension Development Host window, press `Cmd+R` (Mac) or `Ctrl+R` (Windows/Linux)
4. **Test again**: The changes should take effect immediately

## Using Watch Mode (Recommended for Development)

```bash
npm run watch
```

This will automatically recompile whenever you save changes to `src/extension.ts`.
You still need to reload the Extension Development Host window after changes.

## Publishing Your Extension

Once you're happy with the extension:

```bash
# Install vsce
npm install -g @vscode/vsce

# Package the extension
vsce package

# This creates a .vsix file you can:
# - Install locally: Extensions view → ... menu → Install from VSIX
# - Share with others
# - Publish to VS Code Marketplace
```
