import {
  searchActiveListings,
  formatPropertyCard,
} from "../src/property-search";
import { pool } from "../src/db";

async function runTest() {
  try {
    const results = await searchActiveListings(
      {
        city: "Irvine",
        maxPrice: 1500000,
        beds: 3,
        baths: null,
        sqft: null,
        type: "Condominium",
        pool: null,
        hasView: null,
        maxHoa: null,
      },
      1,
      5
    );

    console.log(`Found ${results.length} listings.`);

    for (const listing of results) {
      console.log({
        id: listing.L_DisplayId,
        address: listing.L_Address,
        city: listing.L_City,
        price: listing.price,
        beds: listing.beds,
        baths: listing.baths,
        sqft: listing.sqft,
        type: listing.type,
      });
    }

    if (results.length > 0) {
      console.log("\nFormatted property card:");
      console.log(formatPropertyCard(results[0]));
    }
  } catch (error) {
    console.error("Property search failed.");
    console.error(error);
  } finally {
    await pool.end();
  }
}

runTest();