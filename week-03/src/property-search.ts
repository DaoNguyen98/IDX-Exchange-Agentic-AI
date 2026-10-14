import { query } from "./db";
import type { PropertyFilters } from "../../week-02/src/property-parser";

export interface ListingRow {
  L_ListingID: string;
  L_DisplayId: string;
  L_Address: string;
  L_City: string;
  L_Zip: string;
  price: number;
  beds: number;
  baths: number | string | null;
  sqft: number;
  type: string;
  status: string;
  YearBuilt: number;
  AssociationFee: number;
  DaysOnMarket: number;
  PoolPrivateYN: string;
  ViewYN: string;
  PhotoCount: number;
  LA1_UserFirstName: string;
  LA1_UserLastName: string;
  LO1_OrganizationName: string;
}

export async function searchActiveListings(
  filters: PropertyFilters,
  page = 1,
  limit = 10
): Promise<ListingRow[]> {
  const offset = (page - 1) * limit;

  let sql = `
    SELECT
      L_ListingID,
      L_DisplayId,
      L_Address,
      L_City,
      L_Zip,
      L_SystemPrice AS price,
      L_Keyword2 AS beds,
      LM_Dec_3 AS baths,
      LM_Int2_3 AS sqft,
      L_Type_ AS type,
      L_Status AS status,
      YearBuilt,
      AssociationFee,
      DaysOnMarket,
      PoolPrivateYN,
      ViewYN,
      PhotoCount,
      LA1_UserFirstName,
      LA1_UserLastName,
      LO1_OrganizationName
    FROM rets_property
    WHERE L_Status = 'Active'
  `;

  const params: any[] = [];

  if (filters.city) {
    sql += " AND L_City = ?";
    params.push(filters.city);
  }

  if (filters.maxPrice) {
    sql += " AND L_SystemPrice <= ?";
    params.push(filters.maxPrice);
  }

  if (filters.beds) {
    sql += " AND L_Keyword2 >= ?";
    params.push(filters.beds);
  }

  if (filters.baths) {
    sql += " AND LM_Dec_3 >= ?";
    params.push(filters.baths);
  }

  if (filters.sqft) {
    sql += " AND LM_Int2_3 >= ?";
    params.push(filters.sqft);
  }

  if (filters.type) {
    sql += " AND L_Type_ = ?";
    params.push(filters.type);
  }

  if (filters.pool) {
    sql += " AND PoolPrivateYN = ?";
    params.push(filters.pool);
  }

  if (filters.hasView) {
    sql += " AND ViewYN = ?";
    params.push(filters.hasView);
  }

  if (filters.maxHoa) {
    sql += " AND AssociationFee <= ?";
    params.push(filters.maxHoa);
  }

  sql += " ORDER BY L_SystemPrice ASC LIMIT ? OFFSET ?";

  params.push(limit, offset);

  return query<ListingRow>(sql, params);
}

export function formatPropertyCard(listing: ListingRow): string {
  const baths =
    listing.baths !== null && listing.baths !== undefined
      ? Number(listing.baths)
      : null;

  const price =
    listing.price !== null && listing.price !== undefined
      ? Number(listing.price).toLocaleString()
      : "N/A";

  const sqft =
    listing.sqft !== null && listing.sqft !== undefined
      ? Number(listing.sqft).toLocaleString()
      : "N/A";

  return [
    `${listing.L_Address}, ${listing.L_City} ${listing.L_Zip}`,
    `$${price}`,
    `${listing.beds ?? "N/A"} bd / ${baths ?? "N/A"} ba`,
    `${sqft} sqft`,
    `${listing.type ?? "Unknown type"}`,
    `${listing.DaysOnMarket ?? "N/A"} days on market`,
    `MLS: ${listing.L_DisplayId}`,
  ].join(" | ");
}