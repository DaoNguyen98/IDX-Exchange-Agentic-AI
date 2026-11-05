import fs from "fs";
import path from "path";
import { getEmbedding } from "./embedding";
import { buildListingText, getActiveListings } from "./listing-source";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function getEmbeddingWithRetry(text: string): Promise<number[]> {
  while (true) {
    try {
      return await getEmbedding(text);
    } catch (error: any) {
      if (error?.status === 429) {
        console.log("Rate limit hit. Waiting 40 seconds...");
        await sleep(40_000);
        continue;
      }

      throw error;
    }
  }
}

async function main() {
  const limit = Number(process.env.INDEX_LIMIT || 50);

  console.log(`Loading ${limit} active listings...`);

  const listings = await getActiveListings(limit);

  const outputDir = path.join("week-06", "data");
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(
    outputDir,
    "listing-embeddings.json"
  );

  let index: any[] = [];

  if (fs.existsSync(outputPath)) {
    index = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    console.log(`Resuming from ${index.length} existing embeddings...`);
  }

  const completedIds = new Set(
    index.map((item) => item.listing.id)
  );

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];

    if (completedIds.has(listing.id)) {
      continue;
    }

    console.log(`Embedding ${i + 1}/${listings.length}: ${listing.id}`);

    const embedding = await getEmbeddingWithRetry(
      buildListingText(listing)
    );

    index.push({
      listing,
      embedding,
    });

    fs.writeFileSync(
      outputPath,
      JSON.stringify(index)
    );

    // Stay below Gemini free-tier request rate.
    await sleep(700);
  }

  console.log(`\nSaved ${index.length} embeddings to:`);
  console.log(outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});