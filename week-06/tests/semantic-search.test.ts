import assert from "node:assert";
import { cosineSimilarity } from "../src/semantic-search";

function runTests() {
  assert.strictEqual(
    cosineSimilarity([1, 0], [1, 0]),
    1,
    "Identical vectors should have similarity 1"
  );

  assert.strictEqual(
    cosineSimilarity([1, 0], [0, 1]),
    0,
    "Orthogonal vectors should have similarity 0"
  );

  const similar = cosineSimilarity([1, 1], [1, 0.9]);

  assert(
    similar > 0.99,
    "Similar vectors should have high cosine similarity"
  );

  console.log("Week 6 semantic search tests passed.");
}

runTests();