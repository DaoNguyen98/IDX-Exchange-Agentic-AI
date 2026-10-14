import mysql from "mysql2/promise";

const {
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
} = process.env;

if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_PASSWORD || !MYSQL_DATABASE) {
  throw new Error(
    "Missing MySQL environment variables. Required: MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE."
  );
}

export const pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query<T>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}