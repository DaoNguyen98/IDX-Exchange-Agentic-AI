import { runPropertySearchSkill } from "../src/property-search-skill";
import { pool } from "../src/db";

async function runTest() {
  try {
    const query =
      "Show me 3-bedroom condos in Irvine under $1.5M";

    const results = await runPropertySearchSkill(
      query,
      1,
      5
    );

    console.log("User query:");
    console.log(query);

    console.log("\nProperty cards:");

    for (const card of results) {
      console.log(card);
    }

    console.log(`\nReturned ${results.length} property cards.`);
  } catch (error) {
    console.error("Property search skill failed.");
    console.error(error);
  } finally {
    await pool.end();
  }
}

runTest();