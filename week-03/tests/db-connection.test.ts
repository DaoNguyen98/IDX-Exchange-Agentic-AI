import { query, pool } from "../src/db";

async function testConnection() {
  try {
    const result = await query<{ databaseName: string }>(
      "SELECT DATABASE() AS databaseName"
    );

    console.log("Database connection successful.");
    console.log("Connected database:", result[0].databaseName);
  } catch (error) {
    console.error("Database connection failed.");
    console.error(error);
  } finally {
    await pool.end();
  }
}

testConnection();