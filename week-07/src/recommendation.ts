import fs from "fs";
import path from "path";

import {
  calculateHybridScore,
  RecommendationListing,
} from "./hybrid-score";

import { validateWithComps } from "./comp-validation";

type IndexedListing = {
  listing: {
    id: string;
    city: string;
    price: number;
    remarks: string;
    propertyType: string;
    beds: number | null;
    baths: number | null;
    sqft: number | null;
  };
  embedding: number[];
};

export async function recommendSimilarListings(
  targetListingId: string,
  topK = 5
) {
  const indexPath = path.join(
    "week-06",
    "data",
    "listing-embeddings.json"
  );

  if (!fs.existsSync(indexPath)) {
    throw new Error(
      "Week 6 embedding index not found. Build it before running recommendations."
    );
  }

  const index: IndexedListing[] = JSON.parse(
    fs.readFileSync(indexPath, "utf8")
  );

  const targetItem = index.find(
    (item) => item.listing.id === targetListingId
  );

  if (!targetItem) {
    throw new Error(
      `Listing ${targetListingId} was not found in the Week 6 embedding index.`
    );
  }

  const target: RecommendationListing = {
    id: targetItem.listing.id,
    city: targetItem.listing.city,
    price: targetItem.listing.price,
    beds: targetItem.listing.beds,
    sqft: targetItem.listing.sqft,
    embedding: targetItem.embedding,
  };

  const candidates = index
    .filter((item) => item.listing.id !== targetListingId)
    .map((item) => {
      const candidate: RecommendationListing = {
        id: item.listing.id,
        city: item.listing.city,
        price: item.listing.price,
        beds: item.listing.beds,
        sqft: item.listing.sqft,
        embedding: item.embedding,
      };

      return {
        listing: item.listing,
        hybridScore: calculateHybridScore(target, candidate),
      };
    })
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, topK);

  const results = [];

  for (const candidate of candidates) {
    const listing = candidate.listing;

    let compValidation = null;

    if (
      listing.city &&
      listing.sqft !== null &&
      listing.sqft > 0 &&
      listing.price > 0
    ) {
      compValidation = await validateWithComps(
        listing.city,
        listing.sqft,
        listing.price
      );
    }

    results.push({
      ...listing,
      hybridScore: candidate.hybridScore,
      compValidation,
    });
  }

  return {
    target: targetItem.listing,
    recommendations: results,
  };
}