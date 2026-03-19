import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to the database successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.log("❌ An error occurred", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();