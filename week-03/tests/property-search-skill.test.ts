import { runPropertySearchSkill } from "../src/property-search-skill";
import { pool } from "../src/db";

async function runTest() {
  try {
    const query =
      "Find condos in Irvine between $600k and $1.2M";

    const results = await runPropertySearchSkill(
      query,
      1,
      5
    );

    console.log("User query:");
    console.log(query);

    console.log("\nProperty cards:");

   for (let i = 0; i < results.length; i++) {
    console.log(`\nProperty ${i + 1}`);
    console.log(results[i]);
    console.log("----------------------------------------");
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