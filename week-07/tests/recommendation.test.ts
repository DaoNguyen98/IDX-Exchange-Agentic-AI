import assert from "node:assert";
import { recommendSimilarListings } from "../src/recommendation";

async function runTests() {
  const result = await recommendSimilarListings("1118381441");

  assert.strictEqual(
    result.target.id,
    "1118381441",
    "Target listing should match requested ID"
  );

  assert.strictEqual(
    result.recommendations.length,
    5,
    "Should return exactly 5 recommendations"
  );

  for (const listing of result.recommendations) {
    assert(
      listing.hybridScore >= 0 && listing.hybridScore <= 100,
      "Hybrid score should be between 0 and 100"
    );

    assert(
      listing.id !== result.target.id,
      "Recommendation should not be the target listing"
    );

    if (listing.compValidation) {
      assert(
        listing.compValidation.compCount >= 0,
        "Comp count should not be negative"
      );
    }
  }

  for (let i = 1; i < result.recommendations.length; i++) {
    assert(
      result.recommendations[i - 1].hybridScore >=
        result.recommendations[i].hybridScore,
      "Recommendations should be sorted by hybrid score"
    );
  }

  console.log("Week 7 recommendation tests passed.");
}

runTests().catch((error) => {
  console.error(error);
  process.exit(1);
});