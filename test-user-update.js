// Test file for the User.updateOne example
// This demonstrates the exact use case you mentioned

// ❌ INCORRECT - Uncomment this to see the warning

async function updateUserEmail() {
  // This will show: "Model 'User' is not imported. Please import the model before using it."
  await User.updateOne(
    { _id: "507f1f77bcf86cd799439011" },
    { email: "newemail@example.com" }
  );
}

// ✅ CORRECT - Import User model first
// import User from "./models/User";

// async function updateUserEmail() {
//   // Now this works fine - no warning!
//   await User.updateOne(
//     { _id: "507f1f77bcf86cd799439011" },
//     { email: "newemail@example.com" }
//   );
// }

// More examples with different models
// If you uncomment these, you'll see warnings for Product and Order
/*
async function testMissingImports() {
  await Product.find({ category: "electronics" });
  await Order.create({ total: 100 });
}
*/

export { updateUserEmail };
