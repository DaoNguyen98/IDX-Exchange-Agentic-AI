import assert from "node:assert";
import {
  calculateHybridScore,
  RecommendationListing,
} from "../src/hybrid-score";

const target: RecommendationListing = {
  id: "A",
  city: "Denver",
  price: 500_000,
  beds: 3,
  sqft: 1_800,
  embedding: [1, 0],
};

const verySimilar: RecommendationListing = {
  id: "B",
  city: "Denver",
  price: 520_000,
  beds: 3,
  sqft: 1_950,
  embedding: [1, 0],
};

const lessSimilar: RecommendationListing = {
  id: "C",
  city: "Boulder",
  price: 900_000,
  beds: 5,
  sqft: 3_000,
  embedding: [0, 1],
};

const score1 = calculateHybridScore(target, verySimilar);
const score2 = calculateHybridScore(target, lessSimilar);

assert(score1 > score2);
assert(score1 > 90);
assert(score2 < 20);

console.log("Week 7 hybrid score tests passed.");
console.log("Very similar score:", score1);
console.log("Less similar score:", score2);