export interface PropertyFilters {
  city: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  type: string | null;
  pool: string | null;
  hasView: string | null;
  maxHoa: number | null;
}

function parseMoney(
  amount: string,
  suffix?: string
): number {
  let value = Number(amount.replace(/,/g, ""));

  if (suffix?.toLowerCase() === "k") {
    value *= 1_000;
  }

  if (suffix?.toLowerCase() === "m") {
    value *= 1_000_000;
  }

  return value;
}

export async function parsePropertyQuery(
  query: string
): Promise<PropertyFilters> {
  const cleanQuery = query.trim();

  /*
   * HOA is removed before parsing property prices so:
   *
   * "HOA under $500"
   *
   * does not accidentally become:
   *
   * maxPrice = 500
   */
  const queryWithoutHoa = cleanQuery.replace(
    /hoa(?: fee)?(?:\s+(?:under|below|up to|max(?:imum)?))?\s*\$?[\d,.]+(?:k|m)?/gi,
    ""
  );

  /*
   * CITY
   *
   * Examples:
   * in Irvine
   * in Newport Beach under $1M
   * in Anaheim with a pool
   */
  const cityMatch = cleanQuery.match(
    /\bin\s+([A-Za-z\s]+?)(?=\s+(?:under|below|above|over|between|from|with|at least|up to|max(?:imum)?|minimum)|\s+\d+(?:\.\d+)?[\s-]*(?:bed|beds|bedroom|bedrooms|bath|baths|bathroom|bathrooms)|[.!?]|$)/i
  );

  /*
   * PRICE RANGE
   *
   * Example:
   * between $600k and $1.2M
   */
  const betweenPriceMatch = queryWithoutHoa.match(
    /\bbetween\s+\$?([\d,.]+)\s*(k|m)?\s+and\s+\$?([\d,.]+)\s*(k|m)?/i
  );

  /*
   * MINIMUM PRICE
   *
   * Examples:
   * above $600k
   * over $600k
   * at least $600k
   * from $600k
   * minimum $600k
   */
  const minPriceMatch = queryWithoutHoa.match(
    /\b(?:above|over|at least|from|minimum(?:\s+of)?)\s+\$?([\d,.]+)\s*(k|m)?/i
  );

  /*
   * MAXIMUM PRICE
   *
   * Examples:
   * under $1M
   * below $1M
   * up to $1M
   * no more than $1M
   * maximum $1M
   */
  const maxPriceMatch = queryWithoutHoa.match(
    /\b(?:under|below|up to|no more than|maximum(?:\s+of)?|max)\s+\$?([\d,.]+)\s*(k|m)?/i
  );

  /*
   * BEDROOMS / BATHROOMS / SQFT
   */
  const bedsMatch = cleanQuery.match(
    /(\d+)[\s-]*(?:bed|beds|bedroom|bedrooms)\b/i
  );

  const bathsMatch = cleanQuery.match(
    /(\d+(?:\.\d+)?)[\s-]*(?:bath|baths|bathroom|bathrooms)\b/i
  );

  const sqftMatch = cleanQuery.match(
    /([\d,]+)\s*(?:sqft|sq ft|square feet)\b/i
  );

  /*
   * HOA
   *
   * Examples:
   * HOA under $500
   * HOA below 500
   * max HOA $600
   */
  const hoaMatch = cleanQuery.match(
    /(?:hoa(?: fee)?\s*(?:under|below|up to|max(?:imum)?)?|max(?:imum)?\s+hoa(?: fee)?)\s*\$?([\d,.]+)\s*(k|m)?/i
  );

  /*
   * BOOLEAN FEATURES
   */
  const poolMatch = /\bpool\b/i.test(cleanQuery);
  const viewMatch = /\bview\b/i.test(cleanQuery);

  /*
   * PROPERTY TYPE
   */
  

  let type: string | null = null;

  if (/\b(condo|condos|condominium|condominiums)\b/i.test(cleanQuery)) {
    type = "Condominium";
  } else if (
    /\b(townhome|townhomes|townhouse|townhouses)\b/i.test(cleanQuery)
  ) {
    type = "Townhouse";
  } else if (
    /\b(single family|single-family|house|houses)\b/i.test(cleanQuery)
  ) {
    type = "SingleFamilyResidence";
  } else if (/\bland\b/i.test(cleanQuery)) {
    type = "UnimprovedLand";
  }

  /*
   * PRICE NORMALIZATION
   */
  let minPrice: number | null = null;
  let maxPrice: number | null = null;

  if (betweenPriceMatch) {
    minPrice = parseMoney(
      betweenPriceMatch[1],
      betweenPriceMatch[2]
    );

    maxPrice = parseMoney(
      betweenPriceMatch[3],
      betweenPriceMatch[4]
    );
  } else {
    if (minPriceMatch) {
      minPrice = parseMoney(
        minPriceMatch[1],
        minPriceMatch[2]
      );
    }

    if (maxPriceMatch) {
      maxPrice = parseMoney(
        maxPriceMatch[1],
        maxPriceMatch[2]
      );
    }
  }

  const maxHoa = hoaMatch
    ? parseMoney(hoaMatch[1], hoaMatch[2])
    : null;

  return {
    city: cityMatch?.[1]?.trim() || null,
    minPrice,
    maxPrice,
    beds: bedsMatch ? Number(bedsMatch[1]) : null,
    baths: bathsMatch ? Number(bathsMatch[1]) : null,
    sqft: sqftMatch
      ? Number(sqftMatch[1].replace(/,/g, ""))
      : null,
    type,
    pool: poolMatch ? "True" : null,
    hasView: viewMatch ? "True" : null,
    maxHoa,
  };
}