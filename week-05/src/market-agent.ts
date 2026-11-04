import { getMarketStats } from "./market-stats";

import {
  getPriceTrend,
  calculateTrendDirection,
  calculatePriceChangePercent,
  calculatePricePerSqFtTrendDirection,
  calculatePricePerSqFtChangePercent,
  calculateMonthOverMonth,
  calculateYearOverYear,
} from "./market-trend";

import {
  getMarketSession,
  updateMarketSession,
} from "./market-session";

import {
  getInventoryStats,
} from "./inventory-stats";

function extractCity(
  message: string
): string | null {
  const inMatch = message.match(
    /\bin\s+([A-Za-z\s]+?)(?:\?|$)/i
  );

  if (inMatch) {
    const city =
      inMatch[1]?.trim();

    if (
      city &&
      !/^favou?rs?\b/i.test(city) &&
      !/^the market\b/i.test(city)
    ) {
      return city;
    }
  }

  const secondaryMatch =
    message.match(
      /\b(?:for|about)\s+([A-Za-z\s]+?)(?:\?|$)/i
    );

  const city =
    secondaryMatch?.[1]?.trim();

  if (!city) {
    return null;
  }

  if (
    /^favou?rs?\b/i.test(city) ||
    /^the market\b/i.test(city)
  ) {
    return null;
  }

  return city;
}

