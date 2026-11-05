import mysql from "mysql2/promise";

export type Listing = {
  id: string;
  city: string;
  price: number;
  remarks: string;
  propertyType: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
};

export async function getActiveListings(limit = 50): Promise<Listing[]> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "idx_exchange",
  });

  const [rows] = await connection.execute<any[]>(
    `
    SELECT
      L_ListingID,
      L_City,
      L_SystemPrice,
      L_Remarks,
      L_Type_,
      L_Keyword2,
      LM_Dec_3,
      LM_Int2_3
    FROM rets_property
    WHERE L_Status = 'Active'
      AND L_Remarks IS NOT NULL
      AND L_Remarks <> ''
    LIMIT ?
    `,
    [limit]
  );

  await connection.end();

  return rows.map((row) => ({
    id: String(row.L_ListingID),
    city: row.L_City ?? "",
    price: Number(row.L_SystemPrice ?? 0),
    remarks: row.L_Remarks ?? "",
    propertyType: row.L_Type_ ?? "",
    beds: row.L_Keyword2 == null ? null : Number(row.L_Keyword2),
    baths: row.LM_Dec_3 == null ? null : Number(row.LM_Dec_3),
    sqft: row.LM_Int2_3 == null ? null : Number(row.LM_Int2_3),
  }));
}

export function buildListingText(listing: Listing): string {
  return [
    `${listing.propertyType} in ${listing.city}, California.`,
    listing.beds !== null ? `${listing.beds} bedrooms.` : "",
    listing.baths !== null ? `${listing.baths} bathrooms.` : "",
    listing.sqft !== null ? `${listing.sqft} square feet.` : "",
    listing.price ? `Price $${listing.price}.` : "",
    listing.remarks,
  ]
    .filter(Boolean)
    .join(" ");
}