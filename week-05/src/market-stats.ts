import { query } from "../../week-03/src/db";

export interface MarketStats {
  city?: string;
  postalCode?: string;
  propertySubType?: string;
  soldCount: number;
  averageClosePrice: number;
  medianClosePrice: number;
  averagePricePerSqFt: number;
  averageDaysOnMarket: number;
  listToCloseRatio: number;
}

interface SummaryRow {
  sold_count: number;
  avg_close_price: number;
  avg_price_per_sqft: number;
  avg_dom: number;
  list_to_close_pct: number;
}

interface MedianRow {
  median_close_price: number;
}

export async function getMarketStats(
  city?: string,
  propertySubType?: string,
  postalCode?: string
): Promise<MarketStats | null> {
  const conditions: string[] = [
    "ClosePrice IS NOT NULL",
    "ClosePrice > 0",
    "STR_TO_DATE(CloseDate, '%Y-%m-%d') <= CURDATE()",
    "STR_TO_DATE(CloseDate, '%Y-%m-%d') >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)",
  ];

  const params: unknown[] = [];

  if (city) {
    conditions.push("City = ?");
    params.push(city);
  }

  if (postalCode) {
    conditions.push("PostalCode = ?");
    params.push(postalCode);
  }

  if (propertySubType) {
    conditions.push("PropertySubType = ?");
    params.push(propertySubType);
  }

  const whereClause = conditions.join("\nAND ");

  const summaryRows = await query<SummaryRow>(
    `
    SELECT
      COUNT(*) AS sold_count,
      ROUND(AVG(ClosePrice), 0) AS avg_close_price,
      ROUND(
        AVG(
          ClosePrice / NULLIF(LivingArea, 0)
        ),
        0
      ) AS avg_price_per_sqft,
      ROUND(
        AVG(DaysOnMarket),
        1
      ) AS avg_dom,
      ROUND(
        AVG(
          ClosePrice / NULLIF(ListPrice, 0)
        ) * 100,
        1
      ) AS list_to_close_pct
    FROM california_sold
    WHERE ${whereClause}
    `,
    params
  );

  const medianRows = await query<MedianRow>(
    `
    SELECT
      ROUND(
        AVG(ClosePrice),
        0
      ) AS median_close_price
    FROM (
      SELECT
        ClosePrice,
        ROW_NUMBER() OVER (
          ORDER BY ClosePrice
        ) AS row_num,
        COUNT(*) OVER () AS total_rows
      FROM california_sold
      WHERE ${whereClause}
    ) ranked
    WHERE row_num IN (
      FLOOR(
        (total_rows + 1) / 2
      ),
      FLOOR(
        (total_rows + 2) / 2
      )
    )
    `,
    params
  );

  const summary =
    summaryRows[0];

  const median =
    medianRows[0];

  if (
    !summary ||
    Number(summary.sold_count) === 0
  ) {
    return null;
  }

  return {
    city,
    postalCode,
    propertySubType,

    soldCount:
      Number(summary.sold_count),

    averageClosePrice:
      Number(summary.avg_close_price),

    medianClosePrice:
      Number(
        median?.median_close_price ?? 0
      ),

    averagePricePerSqFt:
      Number(
        summary.avg_price_per_sqft
      ),

    averageDaysOnMarket:
      Number(summary.avg_dom),

    listToCloseRatio:
      Number(
        summary.list_to_close_pct
      ),
  };
}