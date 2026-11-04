import * as readline from "node:readline";

import { handleMarketQuestion } from "./market-agent";

import {
  clearMarketSession,
} from "./market-session";

import { pool } from "../../week-03/src/db";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const userId = "market-chat-user";

function ask(): void {
  rl.question("\nYou: ", async (message) => {
    const input = message.trim();

    if (!input) {
      ask();
      return;
    }

    if (
      input.toLowerCase() === "exit" ||
      input.toLowerCase() === "quit"
    ) {
      console.log("\nMarket chat ended.");
      rl.close();
      await pool.end();
      return;
    }

    if (input.toLowerCase() === "reset") {
      clearMarketSession(userId);

      console.log(
        "\nAgent: Market conversation has been reset."
      );

      ask();
      return;
    }

    try {
      const response = await handleMarketQuestion(
        input,
        userId
      );

      console.log(`\nAgent:\n${response}`);
    } catch (error) {
      console.error(
        "\nAgent: Something went wrong."
      );

      console.error(error);
    }

    ask();
  });
}

console.log("IDX Market Statistics Agent");
console.log("---------------------------");
console.log('Type "reset" to start a new market conversation.');
console.log('Type "exit" to quit.');

clearMarketSession(userId);

ask();