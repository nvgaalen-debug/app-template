// Eén centrale plek voor de databaseverbinding. De connectionstring komt uit
// de app settings van Azure (of local.settings.json lokaal), niet uit de code.
import sql from "mssql";

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool) return pool;

  const connectionString = process.env.SQL_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("SQL_CONNECTION_STRING is niet ingesteld");
  }

  pool = await new sql.ConnectionPool(connectionString).connect();
  return pool;
}

export { sql };
