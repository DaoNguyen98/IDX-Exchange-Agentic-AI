import { recommendSimilarListings } from "./recommendation";

function money(value: number): string {
  return `$${value.toLocaleString()}`;
}

async function main() {
  const listingId = process.argv[2];

  if (!listingId) {
    console.error(
      "Usage: npx tsx week-07/src/recommendation-cli.ts <listing-id>"
    );
    process.exit(1);
  }

  const result = await recommendSimilarListings(listingId);

  console.log("============================================================");
  console.log("               IDX PROPERTY RECOMMENDATIONS");
  console.log("============================================================");

  console.log("\nTarget Listing");
  console.log("------------------------------------------------------------");
  console.log(`ID:        ${result.target.id}`);
  console.log(`City:      ${result.target.city}`);
  console.log(`Price:     ${money(result.target.price)}`);
  console.log(
    `Property:  ${result.target.propertyType} | ` +
      `${result.target.beds ?? "?"} bd | ` +
      `${result.target.baths ?? "?"} ba | ` +
      `${result.target.sqft?.toLocaleString() ?? "?"} sq ft`
  );

  console.log("\nTop 5 Similar Listings");
  console.log("------------------------------------------------------------");

  for (const [index, listing] of result.recommendations.entries()) {
    console.log(`\n#${index + 1}  ${listing.city}`);
    console.log(`ID:            ${listing.id}`);
    console.log(`Price:         ${money(listing.price)}`);
    console.log(
      `Property:      ${listing.propertyType} | ` +
        `${listing.beds ?? "?"} bd | ` +
        `${listing.baths ?? "?"} ba | ` +
        `${listing.sqft?.toLocaleString() ?? "?"} sq ft`
    );
    console.log(`Hybrid Score:  ${listing.hybridScore}`);

    if (listing.compValidation) {
      const comp = listing.compValidation;

      console.log(`Comp Price:    ${money(comp.compPrice)}`);
      console.log(`Comp Count:    ${comp.compCount}`);
      console.log(`Avg PPSF:      $${comp.avgPricePerSqft}`);
      console.log(`Price Delta:   ${comp.deltaPct}%`);

      if (comp.deltaPct > 0) {
        console.log(
          `Assessment:   Listed ${Math.abs(comp.deltaPct)}% above recent comps`
        );
      } else if (comp.deltaPct < 0) {
        console.log(
          `Assessment:   Listed ${Math.abs(comp.deltaPct)}% below recent comps`
        );
      } else {
        console.log("Assessment:   In line with recent comps");
      }
    } else {
      console.log("Assessment:   Not enough data for comp validation");
    }

    console.log("------------------------------------------------------------");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});