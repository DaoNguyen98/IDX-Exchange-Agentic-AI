import { query } from "../../week-03/src/db";

export interface MonthlyTrend {
  month: string;
  sales: number;
  averagePrice: number;
  averagePricePerSqFt: number;
  averageDaysOnMarket: number;
}

export interface MonthOverMonthComparison {
  currentMonth: string;
  previousMonth: string;
  priceChangePercent: number | null;
  pricePerSqFtChangePercent: number | null;
  domChangePercent: number | null;
  salesChangePercent: number | null;
}

export interface YearOverYearComparison {
  currentMonth: string;
  previousYearMonth: string;
  priceChangePercent: number | null;
  pricePerSqFtChangePercent: number | null;
  domChangePercent: number | null;
  salesChangePercent: number | null;
}

export async function getPriceTrend(
  city: string,
  months = 12,
  propertySubType?: string
): Promise<MonthlyTrend[]> {
  const params: unknown[] = [
    city,
    months,
  ];

  let subtypeFilter = "";

  if (propertySubType) {
    subtypeFilter =
      " AND PropertySubType = ?";

    params.push(propertySubType);
  }

  const rows = await query<{
    month: string;
    sales: number;
    avg_price: number;
    avg_price_per_sqft: number;
    avg_dom: number;
  }>(
    `
    SELECT
      DATE_FORMAT(
        STR_TO_DATE(
          CloseDate,
          '%Y-%m-%d'
        ),
        '%Y-%m'
      ) AS month,

      COUNT(*) AS sales,

      ROUND(
        AVG(ClosePrice),
        0
      ) AS avg_price,

      ROUND(
        AVG(
          ClosePrice /
          NULLIF(LivingArea, 0)
        ),
        0
      ) AS avg_price_per_sqft,

      ROUND(
        AVG(DaysOnMarket),
        1
      ) AS avg_dom

    FROM california_sold

    WHERE City = ?

      AND ClosePrice IS NOT NULL
      AND ClosePrice > 0

      AND STR_TO_DATE(
        CloseDate,
        '%Y-%m-%d'
      ) <= CURDATE()

      AND STR_TO_DATE(
        CloseDate,
        '%Y-%m-%d'
      ) >= DATE_SUB(
        CURDATE(),
        INTERVAL ? MONTH
      )

      ${subtypeFilter}

    GROUP BY
      DATE_FORMAT(
        STR_TO_DATE(
          CloseDate,
          '%Y-%m-%d'
        ),
        '%Y-%m'
      )

    ORDER BY month
    `,
    params
  );

  return rows.map((row) => ({
    month: row.month,

    sales:
      Number(row.sales),

    averagePrice:
      Number(row.avg_price),

    averagePricePerSqFt:
      Number(
        row.avg_price_per_sqft
      ),

    averageDaysOnMarket:
      Number(row.avg_dom),
  }));
}

export function calculateTrendDirection(
  trend: MonthlyTrend[]
):
  | "rising"
  | "falling"
  | "stable"
  | "insufficient-data" {
  if (trend.length < 2) {
    return "insufficient-data";
  }

  const first =
    trend[0].averagePrice;

  const last =
    trend[
      trend.length - 1
    ].averagePrice;

  if (!first || !last) {
    return "insufficient-data";
  }

  const changePercent =
    ((last - first) / first) *
    100;

  if (changePercent > 3) {
    return "rising";
  }

  if (changePercent < -3) {
    return "falling";
  }

  return "stable";
}

export function calculatePriceChangePercent(
  trend: MonthlyTrend[]
): number | null {
  if (trend.length < 2) {
    return null;
  }

  const first =
    trend[0].averagePrice;

  const last =
    trend[
      trend.length - 1
    ].averagePrice;

  if (!first || !last) {
    return null;
  }

  return Number(
    (
      ((last - first) / first) *
      100
    ).toFixed(1)
  );
}

export function calculatePricePerSqFtTrendDirection(
  trend: MonthlyTrend[]
):
  | "rising"
  | "falling"
  | "stable"
  | "insufficient-data" {
  const validTrend =
    trend.filter(
      (row) =>
        row.averagePricePerSqFt > 0
    );

  if (validTrend.length < 2) {
    return "insufficient-data";
  }

  const first =
    validTrend[0]
      .averagePricePerSqFt;

  const last =
    validTrend[
      validTrend.length - 1
    ].averagePricePerSqFt;

  const changePercent =
    ((last - first) / first) *
    100;

  if (changePercent > 3) {
    return "rising";
  }

  if (changePercent < -3) {
    return "falling";
  }

  return "stable";
}

export function calculatePricePerSqFtChangePercent(
  trend: MonthlyTrend[]
): number | null {
  const validTrend =
    trend.filter(
      (row) =>
        row.averagePricePerSqFt > 0
    );

  if (validTrend.length < 2) {
    return null;
  }

  const first =
    validTrend[0]
      .averagePricePerSqFt;

  const last =
    validTrend[
      validTrend.length - 1
    ].averagePricePerSqFt;

  return Number(
    (
      ((last - first) / first) *
      100
    ).toFixed(1)
  );
}

function calculatePercentChange(
  previousValue: number,
  currentValue: number
): number | null {
  if (
    !previousValue ||
    previousValue === 0
  ) {
    return null;
  }

  return Number(
    (
      (
        (currentValue -
          previousValue) /
        previousValue
      ) * 100
    ).toFixed(1)
  );
}

export function calculateMonthOverMonth(
  trend: MonthlyTrend[]
): MonthOverMonthComparison | null {
  if (trend.length < 2) {
    return null;
  }

  const previous =
    trend[
      trend.length - 2
    ];

  const current =
    trend[
      trend.length - 1
    ];

  return {
    currentMonth:
      current.month,

    previousMonth:
      previous.month,

    priceChangePercent:
      calculatePercentChange(
        previous.averagePrice,
        current.averagePrice
      ),

    pricePerSqFtChangePercent:
      calculatePercentChange(
        previous.averagePricePerSqFt,
        current.averagePricePerSqFt
      ),

    domChangePercent:
      calculatePercentChange(
        previous.averageDaysOnMarket,
        current.averageDaysOnMarket
      ),

    salesChangePercent:
      calculatePercentChange(
        previous.sales,
        current.sales
      ),
  };
}

export function calculateYearOverYear(
  trend: MonthlyTrend[]
): YearOverYearComparison | null {
  if (trend.length < 2) {
    return null;
  }

  const current =
    trend[
      trend.length - 1
    ];

  const [
    currentYearString,
    currentMonthString,
  ] = current.month.split("-");

  const currentYear =
    Number(currentYearString);

  if (
    !currentYear ||
    !currentMonthString
  ) {
    return null;
  }

  const previousYearMonth =
    `${currentYear - 1}-${currentMonthString}`;

  const previousYear =
    trend.find(
      (row) =>
        row.month ===
        previousYearMonth
    );

  if (!previousYear) {
    return null;
  }

  return {
    currentMonth:
      current.month,

    previousYearMonth:
      previousYear.month,

    priceChangePercent:
      calculatePercentChange(
        previousYear.averagePrice,
        current.averagePrice
      ),

    pricePerSqFtChangePercent:
      calculatePercentChange(
        previousYear.averagePricePerSqFt,
        current.averagePricePerSqFt
      ),

    domChangePercent:
      calculatePercentChange(
        previousYear.averageDaysOnMarket,
        current.averageDaysOnMarket
      ),

    salesChangePercent:
      calculatePercentChange(
        previousYear.sales,
        current.sales
      ),
  };
}