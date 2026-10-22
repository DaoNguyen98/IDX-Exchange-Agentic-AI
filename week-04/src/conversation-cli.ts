import * as readline from "node:readline";
import { handlePropertyConversation } from "./conversational-property-agent";
import { clearSession } from "./session";
import { pool } from "../../week-03/src/db";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const userId = "presentation-user";

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
      console.log("\nConversation ended.");
      rl.close();
      await pool.end();
      return;
    }

    if (input.toLowerCase() === "reset") {
      clearSession(userId);
      console.log("\nAgent: Search preferences have been reset.");
      ask();
      return;
    }

    try {
      const response = await handlePropertyConversation(
        userId,
        input
      );

      console.log(`\nAgent:\n${response}`);
    } catch (error) {
      console.error("\nAgent: Something went wrong.");
      console.error(error);
    }

    ask();
  });
}

console.log("IDX Conversational Property Search");
console.log("----------------------------------");
console.log('Type "reset" to start a new search.');
console.log('Type "exit" to quit.');

clearSession(userId);
ask();