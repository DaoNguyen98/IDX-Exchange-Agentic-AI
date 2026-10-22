import { handlePropertyConversation } from "../src/conversational-property-agent";
import { clearSession } from "../src/session";
import { pool } from "../../week-03/src/db";

async function runConversationTest() {
  const userId = "week4-demo-user";

  try {
    clearSession(userId);

 

    const messages = [
      "I want condos in Irvine",
      "Above $600k",
      "Under $1M",
      "3 bedrooms",
    ];

    for (const message of messages) {
      console.log(`\nUser: ${message}`);

      const response = await handlePropertyConversation(
        userId,
        message
      );

      console.log(`Agent:\n${response}`);
    }
  } catch (error) {
    console.error("Conversation test failed.");
    console.error(error);
  } finally {
    await pool.end();
  }
}

runConversationTest();