function extractPostalCode(
  message: string
): string | null {
  const explicitMatch =
    message.match(
      /\b(?:zip|zip code|postal code)\s*[:#-]?\s*(\d{5})\b/i
    );

  if (explicitMatch) {
    return explicitMatch[1];
  }

  const simpleMatch =
    message.match(
      /\b(\d{5})\b/
    );

  return simpleMatch?.[1] ?? null;
}

function extractPropertySubType(
  message: string
): string | null {
  const lower =
    message.toLowerCase();

  if (
    lower.includes("condo") ||
    lower.includes("condominium")
  ) {
    return "Condominium";
  }

  if (
    lower.includes("townhome") ||
    lower.includes("townhouse")
  ) {
    return "Townhouse";
  }

  if (
    lower.includes("single family") ||
    lower.includes("single-family") ||
    lower.includes("single house") ||
    lower.includes("house")
  ) {
    return "SingleFamilyResidence";
  }

  if (
    lower.includes("manufactured") ||
    lower.includes("mobile home")
  ) {
    return "ManufacturedOnLand";
  }

  if (
    lower.includes("duplex")
  ) {
    return "Duplex";
  }

  if (
    lower.includes("land")
  ) {
    return "Land";
  }

  return null;
}

function formatMoney(
  value: number
): string {
  return `$${Math.round(
    value
  ).toLocaleString()}`;
}

function formatPropertyLabel(
  propertySubType:
    | string
    | null
    | undefined
): string {
  switch (propertySubType) {
    case "Condominium":
      return "condos";

    case "SingleFamilyResidence":
      return "single-family homes";

    case "Townhouse":
      return "townhomes";

    case "ManufacturedOnLand":
      return "manufactured homes";

    case "Duplex":
      return "duplexes";

    case "Land":
      return "land";

    default:
      return "homes";
  }
}

function looksLikeShortCityAnswer(
  message: string
): boolean {
  return /^[A-Za-z]+(?:\s+[A-Za-z]+){0,4}$/.test(
    message.trim()
  );
}

function formatMonthlyDomTrend(
  trend: {
    month: string;
    averageDaysOnMarket: number;
  }[]
): string {
  return trend
    .map(
      (row) =>
        `${row.month}: ${row.averageDaysOnMarket} days`
    )
    .join("\n");
}

function formatPercent(
  value: number | null
): string {
  if (value === null) {
    return "N/A";
  }

  return `${value > 0 ? "+" : ""}${value}%`;
}

export async function handleMarketQuestion(
  message: string,
  userId = "market-chat-user"
): Promise<string> {
  const input =
    message.trim();

  const session =
    getMarketSession(userId);

  let city =
    extractCity(input);

  const postalCode =
    extractPostalCode(input);

  const newPropertySubType =
    extractPropertySubType(input);

  if (
    !city &&
    !postalCode &&
    session.pendingQuestion &&
    looksLikeShortCityAnswer(input)
  ) {
    city = input;
  }

  if (
    city &&
    postalCode
  ) {
    updateMarketSession(
      userId,
      {
        city,
        postalCode,
      }
    );
  } else if (city) {
    updateMarketSession(
      userId,
      {
        city,
        postalCode: undefined,
      }
    );
  } else if (postalCode) {
    updateMarketSession(
      userId,
      {
        city: undefined,
        postalCode,
      }
    );
  }

  if (newPropertySubType) {
    updateMarketSession(
      userId,
      {
        propertySubType:
          newPropertySubType,
      }
    );
  }

  let updatedSession =
    getMarketSession(userId);

  if (
    !updatedSession.city &&
    !updatedSession.postalCode
  ) {
    updateMarketSession(
      userId,
      {
        pendingQuestion: input,
      }
    );

    return "Which California city or ZIP code would you like to analyze?";
  }

  let questionToAnswer =
    input;

  if (
    session.pendingQuestion &&
    (
      looksLikeShortCityAnswer(
        input
      ) ||
      postalCode
    )
  ) {
    questionToAnswer =
      session.pendingQuestion;

    updateMarketSession(
      userId,
      {
        pendingQuestion:
          undefined,
      }
    );
  }

  updatedSession =
    getMarketSession(userId);

  const selectedCity =
    updatedSession.city;

  const selectedPostalCode =
    updatedSession.postalCode;

  const propertySubType =
    updatedSession.propertySubType;

  const propertyLabel =
    formatPropertyLabel(
      propertySubType
    );

  const locationLabel =
    selectedPostalCode
      ? `ZIP code ${selectedPostalCode}`
      : selectedCity!;

  if (
    propertySubType === "Land"
  ) {
    return `I couldn't find recent land sales data for ${locationLabel}.`;
  }

  const stats =
    await getMarketStats(
      selectedCity,
      propertySubType,
      selectedPostalCode
    );

  if (!stats) {
    return `I couldn't find enough recent ${propertyLabel} sales data for ${locationLabel}.`;
  }

  /*
   * 24 months so YoY can look for
   * the same month one year earlier.
   */
  const trend =
    selectedCity
      ? await getPriceTrend(
          selectedCity,
          24,
          propertySubType
        )
      : [];

  const direction =
    calculateTrendDirection(
      trend
    );

  const priceChange =
    calculatePriceChangePercent(
      trend
    );

  const ppsfDirection =
    calculatePricePerSqFtTrendDirection(
      trend
    );

  const ppsfChange =
    calculatePricePerSqFtChangePercent(
      trend
    );

  const monthOverMonth =
    calculateMonthOverMonth(
      trend
    );

  const yearOverYear =
    calculateYearOverYear(
      trend
    );

  const lowerMessage =
    questionToAnswer.toLowerCase();

  /*
   * YEAR-OVER-YEAR
   */
  if (
    lowerMessage.includes(
      "year-over-year"
    ) ||
    lowerMessage.includes(
      "year over year"
    ) ||
    lowerMessage.includes(
      "yoy"
    ) ||
    lowerMessage.includes(
      "compared to last year"
    ) ||
    lowerMessage.includes(
      "from last year"
    )
  ) {
    if (!selectedCity) {
      return `ZIP-specific year-over-year analysis is not supported yet for ${locationLabel}.`;
    }

    if (!yearOverYear) {
      return `There isn't enough historical data to calculate a year-over-year comparison for ${propertyLabel} in ${locationLabel}.`;
    }

    if (
      lowerMessage.includes(
        "price"
      ) &&
      !lowerMessage.includes(
        "square foot"
      ) &&
      !lowerMessage.includes(
        "sq ft"
      ) &&
      !lowerMessage.includes(
        "sqft"
      )
    ) {
      return [
        `Year-over-year average price change for ${propertyLabel} in ${locationLabel}:`,
        `${yearOverYear.previousYearMonth} → ${yearOverYear.currentMonth}`,
        `Price change: ${formatPercent(
          yearOverYear.priceChangePercent
        )}`,
      ].join("\n");
    }

    if (
      lowerMessage.includes(
        "square foot"
      ) ||
      lowerMessage.includes(
        "sq ft"
      ) ||
      lowerMessage.includes(
        "sqft"
      )
    ) {
      return [
        `Year-over-year price-per-square-foot change for ${propertyLabel} in ${locationLabel}:`,
        `${yearOverYear.previousYearMonth} → ${yearOverYear.currentMonth}`,
        `Price per sq ft change: ${formatPercent(
          yearOverYear.pricePerSqFtChangePercent
        )}`,
      ].join("\n");
    }

    if (
      lowerMessage.includes(
        "days on market"
      ) ||
      lowerMessage.includes(
        "dom"
      )
    ) {
      return [
        `Year-over-year days-on-market change for ${propertyLabel} in ${locationLabel}:`,
        `${yearOverYear.previousYearMonth} → ${yearOverYear.currentMonth}`,
        `Days on market change: ${formatPercent(
          yearOverYear.domChangePercent
        )}`,
      ].join("\n");
    }

    if (
      lowerMessage.includes(
        "sales"
      ) ||
      lowerMessage.includes(
        "sold"
      )
    ) {
      return [
        `Year-over-year sales-volume change for ${propertyLabel} in ${locationLabel}:`,
        `${yearOverYear.previousYearMonth} → ${yearOverYear.currentMonth}`,
        `Sales change: ${formatPercent(
          yearOverYear.salesChangePercent
        )}`,
      ].join("\n");
    }

    return [
      `Year-over-year market change for ${propertyLabel} in ${locationLabel}:`,
      `${yearOverYear.previousYearMonth} → ${yearOverYear.currentMonth}`,
      `Average price: ${formatPercent(
        yearOverYear.priceChangePercent
      )}`,
      `Price per sq ft: ${formatPercent(
        yearOverYear.pricePerSqFtChangePercent
      )}`,
      `Days on market: ${formatPercent(
        yearOverYear.domChangePercent
      )}`,
      `Sales volume: ${formatPercent(
        yearOverYear.salesChangePercent
      )}`,
    ].join("\n");
  }

  /*
   * MONTH-OVER-MONTH
   */
  if (
    lowerMessage.includes(
      "month-over-month"
    ) ||
    lowerMessage.includes(
      "month over month"
    ) ||
    lowerMessage.includes(
      "mom"
    ) ||
    lowerMessage.includes(
      "from last month"
    ) ||
    lowerMessage.includes(
      "compared to last month"
    )
  ) {
    if (!selectedCity) {
      return `ZIP-specific month-over-month analysis is not supported yet for ${locationLabel}.`;
    }

    if (!monthOverMonth) {
      return `There isn't enough monthly data to calculate a month-over-month comparison for ${propertyLabel} in ${locationLabel}.`;
    }

    if (
      lowerMessage.includes(
        "price"
      ) &&
      !lowerMessage.includes(
        "square foot"
      ) &&
      !lowerMessage.includes(
        "sq ft"
      ) &&
      !lowerMessage.includes(
        "sqft"
      )
    ) {
      return [
        `Month-over-month average price change for ${propertyLabel} in ${locationLabel}:`,
        `${monthOverMonth.previousMonth} → ${monthOverMonth.currentMonth}`,
        `Price change: ${formatPercent(
          monthOverMonth.priceChangePercent
        )}`,
      ].join("\n");
    }

    if (
      lowerMessage.includes(
        "square foot"
      ) ||
      lowerMessage.includes(
        "sq ft"
      ) ||
      lowerMessage.includes(
        "sqft"
      )
    ) {
      return [
        `Month-over-month price-per-square-foot change for ${propertyLabel} in ${locationLabel}:`,
        `${monthOverMonth.previousMonth} → ${monthOverMonth.currentMonth}`,
        `Price per sq ft change: ${formatPercent(
          monthOverMonth.pricePerSqFtChangePercent
        )}`,
      ].join("\n");
    }

    if (
      lowerMessage.includes(
        "days on market"
      ) ||
      lowerMessage.includes(
        "dom"
      )
    ) {
      return [
        `Month-over-month days-on-market change for ${propertyLabel} in ${locationLabel}:`,
        `${monthOverMonth.previousMonth} → ${monthOverMonth.currentMonth}`,
        `Days on market change: ${formatPercent(
          monthOverMonth.domChangePercent
        )}`,
      ].join("\n");
    }

    if (
      lowerMessage.includes(
        "sales"
      ) ||
      lowerMessage.includes(
        "sold"
      )
    ) {
      return [
        `Month-over-month sales-volume change for ${propertyLabel} in ${locationLabel}:`,
        `${monthOverMonth.previousMonth} → ${monthOverMonth.currentMonth}`,
        `Sales change: ${formatPercent(
          monthOverMonth.salesChangePercent
        )}`,
      ].join("\n");
    }

    return [
      `Month-over-month market change for ${propertyLabel} in ${locationLabel}:`,
      `${monthOverMonth.previousMonth} → ${monthOverMonth.currentMonth}`,
      `Average price: ${formatPercent(
        monthOverMonth.priceChangePercent
      )}`,
      `Price per sq ft: ${formatPercent(
        monthOverMonth.pricePerSqFtChangePercent
      )}`,
      `Days on market: ${formatPercent(
        monthOverMonth.domChangePercent
      )}`,
      `Sales volume: ${formatPercent(
        monthOverMonth.salesChangePercent
      )}`,
    ].join("\n");
  }

  /*
   * ACTIVE INVENTORY
   */
  if (
    selectedCity &&
    (
      lowerMessage.includes(
        "active listings"
      ) ||
      lowerMessage.includes(
        "active homes"
      ) ||
      lowerMessage.includes(
        "active properties"
      ) ||
      (
        lowerMessage.includes(
          "how many"
        ) &&
        lowerMessage.includes(
          "for sale"
        )
      )
    )
  ) {
    const inventory =
      await getInventoryStats(
        selectedCity,
        propertySubType
      );

    return `${inventory.activeCount.toLocaleString()} active ${propertyLabel} are currently listed for sale in ${selectedCity}.`;
  }

  /*
   * INVENTORY COMPARISON
   */
  if (
    selectedCity &&
    (
      lowerMessage.includes(
        "inventory"
      ) ||
      (
        lowerMessage.includes(
          "active"
        ) &&
        (
          lowerMessage.includes(
            "sold"
          ) ||
          lowerMessage.includes(
            "sales"
          )
        )
      )
    )
  ) {
    const inventory =
      await getInventoryStats(
        selectedCity,
        propertySubType
      );

    return [
      `Inventory snapshot for ${propertyLabel} in ${selectedCity}:`,
      `Active listings: ${inventory.activeCount.toLocaleString()}`,
      `Homes sold in the last 90 days: ${inventory.recentSoldCount.toLocaleString()}`,
      `Active-listings-to-recent-sales ratio: ${inventory.inventoryToSalesRatio}`,
    ].join("\n");
  }

  /*
   * MONTHLY DOM TREND
   */
  if (
    (
      lowerMessage.includes(
        "days on market"
      ) ||
      lowerMessage.includes(
        "dom"
      )
    ) &&
    (
      lowerMessage.includes(
        "month"
      ) ||
      lowerMessage.includes(
        "monthly"
      ) ||
      lowerMessage.includes(
        "trend"
      ) ||
      lowerMessage.includes(
        "changed"
      ) ||
      lowerMessage.includes(
        "change"
      )
    )
  ) {
    if (!selectedCity) {
      return `ZIP-specific monthly days-on-market trend analysis is not supported yet for ${locationLabel}.`;
    }

    if (trend.length === 0) {
      return `There isn't enough recent data to show monthly days on market for ${propertyLabel} in ${locationLabel}.`;
    }

    return [
      `Monthly average days on market for ${propertyLabel} in ${locationLabel}:`,
      formatMonthlyDomTrend(
        trend
      ),
    ].join("\n");
  }

  /*
   * PPSF TREND
   */
  if (
    (
      lowerMessage.includes(
        "price per square foot"
      ) ||
      lowerMessage.includes(
        "price per sqft"
      ) ||
      lowerMessage.includes(
        "price per sq ft"
      )
    ) &&
    (
      lowerMessage.includes(
        "trend"
      ) ||
      lowerMessage.includes(
        "changed"
      ) ||
      lowerMessage.includes(
        "change"
      ) ||
      lowerMessage.includes(
        "rising"
      ) ||
      lowerMessage.includes(
        "falling"
      ) ||
      lowerMessage.includes(
        "going up"
      ) ||
      lowerMessage.includes(
        "going down"
      )
    )
  ) {
    if (!selectedCity) {
      return `ZIP-specific price-per-square-foot trend analysis is not supported yet for ${locationLabel}.`;
    }

    if (
      ppsfDirection ===
        "insufficient-data" ||
      ppsfChange === null
    ) {
      return `There isn't enough recent data to determine the price-per-square-foot trend for ${propertyLabel} in ${locationLabel}.`;
    }

    return [
      `Price per square foot for ${propertyLabel} in ${locationLabel} appears ${ppsfDirection}.`,
      `The monthly average price per square foot changed by ${ppsfChange}% across the available recent period.`,
    ].join("\n");
  }

  /*
   * AVERAGE PRICE
   */
  if (
    lowerMessage.includes(
      "average"
    ) &&
    lowerMessage.includes(
      "price"
    ) &&
    !lowerMessage.includes(
      "square foot"
    ) &&
    !lowerMessage.includes(
      "sq ft"
    ) &&
    !lowerMessage.includes(
      "sqft"
    )
  ) {
    return [
      `The average sold price for ${propertyLabel} in ${locationLabel} is ${formatMoney(
        stats.averageClosePrice
      )}.`,
      `This is based on ${stats.soldCount.toLocaleString()} recent sales.`,
    ].join("\n");
  }

  /*
   * MEDIAN PRICE
   */
  if (
    lowerMessage.includes(
      "median"
    ) &&
    lowerMessage.includes(
      "price"
    )
  ) {
    return [
      `The median sold price for ${propertyLabel} in ${locationLabel} is ${formatMoney(
        stats.medianClosePrice
      )}.`,
      `This is based on ${stats.soldCount.toLocaleString()} recent sales.`,
    ].join("\n");
  }

  /*
   * PRICE PER SQUARE FOOT
   */
  if (
    lowerMessage.includes(
      "price per square foot"
    ) ||
    lowerMessage.includes(
      "price per sqft"
    ) ||
    lowerMessage.includes(
      "price per sq ft"
    )
  ) {
    return `The average sold price per square foot for ${propertyLabel} in ${locationLabel} is about $${stats.averagePricePerSqFt.toLocaleString()}.`;
  }

  /*
   * DAYS ON MARKET
   */
  if (
    lowerMessage.includes(
      "days on market"
    ) ||
    lowerMessage.includes(
      "how long"
    ) ||
    lowerMessage.includes(
      "stay on the market"
    )
  ) {
    return `${propertyLabel} in ${locationLabel} spent an average of ${stats.averageDaysOnMarket} days on the market during the recent period.`;
  }

  /*
   * ABOVE / BELOW ASKING
   */
  if (
    lowerMessage.includes(
      "above asking"
    ) ||
    lowerMessage.includes(
      "below asking"
    ) ||
    lowerMessage.includes(
      "asking price"
    ) ||
    lowerMessage.includes(
      "list price"
    )
  ) {
    let interpretation =
      "about at asking price";

    if (
      stats.listToCloseRatio > 100
    ) {
      interpretation =
        "above asking price";
    } else if (
      stats.listToCloseRatio < 100
    ) {
      interpretation =
        "below asking price";
    }

    return [
      `${propertyLabel} in ${locationLabel} sold for an average of ${stats.listToCloseRatio}% of their list price.`,
      `That means they were generally selling ${interpretation}.`,
    ].join("\n");
  }

  /*
   * PRICE TREND
   */
  if (
    lowerMessage.includes(
      "rising"
    ) ||
    lowerMessage.includes(
      "falling"
    ) ||
    lowerMessage.includes(
      "going up"
    ) ||
    lowerMessage.includes(
      "going down"
    ) ||
    lowerMessage.includes(
      "trend"
    )
  ) {
    if (!selectedCity) {
      return `ZIP-specific price trend analysis is not supported yet for ${locationLabel}.`;
    }

    if (
      direction ===
        "insufficient-data" ||
      priceChange === null
    ) {
      return `There isn't enough recent data to determine the price trend for ${propertyLabel} in ${locationLabel}.`;
    }

    return [
      `Prices for ${propertyLabel} in ${locationLabel} appear ${direction}.`,
      `The monthly average sold price changed by ${priceChange}% across the available recent period.`,
    ].join("\n");
  }

  /*
   * NUMBER SOLD
   */
  if (
    lowerMessage.includes(
      "how many"
    ) &&
    (
      lowerMessage.includes(
        "sold"
      ) ||
      lowerMessage.includes(
        "sales"
      )
    )
  ) {
    return `${stats.soldCount.toLocaleString()} ${propertyLabel} sold in ${locationLabel} during the available recent period.`;
  }

  /*
   * BUYER VS SELLER
   */
  if (
    lowerMessage.includes(
      "good time to buy"
    ) ||
    lowerMessage.includes(
      "buyer"
    ) ||
    lowerMessage.includes(
      "seller"
    ) ||
    lowerMessage.includes(
      "favor buyers"
    ) ||
    lowerMessage.includes(
      "favor sellers"
    ) ||
    lowerMessage.includes(
      "favors buyers"
    ) ||
    lowerMessage.includes(
      "favors sellers"
    )
  ) {
    let marketView =
      "The market looks relatively balanced.";

    if (
      stats.listToCloseRatio < 98 &&
      stats.averageDaysOnMarket > 45
    ) {
      marketView =
        "The data suggests buyers may have somewhat more negotiating leverage.";
    }

    if (
      stats.listToCloseRatio >= 100 &&
      stats.averageDaysOnMarket < 30
    ) {
      marketView =
        "The data suggests sellers currently have stronger leverage.";
    }

    let inventoryLines:
      string[] = [];

    if (selectedCity) {
      const inventory =
        await getInventoryStats(
          selectedCity,
          propertySubType
        );

      inventoryLines = [
        `Active listings: ${inventory.activeCount.toLocaleString()}`,
        `Sold in last 90 days: ${inventory.recentSoldCount.toLocaleString()}`,
        `Inventory-to-recent-sales ratio: ${inventory.inventoryToSalesRatio}`,
      ];
    }

    return [
      `${locationLabel} ${propertyLabel} market snapshot:`,
      `Median sold price: ${formatMoney(
        stats.medianClosePrice
      )}`,
      `Average price/sq ft: $${stats.averagePricePerSqFt.toLocaleString()}`,
      `Average days on market: ${stats.averageDaysOnMarket}`,
      `List-to-close ratio: ${stats.listToCloseRatio}%`,

      selectedCity
        ? `Recent price trend: ${direction}${
            priceChange !== null
              ? ` (${
                  priceChange > 0
                    ? "+"
                    : ""
                }${priceChange}%)`
              : ""
          }`
        : "Recent price trend: ZIP-specific trend support is not implemented yet.",

      ...inventoryLines,

      "",
      marketView,
    ].join("\n");
  }

  return [
    `What would you like to know about the ${locationLabel} ${propertyLabel} market?`,
    "",
    "You can ask about:",
    "- Average home price",
    "- Median home price",
    "- Price per square foot",
    "- Price per square foot trends",
    "- Days on market",
    "- Monthly days on market",
    "- Month-over-month market changes",
    "- Year-over-year market changes",
    "- Selling above or below asking price",
    "- Price trends",
    "- Number of homes sold",
    "- Active listings",
    "- Inventory compared with recent sales",
    "- Whether the market favors buyers or sellers",
  ].join("\n");
}