import fs from "fs";
import path from "path";
import { getEmbedding } from "./embedding";
import { cosineSimilarity } from "./semantic-search";

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

function formatMoney(value: number): string {
  return `$${value.toLocaleString()}`;
}

function shorten(text: string, max = 150): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max) + "..." : clean;
}

async function main() {
  const query = process.argv.slice(2).join(" ").trim();

  if (!query) {
    console.error(
      'Usage: npx tsx week-06/src/semantic-cli.ts "your search"'
    );
    process.exit(1);
  }

  const indexPath = path.join(
    "week-06",
    "data",
    "listing-embeddings.json"
  );

  const index: IndexedListing[] = JSON.parse(
    fs.readFileSync(indexPath, "utf8")
  );

  const queryEmbedding = await getEmbedding(query);

  const scored = index
    .map(({ listing, embedding }) => ({
      ...listing,
      similarity: cosineSimilarity(queryEmbedding, embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);

  console.log("============================================================");
  console.log("              IDX SEMANTIC PROPERTY SEARCH");
  console.log("============================================================");
  console.log(`Query: ${query}`);
  console.log(`Indexed listings searched: ${index.length}`);
  console.log("------------------------------------------------------------");
  console.log("Top 5 Matches\n");

  for (const [i, listing] of scored.entries()) {
    console.log(`#${i + 1}  ${listing.city}`);
    console.log(`Price:       ${formatMoney(listing.price)}`);
    console.log(
      `Property:    ${listing.propertyType} | ` +
        `${listing.beds ?? "?"} bd | ` +
        `${listing.baths ?? "?"} ba | ` +
        `${listing.sqft?.toLocaleString() ?? "?"} sq ft`
    );
    console.log(
      `Match:       ${(listing.similarity * 100).toFixed(1)}%`
    );
    console.log(`Description: ${shorten(listing.remarks)}`);
    console.log("------------------------------------------------------------");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});