import { getMarketStats } from "../src/market-stats";
import { pool } from "../../week-03/src/db";

async function runTest() {
  try {
    const result = await getMarketStats("Irvine");

    console.log("Market stats for Irvine:");
    console.log(result);
  } catch (error) {
    console.error("Test failed:");
    console.error(error);
  } finally {
    await pool.end();
  }
}

runTest();