import { parsePropertyQuery } from "../src/property-parser";

async function run() {
  const query =
    "Show me 3-bedroom condos in Irvine under $1.5M with a pool.";

  const result = await parsePropertyQuery(query);

  console.log("Query:");
  console.log(query);

  console.log("\nParsed filters:");
  console.log(result);
}

run();