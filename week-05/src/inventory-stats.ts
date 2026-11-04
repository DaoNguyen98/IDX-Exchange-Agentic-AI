import { query } from "../../week-03/src/db";

export interface InventoryStats {
  city: string;
  propertySubType?: string;
  activeCount: number;
  recentSoldCount: number;
  inventoryToSalesRatio: number;
}

interface CountRow {
  count_value: number;
}

export async function getInventoryStats(
  city: string,
  propertySubType?: string
): Promise<InventoryStats> {
  /*
   * ACTIVE INVENTORY
   * rets_property uses:
   * - L_City
   * - L_Type_
   * - L_Status
   * - StandardStatus
   */

  const activeConditions: string[] = [
    "L_City = ?",
    "L_Status = 'Active'",
    "StandardStatus = 'Active'",
  ];

  const activeParams: unknown[] = [
    city,
  ];

  if (propertySubType) {
    activeConditions.push(
      "L_Type_ = ?"
    );

    activeParams.push(
      propertySubType
    );
  }

  const activeWhereClause =
    activeConditions.join(
      "\nAND "
    );

  const activeRows =
    await query<CountRow>(
      `
      SELECT
        COUNT(*) AS count_value
      FROM rets_property
      WHERE ${activeWhereClause}
      `,
      activeParams
    );

  /*
   * RECENT SOLD VOLUME
   * california_sold uses:
   * - City
   * - PropertySubType
   * - CloseDate
   */

  const soldConditions: string[] = [
    "City = ?",
    "ClosePrice IS NOT NULL",
    "ClosePrice > 0",
    "STR_TO_DATE(CloseDate, '%Y-%m-%d') <= CURDATE()",
    "STR_TO_DATE(CloseDate, '%Y-%m-%d') >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)",
  ];

  const soldParams: unknown[] = [
    city,
  ];

  if (propertySubType) {
    soldConditions.push(
      "PropertySubType = ?"
    );

    soldParams.push(
      propertySubType
    );
  }

  const soldWhereClause =
    soldConditions.join(
      "\nAND "
    );

  const soldRows =
    await query<CountRow>(
      `
      SELECT
        COUNT(*) AS count_value
      FROM california_sold
      WHERE ${soldWhereClause}
      `,
      soldParams
    );

  const activeCount =
    Number(
      activeRows[0]
        ?.count_value ?? 0
    );

  const recentSoldCount =
    Number(
      soldRows[0]
        ?.count_value ?? 0
    );

  const inventoryToSalesRatio =
    recentSoldCount > 0
      ? Number(
          (
            activeCount /
            recentSoldCount
          ).toFixed(2)
        )
      : 0;

  return {
    city,
    propertySubType,
    activeCount,
    recentSoldCount,
    inventoryToSalesRatio,
  };
}