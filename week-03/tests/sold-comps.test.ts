import { getSoldComps } from "../src/sold-comps";
import { pool } from "../src/db";

async function runTest() {
  try {
    const results = await getSoldComps("Irvine", 12);

    console.log(`Found ${results.length} sold comps.`);

    for (const comp of results.slice(0, 5)) {
      console.log({
        address: comp.UnparsedAddress,
        city: comp.City,
        closeDate: comp.CloseDate,
        closePrice: comp.ClosePrice,
        beds: comp.BedroomsTotal,
        baths: comp.BathroomsTotalInteger,
        sqft: comp.LivingArea,
        propertyType: comp.PropertyType,
        propertySubType: comp.PropertySubType,
      });
    }
  } catch (error) {
    console.error("Sold comps query failed.");
    console.error(error);
  } finally {
    await pool.end();
  }
}

runTest();