import { handleMarketQuestion } from "../src/market-agent";
import { pool } from "../../week-03/src/db";

async function runTest() {
  try {
    const questions = [
      "How is the market in Irvine?",
      "What is the median home price in Irvine?",
      "What is the average price per square foot in Irvine?",
      "How long does it take to sell a home in Irvine?",
      "Are homes selling above or below asking price in Irvine?",
      "Are prices rising or falling in Irvine?",
      "How many homes sold in Irvine?",
      "Is now a good time to buy in Irvine?",
    ];

    for (const question of questions) {
      console.log(`\nUser: ${question}`);

      const response = await handleMarketQuestion(question);

      console.log(`Agent:\n${response}`);
      console.log("----------------------------------------");
    }
  } catch (error) {
    console.error("Test failed:");
    console.error(error);
  } finally {
    await pool.end();
  }
}

runTest();