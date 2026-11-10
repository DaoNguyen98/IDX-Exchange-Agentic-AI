import { cosineSimilarity } from "../../week-06/src/semantic-search";

export type RecommendationListing = {
  id: string;
  city: string;
  price: number;
  beds: number | null;
  sqft: number | null;
  embedding: number[];
};

export function calculateHybridScore(
  target: RecommendationListing,
  candidate: RecommendationListing
): number {
  let score = 0;

  // Structured similarity = 60 points
  const priceDiff = Math.abs(target.price - candidate.price);

  if (priceDiff < 50_000) {
    score += 20;
  } else if (priceDiff < 150_000) {
    score += 12;
  } else if (priceDiff < 300_000) {
    score += 5;
  }

  if (
    target.beds !== null &&
    candidate.beds !== null &&
    target.beds === candidate.beds
  ) {
    score += 15;
  }

  if (
    target.city &&
    candidate.city &&
    target.city.toLowerCase() === candidate.city.toLowerCase()
  ) {
    score += 15;
  }

  if (target.sqft !== null && candidate.sqft !== null) {
    const sqftDiff = Math.abs(target.sqft - candidate.sqft);

    if (sqftDiff < 300) {
      score += 10;
    } else if (sqftDiff < 700) {
      score += 5;
    }
  }

  // Semantic similarity = 40 points
  const semanticSimilarity = cosineSimilarity(
    target.embedding,
    candidate.embedding
  );

  score += semanticSimilarity * 40;

  return Math.round(score * 100) / 100;
}