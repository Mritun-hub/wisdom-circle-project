import "dotenv/config";
import { connectDb } from "./config/db.js";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.warn("Warning: JWT_SECRET is not set. Using dev default (not for production).");
  process.env.JWT_SECRET = "dev-only-change-me";
}

await connectDb();
const app = createApp();
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
