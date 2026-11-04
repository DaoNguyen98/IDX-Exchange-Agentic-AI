import {
  getPriceTrend,
  calculateTrendDirection,
  calculatePriceChangePercent,
} from "../src/market-trend";

import { pool } from "../../week-03/src/db";

async function runTest() {
  try {
    const trend = await getPriceTrend("Irvine", 12);

    console.log("12-month trend for Irvine:");
    console.log(trend);

    console.log(
      "\nTrend direction:",
      calculateTrendDirection(trend)
    );

    console.log(
      "Price change:",
      calculatePriceChangePercent(trend),
      "%"
    );
  } catch (error) {
    console.error("Test failed:");
    console.error(error);
  } finally {
    await pool.end();
  }
}

runTest();