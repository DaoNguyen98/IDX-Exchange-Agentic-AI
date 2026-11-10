import mysql from "mysql2/promise";

export type CompValidationResult = {
  compPrice: number;
  listPrice: number;
  compCount: number;
  deltaPct: number;
  avgPricePerSqft: number;
};

export async function validateWithComps(
  city: string,
  sqft: number,
  price: number
): Promise<CompValidationResult> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "idx_exchange",
  });

  const minSqft = Math.round(sqft * 0.8);
  const maxSqft = Math.round(sqft * 1.2);

  const [rows] = await connection.execute<any[]>(
    `
    SELECT
      AVG(ClosePrice / NULLIF(LivingArea, 0)) AS avg_ppsf,
      COUNT(*) AS comp_count
    FROM california_sold
    WHERE City = ?
      AND PropertyType = 'Residential'
      AND LivingArea BETWEEN ? AND ?
      AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    `,
    [city, minSqft, maxSqft]
  );

  await connection.end();

  const avgPpsf = Number(rows[0]?.avg_ppsf ?? 0);
  const compCount = Number(rows[0]?.comp_count ?? 0);

  const compPrice =
    avgPpsf > 0 ? Math.round(avgPpsf * sqft) : 0;

  const deltaPct =
    compPrice > 0
      ? Math.round(((price - compPrice) / compPrice) * 1000) / 10
      : 0;

  return {
    compPrice,
    listPrice: price,
    compCount,
    deltaPct,
    avgPricePerSqft: Math.round(avgPpsf * 100) / 100,
  };
}